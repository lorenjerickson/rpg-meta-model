import type { HitDie } from '../professions/profession';

/** The fixed hit point increase per level for players who don't roll: half the die + 1. */
export function fixedHitPointIncrease(die: HitDie): number {
  return die / 2 + 1;
}

export interface HitPointLevel {
  hitDie: HitDie;
  /** The rolled result for this level; omit to take the fixed value. Ignored at level 1. */
  roll?: number;
}

/**
 * Maximum hit points from levels in the order they were gained. The first level takes the full
 * hit die; later levels take the roll or the fixed value. Every level adds the Hardiness
 * modifier and any per-level bonus (e.g. from a feat), and adds at least 1.
 */
export function maxHitPoints(
  levels: readonly HitPointLevel[],
  hardinessModifier: number,
  bonusPerLevel = 0,
): number {
  return levels.reduce((total, level, index) => {
    const base = index === 0 ? level.hitDie : (level.roll ?? fixedHitPointIncrease(level.hitDie));
    return total + Math.max(1, base + hardinessModifier + bonusPerLevel);
  }, 0);
}
