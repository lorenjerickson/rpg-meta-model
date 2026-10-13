import { describe, expect, it } from 'vitest';
import { emptyPurse } from '../core/currency';
import { NO_DEATH_SAVES } from '../combat/deathSaves';
import { applyBackgroundAbilityIncrease, isValidPointBuy, pointBuyCost } from './abilityGeneration';
import type { Character } from './character';
import { meetsMulticlassPrerequisite } from './classes';
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
    abilityScores: { str: 8, dex: 14, con: 14, int: 17, wis: 12, cha: 10 },
    hitPoints: { current: 32, max: 32, temporary: 0 },
    hitDiceSpent: {},
    deathSaves: NO_DEATH_SAVES,
    exhaustion: 0,
    conditions: [],
    heroicInspiration: false,
    proficiencies: {
      savingThrows: ['int', 'wis'],
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

describe('ability generation', () => {
  it('prices point buy', () => {
    const scores = { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 };
    expect(pointBuyCost(scores)).toBe(27);
    expect(isValidPointBuy(scores)).toBe(true);
    expect(isValidPointBuy({ ...scores, int: 9 })).toBe(false);
    expect(isValidPointBuy({ ...scores, str: 16 })).toBe(false);
  });

  it('applies background increases', () => {
    const scores = { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 };
    expect(
      applyBackgroundAbilityIncrease(scores, ['con', 'int', 'wis'], {
        kind: 'two-and-one',
        plusTwo: 'int',
        plusOne: 'con',
      }),
    ).toEqual({ ...scores, int: 17, con: 14 });
    expect(
      applyBackgroundAbilityIncrease(scores, ['con', 'int', 'wis'], { kind: 'one-each' }),
    ).toEqual({ ...scores, con: 14, int: 16, wis: 13 });
  });

  it('rejects increases outside the background or above 20', () => {
    const scores = { str: 8, dex: 14, con: 13, int: 19, wis: 12, cha: 10 };
    expect(() =>
      applyBackgroundAbilityIncrease(scores, ['con', 'int', 'wis'], {
        kind: 'two-and-one',
        plusTwo: 'str',
        plusOne: 'con',
      }),
    ).toThrow(/not one of/);
    expect(() =>
      applyBackgroundAbilityIncrease(scores, ['con', 'int', 'wis'], {
        kind: 'two-and-one',
        plusTwo: 'int',
        plusOne: 'con',
      }),
    ).toThrow(RangeError);
  });
});

describe('classes', () => {
  it('checks multiclass prerequisites', () => {
    const scores = { str: 13, dex: 12, con: 10, int: 10, wis: 13, cha: 12 };
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
    expect(savingThrowModifier(wizard, 'int')).toBe(6);
    expect(savingThrowModifier(wizard, 'str')).toBe(-1);
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
