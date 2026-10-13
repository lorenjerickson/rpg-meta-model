import {
  ABILITIES,
  PLAYER_ABILITY_SCORE_CAP,
  type Ability,
  type AbilityScores,
} from '../core/abilities';

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export const POINT_BUY_BUDGET = 27;

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

export function pointBuyCost(scores: AbilityScores): number {
  return ABILITIES.reduce((total, ability) => {
    const cost = POINT_BUY_COSTS[scores[ability]];
    if (cost === undefined) {
      throw new RangeError(
        `Point buy scores must be 8-15; ${ability} is ${String(scores[ability])}`,
      );
    }
    return total + cost;
  }, 0);
}

export function isValidPointBuy(scores: AbilityScores): boolean {
  try {
    return pointBuyCost(scores) <= POINT_BUY_BUDGET;
  } catch {
    return false;
  }
}

/** A background raises one of its abilities by 2 and another by 1, or all three by 1. */
export type BackgroundAbilityIncrease =
  { kind: 'two-and-one'; plusTwo: Ability; plusOne: Ability } | { kind: 'one-each' };

export function applyBackgroundAbilityIncrease(
  scores: AbilityScores,
  backgroundAbilities: readonly [Ability, Ability, Ability],
  increase: BackgroundAbilityIncrease,
): AbilityScores {
  const increases: Partial<Record<Ability, number>> = {};
  if (increase.kind === 'one-each') {
    for (const ability of backgroundAbilities) {
      increases[ability] = 1;
    }
  } else {
    const { plusTwo, plusOne } = increase;
    if (plusTwo === plusOne) {
      throw new Error('The +2 and +1 must go to different abilities');
    }
    for (const ability of [plusTwo, plusOne]) {
      if (!backgroundAbilities.includes(ability)) {
        throw new Error(`${ability} is not one of this background's abilities`);
      }
    }
    increases[plusTwo] = 2;
    increases[plusOne] = 1;
  }

  const result = { ...scores };
  for (const ability of ABILITIES) {
    const raised = result[ability] + (increases[ability] ?? 0);
    if (raised > PLAYER_ABILITY_SCORE_CAP) {
      throw new RangeError(
        `${ability} would be ${String(raised)}, above ${String(PLAYER_ABILITY_SCORE_CAP)}`,
      );
    }
    result[ability] = raised;
  }
  return result;
}
