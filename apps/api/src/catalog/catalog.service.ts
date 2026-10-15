import { withHouseStyle, type ImageGenerator } from '@dnd-domain/ai';
import * as system from '@dnd-domain/system';
import {
  CATALOGS,
  findCatalog,
  type CatalogDefinition,
  type CatalogEntry,
} from '@dnd-domain/system';
import {
  findValueSets,
  inferShape,
  validateShape,
  type EntryDetail,
  type EntrySummary,
  type MediaView,
  type Shape,
  type ShapeError,
} from '@dnd-domain/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CATALOG_STORE, CONTENT_STORE, IMAGE_GENERATOR } from '../config.js';
import type { ContentStore } from '../content/content-store.js';
import { InvalidImageError, prepareImage } from '../content/images.js';
import type { CatalogStore, EntryMedia, StoredImage } from './catalog-store.js';

const contentUrl = (key: string) => `/content/${key}`;

function mediaView(media: EntryMedia | undefined): MediaView {
  if (!media) return {};
  return {
    ...(media.icon ? { icon: media.icon } : {}),
    ...(media.image
      ? {
          imageUrl: contentUrl(media.image.key),
          thumbnailUrl: contentUrl(media.image.thumbKey),
          source: media.image.source,
          ...(media.image.prompt ? { prompt: media.image.prompt } : {}),
        }
      : {}),
  };
}

/**
 * The editable catalogs: seeded entries from the game system, overlaid with saved edits, each
 * with an image or icon. Shapes are inferred from the seeds, so every catalog edits the same way.
 */
@Injectable()
export class CatalogService {
  private readonly valueSets = findValueSets(system);
  private readonly shapes = new Map<string, (entry: CatalogEntry) => Shape>();

  constructor(
    @Inject(CATALOG_STORE) private readonly store: CatalogStore,
    @Inject(CONTENT_STORE) private readonly content: ContentStore,
    @Inject(IMAGE_GENERATOR) private readonly generator: ImageGenerator | null,
  ) {}

  catalogs() {
    return CATALOGS.map((catalog) => ({
      key: catalog.key,
      label: catalog.label,
      count: catalog.entries.length,
    }));
  }

  async entries(catalogKey: string): Promise<EntrySummary[]> {
    const catalog = this.catalog(catalogKey);
    const [edits, media] = await Promise.all([
      this.store.edits(catalog.key),
      this.store.media(catalog.key),
    ]);
    return catalog.entries.map((seed) => {
      const entry = edits.get(seed.id) ?? seed;
      return {
        id: entry.id,
        name: entry.name,
        ...catalog.summarize(entry),
        edited: edits.has(seed.id),
        media: mediaView(media.get(seed.id)),
      };
    });
  }

  async detail(catalogKey: string, id: string): Promise<EntryDetail> {
    const catalog = this.catalog(catalogKey);
    const seed = this.seed(catalog, id);
    const [edits, media] = await Promise.all([
      this.store.edits(catalog.key),
      this.store.media(catalog.key),
    ]);
    const entry = edits.get(id) ?? seed;
    const description = catalog.summarize(entry).description;
    return {
      catalog: { key: catalog.key, label: catalog.label },
      entry,
      edited: edits.has(id),
      shape: this.shapeOf(catalog, seed),
      media: mediaView(media.get(id)),
      defaultPrompt: description ? `${entry.name}: ${description}` : entry.name,
      canGenerate: this.generator !== null,
    };
  }

  /** Problems with an edited entry, or none. Its id must not change. */
  validate(catalogKey: string, id: string, entry: unknown): ShapeError[] {
    const catalog = this.catalog(catalogKey);
    const seed = this.seed(catalog, id);
    const errors = validateShape(this.shapeOf(catalog, seed), entry);
    const record = entry as Partial<CatalogEntry> | null;
    if (record?.id !== id) errors.push({ path: ['id'], message: 'cannot change' });
    if (typeof record?.name !== 'string' || !record.name.trim()) {
      errors.push({ path: ['name'], message: 'is required' });
    }
    return errors;
  }

  async save(catalogKey: string, id: string, entry: unknown): Promise<EntryDetail> {
    const errors = this.validate(catalogKey, id, entry);
    if (errors.length) {
      throw new BadRequestException({ message: 'The entry has problems', errors });
    }
    await this.store.saveEdit(catalogKey, id, entry as CatalogEntry);
    return this.detail(catalogKey, id);
  }

  /** Goes back to the seeded entry. */
  async revert(catalogKey: string, id: string): Promise<EntryDetail> {
    this.seed(this.catalog(catalogKey), id);
    await this.store.removeEdit(catalogKey, id);
    return this.detail(catalogKey, id);
  }

  async uploadImage(catalogKey: string, id: string, data: Uint8Array): Promise<MediaView> {
    return this.storeImage(catalogKey, id, data, { source: 'upload' });
  }

  async generateImage(catalogKey: string, id: string, prompt: string): Promise<MediaView> {
    if (!this.generator) {
      throw new ServiceUnavailableException('Image generation is not configured');
    }
    this.seed(this.catalog(catalogKey), id);
    if (!prompt.trim()) throw new BadRequestException('Describe the image to generate');
    const image = await this.generator.generate({ prompt: withHouseStyle(prompt) });
    return this.storeImage(catalogKey, id, image.data, {
      source: 'generated',
      prompt: prompt.trim(),
      model: this.generator.name,
    });
  }

  async removeImage(catalogKey: string, id: string): Promise<MediaView> {
    this.seed(this.catalog(catalogKey), id);
    const media = (await this.store.media(catalogKey)).get(id) ?? {};
    if (media.image) {
      await this.content.delete([media.image.key, media.image.thumbKey]);
    }
    const rest: EntryMedia = media.icon ? { icon: media.icon } : {};
    await this.store.saveMedia(catalogKey, id, rest);
    return mediaView(rest);
  }

  /** Chooses the icon shown without an image; null goes back to the default. */
  async setIcon(catalogKey: string, id: string, icon: string | null): Promise<MediaView> {
    this.seed(this.catalog(catalogKey), id);
    if (icon !== null && !/^[a-z0-9-]{1,40}$/.test(icon)) {
      throw new BadRequestException('Not an icon name');
    }
    const media = (await this.store.media(catalogKey)).get(id) ?? {};
    const next: EntryMedia = {
      ...(media.image ? { image: media.image } : {}),
      ...(icon ? { icon } : {}),
    };
    await this.store.saveMedia(catalogKey, id, next);
    return mediaView(next);
  }

  private async storeImage(
    catalogKey: string,
    id: string,
    data: Uint8Array,
    origin: Pick<StoredImage, 'source' | 'prompt' | 'model'>,
  ): Promise<MediaView> {
    this.seed(this.catalog(catalogKey), id);
    let prepared;
    try {
      prepared = await prepareImage(data);
    } catch (error) {
      if (error instanceof InvalidImageError) throw new BadRequestException(error.message);
      throw error;
    }
    const base = `catalogs/${catalogKey}/${id}/${randomUUID()}`;
    const image: StoredImage = {
      key: `${base}.webp`,
      thumbKey: `${base}-thumb.webp`,
      source: origin.source,
      ...(origin.prompt ? { prompt: origin.prompt } : {}),
      ...(origin.model ? { model: origin.model } : {}),
      updatedAt: new Date().toISOString(),
    };
    await this.content.put(image.key, prepared.image);
    await this.content.put(image.thumbKey, prepared.thumbnail);
    const previous = (await this.store.media(catalogKey)).get(id) ?? {};
    const next: EntryMedia = { ...(previous.icon ? { icon: previous.icon } : {}), image };
    await this.store.saveMedia(catalogKey, id, next);
    if (previous.image) {
      await this.content.delete([previous.image.key, previous.image.thumbKey]);
    }
    return mediaView(next);
  }

  private catalog(key: string): CatalogDefinition {
    const catalog = findCatalog(key);
    if (!catalog) throw new NotFoundException(`No catalog ${key}`);
    return catalog;
  }

  private seed(catalog: CatalogDefinition, id: string): CatalogEntry {
    const seed = catalog.entries.find((entry) => entry.id === id);
    if (!seed) throw new NotFoundException(`No ${catalog.label.toLowerCase()} entry ${id}`);
    return seed;
  }

  /**
   * An entry's shape, inferred from the seeded entries of its kind: a catalog made from several
   * seed lists (gear, tools and ammunition) has one shape per list, and in those the category is
   * fixed, because it says which list an entry belongs to.
   */
  private shapeOf(catalog: CatalogDefinition, seed: CatalogEntry): Shape {
    let shapeFor = this.shapes.get(catalog.key);
    if (!shapeFor) {
      const readOnly = catalog.parts.length > 1 ? ['id', 'category'] : ['id'];
      const shapes = catalog.parts.map((part) => ({
        part,
        shape: inferShape(part, { valueSets: this.valueSets, readOnly }),
      }));
      shapeFor = (entry) =>
        shapes.find(({ part }) => part.some((candidate) => candidate.id === entry.id))?.shape ?? {
          kind: 'any',
        };
      this.shapes.set(catalog.key, shapeFor);
    }
    return shapeFor(seed);
  }
}
