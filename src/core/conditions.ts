import { assertIntegerInRange } from './validation';

export const CONDITIONS = [
  'blinded',
  'charmed',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
] as const;

export type Condition = (typeof CONDITIONS)[number];

/** Conditions that give a creature other conditions while they last. */
export const IMPLIED_CONDITIONS: Readonly<Partial<Record<Condition, readonly Condition[]>>> = {
  paralyzed: ['incapacitated'],
  petrified: ['incapacitated'],
  stunned: ['incapacitated'],
  unconscious: ['incapacitated', 'prone'],
};

/** Returns the given conditions plus every condition they imply. */
export function expandConditions(conditions: Iterable<Condition>): Set<Condition> {
  const result = new Set<Condition>();
  for (const condition of conditions) {
    result.add(condition);
    for (const implied of IMPLIED_CONDITIONS[condition] ?? []) {
      result.add(implied);
    }
  }
  return result;
}

/** Exhaustion is cumulative from 1 to 6; a creature dies at level 6. */
export const MAX_EXHAUSTION_LEVEL = 6;

/** D20 Tests are reduced by 2 per exhaustion level. */
export function exhaustionD20Penalty(level: number): number {
  assertIntegerInRange(level, 0, MAX_EXHAUSTION_LEVEL, 'Exhaustion level');
  return 0 - 2 * level;
}

/** Speed is reduced by 5 feet per exhaustion level. */
export function exhaustionSpeedReduction(level: number): number {
  assertIntegerInRange(level, 0, MAX_EXHAUSTION_LEVEL, 'Exhaustion level');
  return 5 * level;
}

export function diesFromExhaustion(level: number): boolean {
  return level >= MAX_EXHAUSTION_LEVEL;
}
