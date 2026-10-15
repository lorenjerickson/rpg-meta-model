import type { CatalogEntry } from '@dnd-domain/system';
import pg from 'pg';

/** The image stored for an entry. */
export interface StoredImage {
  /** Content-store key of the full image. */
  key: string;
  /** Content-store key of its thumbnail. */
  thumbKey: string;
  source: 'upload' | 'generated';
  /** The prompt, for generated images. */
  prompt?: string;
  /** The provider and model, for generated images. */
  model?: string;
  updatedAt: string;
}

/** An entry's picture: an uploaded or generated image, and/or a chosen icon. */
export interface EntryMedia {
  icon?: string;
  image?: StoredImage;
}

/** Edits to seeded catalog entries, and their pictures. Seeds themselves are never stored. */
export interface CatalogStore {
  edits(catalog: string): Promise<Map<string, CatalogEntry>>;
  saveEdit(catalog: string, id: string, entry: CatalogEntry): Promise<void>;
  removeEdit(catalog: string, id: string): Promise<void>;
  media(catalog: string): Promise<Map<string, EntryMedia>>;
  saveMedia(catalog: string, id: string, media: EntryMedia): Promise<void>;
}

const key = (catalog: string, id: string) => `${catalog}\u0000${id}`;

function byCatalog<T>(rows: Map<string, T>, catalog: string): Map<string, T> {
  const prefix = key(catalog, '');
  return new Map(
    [...rows].filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k.slice(prefix.length), v]),
  );
}

/** Keeps everything in memory: for tests, and for running without a database. */
export class MemoryCatalogStore implements CatalogStore {
  private readonly editRows = new Map<string, CatalogEntry>();
  private readonly mediaRows = new Map<string, EntryMedia>();

  edits(catalog: string) {
    return Promise.resolve(byCatalog(this.editRows, catalog));
  }
  saveEdit(catalog: string, id: string, entry: CatalogEntry) {
    this.editRows.set(key(catalog, id), structuredClone(entry));
    return Promise.resolve();
  }
  removeEdit(catalog: string, id: string) {
    this.editRows.delete(key(catalog, id));
    return Promise.resolve();
  }
  media(catalog: string) {
    return Promise.resolve(byCatalog(this.mediaRows, catalog));
  }
  saveMedia(catalog: string, id: string, media: EntryMedia) {
    this.mediaRows.set(key(catalog, id), structuredClone(media));
    return Promise.resolve();
  }
}

const SCHEMA = `
  create table if not exists catalog_edits (
    catalog text not null,
    id text not null,
    data jsonb not null,
    updated_at timestamptz not null default now(),
    primary key (catalog, id)
  );
  create table if not exists catalog_media (
    catalog text not null,
    id text not null,
    media jsonb not null,
    updated_at timestamptz not null default now(),
    primary key (catalog, id)
  );
`;

/** Keeps edits and media records in Postgres, as JSON. */
export class PgCatalogStore implements CatalogStore {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  /** Creates the tables if they don't exist. */
  async migrate(): Promise<void> {
    await this.pool.query(SCHEMA);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async edits(catalog: string) {
    const result = await this.pool.query<{ id: string; data: CatalogEntry }>(
      'select id, data from catalog_edits where catalog = $1',
      [catalog],
    );
    return new Map(result.rows.map((row) => [row.id, row.data]));
  }

  async saveEdit(catalog: string, id: string, entry: CatalogEntry) {
    await this.pool.query(
      `insert into catalog_edits (catalog, id, data) values ($1, $2, $3)
       on conflict (catalog, id) do update set data = excluded.data, updated_at = now()`,
      [catalog, id, JSON.stringify(entry)],
    );
  }

  async removeEdit(catalog: string, id: string) {
    await this.pool.query('delete from catalog_edits where catalog = $1 and id = $2', [
      catalog,
      id,
    ]);
  }

  async media(catalog: string) {
    const result = await this.pool.query<{ id: string; media: EntryMedia }>(
      'select id, media from catalog_media where catalog = $1',
      [catalog],
    );
    return new Map(result.rows.map((row) => [row.id, row.media]));
  }

  async saveMedia(catalog: string, id: string, media: EntryMedia) {
    await this.pool.query(
      `insert into catalog_media (catalog, id, media) values ($1, $2, $3)
       on conflict (catalog, id) do update set media = excluded.media, updated_at = now()`,
      [catalog, id, JSON.stringify(media)],
    );
  }
}
