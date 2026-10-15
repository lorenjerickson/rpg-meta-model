import { describe, expect, it } from 'vitest';
import { formatMoney } from '../core/currency';
import { makeCharacter } from '../testing/characters';
import type { Character } from './character';
import { LODGINGS, findLodging, longRest, shortRest, type LodgingDefinition } from './rests';

function lodging(id: string): LodgingDefinition {
  const found = findLodging(id);
  if (found === undefined) {
    throw new Error(`Missing ${id}`);
  }
  return found;
}

/** An RNG that always rolls the highest face, or the lowest. */
const HIGH = () => 0.999;
const LOW = () => 0;

/** A worn-out 5th-level scholar (5d6 Hit Dice, Hardiness +2, proficient in Sanity saves). */
function weary(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    hitPoints: { current: 10, max: 32, temporary: 3 },
    hitDiceSpent: { 6: 4 },
    exhaustion: 2,
    madness: 2,
    conditions: ['intoxicated', 'poisoned'],
    heroicInspiration: false,
    deathSaves: { successes: 1, failures: 1 },
    inventory: [
      {
        itemId: 'concussion-horn',
        quantity: 1,
        equipped: true,
        apparatus: { charges: 0, malfunctioning: false },
      },
      {
        itemId: 'galvanic-paralyser',
        quantity: 1,
        equipped: true,
        apparatus: { charges: 0, malfunctioning: false },
      },
    ],
    ...overrides,
  });
}

describe('short rest', () => {
  it('spends Hit Dice to regain Hit Points with the Hardiness modifier', () => {
    const result = shortRest(weary({ hitDiceSpent: {} }), { hitDice: { 6: 2 }, rng: () => 0.5 });
    // Each d6 rolls a 4, plus Hardiness +2.
    expect(result.hitPointsRegained).toBe(12);
    expect(result.character.hitPoints.current).toBe(22);
    expect(result.character.hitDiceSpent).toEqual({ 6: 2 });
    expect(result.countedAs).toBe('short');
  });

  it("refuses to spend Hit Dice the character doesn't have", () => {
    expect(() => shortRest(weary(), { hitDice: { 6: 2 } })).toThrow(/has 1 d6 Hit Dice/);
    expect(() => shortRest(weary(), { hitDice: { 10: 1 } })).toThrow(/has 0 d10/);
  });

  it('sobers up and recharges only clockwork and steam apparatus', () => {
    const result = shortRest(weary());
    expect(result.character.conditions).toEqual(['poisoned']);
    expect(result.apparatusRecharged).toEqual(['concussion-horn']);
    expect(result.character.inventory.map((entry) => entry.apparatus?.charges)).toEqual([3, 0]);
    expect(result.character.exhaustion).toBe(2);
    expect(result.madnessRecovery).toBeNull();
  });
});

describe('long rest', () => {
  it('restores a character fully in a hotel', () => {
    const result = longRest(weary(), { lodging: lodging('hotel'), rng: HIGH });
    const { character } = result;
    expect(result.countedAs).toBe('long');
    expect(character.hitPoints).toEqual({ current: 32, max: 32, temporary: 0 });
    expect(character.hitDiceSpent).toEqual({});
    expect(character.exhaustion).toBe(1);
    expect(character.deathSaves).toEqual({ successes: 0, failures: 0 });
    expect(character.heroicInspiration).toBe(true);
    expect(character.conditions).toEqual(['poisoned']);
    expect(result.apparatusRecharged).toEqual(['concussion-horn', 'galvanic-paralyser']);
  });

  it('lets a Sanity save recover one level of Madness', () => {
    const recovered = longRest(weary({ exhaustion: 0 }), { lodging: lodging('hotel'), rng: HIGH });
    // d20 (20) + proficiency d6 (6) − Madness 2d4 (8).
    expect(recovered.madnessRecovery).toEqual({ natural: 20, total: 18, success: true });
    expect(recovered.character.madness).toBe(1);

    const relapsed = longRest(weary(), { lodging: lodging('lodging-house'), rng: LOW });
    expect(relapsed.madnessRecovery?.success).toBe(false);
    expect(relapsed.character.madness).toBe(2);
  });

  it('recovers less in a doss-house', () => {
    const { character, exhaustionRemoved } = longRest(weary(), {
      lodging: lodging('doss-house'),
      rng: HIGH,
    });
    expect(exhaustionRemoved).toBe(0);
    expect(character.exhaustion).toBe(2);
    // Half of 5 Hit Dice, rounded down: 2 of the 4 spent come back.
    expect(character.hitDiceSpent).toEqual({ 6: 2 });
  });

  it('removes two levels of Exhaustion in a country house', () => {
    expect(longRest(weary(), { lodging: lodging('country-house') }).character.exhaustion).toBe(0);
  });

  it('only counts as a Short Rest when sleeping rough or interrupted', () => {
    const rough = longRest(weary(), { lodging: lodging('sleeping-rough') });
    expect(rough.countedAs).toBe('short');
    expect(rough.character.hitPoints.current).toBe(10);
    expect(rough.character.exhaustion).toBe(2);

    const interrupted = longRest(weary(), { lodging: lodging('hotel'), interrupted: true });
    expect(interrupted.countedAs).toBe('short');
    expect(interrupted.character.heroicInspiration).toBe(false);
  });
});

describe('lodgings', () => {
  it('get dearer and more restful from worst to best', () => {
    const costs = LODGINGS.map((entry) => entry.costPerNight);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
    expect(LODGINGS[0]?.safe).toBe(false);
    expect(LODGINGS.slice(1).every((entry) => entry.safe)).toBe(true);
    expect(formatMoney(lodging('doss-house').costPerNight)).toBe('4d');
    expect(formatMoney(lodging('country-house').costPerNight)).toBe('£1 1s');
  });
});
