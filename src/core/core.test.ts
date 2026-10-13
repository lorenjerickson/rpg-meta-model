import { describe, expect, it } from 'vitest';
import { attributeModifier, formatModifier } from './attributes';
import { expandConditions, exhaustionD20Penalty, exhaustionSpeedReduction } from './conditions';
import { fromCopper, toCopper } from './currency';
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
import { proficiencyContribution } from './proficiency';
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

  it('treats natural 20 and 1 specially only for attack rolls', () => {
    expect(resolveD20Test('attack-roll', 20, -5, 30)).toEqual({
      total: 15,
      success: true,
      critical: true,
    });
    expect(resolveD20Test('attack-roll', 1, 20, 10).success).toBe(false);
    expect(resolveD20Test('saving-throw', 20, -5, 16).success).toBe(false);
    expect(resolveD20Test('attribute-check', 1, 12, 10).success).toBe(true);
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

describe('conditions', () => {
  it('expands implied conditions', () => {
    expect(expandConditions(['unconscious'])).toEqual(
      new Set(['unconscious', 'incapacitated', 'prone']),
    );
    expect(expandConditions(['grappled'])).toEqual(new Set(['grappled']));
  });

  it('scales exhaustion penalties by level', () => {
    expect(exhaustionD20Penalty(0)).toBe(0);
    expect(exhaustionD20Penalty(3)).toBe(-6);
    expect(exhaustionSpeedReduction(4)).toBe(20);
    expect(() => exhaustionD20Penalty(7)).toThrow(RangeError);
  });
});

describe('currency', () => {
  it('converts to and from copper', () => {
    expect(toCopper({ gp: 1, sp: 2, cp: 3 })).toBe(123);
    expect(toCopper({ pp: 1, ep: 1 })).toBe(1050);
    expect(fromCopper(1234)).toEqual({ cp: 4, sp: 3, ep: 0, gp: 12, pp: 0 });
    expect(() => fromCopper(15, ['gp', 'sp'])).toThrow(RangeError);
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
