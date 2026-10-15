import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SECTIONS, findDestination, findSection } from '../../../navigation';
import { DestinationPage } from '../../../views/DestinationPage';

interface Params {
  section: string;
  page: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SECTIONS.flatMap((section) =>
    section.groups
      .flatMap((group) => group.items)
      .filter((item) => item.key !== 'overview')
      .map((item) => ({ section: section.key, page: item.key })),
  );
}

async function resolve(params: Promise<Params>) {
  const { section: sectionKey, page } = await params;
  const section = findSection(sectionKey);
  const destination = section && page !== 'overview' ? findDestination(section, page) : undefined;
  return { section, destination };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { section, destination } = await resolve(params);
  return {
    title:
      section && destination
        ? `${destination.label} · ${section.label} · Wanderlust`
        : 'Wanderlust',
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { section, destination } = await resolve(params);
  if (!section || !destination) notFound();
  return <DestinationPage section={section} destination={destination} />;
}
