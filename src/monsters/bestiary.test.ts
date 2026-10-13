import { describe, expect, it } from 'vitest';
import { attributeModifier } from '../core/attributes';
import { CREATURE_TYPES } from '../core/creatures';
import { averageRoll } from '../core/dice';
import { MONSTERS, findMonster } from './catalog';
import { challengeRatingInfo } from './challenge';
import { rateEncounter } from './encounters';
import { MONSTER_ORIGINS, monsterProficiencyBonus, monsterXp } from './statBlock';

function monster(id: string) {
  const found = findMonster(id);
  if (found === undefined) {
    throw new Error(`Missing ${id}`);
  }
  return found;
}

describe('bestiary', () => {
  it('has a large selection with unique ids', () => {
    const ids = MONSTERS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(MONSTERS.length).toBeGreaterThanOrEqual(50);
  });

  it.each(MONSTERS.map((entry) => [entry.id, entry] as const))(
    '%s is a well-formed stat block',
    (_id, entry) => {
      expect(CREATURE_TYPES).toContain(entry.creatureType);
      expect(MONSTER_ORIGINS).toContain(entry.origin);
      expect(() => challengeRatingInfo(entry.challengeRating)).not.toThrow();
      expect(entry.hitPoints.average).toBe(averageRoll(entry.hitPoints.formula));
      expect(entry.hitPoints.average).toBeGreaterThan(0);
      expect(entry.actions.length).toBeGreaterThan(0);
      expect(entry.description).toBeTruthy();

      const abilities = [
        ...entry.traits,
        ...entry.actions,
        ...entry.bonusActions,
        ...entry.reactions,
      ];
      const ids = abilities.map((ability) => ability.id);
      expect(new Set(ids).size, 'ability ids').toBe(ids.length);
      for (const ability of abilities) {
        expect(ability.description.length, ability.id).toBeGreaterThan(10);
      }
    },
  );

  it('keeps anomalies and the reanimated consistent with their origin', () => {
    for (const entry of MONSTERS) {
      if (entry.creatureType === 'anomaly') {
        expect(entry.origin, entry.id).toBe('anomaly');
      }
      if (entry.creatureType === 'undead') {
        expect(entry.origin, entry.id).toBe('reanimation');
      }
    }
  });

  it('covers every creature type', () => {
    const used = new Set(MONSTERS.map((entry) => entry.creatureType));
    expect([...used].sort()).toEqual([...CREATURE_TYPES].sort());
  });

  it('uses Sanity saves for the horrors', () => {
    const sanity = MONSTERS.filter((entry) =>
      [...entry.traits, ...entry.actions].some(
        (ability) => ability.savingThrow?.attribute === 'sanity',
      ),
    );
    expect(sanity.length).toBeGreaterThanOrEqual(8);
  });

  it('contains no magical creatures or terms', () => {
    const text = JSON.stringify(MONSTERS).toLowerCase();
    const terms = [
      'magic',
      'spell',
      'arcane',
      'mystic',
      'wizard',
      'enchant',
      'divine',
      'celestial',
      'fey',
      'fiend',
      'demon',
      'devil',
      'elemental',
      'necrotic',
      'radiant',
      'curse',
    ];
    // "Electromagnetic forces" is fine; Force as a damage type is not.
    expect(text).not.toContain('"type":"force"');
    for (const term of terms) {
      expect(text, term).not.toMatch(new RegExp(`\\b${term}`));
    }
  });
});

describe('generated stat-block numbers', () => {
  it('derives attack bonuses and damage from attributes and proficiency', () => {
    const wolf = monster('wolf');
    const bite = wolf.actions.find((entry) => entry.id === 'bite');
    expect(bite?.attack?.bonus).toBe(attributeModifier(14) + monsterProficiencyBonus(wolf));
    expect(bite?.description).toBe(
      'Melee Attack Roll: +4, reach 5 ft. Hit: 5 (1d6 + 2) Piercing damage. If the target is ' +
        'Medium or smaller, it has the Prone condition.',
    );
  });

  it('derives save DCs and describes failure and success', () => {
    const hound = monster('incendiary-hound');
    const breath = hound.actions.find((entry) => entry.id === 'naphtha-breath');
    expect(breath?.savingThrow).toMatchObject({ attribute: 'agility', dc: 12 });
    expect(breath?.description).toBe(
      'Agility Saving Throw: DC 12, each creature in a 15-foot Cone. Failure: 17 (5d6) Fire ' +
        'damage. Success: Half damage.',
    );
    expect(breath?.usage).toEqual({ kind: 'recharge', minimum: 5 });
  });

  it('derives initiative, passive Perception and saving throws', () => {
    const progenitor = monster('abyssal-progenitor');
    expect(progenitor.initiative).toEqual({ modifier: -1, score: 9 });
    expect(progenitor.passivePerception).toBe(10 + 2 + 2 * 4);
    expect(progenitor.savingThrows).toEqual({ hardiness: 6, intellect: 8, wisdom: 6, sanity: 9 });
    expect(progenitor.legendaryActions?.usesInLair).toBe(4);
  });

  it('feeds encounter building', () => {
    const party = [3, 3, 3, 3];
    const ghouls = (count: number) =>
      Array.from({ length: count }, () => monsterXp(monster('ghoul')));
    expect(rateEncounter(party, ghouls(3))).toBe('low');
    expect(rateEncounter(party, ghouls(4))).toBe('moderate');
  });
});
