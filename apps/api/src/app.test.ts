import 'reflect-metadata';
import type { Server } from 'node:http';
import type { ImageGenerator } from '@dnd-domain/ai';
import { PROFESSIONS, TOOLS } from '@dnd-domain/system';
import type {
  CatalogInfo,
  EntryDetail,
  EntrySummary,
  MediaView,
  Shape,
  ShapeError,
} from '@dnd-domain/utils';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import sharp from 'sharp';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module.js';
import { MemoryCatalogStore } from './catalog/catalog-store.js';
import { CATALOG_STORE, CONTENT_STORE, IMAGE_GENERATOR } from './config.js';
import { MemoryContentStore } from './content/content-store.js';

/** A response body, typed as the API's contract says it is. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- the type names the contract
const json = <T>(response: { body: unknown }) => response.body as T;

const fieldsOf = (shape: Shape) => (shape.kind === 'object' ? shape.fields : []);

const png = (color: string) =>
  sharp({ create: { width: 600, height: 400, channels: 3, background: color } })
    .png()
    .toBuffer();

const prompts: string[] = [];
const fakeGenerator: ImageGenerator = {
  name: 'fake/painter',
  async generate({ prompt }) {
    prompts.push(prompt);
    return { data: await png('#7048e8'), contentType: 'image/png' };
  },
};

describe('api', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CATALOG_STORE)
      .useValue(new MemoryCatalogStore())
      .overrideProvider(CONTENT_STORE)
      .useValue(new MemoryContentStore())
      .overrideProvider(IMAGE_GENERATOR)
      .useValue(fakeGenerator)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports health', async () => {
    await request(server).get('/health').expect(200, { status: 'ok' });
  });

  describe('catalogs', () => {
    it('lists the catalogs and their entries', async () => {
      const catalogs = json<CatalogInfo[]>(await request(server).get('/catalogs').expect(200));
      expect(catalogs).toContainEqual({
        key: 'professions',
        label: 'Professions',
        count: PROFESSIONS.length,
      });
      const entries = json<EntrySummary[]>(
        await request(server).get('/catalogs/professions').expect(200),
      );
      expect(entries).toHaveLength(PROFESSIONS.length);
      expect(entries[0]).toMatchObject({
        id: 'soldier',
        name: 'Soldier',
        edited: false,
        media: {},
      });
      await request(server).get('/catalogs/spells').expect(404);
    });

    it('describes an entry with the shape inferred from its catalog', async () => {
      const detail = json<EntryDetail>(
        await request(server).get('/catalogs/professions/soldier').expect(200),
      );
      expect(detail.entry.name).toBe('Soldier');
      const fields = fieldsOf(detail.shape);
      expect(fields.find((field) => field.key === 'id')?.readOnly).toBe(true);
      const category = fields.find((field) => field.key === 'category')?.shape;
      expect(category?.kind === 'string' && category.valueSet?.name).toBe('profession_categories');
      expect(detail.canGenerate).toBe(true);
      await request(server).get('/catalogs/professions/alchemist').expect(404);
    });

    it('infers one shape per seed list in mixed catalogs', async () => {
      const tool = TOOLS[0];
      if (!tool) throw new Error('no tools');
      const detail = json<EntryDetail>(
        await request(server).get(`/catalogs/gear/${tool.id}`).expect(200),
      );
      const fields = fieldsOf(detail.shape);
      expect(fields.map((field) => field.key)).toContain('toolCategory');
      expect(fields.find((field) => field.key === 'category')?.readOnly).toBe(true);
    });

    it('saves valid edits, rejects invalid ones, and reverts', async () => {
      const original = json<EntryDetail>(
        await request(server).get('/catalogs/professions/soldier').expect(200),
      );
      const entry = { ...original.entry, name: 'Infantryman', hitDie: 12 };

      const saved = json<EntryDetail>(
        await request(server).put('/catalogs/professions/soldier').send({ entry }).expect(200),
      );
      expect(saved).toMatchObject({ edited: true, entry: { name: 'Infantryman' } });
      const list = json<EntrySummary[]>(
        await request(server).get('/catalogs/professions').expect(200),
      );
      expect(list[0]).toMatchObject({ name: 'Infantryman', edited: true });

      const invalid = json<{ errors: ShapeError[] }>(
        await request(server)
          .put('/catalogs/professions/soldier')
          .send({ entry: { ...entry, id: 'grenadier', hitDie: 'd12' } })
          .expect(400),
      );
      expect(invalid.errors).toEqual(
        expect.arrayContaining([
          { path: ['hitDie'], message: 'must be a number' },
          { path: ['id'], message: 'cannot change' },
        ]),
      );

      const reverted = json<EntryDetail>(
        await request(server).delete('/catalogs/professions/soldier/edits').expect(200),
      );
      expect(reverted).toMatchObject({ edited: false, entry: { name: 'Soldier' } });
    });

    it('starts a new entry from what the seeds of its kind share', async () => {
      const draft = json<EntryDetail>(
        await request(server).get('/catalogs/gear/new?part=1').expect(200),
      );
      expect(draft).toMatchObject({
        added: true,
        part: 1,
        kind: 'tool',
        entry: { id: '', name: '', category: 'tool' },
      });
      expect(fieldsOf(draft.shape).map((field) => field.key)).toContain('toolCategory');
      await request(server).get('/catalogs/gear/new?part=9').expect(404);
    });

    it('adds, edits and deletes entries, but never deletes seeded ones', async () => {
      const draft = json<EntryDetail>(await request(server).get('/catalogs/weapons/new'));
      const blank = { ...draft.entry, id: 'boarding-pike', name: 'Boarding Pike' };
      // Choices start unmade, so a blank entry can't be created until they are made.
      const unchosen = json<{ errors: ShapeError[] }>(
        await request(server).post('/catalogs/weapons').send({ entry: blank }).expect(400),
      );
      expect(unchosen.errors).toContainEqual({ path: ['mastery'], message: 'choose one' });
      expect(unchosen.errors).toContainEqual({ path: ['damage', 'type'], message: 'choose one' });
      const entry = {
        ...blank,
        weaponCategory: 'martial',
        weaponType: 'melee',
        mastery: 'topple',
        damage: { ...(draft.entry.damage as object), type: 'piercing' },
      };

      const created = json<EntryDetail>(
        await request(server).post('/catalogs/weapons').send({ entry }).expect(201),
      );
      expect(created).toMatchObject({
        added: true,
        edited: false,
        entry: { name: 'Boarding Pike' },
      });
      const list = json<EntrySummary[]>(await request(server).get('/catalogs/weapons'));
      expect(list.at(-1)).toMatchObject({ id: 'boarding-pike', added: true });

      const taken = json<{ errors: ShapeError[] }>(
        await request(server).post('/catalogs/weapons').send({ entry }).expect(400),
      );
      expect(taken.errors).toContainEqual({
        path: ['id'],
        message: 'is taken by another entry: choose another name',
      });
      for (const id of ['cutlass', 'new', 'Bad Id']) {
        await request(server)
          .post('/catalogs/weapons')
          .send({ entry: { ...entry, id } })
          .expect(400);
      }

      const renamed = json<EntryDetail>(
        await request(server)
          .put('/catalogs/weapons/boarding-pike')
          .send({ entry: { ...entry, name: 'Half Pike' } })
          .expect(200),
      );
      expect(renamed).toMatchObject({ added: true, edited: false, entry: { name: 'Half Pike' } });
      await request(server).delete('/catalogs/weapons/boarding-pike/edits').expect(400);

      await request(server).delete('/catalogs/weapons/cutlass').expect(400);
      await request(server).delete('/catalogs/weapons/boarding-pike').expect(204);
      await request(server).get('/catalogs/weapons/boarding-pike').expect(404);
    });
  });

  describe('images and icons', () => {
    it('stores an uploaded image with a thumbnail in the content repository', async () => {
      const upload = json<MediaView>(
        await request(server)
          .post('/catalogs/bestiary/ghoul/image')
          .attach('file', await png('#f5b83d'), 'ghoul.png')
          .expect(201),
      );
      expect(upload.source).toBe('upload');
      expect(upload.imageUrl).toMatch(/^\/content\/catalogs\/bestiary\/ghoul\/[\w-]+\.webp$/);

      const thumbnail = await request(server)
        .get(upload.thumbnailUrl ?? '')
        .expect(200);
      expect(thumbnail.headers['content-type']).toBe('image/webp');
      expect((await sharp(thumbnail.body as Buffer).metadata()).width).toBe(256);

      const list = json<EntrySummary[]>(
        await request(server).get('/catalogs/bestiary').expect(200),
      );
      const ghoul = list.find((entry) => entry.id === 'ghoul');
      expect(ghoul?.media.thumbnailUrl).toBe(upload.thumbnailUrl);
    });

    it('rejects files that are not images', async () => {
      await request(server)
        .post('/catalogs/bestiary/ghoul/image')
        .attach('file', Buffer.from('not an image'), 'notes.txt')
        .expect(400);
    });

    it('generates an image in the house style, replacing the old one', async () => {
      const before = json<EntryDetail>(
        await request(server).get('/catalogs/bestiary/ghoul').expect(200),
      );
      const generated = json<MediaView>(
        await request(server)
          .post('/catalogs/bestiary/ghoul/image/generate')
          .send({ prompt: 'A pallid ghoul in a crypt' })
          .expect(201),
      );
      expect(generated).toMatchObject({ source: 'generated', prompt: 'A pallid ghoul in a crypt' });
      expect(prompts.at(-1)).toMatch(/^A pallid ghoul in a crypt\n\nIllustration for a Victorian/);
      await request(server)
        .get(before.media.imageUrl ?? '')
        .expect(404);
      await request(server)
        .get(generated.imageUrl ?? '')
        .expect(200);
    });

    it('chooses icons and removes images', async () => {
      const icon = json<MediaView>(
        await request(server)
          .put('/catalogs/bestiary/ghoul/icon')
          .send({ icon: 'skull' })
          .expect(200),
      );
      expect(icon.icon).toBe('skull');
      const removed = json<MediaView>(
        await request(server).delete('/catalogs/bestiary/ghoul/image').expect(200),
      );
      expect(removed).toEqual({ icon: 'skull' });
      await request(server).get('/content/../secrets').expect(404);
    });
  });
});
