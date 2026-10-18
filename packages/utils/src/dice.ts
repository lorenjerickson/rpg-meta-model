/**
 * Dice values as plain data, and their notation ("2d6 + 3"), so generated forms can show and edit
 * them as one field. Mirrors the system's `DiceExpression`.
 */

export const DICE_SIZES = [2, 4, 6, 8, 10, 12, 20, 100] as const;

export interface DiceValue {
  terms: readonly { count: number; die: number }[];
  modifier: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const own = Object.keys(value);
  return own.length === keys.length && keys.every((key) => own.includes(key));
}

/** A `{ terms, modifier }` object of whole dice counts and supported die sizes. */
export function isDiceValue(value: unknown): value is DiceValue {
  return (
    isRecord(value) &&
    hasKeys(value, ['terms', 'modifier']) &&
    Number.isInteger(value.modifier) &&
    Array.isArray(value.terms) &&
    value.terms.every(
      (term: unknown) =>
        isRecord(term) &&
        hasKeys(term, ['count', 'die']) &&
        Number.isInteger(term.count) &&
        (term.count as number) > 0 &&
        (DICE_SIZES as readonly unknown[]).includes(term.die),
    )
  );
}

/** "2d6 + 3", "1d8 - 1", or just the modifier when there are no dice. */
export function formatDiceNotation(value: DiceValue): string {
  const dice = value.terms.map((term) => `${String(term.count)}d${String(term.die)}`).join(' + ');
  if (!dice) return String(value.modifier);
  if (!value.modifier) return dice;
  return `${dice} ${value.modifier < 0 ? '-' : '+'} ${String(Math.abs(value.modifier))}`;
}

const NOTATION = /^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/;
const TERM = /([+-]?)(?:(\d*)d(\d+)|(\d+))/g;

/** Parses notation such as "d20", "2d6+3" or "1d8 + 2d6 - 1"; undefined when it isn't valid. */
export function parseDiceNotation(notation: string): DiceValue | undefined {
  const compact = notation.replace(/\s+/g, '').toLowerCase();
  if (!NOTATION.test(compact)) return undefined;
  const terms: { count: number; die: number }[] = [];
  let modifier = 0;
  for (const [, sign, countText, sizeText, constantText] of compact.matchAll(TERM)) {
    const direction = sign === '-' ? -1 : 1;
    if (constantText !== undefined) {
      modifier += direction * Number(constantText);
      continue;
    }
    const die = Number(sizeText);
    const count = countText ? Number(countText) : 1;
    if (direction < 0 || count < 1 || !(DICE_SIZES as readonly number[]).includes(die)) {
      return undefined;
    }
    terms.push({ count, die });
  }
  return { terms, modifier };
}

/** The keys of a signed roll of one kind of die, such as -1d4, stored as separate fields. */
export const SIGNED_DICE_KEYS = ['count', 'die', 'sign'] as const;

export interface SignedDice {
  count: number;
  die: number;
  sign: 1 | -1;
}

/** An object whose count, die and sign are a valid signed roll; other keys are allowed. */
export function hasSignedDice(value: unknown): boolean {
  return (
    isRecord(value) &&
    Number.isInteger(value.count) &&
    (value.count as number) > 0 &&
    (DICE_SIZES as readonly unknown[]).includes(value.die) &&
    (value.sign === 1 || value.sign === -1)
  );
}

/** "1d4", or "-1d4" when the dice are subtracted. */
export function formatSignedDice(value: SignedDice): string {
  return `${value.sign < 0 ? '-' : ''}${String(value.count)}d${String(value.die)}`;
}

const SIGNED = /^([+-]?)(\d*)d(\d+)$/;

/** Parses "1d4", "+d6" or "-2d4"; undefined when it isn't one signed roll of a supported die. */
export function parseSignedDice(notation: string): SignedDice | undefined {
  const match = SIGNED.exec(notation.replace(/\s+/g, '').toLowerCase());
  if (!match) return undefined;
  const [, sign, countText, dieText] = match;
  const count = countText ? Number(countText) : 1;
  const die = Number(dieText);
  if (count < 1 || !(DICE_SIZES as readonly number[]).includes(die)) return undefined;
  return { count, die, sign: sign === '-' ? -1 : 1 };
}
