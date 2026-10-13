import { describe, expect, it } from 'vitest';
import { dice } from '../core/dice';
import { armorSpeedPenalty, calculateArmorClass, type ArmorDefinition } from './armor';
import { carryingCapacity, dragLiftPushCapacity } from './carrying';
import {
  isProficientWithWeapon,
  weaponAttackAttribute,
  weaponReach,
  type WeaponDefinition,
} from './weapons';

const modifiers = {
  might: 1,
  agility: 3,
  hardiness: 2,
  intellect: 0,
  wisdom: 2,
  charisma: -1,
  fortune: 0,
  sanity: 0,
};

const halfPlate: ArmorDefinition = {
  id: 'half-plate',
  name: 'Half Plate Armor',
  category: 'armor',
  weightLb: 40,
  armorCategory: 'medium',
  armorClass: { base: 15, agilityCap: 2 },
  stealthDisadvantage: true,
};

const plate: ArmorDefinition = {
  id: 'plate',
  name: 'Plate Armor',
  category: 'armor',
  weightLb: 65,
  armorCategory: 'heavy',
  armorClass: { base: 18, agilityCap: 0 },
  mightRequirement: 15,
  stealthDisadvantage: true,
};

const shield: ArmorDefinition = {
  id: 'shield',
  name: 'Shield',
  category: 'armor',
  weightLb: 6,
  armorCategory: 'shield',
  armorClass: { base: 2, agilityCap: 0 },
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
  it('uses 10 + Agility unarmored, with optional Unarmored Defense', () => {
    expect(calculateArmorClass({ attributeModifiers: modifiers })).toBe(13);
    expect(
      calculateArmorClass({ attributeModifiers: modifiers, unarmoredDefenseAttribute: 'wisdom' }),
    ).toBe(15);
  });

  it('caps Agility for medium and ignores it for heavy armor', () => {
    expect(calculateArmorClass({ attributeModifiers: modifiers, armor: halfPlate })).toBe(17);
    expect(calculateArmorClass({ attributeModifiers: modifiers, armor: plate, shield })).toBe(20);
  });

  it('adds quality and flat bonuses', () => {
    const finePlate: ArmorDefinition = {
      ...plate,
      qualityBonus: 1,
    };
    expect(calculateArmorClass({ attributeModifiers: modifiers, armor: finePlate, bonus: 1 })).toBe(
      20,
    );
  });

  it('rejects a shield worn as armor', () => {
    expect(() => calculateArmorClass({ attributeModifiers: modifiers, armor: shield })).toThrow(
      /is a shield/,
    );
  });

  it('slows wearers who lack the Might requirement', () => {
    expect(armorSpeedPenalty(plate, 14)).toBe(10);
    expect(armorSpeedPenalty(plate, 15)).toBe(0);
    expect(armorSpeedPenalty(halfPlate, 8)).toBe(0);
  });
});

describe('weapons', () => {
  it('picks the attack attribute', () => {
    expect(weaponAttackAttribute(rapier, modifiers)).toBe('agility');
    expect(weaponAttackAttribute(glaive, modifiers)).toBe('might');
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
  it('scales with Might and size', () => {
    expect(carryingCapacity(10)).toBe(150);
    expect(carryingCapacity(10, 'tiny')).toBe(75);
    expect(carryingCapacity(20, 'large')).toBe(600);
    expect(dragLiftPushCapacity(10)).toBe(300);
  });
});
