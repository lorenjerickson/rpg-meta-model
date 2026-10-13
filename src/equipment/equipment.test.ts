import { describe, expect, it } from 'vitest';
import { dice } from '../core/dice';
import { armorSpeedPenalty, calculateArmorClass, type ArmorDefinition } from './armor';
import { carryingCapacity, dragLiftPushCapacity } from './carrying';
import {
  isProficientWithWeapon,
  weaponAttackAbility,
  weaponReach,
  type WeaponDefinition,
} from './weapons';

const modifiers = { str: 1, dex: 3, con: 2, int: 0, wis: 2, cha: -1 };

const halfPlate: ArmorDefinition = {
  id: 'half-plate',
  name: 'Half Plate Armor',
  category: 'armor',
  weightLb: 40,
  armorCategory: 'medium',
  armorClass: { base: 15, dexterityCap: 2 },
  stealthDisadvantage: true,
};

const plate: ArmorDefinition = {
  id: 'plate',
  name: 'Plate Armor',
  category: 'armor',
  weightLb: 65,
  armorCategory: 'heavy',
  armorClass: { base: 18, dexterityCap: 0 },
  strengthRequirement: 15,
  stealthDisadvantage: true,
};

const shield: ArmorDefinition = {
  id: 'shield',
  name: 'Shield',
  category: 'armor',
  weightLb: 6,
  armorCategory: 'shield',
  armorClass: { base: 2, dexterityCap: 0 },
  stealthDisadvantage: false,
};

const rapier: WeaponDefinition = {
  id: 'rapier',
  name: 'Rapier',
  category: 'weapon',
  weightLb: 2,
  weaponCategory: 'martial',
  weaponType: 'melee',
  damage: { dice: dice(1, 8), type: 'piercing' },
  properties: ['finesse'],
  mastery: 'vex',
};

const glaive: WeaponDefinition = {
  id: 'glaive',
  name: 'Glaive',
  category: 'weapon',
  weightLb: 6,
  weaponCategory: 'martial',
  weaponType: 'melee',
  damage: { dice: dice(1, 10), type: 'slashing' },
  properties: ['heavy', 'reach', 'two-handed'],
  mastery: 'graze',
};

describe('armor class', () => {
  it('uses 10 + Dex unarmored, with optional Unarmored Defense', () => {
    expect(calculateArmorClass({ abilityModifiers: modifiers })).toBe(13);
    expect(
      calculateArmorClass({ abilityModifiers: modifiers, unarmoredDefenseAbility: 'wis' }),
    ).toBe(15);
  });

  it('caps Dex for medium and ignores it for heavy armor', () => {
    expect(calculateArmorClass({ abilityModifiers: modifiers, armor: halfPlate })).toBe(17);
    expect(calculateArmorClass({ abilityModifiers: modifiers, armor: plate, shield })).toBe(20);
  });

  it('adds magic and flat bonuses', () => {
    const magicPlate: ArmorDefinition = {
      ...plate,
      magic: { rarity: 'rare', magicCategory: 'armor', attunement: false, bonus: 1 },
    };
    expect(calculateArmorClass({ abilityModifiers: modifiers, armor: magicPlate, bonus: 1 })).toBe(
      20,
    );
  });

  it('rejects a shield worn as armor', () => {
    expect(() => calculateArmorClass({ abilityModifiers: modifiers, armor: shield })).toThrow(
      /is a shield/,
    );
  });

  it('slows wearers who lack the Strength requirement', () => {
    expect(armorSpeedPenalty(plate, 14)).toBe(10);
    expect(armorSpeedPenalty(plate, 15)).toBe(0);
    expect(armorSpeedPenalty(halfPlate, 8)).toBe(0);
  });
});

describe('weapons', () => {
  it('picks the attack ability', () => {
    expect(weaponAttackAbility(rapier, modifiers)).toBe('dex');
    expect(weaponAttackAbility(glaive, modifiers)).toBe('str');
  });

  it('computes reach', () => {
    expect(weaponReach(rapier)).toBe(5);
    expect(weaponReach(glaive)).toBe(10);
  });

  it('checks proficiency by category, property and weapon', () => {
    const rogueStyle = [
      { category: 'simple' as const },
      { category: 'martial' as const, withAnyProperty: ['finesse', 'light'] as const },
    ];
    expect(isProficientWithWeapon(rapier, rogueStyle)).toBe(true);
    expect(isProficientWithWeapon(glaive, rogueStyle)).toBe(false);
    expect(isProficientWithWeapon(glaive, [{ weaponId: 'glaive' }])).toBe(true);
  });
});

describe('carrying capacity', () => {
  it('scales with Strength and size', () => {
    expect(carryingCapacity(10)).toBe(150);
    expect(carryingCapacity(10, 'tiny')).toBe(75);
    expect(carryingCapacity(20, 'large')).toBe(600);
    expect(dragLiftPushCapacity(10)).toBe(300);
  });
});
