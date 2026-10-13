import {
  ATTRIBUTES,
  PLAYER_ATTRIBUTE_SCORE_CAP,
  type Attribute,
  type AttributeScores,
} from '../core/attributes';

/** One score per attribute. */
export const STANDARD_ARRAY = [15, 14, 13, 12, 11, 10, 9, 8] as const;

/** What the standard array costs, so the two methods stay equivalent. */
export const POINT_BUY_BUDGET = 31;

/** Point cost of each score under point buy. Scores outside 8-15 can't be bought. */
export const POINT_BUY_COSTS: Readonly<Record<number, number>> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function pointBuyCost(scores: AttributeScores): number {
  return ATTRIBUTES.reduce((total, attribute) => {
    const cost = POINT_BUY_COSTS[scores[attribute]];
    if (cost === undefined) {
      throw new RangeError(
        `Point buy scores must be 8-15; ${attribute} is ${String(scores[attribute])}`,
      );
    }
    return total + cost;
  }, 0);
}

export function isValidPointBuy(scores: AttributeScores): boolean {
  try {
    return pointBuyCost(scores) <= POINT_BUY_BUDGET;
  } catch {
    return false;
  }
}

/** A background raises one of its attributes by 2 and another by 1, or all three by 1. */
export type BackgroundAttributeIncrease =
  { kind: 'two-and-one'; plusTwo: Attribute; plusOne: Attribute } | { kind: 'one-each' };

export function applyBackgroundAttributeIncrease(
  scores: AttributeScores,
  backgroundAttributes: readonly [Attribute, Attribute, Attribute],
  increase: BackgroundAttributeIncrease,
): AttributeScores {
  const increases: Partial<Record<Attribute, number>> = {};
  if (increase.kind === 'one-each') {
    for (const attribute of backgroundAttributes) {
      increases[attribute] = 1;
    }
  } else {
    const { plusTwo, plusOne } = increase;
    if (plusTwo === plusOne) {
      throw new Error('The +2 and +1 must go to different attributes');
    }
    for (const attribute of [plusTwo, plusOne]) {
      if (!backgroundAttributes.includes(attribute)) {
        throw new Error(`${attribute} is not one of this background's attributes`);
      }
    }
    increases[plusTwo] = 2;
    increases[plusOne] = 1;
  }

  const result = { ...scores };
  for (const attribute of ATTRIBUTES) {
    const raised = result[attribute] + (increases[attribute] ?? 0);
    if (raised > PLAYER_ATTRIBUTE_SCORE_CAP) {
      throw new RangeError(
        `${attribute} would be ${String(raised)}, above ${String(PLAYER_ATTRIBUTE_SCORE_CAP)}`,
      );
    }
    result[attribute] = raised;
  }
  return result;
}
