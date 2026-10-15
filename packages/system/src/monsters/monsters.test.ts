import { describe, expect, it } from 'vitest';
import { challengeRatingInfo, formatChallengeRating, parseChallengeRating } from './challenge';
import { encounterXpBudget, rateEncounter } from './encounters';

describe('challenge ratings', () => {
  it.each([
    [0, 10, 2],
    [1 / 8, 25, 2],
    [1, 200, 2],
    [5, 1800, 3],
    [10, 5900, 4],
    [17, 18000, 6],
    [21, 33000, 7],
    [30, 155000, 9],
  ])('CR %f is worth %i XP with proficiency +%i', (cr, xp, proficiencyBonus) => {
    expect(challengeRatingInfo(cr)).toEqual({ challengeRating: cr, xp, proficiencyBonus });
  });

  it('rejects unknown challenge ratings', () => {
    expect(() => challengeRatingInfo(1.5)).toThrow(RangeError);
  });

  it('formats and parses fractions', () => {
    expect(formatChallengeRating(0.125)).toBe('1/8');
    expect(formatChallengeRating(0.5)).toBe('1/2');
    expect(formatChallengeRating(12)).toBe('12');
    expect(parseChallengeRating('1/4')).toBe(0.25);
    expect(parseChallengeRating(' 7 ')).toBe(7);
  });
});

describe('encounters', () => {
  const party = [3, 3, 3, 4];

  it('sums per-character budgets', () => {
    expect(encounterXpBudget(party, 'low')).toBe(150 * 3 + 250);
    expect(encounterXpBudget(party, 'high')).toBe(400 * 3 + 500);
  });

  it('rates encounters by total XP', () => {
    expect(rateEncounter(party, [200, 200])).toBe('low');
    expect(rateEncounter(party, [700, 200])).toBe('moderate');
    expect(rateEncounter(party, [1100, 450])).toBe('high');
    expect(rateEncounter(party, [1800, 200])).toBe('beyond-high');
  });
});
