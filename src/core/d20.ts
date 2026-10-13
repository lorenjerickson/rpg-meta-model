import { rollDie, type Rng } from './dice';

/** The three kinds of roll the rules call D20 Tests. */
export const D20_TESTS = ['attribute-check', 'saving-throw', 'attack-roll'] as const;

export type D20Test = (typeof D20_TESTS)[number];

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

/** Any advantage and any disadvantage cancel out, however many sources of each. */
export function resolveRollMode(hasAdvantage: boolean, hasDisadvantage: boolean): RollMode {
  if (hasAdvantage === hasDisadvantage) {
    return 'normal';
  }
  return hasAdvantage ? 'advantage' : 'disadvantage';
}

export interface D20Roll {
  /** The die result that counts, before modifiers. */
  natural: number;
  rolls: readonly number[];
  mode: RollMode;
}

export function rollD20(mode: RollMode = 'normal', rng: Rng = Math.random): D20Roll {
  const first = rollDie(20, rng);
  if (mode === 'normal') {
    return { natural: first, rolls: [first], mode };
  }
  const second = rollDie(20, rng);
  const natural = mode === 'advantage' ? Math.max(first, second) : Math.min(first, second);
  return { natural, rolls: [first, second], mode };
}

export const DIFFICULTY_CLASSES = {
  'very-easy': 5,
  easy: 10,
  medium: 15,
  hard: 20,
  'very-hard': 25,
  'nearly-impossible': 30,
} as const;

export type Difficulty = keyof typeof DIFFICULTY_CLASSES;

/** Passive score: 10 + modifier, with +5 for advantage and -5 for disadvantage. */
export function passiveScore(modifier: number, mode: RollMode = 'normal'): number {
  const adjustment = mode === 'advantage' ? 5 : mode === 'disadvantage' ? -5 : 0;
  return 10 + modifier + adjustment;
}

export interface D20TestOutcome {
  total: number;
  success: boolean;
  /** Only attack rolls can be critical (a natural 20). */
  critical: boolean;
}

/**
 * Resolves a D20 Test against a DC or AC. A natural 20 always hits and a natural 1 always
 * misses, but only for attack rolls; attribute checks and saving throws just compare totals.
 */
export function resolveD20Test(
  test: D20Test,
  natural: number,
  modifier: number,
  target: number,
): D20TestOutcome {
  const total = natural + modifier;
  if (test === 'attack-roll') {
    if (natural === 20) {
      return { total, success: true, critical: true };
    }
    if (natural === 1) {
      return { total, success: false, critical: false };
    }
  }
  return { total, success: total >= target, critical: false };
}
