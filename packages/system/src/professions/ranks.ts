import { MAX_CHARACTER_LEVEL, MIN_CHARACTER_LEVEL } from '../character/progression';
import { assertIntegerInRange } from '../core/validation';

/** The ranks every profession progresses through, lowest first. */
export const RANKS = ['novice', 'apprentice', 'journeyman', 'master', 'grand-master'] as const;

export type Rank = (typeof RANKS)[number];

export const RANK_NAMES: Readonly<Record<Rank, string>> = {
  novice: 'Novice',
  apprentice: 'Apprentice',
  journeyman: 'Journeyman',
  master: 'Master',
  'grand-master': 'Grand Master',
};

/**
 * The profession level at which each rank is reached. Ranks line up with the proficiency bonus
 * steps, so each rank-up arrives with a new bonus.
 */
export const RANK_MIN_LEVEL: Readonly<Record<Rank, number>> = {
  novice: 1,
  apprentice: 5,
  journeyman: 9,
  master: 13,
  'grand-master': 17,
};

export function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

export function compareRanks(a: Rank, b: Rank): number {
  return rankIndex(a) - rankIndex(b);
}

/** The rank reached at a given level in a profession. */
export function rankForLevel(professionLevel: number): Rank {
  assertIntegerInRange(
    professionLevel,
    MIN_CHARACTER_LEVEL,
    MAX_CHARACTER_LEVEL,
    'Profession level',
  );
  return RANKS.findLast((rank) => professionLevel >= RANK_MIN_LEVEL[rank]) ?? 'novice';
}

export function hasReachedRank(professionLevel: number, rank: Rank): boolean {
  return compareRanks(rankForLevel(professionLevel), rank) >= 0;
}
