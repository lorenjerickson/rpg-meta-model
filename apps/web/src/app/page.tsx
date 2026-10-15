import { MONSTERS, PROFESSIONS } from '@dnd-domain/system';
import { Panel } from '@dnd-domain/ui';
import { invariant } from '@dnd-domain/utils';

export default function Home() {
  invariant(PROFESSIONS.length > 0, 'The profession catalog is empty');

  return (
    <main>
      <h1>dnd-domain</h1>
      <Panel title="Professions">
        <ul>
          {PROFESSIONS.map((profession) => (
            <li key={profession.id}>{profession.name}</li>
          ))}
        </ul>
      </Panel>
      <Panel title="Bestiary">
        <p>{MONSTERS.length} creatures</p>
      </Panel>
    </main>
  );
}
