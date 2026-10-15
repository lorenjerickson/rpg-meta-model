import { MAX_CHARACTER_LEVEL, MIN_CHARACTER_LEVEL } from '../character/progression';
import { assertIntegerInRange, lookup } from '../core/validation';

export const ENCOUNTER_DIFFICULTIES = ['low', 'moderate', 'high'] as const;

export type EncounterDifficulty = (typeof ENCOUNTER_DIFFICULTIES)[number];

/** XP budget per character, by character level. Index = level - 1. */
export const XP_BUDGET_PER_CHARACTER: readonly Readonly<Record<EncounterDifficulty, number>>[] = [
  { low: 50, moderate: 75, high: 100 },
  { low: 100, moderate: 150, high: 200 },
  { low: 150, moderate: 225, high: 400 },
  { low: 250, moderate: 375, high: 500 },
  { low: 500, moderate: 750, high: 1100 },
  { low: 600, moderate: 1000, high: 1400 },
  { low: 750, moderate: 1300, high: 1700 },
  { low: 1000, moderate: 1700, high: 2100 },
  { low: 1300, moderate: 2000, high: 2600 },
  { low: 1600, moderate: 2300, high: 3100 },
  { low: 1900, moderate: 2900, high: 4100 },
  { low: 2200, moderate: 3700, high: 4700 },
  { low: 2600, moderate: 4200, high: 5400 },
  { low: 2900, moderate: 4900, high: 6200 },
  { low: 3300, moderate: 5400, high: 7800 },
  { low: 3800, moderate: 6100, high: 9800 },
  { low: 4500, moderate: 7200, high: 11700 },
  { low: 5000, moderate: 8700, high: 14200 },
  { low: 5500, moderate: 10700, high: 17200 },
  { low: 6400, moderate: 13200, high: 22000 },
];

/** Total XP budget for a party: the sum of each character's budget. */
export function encounterXpBudget(
  partyLevels: readonly number[],
  difficulty: EncounterDifficulty,
): number {
  return partyLevels.reduce((total, level) => {
    assertIntegerInRange(level, MIN_CHARACTER_LEVEL, MAX_CHARACTER_LEVEL, 'Character level');
    return total + lookup(XP_BUDGET_PER_CHARACTER, level - 1, 'XP budget')[difficulty];
  }, 0);
}

/**
 * The lowest difficulty whose budget covers the encounter's total monster XP, or
 * "beyond-high" if it exceeds the High budget. Monster XP is summed with no multiplier.
 */
export function rateEncounter(
  partyLevels: readonly number[],
  monsterXp: readonly number[],
): EncounterDifficulty | 'beyond-high' {
  const total = monsterXp.reduce((sum, xp) => sum + xp, 0);
  return (
    ENCOUNTER_DIFFICULTIES.find(
      (difficulty) => total <= encounterXpBudget(partyLevels, difficulty),
    ) ?? 'beyond-high'
  );
}
