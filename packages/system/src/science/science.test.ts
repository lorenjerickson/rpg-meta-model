import { describe, expect, it } from 'vitest';
import { poolDie } from '../core/dicePool';
import {
  activate,
  canActivate,
  chargeCost,
  freshApparatusState,
  operatorPool,
  overchargeMalfunctions,
  recharge,
} from './apparatus';
import { APPARATUS, findApparatus } from './catalog/apparatus';
import { PREPARATIONS } from './catalog/preparations';

function apparatus(id: string) {
  const found = findApparatus(id);
  if (found === undefined) {
    throw new Error(`Missing ${id}`);
  }
  return found;
}

const pendant = apparatus('mesmeric-pendant');
const horn = apparatus('concussion-horn');
const lance = apparatus('tesla-lance');

describe('operator rules', () => {
  it('adds proficiency dice only when proficient', () => {
    expect(operatorPool(14, 'intellect', 3, true)).toEqual([
      poolDie(1, 4, 'Intellect'),
      poolDie(1, 6, 'Proficiency'),
    ]);
    expect(operatorPool(14, 'intellect', 3, false)).toEqual([poolDie(1, 4, 'Intellect')]);
  });
});

describe('charges', () => {
  it('starts full and spends charges per effect', () => {
    const state = freshApparatusState(pendant);
    expect(state).toEqual({ charges: 6, malfunctioning: false });
    expect(activate(pendant, state, 'suggestion').charges).toBe(4);
  });

  it('adds extra charges when overcharging, if the effect allows it', () => {
    expect(chargeCost(horn, 'concussion-blast', 2)).toBe(3);
    expect(() => chargeCost(pendant, 'suggestion', 1)).toThrow(/can't be overcharged/);
  });

  it('refuses to activate without enough charges or while malfunctioning', () => {
    const low = { charges: 2, malfunctioning: false };
    expect(canActivate(lance, low, 'lightning-discharge')).toBe(false);
    expect(() => activate(lance, low, 'lightning-discharge')).toThrow(/needs 3 charges/);
    const broken = { charges: 6, malfunctioning: true };
    expect(canActivate(lance, broken, 'lightning-discharge')).toBe(false);
    expect(() => activate(lance, broken, 'lightning-discharge')).toThrow(/malfunctioning/);
  });

  it('malfunctions when an overcharge roll is at or below the extra charges', () => {
    expect(overchargeMalfunctions(2, 2)).toBe(true);
    expect(overchargeMalfunctions(3, 2)).toBe(false);
    expect(overchargeMalfunctions(1, 0)).toBe(false);
  });

  it('recharges clockwork and steam on a Short Rest and galvanic only on a Long Rest', () => {
    const emptyHorn = { charges: 0, malfunctioning: false };
    expect(recharge(horn, emptyHorn, 'short').charges).toBe(3);
    const emptyLance = { charges: 0, malfunctioning: false };
    expect(recharge(lance, emptyLance, 'short').charges).toBe(0);
    expect(recharge(lance, emptyLance, 'long').charges).toBe(6);
  });

  it('recharges aetheric devices by a rolled amount, capped at the maximum', () => {
    const empty = { charges: 0, malfunctioning: false };
    expect(recharge(pendant, empty, 'long', () => 0).charges).toBe(2);
    expect(
      recharge(pendant, { charges: 5, malfunctioning: false }, 'long', () => 0.99).charges,
    ).toBe(6);
  });
});

describe('science catalog', () => {
  const items = [...APPARATUS, ...PREPARATIONS];

  it('has a broad selection of effects', () => {
    const effects = [
      ...APPARATUS.flatMap((device) => device.effects),
      ...PREPARATIONS.map((entry) => entry.effect),
    ];
    expect(effects.length).toBeGreaterThanOrEqual(40);
  });

  it('contains no magical terms', () => {
    const text = JSON.stringify(items).toLowerCase();
    for (const term of ['magic', 'spell', 'arcane', 'arcana', 'mystic', 'wizard', 'enchant']) {
      expect(text, term).not.toContain(term);
    }
  });
});
