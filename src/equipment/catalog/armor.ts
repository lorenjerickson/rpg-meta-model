import { lsd } from '../../core/currency';
import type { ArmorDefinition } from '../armor';

function armor(id: string, input: Omit<ArmorDefinition, 'id' | 'category'>): ArmorDefinition {
  return { id, category: 'armor', ...input };
}

/** Protective wear of the period. Real body armour is rare; heavy armour rarer still. */
export const ARMOR: readonly ArmorDefinition[] = [
  // Light
  armor('padded-waistcoat', {
    name: 'Padded Waistcoat',
    description: 'A quilted waistcoat worn under a jacket.',
    armorCategory: 'light',
    armorClass: { base: 11, agilityCap: null },
    stealthDisadvantage: false,
    weightLb: 4,
    cost: lsd(0, 10),
  }),
  armor('leather-duster', {
    name: 'Leather Duster',
    description: 'A long, heavy riding coat of oiled leather.',
    armorCategory: 'light',
    armorClass: { base: 11, agilityCap: null },
    stealthDisadvantage: false,
    weightLb: 8,
    cost: lsd(1, 5),
  }),
  armor('reinforced-greatcoat', {
    name: 'Reinforced Greatcoat',
    description: 'A military greatcoat with steel strips sewn into the lining.',
    armorCategory: 'light',
    armorClass: { base: 12, agilityCap: null },
    stealthDisadvantage: false,
    weightLb: 12,
    cost: lsd(3),
  }),

  // Medium
  armor('mail-vest', {
    name: 'Mail Vest',
    description: 'A vest of fine steel mail, worn hidden beneath clothing.',
    armorCategory: 'medium',
    armorClass: { base: 13, agilityCap: 2 },
    stealthDisadvantage: false,
    weightLb: 15,
    cost: lsd(6),
    rarity: 'uncommon',
  }),
  armor('cavalry-cuirass', {
    name: 'Cavalry Cuirass',
    description: 'A polished steel breast- and back-plate, still worn by heavy cavalry.',
    armorCategory: 'medium',
    armorClass: { base: 14, agilityCap: 2 },
    stealthDisadvantage: false,
    weightLb: 18,
    cost: lsd(8),
    rarity: 'uncommon',
  }),
  armor('trench-armour', {
    name: 'Trench Armour',
    description: 'Overlapping steel plates hung on the chest, worn by sentries and sappers.',
    armorCategory: 'medium',
    armorClass: { base: 15, agilityCap: 2 },
    stealthDisadvantage: true,
    weightLb: 25,
    cost: lsd(10),
    rarity: 'uncommon',
  }),

  // Heavy
  armor('diving-dress', {
    name: 'Standard Diving Dress',
    description:
      'A copper helmet, corselet and weighted canvas suit. With an air pump and hose, the ' +
      'wearer can breathe underwater and walk the sea floor.',
    armorCategory: 'heavy',
    armorClass: { base: 16, agilityCap: 0 },
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
    armorClass: { base: 18, agilityCap: 0 },
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
    armorClass: { base: 2, agilityCap: 0 },
    stealthDisadvantage: false,
    weightLb: 15,
    cost: lsd(1),
  }),
];
