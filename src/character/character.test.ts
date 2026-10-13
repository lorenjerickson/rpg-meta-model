import { describe, expect, it } from 'vitest';
import { ATTRIBUTES } from '../core/attributes';
import { NO_DEATH_SAVES } from '../combat/deathSaves';
import {
  POINT_BUY_BUDGET,
  STANDARD_ARRAY,
  applyBackgroundAttributeIncrease,
  isValidPointBuy,
  pointBuyCost,
} from './attributeGeneration';
import type { Character } from './character';
import {
  characterActions,
  characterOperatorAttackBonus,
  characterOperatorDc,
  characterProfessionDc,
  characterProficiencyBonus,
  hitDiceRemaining,
  passivePerception,
  professionRanks,
  savingThrowModifier,
  skillModifier,
  totalLevel,
} from './derived';
import { maxHitPoints } from './hitPoints';
import { experienceForLevel, levelForExperience, proficiencyBonusForLevel } from './progression';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test',
    name: 'Testa',
    ethnicityId: 'welsh',
    backgroundId: 'sage',
    professions: [{ professionId: 'scholar', level: 5, specializationPath: ['occult-researcher'] }],
    experience: 6500,
    size: 'medium',
    speed: { walk: 30 },
    senses: {},
    attributeScores: {
      might: 8,
      agility: 14,
      hardiness: 14,
      intellect: 17,
      wisdom: 12,
      charisma: 10,
      fortune: 10,
      sanity: 10,
    },
    hitPoints: { current: 32, max: 32, temporary: 0 },
    hitDiceSpent: {},
    deathSaves: NO_DEATH_SAVES,
    exhaustion: 0,
    conditions: [],
    heroicInspiration: false,
    proficiencies: {
      savingThrows: ['intellect', 'sanity'],
      skills: { science: 'expertise', perception: 'proficient', history: 'proficient' },
      weapons: [{ category: 'simple' }],
      armor: [],
      tools: [],
      languages: ['english', 'welsh'],
      disciplines: ['aetherics'],
    },
    feats: [],
    inventory: [],
    money: 0,
    ...overrides,
  };
}

describe('progression', () => {
  it('maps experience to level and back', () => {
    expect(levelForExperience(0)).toBe(1);
    expect(levelForExperience(299)).toBe(1);
    expect(levelForExperience(300)).toBe(2);
    expect(levelForExperience(355000)).toBe(20);
    expect(levelForExperience(1_000_000)).toBe(20);
    expect(experienceForLevel(5)).toBe(6500);
  });

  it.each([
    [1, 2],
    [4, 2],
    [5, 3],
    [9, 4],
    [13, 5],
    [17, 6],
    [20, 6],
  ])('level %i has proficiency bonus +%i', (level, bonus) => {
    expect(proficiencyBonusForLevel(level)).toBe(bonus);
  });

  it('rejects levels outside 1-20', () => {
    expect(() => proficiencyBonusForLevel(0)).toThrow(RangeError);
    expect(() => proficiencyBonusForLevel(21)).toThrow(RangeError);
  });
});

describe('attribute generation', () => {
  it('prices point buy', () => {
    const scores = {
      might: 15,
      agility: 15,
      hardiness: 15,
      intellect: 8,
      wisdom: 8,
      charisma: 8,
      fortune: 11,
      sanity: 9,
    };
    expect(pointBuyCost(scores)).toBe(31);
    expect(isValidPointBuy(scores)).toBe(true);
    expect(isValidPointBuy({ ...scores, intellect: 9 })).toBe(false);
    expect(isValidPointBuy({ ...scores, might: 16 })).toBe(false);
  });

  it('prices the standard array at exactly the point buy budget', () => {
    const [might, agility, hardiness, intellect, wisdom, charisma, fortune, sanity] =
      STANDARD_ARRAY;
    expect(STANDARD_ARRAY).toHaveLength(ATTRIBUTES.length);
    expect(
      pointBuyCost({ might, agility, hardiness, intellect, wisdom, charisma, fortune, sanity }),
    ).toBe(POINT_BUY_BUDGET);
  });

  it('applies background increases', () => {
    const scores = {
      might: 8,
      agility: 14,
      hardiness: 13,
      intellect: 15,
      wisdom: 12,
      charisma: 10,
      fortune: 10,
      sanity: 10,
    };
    expect(
      applyBackgroundAttributeIncrease(scores, ['hardiness', 'intellect', 'wisdom'], {
        kind: 'two-and-one',
        plusTwo: 'intellect',
        plusOne: 'hardiness',
      }),
    ).toEqual({ ...scores, intellect: 17, hardiness: 14 });
    expect(
      applyBackgroundAttributeIncrease(scores, ['hardiness', 'intellect', 'wisdom'], {
        kind: 'one-each',
      }),
    ).toEqual({ ...scores, hardiness: 14, intellect: 16, wisdom: 13 });
  });

  it('rejects increases outside the background or above 20', () => {
    const scores = {
      might: 8,
      agility: 14,
      hardiness: 13,
      intellect: 19,
      wisdom: 12,
      charisma: 10,
      fortune: 10,
      sanity: 10,
    };
    expect(() =>
      applyBackgroundAttributeIncrease(scores, ['hardiness', 'intellect', 'wisdom'], {
        kind: 'two-and-one',
        plusTwo: 'might',
        plusOne: 'hardiness',
      }),
    ).toThrow(/not one of/);
    expect(() =>
      applyBackgroundAttributeIncrease(scores, ['hardiness', 'intellect', 'wisdom'], {
        kind: 'two-and-one',
        plusTwo: 'intellect',
        plusOne: 'hardiness',
      }),
    ).toThrow(RangeError);
  });
});

describe('max hit points', () => {
  it('takes the full die at level 1 and the fixed value after', () => {
    const levels = [{ hitDie: 6 as const }, { hitDie: 6 as const }, { hitDie: 6 as const }];
    expect(maxHitPoints(levels, 2)).toBe(8 + 6 + 6);
  });

  it('uses rolls when given and adds at least 1 per level', () => {
    expect(maxHitPoints([{ hitDie: 10 }, { hitDie: 8, roll: 1 }], -3)).toBe(7 + 1);
  });
});

describe('derived character stats', () => {
  const scholar = makeCharacter();

  it('computes level, proficiency and rank', () => {
    expect(totalLevel(scholar)).toBe(5);
    expect(characterProficiencyBonus(scholar)).toBe(3);
    expect(professionRanks(scholar)).toEqual({ scholar: 'apprentice' });
  });

  it('computes saves and skills', () => {
    expect(savingThrowModifier(scholar, 'intellect')).toBe(6);
    expect(savingThrowModifier(scholar, 'might')).toBe(-1);
    expect(savingThrowModifier(scholar, 'sanity')).toBe(3);
    expect(savingThrowModifier(scholar, 'wisdom')).toBe(1);
    expect(skillModifier(scholar, 'science')).toBe(9);
    expect(skillModifier(scholar, 'stealth')).toBe(2);
    expect(passivePerception(scholar)).toBe(14);
  });

  it('computes operator DCs per discipline, with proficiency and attribute', () => {
    expect(characterOperatorDc(scholar, 'aetherics')).toBe(14);
    expect(characterOperatorDc(scholar, 'galvanism')).toBe(11);
    expect(characterOperatorDc(scholar, 'mesmerism')).toBe(8);
    expect(characterOperatorAttackBonus(scholar, 'aetherics')).toBe(6);
  });

  it('computes the profession DC from the best primary attribute', () => {
    expect(characterProfessionDc(scholar, 'scholar')).toBe(14);
    expect(() => characterProfessionDc(scholar, 'alchemist')).toThrow(/Unknown profession/);
  });

  it('collects actions from the profession and specialization path', () => {
    const { actions, bonusActions, reactions } = characterActions(scholar);
    expect(actions).toEqual([]);
    expect(bonusActions.map((entry) => entry.id)).toEqual(['recall-lore', 'forbidden-insight']);
    expect(reactions).toEqual([]);
  });

  it('tracks remaining hit dice by die size across professions', () => {
    const multiProfession = makeCharacter({
      professions: [
        { professionId: 'soldier', level: 3, specializationPath: [] },
        { professionId: 'sailor', level: 2, specializationPath: [] },
        { professionId: 'scholar', level: 1, specializationPath: [] },
      ],
      hitDiceSpent: { 10: 2 },
    });
    expect(hitDiceRemaining(multiProfession)).toEqual({ 10: 3, 6: 1 });
  });
});
