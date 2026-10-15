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
  media: MediaView;
}

export interface EntryDetail {
  catalog: { key: string; label: string };
  entry: CatalogEntryRecord;
  edited: boolean;
  /** The entry's shape, inferred from the seeded entries of its kind. */
  shape: Shape;
  media: MediaView;
  /** A starting prompt for generating its image. */
  defaultPrompt: string;
  canGenerate: boolean;
}
