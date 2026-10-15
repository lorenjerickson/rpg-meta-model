import { Chip, List, Text } from '@dnd-domain/ui';
import { notFound } from 'next/navigation';
import { ApiUnavailableError, getEntries } from '../catalogApi';
import type { Destination, Section } from '../navigation';
import { AppLink } from './AppLink';
import { EntryIcon } from './EntryIcon';

/** A catalog's entries, each with its thumbnail or icon, linking to its editor. */
export async function CatalogList({
  section,
  destination,
}: {
  section: Section;
  destination: Destination;
}) {
  let entries;
  try {
    entries = await getEntries(destination.key);
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return (
        <Text tone="danger">
          The catalog service isn’t reachable. Start the API (and `pnpm db:start`) and reload.
        </Text>
      );
    }
    throw error;
  }
  if (!entries) notFound();

  return (
    <List
      aria-label={destination.label}
      items={entries.map((entry) => ({
        id: entry.id,
        title: (
          <span className="entry-title">
            <AppLink href={`/${section.key}/${destination.key}/${entry.id}`}>{entry.name}</AppLink>
            {entry.edited ? <Chip variant="outlined" label="Edited" /> : null}
          </span>
        ),
        ...(entry.description === undefined ? {} : { description: entry.description, lines: 2 }),
        ...(entry.meta === undefined ? {} : { meta: entry.meta }),
        image: entry.media.thumbnailUrl ?? (
          <EntryIcon chosen={entry.media.icon} fallback={destination.icon} />
        ),
        imageAlt: '',
        imageShape: 'square' as const,
      }))}
    />
  );
}
