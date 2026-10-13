import { describe, expect, it } from 'vitest';
import { ATTRIBUTES } from '../core/attributes';
import { emptyPurse } from '../core/currency';
import { NO_DEATH_SAVES } from '../combat/deathSaves';
import {
  POINT_BUY_BUDGET,
  STANDARD_ARRAY,
  applyBackgroundAttributeIncrease,
  isValidPointBuy,
  pointBuyCost,
} from './attributeGeneration';
import type { Character } from './character';
import { CLASSES, CLASS_CORE, meetsMulticlassPrerequisite } from './classes';
import {
  characterPactMagic,
  characterProficiencyBonus,
  characterSpellAttackBonus,
  characterSpellSaveDc,
  characterSpellSlots,
  hitDiceRemaining,
  passivePerception,
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
    speciesId: 'human',
    backgroundId: 'sage',
    classes: [{ classId: 'wizard', level: 5 }],
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
      skills: { arcana: 'expertise', perception: 'proficient', history: 'proficient' },
      weapons: [{ category: 'simple' }],
      armor: [],
      tools: [],
      languages: ['common', 'elvish'],
    },
    feats: [],
    inventory: [],
    currency: emptyPurse(),
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

describe('classes', () => {
  it('gives every class two different saving throws', () => {
    for (const classId of CLASSES) {
      const [first, second] = CLASS_CORE[classId].savingThrows;
      expect(first, classId).not.toBe(second);
    }
  });

  it('gives Fortune and Sanity saves to their classes', () => {
    const savingWith = (attribute: 'fortune' | 'sanity') =>
      CLASSES.filter((classId) => CLASS_CORE[classId].savingThrows.includes(attribute));
    expect(savingWith('fortune')).toEqual(['bard', 'rogue']);
    expect(savingWith('sanity')).toEqual(['warlock', 'wizard']);
  });

  it('checks multiclass prerequisites', () => {
    const scores = {
      might: 13,
      agility: 12,
      hardiness: 10,
      intellect: 10,
      wisdom: 13,
      charisma: 12,
      fortune: 10,
      sanity: 10,
    };
    expect(meetsMulticlassPrerequisite('fighter', scores)).toBe(true);
    expect(meetsMulticlassPrerequisite('monk', scores)).toBe(false);
    expect(meetsMulticlassPrerequisite('paladin', scores)).toBe(false);
    expect(meetsMulticlassPrerequisite('cleric', scores)).toBe(true);
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
  const wizard = makeCharacter();

  it('computes level and proficiency', () => {
    expect(totalLevel(wizard)).toBe(5);
    expect(characterProficiencyBonus(wizard)).toBe(3);
  });

  it('computes saves and skills', () => {
    expect(savingThrowModifier(wizard, 'intellect')).toBe(6);
    expect(savingThrowModifier(wizard, 'might')).toBe(-1);
    expect(savingThrowModifier(wizard, 'sanity')).toBe(3);
    expect(savingThrowModifier(wizard, 'wisdom')).toBe(1);
    expect(skillModifier(wizard, 'arcana')).toBe(9);
    expect(skillModifier(wizard, 'stealth')).toBe(2);
    expect(passivePerception(wizard)).toBe(14);
  });

  it('computes spellcasting', () => {
    expect(characterSpellSlots(wizard)).toEqual([4, 3, 2]);
    expect(characterSpellSaveDc(wizard, 'wizard')).toBe(14);
    expect(characterSpellAttackBonus(wizard, 'wizard')).toBe(6);
    expect(characterPactMagic(wizard)).toBeNull();
    expect(() => characterSpellSaveDc(wizard, 'fighter')).toThrow(/not a spellcasting class/);
  });

  it('combines multiclass spell slots and keeps pact magic separate', () => {
    const multiclass = makeCharacter({
      classes: [
        { classId: 'paladin', level: 5 },
        { classId: 'sorcerer', level: 3 },
        { classId: 'warlock', level: 2 },
      ],
    });
    // Paladin 5 -> 3, plus Sorcerer 3 = caster level 6.
    expect(characterSpellSlots(multiclass)).toEqual([4, 3, 3]);
    expect(characterPactMagic(multiclass)).toEqual({ slots: 2, slotLevel: 1 });
  });

  it('tracks remaining hit dice by die size', () => {
    const multiclass = makeCharacter({
      classes: [
        { classId: 'fighter', level: 3 },
        { classId: 'paladin', level: 2 },
        { classId: 'wizard', level: 1 },
      ],
      hitDiceSpent: { 10: 2 },
    });
    expect(hitDiceRemaining(multiclass)).toEqual({ 10: 3, 6: 1 });
  });
});
