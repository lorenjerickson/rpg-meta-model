import type { ProfessionDefinition } from '../profession';
import { CLERGY } from './clergy';
import { CONSTABLE } from './constable';
import { FRONTIER_HAND } from './frontierHand';
import { HOSPITALITY } from './hospitality';
import { JOURNALIST } from './journalist';
import { LABOURER } from './labourer';
import { MECHANIC } from './mechanic';
import { MERCHANT } from './merchant';
import { PERFORMER } from './performer';
import { PHYSICIAN } from './physician';
import { SAILOR } from './sailor';
import { SCHOLAR } from './scholar';
import { SOLDIER } from './soldier';
import { STREET_RAT } from './streetRat';

export {
  CLERGY,
  CONSTABLE,
  FRONTIER_HAND,
  HOSPITALITY,
  JOURNALIST,
  LABOURER,
  MECHANIC,
  MERCHANT,
  PERFORMER,
  PHYSICIAN,
  SAILOR,
  SCHOLAR,
  SOLDIER,
  STREET_RAT,
};

/** Professions of the late 19th and early 20th centuries. A first draft. */
export const PROFESSIONS: readonly ProfessionDefinition[] = [
  SOLDIER,
  HOSPITALITY,
  STREET_RAT,
  SAILOR,
  PHYSICIAN,
  CLERGY,
  CONSTABLE,
  LABOURER,
  MERCHANT,
  SCHOLAR,
  JOURNALIST,
  PERFORMER,
  MECHANIC,
  FRONTIER_HAND,
];

export function findProfession(id: string): ProfessionDefinition | undefined {
  return PROFESSIONS.find((profession) => profession.id === id);
}

export function getProfession(id: string): ProfessionDefinition {
  const profession = findProfession(id);
  if (profession === undefined) {
    throw new Error(`Unknown profession: ${id}`);
  }
  return profession;
}
