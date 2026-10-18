import { findCatalog } from '@dnd-domain/system';
import { Breadcrumb, Text } from '@dnd-domain/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiUnavailableError, getDraft, getEntry } from '../../../../catalogApi';
import { findDestination, findSection } from '../../../../navigation';
import { EntryEditor } from '../../../../views/EntryEditor';

interface Params {
  section: string;
  page: string;
  id: string;
}

interface Props {
  params: Promise<Params>;
  searchParams: Promise<{ part?: string }>;
}

/** The entry an editor URL points at; `new` (with `?part=` for the kind) is a blank one. */
async function load(catalog: string, id: string, searchParams: Props['searchParams']) {
  if (id !== 'new') return getEntry(catalog, id);
  const part = Number((await searchParams).part ?? 0);
  return Number.isInteger(part) && part >= 0 ? getDraft(catalog, part) : undefined;
}

/** The section, page and catalog an editor URL points at, if it points at a catalog entry. */
async function resolve(params: Promise<Params>) {
  const { section: sectionKey, page, id } = await params;
  const section = findSection(sectionKey);
  const destination = section && findDestination(section, page);
  if (!section || !destination || section.key !== 'system' || !findCatalog(page)) notFound();
  return { section, destination, id };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { destination, id } = await resolve(params);
  const detail = await load(destination.key, id, searchParams).catch(() => undefined);
  const name = id === 'new' ? `New ${detail?.kind ?? 'entry'}` : (detail?.entry.name ?? id);
  return { title: `${name} · ${destination.label} · Wanderlust` };
}

export default async function EntryPage({ params, searchParams }: Props) {
  const { section, destination, id } = await resolve(params);
  let detail;
  try {
    detail = await load(destination.key, id, searchParams);
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return (
        <Text tone="danger">The catalog service isn’t reachable. Start the API and reload.</Text>
      );
    }
    throw error;
  }
  if (!detail) notFound();
  const isNew = id === 'new';
  const title = isNew ? `New ${detail.kind}` : detail.entry.name;
  const listHref = `/${section.key}/${destination.key}`;

  return (
    <>
      <header className="page__head">
        <Breadcrumb
          items={[
            { label: section.label, href: `/${section.key}` },
            { label: destination.label, href: listHref },
            { label: title },
          ]}
        />
        <Text variant="heading-1">{title}</Text>
      </header>
      <EntryEditor
        key={isNew ? `new-${String(detail.part)}` : detail.entry.id}
        initial={detail}
        isNew={isNew}
        listHref={listHref}
        defaultIcon={destination.icon}
      />
    </>
  );
}
