export const DIE_SIZES = [2, 4, 6, 8, 10, 12, 20, 100] as const;

export type DieSize = (typeof DIE_SIZES)[number];

export interface DiceTerm {
  count: number;
  die: DieSize;
}

/** A sum of dice plus a flat modifier, e.g. 2d6 + 1d4 + 3. */
export interface DiceExpression {
  terms: readonly DiceTerm[];
  modifier: number;
}

/** Returns a float in [0, 1), like Math.random. Inject one to make rolls deterministic. */
export type Rng = () => number;

export interface DiceRoll {
  total: number;
  rolls: readonly number[];
  modifier: number;
}

export function isDieSize(value: number): value is DieSize {
  return (DIE_SIZES as readonly number[]).includes(value);
}

export function dice(count: number, die: DieSize, modifier = 0): DiceExpression {
  return { terms: [{ count, die }], modifier };
}

const NOTATION = /^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/;
const TERM = /([+-]?)(?:(\d*)d(\d+)|(\d+))/g;

/** Parses notation such as "d20", "2d6+3" or "1d8 + 2d6 - 1". */
export function parseDice(notation: string): DiceExpression {
  const compact = notation.replace(/\s+/g, '').toLowerCase();
  if (!NOTATION.test(compact)) {
    throw new Error(`Invalid dice notation: "${notation}"`);
  }

  const terms: DiceTerm[] = [];
  let modifier = 0;
  for (const [, sign, countText, sizeText, constantText] of compact.matchAll(TERM)) {
    const direction = sign === '-' ? -1 : 1;
    if (constantText !== undefined) {
      modifier += direction * Number(constantText);
      continue;
    }
    const die = Number(sizeText);
    if (!isDieSize(die)) {
      throw new Error(`Unsupported die d${String(die)} in "${notation}"`);
    }
    if (direction < 0) {
      throw new Error(`Subtracted dice are not supported: "${notation}"`);
    }
    terms.push({ count: countText ? Number(countText) : 1, die });
  }
  return { terms, modifier };
}

/** Formats an expression as notation, e.g. "2d6 + 3" or "1d8 - 1". */
export function formatDice(expression: DiceExpression): string {
  const diceText = expression.terms
    .map((term) => `${String(term.count)}d${String(term.die)}`)
    .join(' + ');
  if (diceText === '') {
    return String(expression.modifier);
  }
  if (expression.modifier === 0) {
    return diceText;
  }
  const sign = expression.modifier < 0 ? '-' : '+';
  return `${diceText} ${sign} ${String(Math.abs(expression.modifier))}`;
}

export function rollDie(die: DieSize, rng: Rng = Math.random): number {
  return Math.floor(rng() * die) + 1;
}

export interface RollOptions {
  rng?: Rng;
  /** Critical hits roll every damage die twice; the flat modifier is added once. */
  critical?: boolean;
}

export function rollDice(expression: DiceExpression, options: RollOptions = {}): DiceRoll {
  const rng = options.rng ?? Math.random;
  const multiplier = options.critical ? 2 : 1;
  const rolls: number[] = [];
  for (const term of expression.terms) {
    for (let i = 0; i < term.count * multiplier; i++) {
      rolls.push(rollDie(term.die, rng));
    }
  }
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + expression.modifier;
  return { total, rolls, modifier: expression.modifier };
}

/** Average result rounded down, as used for stat-block hit points and fixed damage. */
export function averageRoll(expression: DiceExpression): number {
  const diceAverage = expression.terms.reduce(
    (sum, term) => sum + (term.count * (term.die + 1)) / 2,
    0,
  );
  return Math.floor(diceAverage + expression.modifier);
}

export function minimumRoll(expression: DiceExpression): number {
  return expression.terms.reduce((sum, term) => sum + term.count, 0) + expression.modifier;
}

export function maximumRoll(expression: DiceExpression): number {
  return (
    expression.terms.reduce((sum, term) => sum + term.count * term.die, 0) + expression.modifier
  );
}
