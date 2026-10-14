import { rollD20, type RollMode } from '../core/d20';
import { adjustDamage, type DamageResponses, type DamageType } from '../core/damage';
import { rollDice, type DiceExpression, type Rng } from '../core/dice';
import { rollPool, type DicePool, type PoolDie, type PoolRoll } from '../core/dicePool';

/** Every creature's defense before clothing, armour, conditions and cover. */
export const BASE_DEFENSE = 6;

/** Beating the defense by at least this much is a solid hit, which ignores soak. */
export const SOLID_HIT_MARGIN = 3;

/** Beating the defense (or save) by at least this much is a critical. */
export const CRITICAL_MARGIN = 10;

export interface ContestRoll {
  /** The d20 that counts, or null for rolls made without one (such as soak). */
  natural: number | null;
  pool: PoolRoll;
  total: number;
}

export interface ContestRollOptions {
  /** Whether the roll includes a d20. Attacks, effects and saves do; soak doesn't. */
  d20?: boolean;
  /** Advantage or Disadvantage on the d20, from sources other than conditions. */
  mode?: RollMode;
  rng?: Rng;
}

/** Rolls one side of a contest: an optional d20 plus a pool of dice. */
export function rollContest(pool: DicePool, options: ContestRollOptions = {}): ContestRoll {
  const rng = options.rng ?? Math.random;
  const natural = options.d20 === false ? null : rollD20(options.mode, rng).natural;
  const rolled = rollPool(pool, rng);
  return { natural, pool: rolled, total: (natural ?? 0) + rolled.total };
}

export interface ContestOutcome {
  attack: number;
  defense: number;
  /** How far the attack beat (or fell short of) the defense. */
  margin: number;
  success: boolean;
  /** Won by `SOLID_HIT_MARGIN` or more: the hit ignores soak. */
  solid: boolean;
  critical: boolean;
}

/**
 * Compares an attack (or effect) total with a defense number (or save total). The attacker
 * wins ties, winning by `SOLID_HIT_MARGIN` or more is a solid hit, and winning by
 * `CRITICAL_MARGIN` or more is a critical.
 */
export function resolveContest(attack: number, defense: number): ContestOutcome {
  const margin = attack - defense;
  return {
    attack,
    defense,
    margin,
    success: margin >= 0,
    solid: margin >= SOLID_HIT_MARGIN,
    critical: margin >= CRITICAL_MARGIN,
  };
}

/** The soak that applies to a hit: none for a solid hit, otherwise the soak roll. */
export function effectiveSoak(soak: number, outcome: ContestOutcome): number {
  return outcome.solid ? 0 : Math.max(0, soak);
}

/** Doubles every die in a pool, for critical hits. */
export function doubledPool(pool: DicePool): PoolDie[] {
  return pool.map((entry) => ({ ...entry, count: entry.count * 2 }));
}

/** Rolls damage: the weapon or effect dice plus a pool, with every die doubled on a critical. */
export function rollDamage(
  dice: DiceExpression,
  pool: DicePool,
  critical: boolean,
  rng: Rng = Math.random,
): number {
  const base = rollDice(dice, { rng, critical }).total;
  const extra = rollPool(critical ? doubledPool(pool) : pool, rng).total;
  return Math.max(0, base + extra);
}

/**
 * Damage taken after the soak roll (never below 0), then immunity, resistance and
 * vulnerability.
 */
export function damageAfterSoak(
  damage: number,
  soak: number,
  type: DamageType,
  responses: DamageResponses = {},
): number {
  return adjustDamage(Math.max(0, damage - Math.max(0, soak)), type, responses);
}

export const COVER_LEVELS = ['none', 'half', 'three-quarters', 'total'] as const;

export type Cover = (typeof COVER_LEVELS)[number];

/**
 * What cover adds to defense and to Agility saving throws, or null for total cover, which
 * means the target can't be targeted directly.
 */
export function coverBonus(cover: Cover): number | null {
  switch (cover) {
    case 'none':
      return 0;
    case 'half':
      return 2;
    case 'three-quarters':
      return 5;
    case 'total':
      return null;
  }
}
