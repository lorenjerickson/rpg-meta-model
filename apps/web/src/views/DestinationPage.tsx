import { Text } from '@dnd-domain/ui';
import type { Destination, Section } from '../navigation';

export function DestinationPage({
  section,
  destination,
}: {
  section: Section;
  destination: Destination;
}) {
  const title = destination.key === 'overview' ? section.label : destination.label;
  return (
    <header className="page__head">
      <Text variant="heading-1">{title}</Text>
      <Text muted>
        {destination.key === 'overview' ? section.description : destination.description}
      </Text>
    </header>
  );
}
