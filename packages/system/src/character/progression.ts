import { assertIntegerInRange, lookup } from '../core/validation';

export const MIN_CHARACTER_LEVEL = 1;
export const MAX_CHARACTER_LEVEL = 20;

/** Experience points needed to reach each level. Index = level - 1. */
export const EXPERIENCE_THRESHOLDS: readonly number[] = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000,
  195000, 225000, 265000, 305000, 355000,
];

export function experienceForLevel(level: number): number {
  assertIntegerInRange(level, MIN_CHARACTER_LEVEL, MAX_CHARACTER_LEVEL, 'Character level');
  return lookup(EXPERIENCE_THRESHOLDS, level - 1, 'experience');
}

export function levelForExperience(experience: number): number {
  if (experience < 0) {
    throw new RangeError(`Experience can't be negative, got ${String(experience)}`);
  }
  const level = EXPERIENCE_THRESHOLDS.findLastIndex((threshold) => experience >= threshold) + 1;
  return Math.max(MIN_CHARACTER_LEVEL, level);
}

/** +2 at levels 1-4, rising by 1 every four levels to +6 at 17-20. */
export function proficiencyBonusForLevel(level: number): number {
  assertIntegerInRange(level, MIN_CHARACTER_LEVEL, MAX_CHARACTER_LEVEL, 'Character level');
  return 2 + Math.floor((level - 1) / 4);
}
