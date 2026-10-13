import type { MonsterStatBlock } from '../statBlock';
import { BEASTS } from './beasts';
import { HORRORS } from './horrors';
import { MACHINES } from './machines';
import { PEOPLE } from './people';

export { BEASTS, HORRORS, MACHINES, PEOPLE };

/** Every creature in the bestiary. A first draft. */
export const MONSTERS: readonly MonsterStatBlock[] = [
  ...BEASTS,
  ...PEOPLE,
  ...MACHINES,
  ...HORRORS,
];

export function findMonster(id: string): MonsterStatBlock | undefined {
  return MONSTERS.find((entry) => entry.id === id);
}
