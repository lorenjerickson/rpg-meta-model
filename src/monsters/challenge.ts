export interface ChallengeRatingInfo {
  challengeRating: number;
  xp: number;
  proficiencyBonus: number;
}

const XP_BY_CHALLENGE_RATING: readonly (readonly [number, number])[] = [
  [0, 10],
  [1 / 8, 25],
  [1 / 4, 50],
  [1 / 2, 100],
  [1, 200],
  [2, 450],
  [3, 700],
  [4, 1100],
  [5, 1800],
  [6, 2300],
  [7, 2900],
  [8, 3900],
  [9, 5000],
  [10, 5900],
  [11, 7200],
  [12, 8400],
  [13, 10000],
  [14, 11500],
  [15, 13000],
  [16, 15000],
  [17, 18000],
  [18, 20000],
  [19, 22000],
  [20, 25000],
  [21, 33000],
  [22, 41000],
  [23, 50000],
  [24, 62000],
  [25, 75000],
  [26, 90000],
  [27, 105000],
  [28, 120000],
  [29, 135000],
  [30, 155000],
];

/** +2 below CR 5, rising by 1 every four CRs to +9 at CR 29-30. */
function proficiencyBonusForChallengeRating(challengeRating: number): number {
  return challengeRating < 1 ? 2 : 2 + Math.floor((challengeRating - 1) / 4);
}

/**
 * Every challenge rating with its XP value and proficiency bonus. A CR 0 creature is worth
 * 10 XP, or 0 XP if it has no effective attacks.
 */
export const CHALLENGE_RATINGS: readonly ChallengeRatingInfo[] = XP_BY_CHALLENGE_RATING.map(
  ([challengeRating, xp]) => ({
    challengeRating,
    xp,
    proficiencyBonus: proficiencyBonusForChallengeRating(challengeRating),
  }),
);

export function challengeRatingInfo(challengeRating: number): ChallengeRatingInfo {
  const info = CHALLENGE_RATINGS.find((entry) => entry.challengeRating === challengeRating);
  if (info === undefined) {
    throw new RangeError(`${String(challengeRating)} is not a challenge rating`);
  }
  return info;
}

const FRACTIONS: Readonly<Record<string, number>> = { '1/8': 1 / 8, '1/4': 1 / 4, '1/2': 1 / 2 };

/** Formats 0.125 as "1/8", 0.5 as "1/2" and whole numbers as-is. */
export function formatChallengeRating(challengeRating: number): string {
  const fraction = Object.entries(FRACTIONS).find(([, value]) => value === challengeRating);
  return fraction ? fraction[0] : String(challengeRating);
}

export function parseChallengeRating(text: string): number {
  const trimmed = text.trim();
  const value = FRACTIONS[trimmed] ?? Number(trimmed);
  return challengeRatingInfo(value).challengeRating;
}
