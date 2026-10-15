import { findCatalog } from '@dnd-domain/system';
import { Breadcrumb, Text } from '@dnd-domain/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiUnavailableError, getEntry } from '../../../../catalogApi';
import { findDestination, findSection } from '../../../../navigation';
import { EntryEditor } from '../../../../views/EntryEditor';

interface Params {
  section: string;
  page: string;
  id: string;
}

/** The section, page and catalog an editor URL points at, if it points at a catalog entry. */
async function resolve(params: Promise<Params>) {
  const { section: sectionKey, page, id } = await params;
  const section = findSection(sectionKey);
  const destination = section && findDestination(section, page);
  if (!section || !destination || section.key !== 'system' || !findCatalog(page)) notFound();
  return { section, destination, id };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { destination, id } = await resolve(params);
  const detail = await getEntry(destination.key, id).catch(() => undefined);
  return { title: `${detail?.entry.name ?? id} · ${destination.label} · Wanderlust` };
}

export default async function EntryPage({ params }: { params: Promise<Params> }) {
  const { section, destination, id } = await resolve(params);
  let detail;
  try {
    detail = await getEntry(destination.key, id);
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return (
        <Text tone="danger">The catalog service isn’t reachable. Start the API and reload.</Text>
      );
    }
    throw error;
  }
  if (!detail) notFound();

  return (
    <>
      <header className="page__head">
        <Breadcrumb
          items={[
            { label: section.label, href: `/${section.key}` },
            { label: destination.label, href: `/${section.key}/${destination.key}` },
            { label: detail.entry.name },
          ]}
        />
        <Text variant="heading-1">{detail.entry.name}</Text>
      </header>
      <EntryEditor key={detail.entry.id} initial={detail} defaultIcon={destination.icon} />
    </>
  );
}
