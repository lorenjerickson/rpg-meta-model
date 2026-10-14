import { ATTRIBUTE_NAMES, attributeModifier, type Attribute } from './attributes';
import { rollDie, type DieSize, type Rng } from './dice';

/** One kind of die in a pool, added or subtracted, with where it came from. */
export interface PoolDie {
  count: number;
  die: DieSize;
  sign: 1 | -1;
  /** What contributed the die, e.g. "Agility", "Helmet" or "Poisoned". */
  source: string;
}

/**
 * A collection of dice rolled together and summed, e.g. an attack's attribute and proficiency
 * dice, or a defense roll's armour dice. The d20 of a contested roll is rolled separately.
 */
export type DicePool = readonly PoolDie[];

export function poolDie(count: number, die: DieSize, source: string, sign: 1 | -1 = 1): PoolDie {
  return { count, die, sign, source };
}

const LARGEST_SINGLE_DIE = 6;

/**
 * Dice equivalent to a flat modifier: a die twice the modifier's size (+1 is a d2, +3 a d6,
 * +6 a d12), with an extra die for anything above +6. Negative modifiers subtract the same
 * dice. Each die averages half a point more than the modifier it replaces.
 */
export function modifierDice(modifier: number, source: string): PoolDie[] {
  const magnitude = Math.abs(modifier);
  if (magnitude === 0) {
    return [];
  }
  const sign = modifier < 0 ? -1 : 1;
  const sizeFor = (amount: number) => (amount * 2) as DieSize;
  const first = Math.min(magnitude, LARGEST_SINGLE_DIE);
  const dice = [poolDie(1, sizeFor(first), source, sign)];
  if (magnitude > LARGEST_SINGLE_DIE) {
    dice.push(
      poolDie(
        1,
        sizeFor(Math.min(magnitude - LARGEST_SINGLE_DIE, LARGEST_SINGLE_DIE)),
        source,
        sign,
      ),
    );
  }
  return dice;
}

/** The dice an attribute score adds to a roll. */
export function attributeDice(score: number, attribute: Attribute): PoolDie[] {
  return modifierDice(attributeModifier(score), ATTRIBUTE_NAMES[attribute]);
}

/** The dice a proficiency bonus adds to a roll: a d4 at +2, a d6 at +3, up to a d12 at +6. */
export function proficiencyDice(proficiencyBonus: number): PoolDie[] {
  return modifierDice(proficiencyBonus, 'Proficiency');
}

export interface PoolRoll {
  total: number;
  rolls: readonly { source: string; die: DieSize; value: number; sign: 1 | -1 }[];
}

export function rollPool(pool: DicePool, rng: Rng = Math.random): PoolRoll {
  const rolls = pool.flatMap(({ count, die, sign, source }) =>
    Array.from({ length: count }, () => ({ source, die, sign, value: rollDie(die, rng) })),
  );
  return { total: rolls.reduce((sum, roll) => sum + roll.sign * roll.value, 0), rolls };
}

/** The pool's average total. */
export function poolAverage(pool: DicePool): number {
  return pool.reduce((sum, { count, die, sign }) => sum + (sign * count * (die + 1)) / 2, 0);
}

/**
 * Formats a pool such as "d4 (Agility) + d4 (Proficiency) − d6 (Poisoned)", optionally after
 * a leading term: `formatPool(pool, 'd20')` gives "d20 + d4 (Agility) − d6 (Poisoned)".
 */
export function formatPool(pool: DicePool, leading?: string): string {
  let text = leading ?? '';
  for (const { count, die, sign, source } of pool) {
    const dice = `${count === 1 ? '' : String(count)}d${String(die)} (${source})`;
    if (text === '') {
      text = sign < 0 ? `−${dice}` : dice;
    } else {
      text += ` ${sign < 0 ? '−' : '+'} ${dice}`;
    }
  }
  return text === '' ? '0' : text;
}
