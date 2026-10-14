import { lsd } from '../../core/currency';
import type { DamageType } from '../../core/damage';
import type { DieSize } from '../../core/dice';
import { bonus, type RollModifier } from '../../core/rollModifiers';
import type { ArmorDefinition } from '../armor';
import type { EquipmentSlot } from '../protection';

function armor(id: string, input: Omit<ArmorDefinition, 'id' | 'category'>): ArmorDefinition {
  return { id, category: 'armor', ...input };
}

/** Adds dice to defense rolls. */
export function defense(count: number, die: DieSize): RollModifier {
  return bonus('defense', count, die);
}

/** Adds dice to soak rolls, against any damage or only the given types. */
export function soak(
  count: number,
  die: DieSize,
  damageTypes?: readonly DamageType[],
): RollModifier {
  return bonus('soak', count, die, damageTypes ? { damageTypes } : {});
}

const ALL_SLOTS: readonly EquipmentSlot[] = [
  'head',
  'shoulders',
  'arms',
  'chest',
  'hands',
  'legs',
  'feet',
];

/** Protective wear of the period. Real body armour is rare; heavy armour rarer still. */
export const ARMOR: readonly ArmorDefinition[] = [
  // Light
  armor('padded-waistcoat', {
    name: 'Padded Waistcoat',
    description: 'A quilted waistcoat worn under a jacket.',
    armorCategory: 'light',
    slots: ['chest'],
    modifiers: [defense(1, 4), soak(1, 2)],
    stealthDisadvantage: false,
    weightLb: 4,
    cost: lsd(0, 10),
  }),
  armor('leather-duster', {
    name: 'Leather Duster',
    description: 'A long riding coat of oiled leather that sheds rain, wind and brush.',
    armorCategory: 'light',
    slots: ['shoulders', 'chest', 'arms', 'legs'],
    modifiers: [defense(4, 2), soak(1, 2), soak(1, 4, ['cold'])],
    stealthDisadvantage: false,
    weightLb: 8,
    cost: lsd(1, 5),
  }),
  armor('reinforced-greatcoat', {
    name: 'Reinforced Greatcoat',
    description: 'A military greatcoat with steel strips sewn into the lining.',
    armorCategory: 'light',
    slots: ['shoulders', 'chest', 'arms'],
    modifiers: [defense(3, 4), soak(1, 4, ['cold'])],
    stealthDisadvantage: false,
    weightLb: 12,
    cost: lsd(3),
  }),
  armor('leather-bracers', {
    name: 'Leather Bracers',
    description: 'Hardened leather guards strapped to the forearms.',
    armorCategory: 'light',
    slots: ['arms'],
    modifiers: [defense(1, 4)],
    stealthDisadvantage: false,
    weightLb: 1,
    cost: lsd(0, 5),
  }),
  armor('leather-chaps', {
    name: 'Leather Chaps',
    description: "A drover's leather leggings, proof against thorns and rope burn.",
    armorCategory: 'light',
    slots: ['legs'],
    modifiers: [defense(1, 4), soak(1, 2, ['slashing'])],
    stealthDisadvantage: false,
    weightLb: 3,
    cost: lsd(0, 8),
  }),

  // Medium
  armor('mail-vest', {
    name: 'Mail Vest',
    description: 'A vest of fine steel mail, worn hidden beneath clothing.',
    armorCategory: 'medium',
    slots: ['chest'],
    modifiers: [defense(1, 6), soak(1, 6, ['slashing'])],
    stealthDisadvantage: false,
    weightLb: 15,
    cost: lsd(6),
    rarity: 'uncommon',
  }),
  armor('cavalry-cuirass', {
    name: 'Cavalry Cuirass',
    description: 'A polished steel breast- and back-plate, still worn by heavy cavalry.',
    armorCategory: 'medium',
    slots: ['chest'],
    modifiers: [defense(1, 8), soak(1, 4)],
    stealthDisadvantage: false,
    weightLb: 18,
    cost: lsd(8),
    rarity: 'uncommon',
  }),
  armor('trench-armour', {
    name: 'Trench Armour',
    description: 'Overlapping steel plates hung on the chest, worn by sentries and sappers.',
    armorCategory: 'medium',
    slots: ['shoulders', 'chest'],
    modifiers: [defense(1, 10), soak(1, 6, ['piercing'])],
    stealthDisadvantage: true,
    weightLb: 25,
    cost: lsd(10),
    rarity: 'uncommon',
  }),
  armor('steel-helmet', {
    name: 'Steel Helmet',
    description: 'A broad-brimmed steel helmet against shrapnel and falling debris.',
    armorCategory: 'medium',
    slots: ['head'],
    modifiers: [defense(1, 6), soak(1, 4, ['piercing', 'bludgeoning'])],
    stealthDisadvantage: false,
    weightLb: 2,
    cost: lsd(0, 15),
  }),
  armor('mail-gauntlets', {
    name: 'Mail Gauntlets',
    description: 'Steel-mail gloves, as worn by butchers and knife-fighters.',
    armorCategory: 'medium',
    slots: ['hands'],
    modifiers: [defense(1, 4), soak(1, 4, ['slashing'])],
    stealthDisadvantage: false,
    weightLb: 2,
    cost: lsd(1),
  }),

  // Heavy
  armor('diving-dress', {
    name: 'Standard Diving Dress',
    description:
      'A copper helmet, corselet and weighted canvas suit. With an air pump and hose, the ' +
      'wearer can breathe underwater and walk the sea floor.',
    armorCategory: 'heavy',
    slots: ALL_SLOTS,
    modifiers: [defense(7, 4), soak(1, 6, ['cold']), soak(1, 4)],
    mightRequirement: 13,
    stealthDisadvantage: true,
    weightLb: 190,
    cost: lsd(40),
    rarity: 'uncommon',
  }),
  armor('boilerplate-suit', {
    name: 'Boilerplate Suit',
    description:
      'A riveted suit of boiler steel, hinged at every joint. A one-off from a workshop.',
    armorCategory: 'heavy',
    slots: ALL_SLOTS,
    modifiers: [defense(7, 6), soak(2, 6)],
    mightRequirement: 15,
    stealthDisadvantage: true,
    weightLb: 70,
    cost: lsd(150),
    rarity: 'prototype',
  }),

  // Shield
  armor('trench-shield', {
    name: 'Trench Shield',
    description: 'A steel plate with a handle and a loophole for firing through.',
    armorCategory: 'shield',
    modifiers: [defense(1, 8), soak(1, 4, ['piercing'])],
    stealthDisadvantage: false,
    weightLb: 15,
    cost: lsd(1),
  }),
];
