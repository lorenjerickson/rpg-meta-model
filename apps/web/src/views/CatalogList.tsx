import { findCatalog } from '@dnd-domain/system';
import { Chip, Icon, List, Text } from '@dnd-domain/ui';
import { notFound } from 'next/navigation';
import { ApiUnavailableError, getEntries } from '../catalogApi';
import type { Destination, Section } from '../navigation';
import { AppButtonLink, AppLink } from './AppLink';
import { EntryIcon } from './EntryIcon';

/**
 * A catalog's entries, each with its thumbnail or icon, linking to its editor, and a button to
 * add each kind of entry the catalog holds.
 */
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
  const listHref = `/${section.key}/${destination.key}`;
  const kinds = findCatalog(destination.key)?.kinds ?? [];

  return (
    <div className="catalog">
      <div className="catalog__actions">
        {kinds.map((kind, part) => (
          <AppButtonLink
            key={kind}
            variant={kinds.length === 1 ? 'primary' : 'secondary'}
            href={part ? `${listHref}/new?part=${String(part)}` : `${listHref}/new`}
          >
            <Icon name="plus" size={16} />
            {`Add ${kind}`}
          </AppButtonLink>
        ))}
      </div>
      <List
        aria-label={destination.label}
        filterNoun={destination.label.toLowerCase()}
        items={entries.map((entry) => ({
          id: entry.id,
          // The title is a link, so the filter matches the entry's plain text instead.
          filterText: [entry.name, entry.description, entry.meta].filter(Boolean).join(' '),
          title: (
            <span className="entry-title">
              <AppLink href={`${listHref}/${entry.id}`}>{entry.name}</AppLink>
              {entry.edited ? <Chip variant="outlined" label="Edited" /> : null}
              {entry.added ? <Chip variant="outlined" label="Added" /> : null}
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
    </div>
  );
}
