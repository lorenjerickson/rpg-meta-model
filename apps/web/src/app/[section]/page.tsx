import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SECTIONS, findDestination, findSection } from '../../navigation';
import { DestinationPage } from '../../views/DestinationPage';

interface Params {
  section: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SECTIONS.map((section) => ({ section: section.key }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const section = findSection((await params).section);
  return { title: section ? `${section.label} · Wanderlust` : 'Wanderlust' };
}

export default async function SectionPage({ params }: { params: Promise<Params> }) {
  const section = findSection((await params).section);
  const destination = section && findDestination(section, 'overview');
  if (!section || !destination) notFound();
  return <DestinationPage section={section} destination={destination} />;
}
