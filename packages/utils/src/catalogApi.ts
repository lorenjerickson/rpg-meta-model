import type { Shape } from './shape';

/**
 * The catalog API's responses, shared by the API that sends them and the apps that read them.
 * Image URLs are paths under the API's `/content` route.
 */

export interface MediaView {
  imageUrl?: string;
  thumbnailUrl?: string;
  /** A chosen icon name, shown when there is no image. */
  icon?: string;
  source?: 'upload' | 'generated';
  /** The prompt a generated image was made from. */
  prompt?: string;
}

export interface CatalogInfo {
  key: string;
  label: string;
  count: number;
}

export interface CatalogEntryRecord {
  id: string;
  name: string;
  [field: string]: unknown;
}

export interface EntrySummary {
  id: string;
  name: string;
  description?: string;
  meta?: string;
  /** Changed from the seeded entry. */
  edited: boolean;
  /** Added to the catalog rather than seeded, so it can be deleted. */
  added: boolean;
  media: MediaView;
}

export interface EntryDetail {
  catalog: { key: string; label: string };
  entry: CatalogEntryRecord;
  edited: boolean;
  /** Added to the catalog rather than seeded, so it can be deleted. */
  added: boolean;
  /** Which of the catalog's kinds of entry (its seed lists) this is. */
  part: number;
  /** What an entry of this kind is called, such as "weapon" or "tool". */
  kind: string;
  /** The entry's shape, inferred from the seeded entries of its kind. */
  shape: Shape;
  media: MediaView;
  /** A starting prompt for generating its image. */
  defaultPrompt: string;
  canGenerate: boolean;
}

/** Ids of added entries: lower-case words joined by hyphens, such as "service-revolver". */
export const ENTRY_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Ids that name a page instead of an entry. */
export const RESERVED_ENTRY_IDS: readonly string[] = ['new'];

/** The id a new entry gets from its name: "Sword-Cane (Silver)" → "sword-cane-silver". */
export function entryIdFrom(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
