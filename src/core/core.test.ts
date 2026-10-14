import { describe, expect, it } from 'vitest';
import { ACTIONS, ACTION_DEFINITIONS } from './actions';
import { attributeModifier, formatModifier } from './attributes';
import { LANGUAGES, LINGUA_FRANCAS, languageCategory } from './languages';
import {
  CONDITIONS,
  CONDITION_DEFINITIONS,
  conditionDefense,
  conditionDice,
  expandConditions,
  exhaustionDice,
  exhaustionSpeedReduction,
  isLostToMadness,
  madnessDice,
} from './conditions';
import { COINS, formatMoney, guineas, lsd, parseMoney, toLsd } from './currency';
import { passiveScore, resolveD20Test, resolveRollMode, rollD20 } from './d20';
import { adjustDamage } from './damage';
import {
  averageRoll,
  dice,
  formatDice,
  maximumRoll,
  minimumRoll,
  parseDice,
  rollDice,
  type Rng,
} from './dice';
import {
  attributeDice,
  formatPool,
  modifierDice,
  poolAverage,
  poolDie,
  proficiencyDice,
  rollPool,
} from './dicePool';
import { proficiencyContribution } from './proficiency';
import { applicableDice, bonus, defenseTotal, penalty } from './rollModifiers';
import { SKILLS, SKILL_DEFINITIONS } from './skills';
import { durationInSeconds } from './time';

/** An RNG that returns the given values in order, then repeats the last one. */
function sequence(...values: number[]): Rng {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)] ?? 0;
}

/** RNG value that makes rollDie(die) return `face`. */
function face(value: number, die: number): number {
  return (value - 1) / die;
}

describe('attributes', () => {
  it.each([
    [1, -5],
    [8, -1],
    [9, -1],
    [10, 0],
    [11, 0],
    [14, 2],
    [20, 5],
    [30, 10],
  ])('score %i has modifier %i', (score, expected) => {
    expect(attributeModifier(score)).toBe(expected);
  });

  it('formats modifiers with a sign', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(0)).toBe('+0');
    expect(formatModifier(-2)).toBe('-2');
  });
});

describe('dice', () => {
  it('parses notation', () => {
    expect(parseDice('d20')).toEqual({ terms: [{ count: 1, die: 20 }], modifier: 0 });
    expect(parseDice('2d6+3')).toEqual({ terms: [{ count: 2, die: 6 }], modifier: 3 });
    expect(parseDice('1d8 + 2d6 - 1')).toEqual({
      terms: [
        { count: 1, die: 8 },
        { count: 2, die: 6 },
      ],
      modifier: -1,
    });
    expect(parseDice('5')).toEqual({ terms: [], modifier: 5 });
  });

  it('rejects invalid notation', () => {
    expect(() => parseDice('2d7')).toThrow(/Unsupported die/);
    expect(() => parseDice('banana')).toThrow(/Invalid dice notation/);
    expect(() => parseDice('1d6-1d4')).toThrow(/Subtracted dice/);
  });

  it('formats expressions', () => {
    expect(formatDice(dice(2, 6, 3))).toBe('2d6 + 3');
    expect(formatDice(dice(1, 8, -1))).toBe('1d8 - 1');
    expect(formatDice(parseDice('1d8+2d6'))).toBe('1d8 + 2d6');
    expect(formatDice(parseDice('7'))).toBe('7');
  });

  it('computes average, minimum and maximum', () => {
    expect(averageRoll(dice(2, 8, 2))).toBe(11);
    expect(averageRoll(dice(3, 8))).toBe(13);
    expect(minimumRoll(dice(2, 6, 3))).toBe(5);
    expect(maximumRoll(dice(2, 6, 3))).toBe(15);
  });

  it('rolls with an injected rng', () => {
    const roll = rollDice(dice(2, 6, 3), { rng: sequence(face(4, 6), face(6, 6)) });
    expect(roll).toEqual({ total: 13, rolls: [4, 6], modifier: 3 });
  });

  it('doubles dice but not the modifier on a critical', () => {
    const roll = rollDice(dice(1, 8, 3), { rng: () => face(8, 8), critical: true });
    expect(roll.rolls).toEqual([8, 8]);
    expect(roll.total).toBe(19);
  });
});

describe('d20 tests', () => {
  it('cancels advantage and disadvantage', () => {
    expect(resolveRollMode(true, true)).toBe('normal');
    expect(resolveRollMode(true, false)).toBe('advantage');
    expect(resolveRollMode(false, true)).toBe('disadvantage');
  });

  it('keeps the higher roll with advantage and the lower with disadvantage', () => {
    const rng = () => sequence(face(5, 20), face(17, 20));
    expect(rollD20('advantage', rng()).natural).toBe(17);
    expect(rollD20('disadvantage', rng()).natural).toBe(5);
  });

  it('computes passive scores', () => {
    expect(passiveScore(3)).toBe(13);
    expect(passiveScore(3, 'advantage')).toBe(18);
    expect(passiveScore(3, 'disadvantage')).toBe(8);
  });

  it('resolves rolls against a fixed DC, with no special natural 20 or 1', () => {
    expect(resolveD20Test(12, 3, 15)).toEqual({ total: 15, success: true });
    expect(resolveD20Test(20, -5, 16)).toEqual({ total: 15, success: false });
    expect(resolveD20Test(1, 12, 10).success).toBe(true);
  });
});

describe('dice pools', () => {
  it('turns modifiers into dice twice their size', () => {
    expect(modifierDice(0, 'X')).toEqual([]);
    expect(modifierDice(1, 'X')).toEqual([poolDie(1, 2, 'X')]);
    expect(modifierDice(3, 'X')).toEqual([poolDie(1, 6, 'X')]);
    expect(modifierDice(-2, 'X')).toEqual([poolDie(1, 4, 'X', -1)]);
    expect(modifierDice(8, 'X')).toEqual([poolDie(1, 12, 'X'), poolDie(1, 4, 'X')]);
  });

  it('gives attribute and proficiency dice', () => {
    expect(attributeDice(14, 'agility')).toEqual([poolDie(1, 4, 'Agility')]);
    expect(attributeDice(8, 'might')).toEqual([poolDie(1, 2, 'Might', -1)]);
    expect(attributeDice(10, 'wisdom')).toEqual([]);
    expect(proficiencyDice(2)).toEqual([poolDie(1, 4, 'Proficiency')]);
    expect(proficiencyDice(6)).toEqual([poolDie(1, 12, 'Proficiency')]);
  });

  it('rolls, averages and formats pools', () => {
    const pool = [poolDie(1, 4, 'Agility'), poolDie(2, 6, 'Armour'), poolDie(1, 6, 'Poisoned', -1)];
    expect(rollPool(pool, () => 0.999).total).toBe(4 + 12 - 6);
    expect(poolAverage(pool)).toBe(2.5 + 7 - 3.5);
    expect(formatPool(pool, 'd20')).toBe('d20 + d4 (Agility) + 2d6 (Armour) − d6 (Poisoned)');
    expect(formatPool([poolDie(1, 2, 'Might', -1)])).toBe('−d2 (Might)');
    expect(formatPool([])).toBe('0');
  });

  it('applies modifiers only to matching rolls', () => {
    const modifiers = [
      bonus('attack', 1, 8),
      bonus('attack', 1, 4, { attack: 'melee' }),
      bonus('soak', 1, 6, { damageTypes: ['fire'] }),
      penalty('save', 1, 6, { attributes: ['agility'] }),
    ];
    expect(applicableDice(modifiers, 'Cloak', 'attack', { attack: 'ranged' })).toEqual([
      poolDie(1, 8, 'Cloak'),
    ]);
    expect(applicableDice(modifiers, 'Cloak', 'attack', { attack: 'melee' })).toHaveLength(2);
    expect(applicableDice(modifiers, 'Cloak', 'soak', { damageType: 'cold' })).toEqual([]);
    expect(applicableDice(modifiers, 'Cloak', 'soak', { damageType: 'fire' })).toHaveLength(1);
    expect(applicableDice(modifiers, 'Cloak', 'save', { attribute: 'agility' })).toEqual([
      poolDie(1, 6, 'Cloak', -1),
    ]);
  });

  it('sums flat defense bonuses that apply to the attack', () => {
    const bonuses = [{ value: 2 }, { value: 1, attack: 'melee' as const }];
    expect(defenseTotal(bonuses, 'melee')).toBe(3);
    expect(defenseTotal(bonuses, 'ranged')).toBe(2);
    expect(defenseTotal([])).toBe(0);
  });
});

describe('skills', () => {
  it('lists the period skills in alphabetical order', () => {
    expect(SKILLS).toHaveLength(24);
    expect([...SKILLS].sort()).toEqual([...SKILLS]);
  });

  it('gives every attribute but Hardiness at least one skill', () => {
    const attributes = new Set(SKILLS.map((skill) => SKILL_DEFINITIONS[skill].attribute));
    expect([...attributes].sort()).toEqual(
      ['agility', 'charisma', 'fortune', 'intellect', 'might', 'sanity', 'wisdom'].sort(),
    );
    expect(SKILL_DEFINITIONS.occult.attribute).toBe('sanity');
    expect(SKILL_DEFINITIONS.gambling.attribute).toBe('fortune');
  });

  it('describes every skill', () => {
    for (const skill of SKILLS) {
      expect(SKILL_DEFINITIONS[skill].description.length, skill).toBeGreaterThan(10);
    }
  });
});

describe('proficiency', () => {
  it('applies half, full and double proficiency', () => {
    expect(proficiencyContribution('none', 3)).toBe(0);
    expect(proficiencyContribution('half', 3)).toBe(1);
    expect(proficiencyContribution('proficient', 3)).toBe(3);
    expect(proficiencyContribution('expertise', 3)).toBe(6);
  });
});

describe('damage', () => {
  it('applies immunity, resistance and vulnerability', () => {
    expect(adjustDamage(15, 'fire', { immunities: ['fire'] })).toBe(0);
    expect(adjustDamage(15, 'fire', { resistances: ['fire'] })).toBe(7);
    expect(adjustDamage(15, 'fire', { vulnerabilities: ['fire'] })).toBe(30);
    expect(adjustDamage(15, 'fire', { resistances: ['fire'], vulnerabilities: ['fire'] })).toBe(14);
    expect(adjustDamage(15, 'cold', { resistances: ['fire'] })).toBe(15);
  });
});

describe('languages', () => {
  it('lists every language once, in its category', () => {
    expect(new Set(LANGUAGES).size).toBe(LANGUAGES.length);
    expect(languageCategory('english')).toBe('spoken');
    expect(languageCategory('latin')).toBe('classical');
    expect(languageCategory('flash-cant')).toBe('cant-or-code');
    expect(languageCategory('morse-code')).toBe('cant-or-code');
    expect(languageCategory('plains-sign-talk')).toBe('sign');
    expect(LINGUA_FRANCAS.every((language) => languageCategory(language) === 'spoken')).toBe(true);
  });
});

describe('actions', () => {
  it('defines every action, with period additions and no Magic action', () => {
    expect([...ACTIONS].sort()).toEqual([...ACTIONS]);
    for (const action of ACTIONS) {
      expect(ACTION_DEFINITIONS[action].effects.length, action).toBeGreaterThan(0);
    }
    expect(ACTIONS).toEqual(
      expect.arrayContaining(['operate', 'reload', 'take-cover', 'compose', 'defend']),
    );
    expect(ACTIONS).not.toContain('magic');
    expect(JSON.stringify(ACTION_DEFINITIONS)).not.toMatch(/Advantage|spell|magic/i);
  });

  it('raises defense and Agility saves while dodging', () => {
    const { defense, dice } = ACTION_DEFINITIONS.dodge;
    expect(defense).toEqual([{ value: 4 }]);
    expect(applicableDice(dice ?? [], 'Dodge', 'save', { attribute: 'agility' })).toEqual([
      poolDie(1, 6, 'Dodge'),
    ]);
  });
});

describe('conditions', () => {
  it('expands implied conditions', () => {
    expect(expandConditions(['unconscious'])).toEqual(
      new Set(['unconscious', 'incapacitated', 'prone']),
    );
    expect(expandConditions(['grappled'])).toEqual(new Set(['grappled']));
    expect(expandConditions(['calcified'])).toEqual(new Set(['calcified', 'incapacitated']));
  });

  it('lists the period conditions alphabetically, each with rules text', () => {
    expect([...CONDITIONS].sort()).toEqual([...CONDITIONS]);
    for (const condition of CONDITIONS) {
      expect(CONDITION_DEFINITIONS[condition].effects.length, condition).toBeGreaterThan(0);
    }
    for (const magical of ['charmed', 'petrified', 'invisible']) {
      expect(CONDITIONS, magical).not.toContain(magical);
    }
  });

  it('adds and subtracts dice instead of Advantage and Disadvantage', () => {
    expect(conditionDice(['poisoned'], 'attack')).toEqual([poolDie(1, 6, 'Poisoned', -1)]);
    expect(conditionDice(['poisoned'], 'soak')).toEqual([]);
    expect(conditionDice(['restrained'], 'save', { attribute: 'agility' })).toHaveLength(1);
    expect(conditionDice(['restrained'], 'save', { attribute: 'wisdom' })).toEqual([]);
  });

  it('changes defense by flat values, by attack type, with implied conditions', () => {
    expect(conditionDefense(['poisoned'], 'melee')).toBe(0);
    expect(conditionDefense(['unseen'], 'melee')).toBe(3);
    expect(conditionDefense(['prone'], 'melee')).toBe(-3);
    expect(conditionDefense(['prone'], 'ranged')).toBe(3);
    expect(conditionDefense(['unconscious'], 'melee')).toBe(-5 - 3);
    expect(conditionDefense(['unconscious'], 'ranged')).toBe(-5 + 3);
  });

  it('penalises Intellect, Wisdom and Sanity rolls with madness', () => {
    expect(madnessDice(0, 'save', 'sanity')).toEqual([]);
    expect(madnessDice(2, 'save', 'sanity')).toEqual([poolDie(2, 4, 'Madness', -1)]);
    expect(madnessDice(3, 'check', 'intellect')).toEqual([poolDie(3, 4, 'Madness', -1)]);
    expect(madnessDice(3, 'save', 'might')).toEqual([]);
    expect(madnessDice(3, 'attack', 'sanity')).toEqual([]);
    expect(isLostToMadness(5)).toBe(false);
    expect(isLostToMadness(6)).toBe(true);
    expect(() => madnessDice(7, 'save', 'wisdom')).toThrow(RangeError);
  });

  it('scales exhaustion penalties by level', () => {
    expect(exhaustionDice(0, 'attack')).toEqual([]);
    expect(exhaustionDice(3, 'attack')).toEqual([poolDie(3, 4, 'Exhaustion', -1)]);
    expect(exhaustionDice(3, 'soak')).toEqual([]);
    expect(exhaustionSpeedReduction(4)).toBe(20);
    expect(() => exhaustionDice(7, 'save')).toThrow(RangeError);
  });
});

describe('currency', () => {
  it('converts pounds, shillings and pence to pence and back', () => {
    expect(lsd(1, 2, 6)).toBe(270);
    expect(guineas(2)).toBe(504);
    expect(COINS['half-crown']).toBe(30);
    expect(toLsd(270.75)).toEqual({ pounds: 1, shillings: 2, pence: 6.75 });
    expect(() => toLsd(-1)).toThrow(RangeError);
  });

  it('formats money the period way', () => {
    expect(formatMoney(lsd(1, 2, 6))).toBe('£1 2s 6d');
    expect(formatMoney(lsd(0, 2, 6))).toBe('2s 6d');
    expect(formatMoney(6.5)).toBe('6½d');
    expect(formatMoney(0.25)).toBe('¼d');
    expect(formatMoney(lsd(5))).toBe('£5');
    expect(formatMoney(0)).toBe('0d');
  });

  it('parses period notations', () => {
    expect(parseMoney('£1 2s 6d')).toBe(270);
    expect(parseMoney('2s 6d')).toBe(30);
    expect(parseMoney('6½d')).toBe(6.5);
    expect(parseMoney('2/6')).toBe(30);
    expect(parseMoney('5/-')).toBe(60);
    expect(parseMoney('3 gns')).toBe(756);
    expect(parseMoney('£12')).toBe(2880);
    expect(() => parseMoney('12 dollars')).toThrow(/Invalid amount/);
  });
});

describe('time', () => {
  it('converts durations to seconds', () => {
    expect(
      durationInSeconds({ kind: 'timed', amount: 1, unit: 'minute', concentration: true }),
    ).toBe(60);
    expect(
      durationInSeconds({ kind: 'timed', amount: 10, unit: 'round', concentration: false }),
    ).toBe(60);
    expect(durationInSeconds({ kind: 'until-ended', orTriggered: false })).toBeNull();
  });
});
