import { describe, expect, it } from 'vitest';
import { dice } from '../core/dice';
import { poolDie } from '../core/dicePool';
import { armorSpeedPenalty, type ArmorDefinition } from './armor';
import { carryingCapacity, dragLiftPushCapacity } from './carrying';
import { findItem } from './catalog';
import type { ItemDefinition } from './items';
import { equipmentDefense, equipmentDice, slotConflicts } from './protection';
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

function item(id: string): ItemDefinition {
  const found = findItem(id);
  if (found === undefined) {
    throw new Error(`Missing ${id}`);
  }
  return found;
}

describe('protective equipment', () => {
  const outfit = ['bowler-hat', 'work-clothes', 'leather-gloves', 'work-boots'].map(item);

  it('adds a little defense for every piece worn', () => {
    expect(equipmentDefense(outfit)).toBe(1 + 4 + 1 + 1);
  });

  it('soaks general damage everywhere and typed damage only of its type', () => {
    const worn = [item('leather-duster'), item('leather-gloves')];
    expect(equipmentDice(worn, 'soak', { damageType: 'slashing' })).toEqual([
      poolDie(1, 2, 'Leather Duster'),
    ]);
    expect(equipmentDice(worn, 'soak', { damageType: 'cold' })).toEqual([
      poolDie(1, 2, 'Leather Duster'),
      poolDie(1, 4, 'Leather Duster'),
    ]);
    expect(equipmentDice(worn, 'soak', { damageType: 'fire' })).toEqual([
      poolDie(1, 2, 'Leather Duster'),
      poolDie(1, 2, 'Leather Gloves'),
    ]);
  });

  it('finds pieces that share a slot', () => {
    expect(slotConflicts(outfit)).toEqual([]);
    expect(slotConflicts([item('work-clothes'), item('cavalry-cuirass')])).toEqual(['chest']);
  });

  it('counts held shields without a slot', () => {
    expect(equipmentDefense([item('trench-shield')])).toBe(3);
  });

  it("counts a weapon's attack dice only for attacks made with it", () => {
    const rifle = item('bolt-action-rifle');
    const sabre = item('cavalry-sabre');
    const sight = item('telescopic-sight');
    const equipped = [rifle, sabre, sight];
    expect(equipmentDice(equipped, 'attack', { attack: 'ranged' }, rifle)).toEqual([
      poolDie(1, 4, 'Bolt-Action Rifle'),
      poolDie(1, 6, 'Telescopic Sight'),
    ]);
    expect(equipmentDice(equipped, 'attack', { attack: 'melee' }, sabre)).toEqual([]);
    expect(equipmentDefense(equipped, 'melee')).toBe(1);
    expect(equipmentDefense(equipped, 'ranged')).toBe(0);
    expect(equipmentDice([item('musket')], 'attack', { attack: 'ranged' }, item('musket'))).toEqual(
      [poolDie(1, 4, 'Musket', -1)],
    );
  });

  it('slows wearers who lack the Might requirement', () => {
    const suit = item('boilerplate-suit') as ArmorDefinition;
    expect(armorSpeedPenalty(suit, 14)).toBe(10);
    expect(armorSpeedPenalty(suit, 15)).toBe(0);
    expect(armorSpeedPenalty(item('mail-vest') as ArmorDefinition, 8)).toBe(0);
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
