import { withHouseStyle, type ImageGenerator } from '@dnd-domain/ai';
import * as system from '@dnd-domain/system';
import {
  CATALOGS,
  findCatalog,
  type CatalogDefinition,
  type CatalogEntry,
} from '@dnd-domain/system';
import {
  defaultValue,
  ENTRY_ID,
  findValueSets,
  inferShape,
  RESERVED_ENTRY_IDS,
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

/** An entry found in a catalog: seeded (and maybe edited) or added. */
interface Located {
  part: number;
  entry: CatalogEntry;
  edited: boolean;
  added: boolean;
}

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
 * The editable catalogs: seeded entries from the game system, overlaid with saved edits, plus
 * entries added alongside them, each with an image or icon. Shapes are inferred from the seeds,
 * so every catalog edits the same way.
 */
@Injectable()
export class CatalogService {
  private readonly valueSets = findValueSets(system);
  /** Each catalog's shapes, one per part. */
  private readonly shapes = new Map<string, Shape[]>();

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

  /** Seeded entries in order, then added ones in the order they were added. */
  async entries(catalogKey: string): Promise<EntrySummary[]> {
    const catalog = this.catalog(catalogKey);
    const [edits, additions, media] = await Promise.all([
      this.store.edits(catalog.key),
      this.store.additions(catalog.key),
      this.store.media(catalog.key),
    ]);
    const summary = (entry: CatalogEntry, edited: boolean, added: boolean): EntrySummary => ({
      id: entry.id,
      name: entry.name,
      ...catalog.summarize(entry),
      edited,
      added,
      media: mediaView(media.get(entry.id)),
    });
    return [
      ...catalog.entries.map((seed) =>
        summary(edits.get(seed.id) ?? seed, edits.has(seed.id), false),
      ),
      ...[...additions.values()].map(({ entry }) => summary(entry, false, true)),
    ];
  }

  async detail(catalogKey: string, id: string): Promise<EntryDetail> {
    const catalog = this.catalog(catalogKey);
    const [found, media] = await Promise.all([
      this.locate(catalog, id),
      this.store.media(catalog.key),
    ]);
    return this.describe(catalog, found, mediaView(media.get(id)));
  }

  /** A blank entry of one kind (a part of the catalog), to fill in and create. */
  draft(catalogKey: string, part: number): EntryDetail {
    const catalog = this.catalog(catalogKey);
    this.checkPart(catalog, part);
    const entry = this.template(catalog, part);
    return this.describe(catalog, { part, entry, edited: false, added: true }, {});
  }

  /** Adds an entry of one kind. Its id must be new, and is kept for good. */
  async create(catalogKey: string, part: number, entry: unknown): Promise<EntryDetail> {
    const catalog = this.catalog(catalogKey);
    this.checkPart(catalog, part);
    const errors = this.problems(catalog, part, entry);
    const id = (entry as Partial<CatalogEntry> | null)?.id;
    if (typeof id !== 'string' || !ENTRY_ID.test(id) || RESERVED_ENTRY_IDS.includes(id)) {
      errors.push({ path: ['id'], message: 'must be lower-case words joined by hyphens' });
    } else if (await this.exists(catalog, id)) {
      errors.push({ path: ['id'], message: 'is taken by another entry: choose another name' });
    }
    if (errors.length || typeof id !== 'string') {
      throw new BadRequestException({ message: 'The entry has problems', errors });
    }
    await this.store.saveAddition(catalog.key, id, { part, entry: entry as CatalogEntry });
    return this.detail(catalog.key, id);
  }

  async save(catalogKey: string, id: string, entry: unknown): Promise<EntryDetail> {
    const catalog = this.catalog(catalogKey);
    const found = await this.locate(catalog, id);
    const errors = this.problems(catalog, found.part, entry);
    if ((entry as Partial<CatalogEntry> | null)?.id !== id) {
      errors.push({ path: ['id'], message: 'cannot change' });
    }
    if (errors.length) {
      throw new BadRequestException({ message: 'The entry has problems', errors });
    }
    if (found.added) {
      await this.store.saveAddition(catalog.key, id, {
        part: found.part,
        entry: entry as CatalogEntry,
      });
    } else {
      await this.store.saveEdit(catalog.key, id, entry as CatalogEntry);
    }
    return this.detail(catalog.key, id);
  }

  /** Goes back to the seeded entry. */
  async revert(catalogKey: string, id: string): Promise<EntryDetail> {
    const catalog = this.catalog(catalogKey);
    if ((await this.locate(catalog, id)).added) {
      throw new BadRequestException('An added entry has no original to go back to');
    }
    await this.store.removeEdit(catalog.key, id);
    return this.detail(catalog.key, id);
  }

  /** Deletes an added entry and its image. Seeded entries can only be reverted. */
  async remove(catalogKey: string, id: string): Promise<void> {
    const catalog = this.catalog(catalogKey);
    if (!(await this.locate(catalog, id)).added) {
      throw new BadRequestException('Seeded entries can be reverted, but not deleted');
    }
    const media = (await this.store.media(catalog.key)).get(id);
    if (media?.image) await this.content.delete([media.image.key, media.image.thumbKey]);
    await this.store.removeMedia(catalog.key, id);
    await this.store.removeAddition(catalog.key, id);
  }

  async uploadImage(catalogKey: string, id: string, data: Uint8Array): Promise<MediaView> {
    return this.storeImage(catalogKey, id, data, { source: 'upload' });
  }

  async generateImage(catalogKey: string, id: string, prompt: string): Promise<MediaView> {
    if (!this.generator) {
      throw new ServiceUnavailableException('Image generation is not configured');
    }
    await this.locate(this.catalog(catalogKey), id);
    if (!prompt.trim()) throw new BadRequestException('Describe the image to generate');
    const image = await this.generator.generate({ prompt: withHouseStyle(prompt) });
    return this.storeImage(catalogKey, id, image.data, {
      source: 'generated',
      prompt: prompt.trim(),
      model: this.generator.name,
    });
  }

  async removeImage(catalogKey: string, id: string): Promise<MediaView> {
    await this.locate(this.catalog(catalogKey), id);
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
    await this.locate(this.catalog(catalogKey), id);
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
    await this.locate(this.catalog(catalogKey), id);
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

  private checkPart(catalog: CatalogDefinition, part: number): void {
    if (!Number.isInteger(part) || part < 0 || part >= catalog.parts.length) {
      throw new NotFoundException(`No kind ${String(part)} of ${catalog.label.toLowerCase()}`);
    }
  }

  /** Finds a seeded or added entry, or throws Not Found. */
  private async locate(catalog: CatalogDefinition, id: string): Promise<Located> {
    const part = catalog.parts.findIndex((seeds) => seeds.some((seed) => seed.id === id));
    const seed = catalog.parts[part]?.find((candidate) => candidate.id === id);
    if (seed) {
      const edit = (await this.store.edits(catalog.key)).get(id);
      return { part, entry: edit ?? seed, edited: edit !== undefined, added: false };
    }
    const added = (await this.store.additions(catalog.key)).get(id);
    if (!added) throw new NotFoundException(`No ${catalog.label.toLowerCase()} entry ${id}`);
    return { part: added.part, entry: added.entry, edited: false, added: true };
  }

  private async exists(catalog: CatalogDefinition, id: string): Promise<boolean> {
    return (
      catalog.entries.some((seed) => seed.id === id) ||
      (await this.store.additions(catalog.key)).has(id)
    );
  }

  private describe(catalog: CatalogDefinition, found: Located, media: MediaView): EntryDetail {
    const { entry } = found;
    const description = catalog.summarize(entry).description;
    return {
      catalog: { key: catalog.key, label: catalog.label },
      entry,
      edited: found.edited,
      added: found.added,
      part: found.part,
      kind: catalog.kinds[found.part] ?? 'entry',
      shape: this.shapeOf(catalog, found.part),
      media,
      defaultPrompt: description ? `${entry.name}: ${description}` : entry.name,
      canGenerate: this.generator !== null,
    };
  }

  /** Problems with an entry of one kind: its shape, plus a name. */
  private problems(catalog: CatalogDefinition, part: number, entry: unknown): ShapeError[] {
    const errors = validateShape(this.shapeOf(catalog, part), entry);
    const name = (entry as Partial<CatalogEntry> | null)?.name;
    if (typeof name !== 'string' || !name.trim()) {
      errors.push({ path: ['name'], message: 'is required' });
    }
    return errors;
  }

  /**
   * A new entry of one kind: the shape's defaults, with every value the kind's seeds all share
   * (such as their category), and no id or name yet.
   */
  private template(catalog: CatalogDefinition, part: number): CatalogEntry {
    const seeds = catalog.parts[part] ?? [];
    const [first] = seeds;
    const shared = Object.entries(first ?? {}).filter(
      ([key, value]) =>
        !['id', 'name', 'description'].includes(key) &&
        seeds.every((seed) => JSON.stringify(seed[key]) === JSON.stringify(value)),
    );
    return {
      ...(defaultValue(this.shapeOf(catalog, part)) as object),
      ...structuredClone(Object.fromEntries(shared)),
      id: '',
      name: '',
    };
  }

  /**
   * The shape of one part of a catalog, inferred from its seeded entries: a catalog made from
   * several seed lists (gear, tools and ammunition) has one shape per list, and in those the
   * category is fixed, because it says which list an entry belongs to.
   */
  private shapeOf(catalog: CatalogDefinition, part: number): Shape {
    let shapes = this.shapes.get(catalog.key);
    if (!shapes) {
      const readOnly = catalog.parts.length > 1 ? ['id', 'category'] : ['id'];
      shapes = catalog.parts.map((seeds) =>
        inferShape(seeds, { valueSets: this.valueSets, readOnly }),
      );
      this.shapes.set(catalog.key, shapes);
    }
    return shapes[part] ?? { kind: 'any' };
  }
}
