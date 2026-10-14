import { rollD20, type RollMode } from '../core/d20';
import { adjustDamage, type DamageResponses, type DamageType } from '../core/damage';
import { rollDice, type DiceExpression, type DieSize, type Rng } from '../core/dice';
import { poolDie, rollPool, type DicePool, type PoolDie, type PoolRoll } from '../core/dicePool';

/** Beating the defense (or save) by at least this much is a critical. */
export const CRITICAL_MARGIN = 10;

export interface ContestRoll {
  /** The d20 that counts, or null for rolls made without one (such as armour defense). */
  natural: number | null;
  pool: PoolRoll;
  total: number;
}

export interface ContestRollOptions {
  /** Whether the roll includes a d20. Attacks, effects and saves do; defense and soak don't. */
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
  critical: boolean;
}

/**
 * Compares an attack (or effect) total with a defense (or save) total. The attacker wins ties,
 * and winning by `CRITICAL_MARGIN` or more is a critical.
 */
export function resolveContest(attack: number, defense: number): ContestOutcome {
  const margin = attack - defense;
  return {
    attack,
    defense,
    margin,
    success: margin >= 0,
    critical: margin >= CRITICAL_MARGIN,
  };
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

/** The die added to (or taken from) the natural-armour d20 for a given Armor Class. */
function naturalArmourDie(armorClass: number): { die: DieSize; sign: 1 | -1 } | null {
  if (armorClass >= 20) return { die: 10, sign: 1 };
  if (armorClass >= 18) return { die: 8, sign: 1 };
  if (armorClass >= 16) return { die: 6, sign: 1 };
  if (armorClass >= 14) return { die: 4, sign: 1 };
  if (armorClass >= 12) return { die: 2, sign: 1 };
  if (armorClass >= 10) return null;
  if (armorClass >= 8) return { die: 2, sign: -1 };
  return { die: 4, sign: -1 };
}

/**
 * A natural-armour defense pool converted from an Armor Class: a d20, plus a die for hides,
 * shells and plating tougher than average (AC 12+), or minus one for soft bodies (below 10).
 */
export function naturalDefense(armorClass: number): PoolDie[] {
  const base = poolDie(1, 20, 'Natural armour');
  const extra = naturalArmourDie(armorClass);
  if (extra === null) {
    return [base];
  }
  return [base, poolDie(1, extra.die, extra.sign > 0 ? 'Tough hide' : 'Soft body', extra.sign)];
}

export const COVER_LEVELS = ['none', 'half', 'three-quarters', 'total'] as const;

export type Cover = (typeof COVER_LEVELS)[number];

/**
 * Dice that cover adds to defense rolls and Agility saving throws, or null for total cover,
 * which means the target can't be targeted directly.
 */
export function coverDice(cover: Cover): PoolDie[] | null {
  switch (cover) {
    case 'none':
      return [];
    case 'half':
      return [poolDie(1, 4, 'Half cover')];
    case 'three-quarters':
      return [poolDie(1, 8, 'Three-quarters cover')];
    case 'total':
      return null;
  }
}
