import { describe, expect, it } from 'vitest';
import { casterLevel, pactMagicForLevel, spellSlotsForCasterLevel } from './slots';
import { cantripDiceMultiplier, spellAttackBonus, spellSaveDc } from './spellcasting';
import { formatSpellLevel } from './spells';

describe('spell slots', () => {
  it('reads the slot table', () => {
    expect(spellSlotsForCasterLevel(0)).toEqual([]);
    expect(spellSlotsForCasterLevel(1)).toEqual([2]);
    expect(spellSlotsForCasterLevel(5)).toEqual([4, 3, 2]);
    expect(spellSlotsForCasterLevel(20)).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
  });

  it('rounds a single half or third caster up', () => {
    expect(casterLevel([{ progression: 'half', level: 1 }])).toBe(1);
    expect(casterLevel([{ progression: 'half', level: 5 }])).toBe(3);
    expect(casterLevel([{ progression: 'third', level: 4 }])).toBe(2);
  });

  it('combines multiclass caster levels', () => {
    expect(
      casterLevel([
        { progression: 'full', level: 3 },
        { progression: 'half', level: 3 },
        { progression: 'third', level: 5 },
        { progression: 'pact', level: 5 },
      ]),
    ).toBe(3 + 2 + 1);
  });

  it('reads the Pact Magic table', () => {
    expect(pactMagicForLevel(1)).toEqual({ slots: 1, slotLevel: 1 });
    expect(pactMagicForLevel(11)).toEqual({ slots: 3, slotLevel: 5 });
    expect(pactMagicForLevel(17)).toEqual({ slots: 4, slotLevel: 5 });
  });
});

describe('spellcasting', () => {
  it('computes save DC and attack bonus', () => {
    expect(spellSaveDc(3, 4)).toBe(15);
    expect(spellAttackBonus(3, 4)).toBe(7);
  });

  it('scales cantrips at 5, 11 and 17', () => {
    expect(cantripDiceMultiplier(4)).toBe(1);
    expect(cantripDiceMultiplier(5)).toBe(2);
    expect(cantripDiceMultiplier(11)).toBe(3);
    expect(cantripDiceMultiplier(20)).toBe(4);
  });

  it('formats spell levels', () => {
    expect([0, 1, 2, 3, 9].map((level) => formatSpellLevel(level as 0 | 1 | 2 | 3 | 9))).toEqual([
      'Cantrip',
      '1st',
      '2nd',
      '3rd',
      '9th',
    ]);
  });
});
