import sharp from 'sharp';
import type { StoredContent } from './content-store.js';

/** Largest side of a stored image, and of its thumbnail. */
export const IMAGE_SIZE = 1024;
export const THUMBNAIL_SIZE = 256;

export class InvalidImageError extends Error {}

/**
 * Normalises an uploaded or generated image: upright, at most 1024px, as WebP, plus a 256px
 * square thumbnail for lists.
 */
export async function prepareImage(
  input: Uint8Array,
): Promise<{ image: StoredContent; thumbnail: StoredContent }> {
  try {
    const source = sharp(input, { failOn: 'error' }).rotate();
    const [image, thumbnail] = await Promise.all([
      source
        .clone()
        .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 86 })
        .toBuffer(),
      source
        .clone()
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover', position: 'attention' })
        .webp({ quality: 80 })
        .toBuffer(),
    ]);
    return {
      image: { data: image, contentType: 'image/webp' },
      thumbnail: { data: thumbnail, contentType: 'image/webp' },
    };
  } catch (error) {
    throw new InvalidImageError(
      `Not a readable image: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
