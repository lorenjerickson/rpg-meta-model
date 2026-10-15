import type { Attribute } from '../core/attributes';
import type { Money } from '../core/currency';
import type { DefenseBonus, RollModifier } from '../core/rollModifiers';
import type { ApparatusDefinition, PreparationDefinition } from '../science/apparatus';
import type { ArmorDefinition } from './armor';
import type { EquipmentSlot } from './protection';
import type { MountDefinition, VehicleDefinition } from './transport';
import type { WeaponDefinition } from './weapons';

export const ITEM_CATEGORIES = [
  'weapon',
  'armor',
  'tool',
  'adventuring-gear',
  'ammunition',
  'mount',
  'vehicle',
  'apparatus',
  'preparation',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/** How hard an item is to find or buy. A prototype is a one-off invention. */
export const RARITIES = ['common', 'uncommon', 'rare', 'very-rare', 'prototype'] as const;

export type Rarity = (typeof RARITIES)[number];

export interface ItemBase {
  id: string;
  name: string;
  category: ItemCategory;
  weightLb: number;
  /** Price in pence. */
  cost?: Money;
  description?: string;
  rarity?: Rarity;
  /** Body slots the item covers when worn. Held items such as weapons and shields have none. */
  slots?: readonly EquipmentSlot[];
  /** What the item adds to the wearer's defense while worn or held. */
  defense?: DefenseBonus;
  /**
   * Dice the item adds to or subtracts from rolls while equipped: soak for protective wear,
   * attack for weapons and aids such as scopes, and so on.
   */
  modifiers?: readonly RollModifier[];
}

export const TOOL_CATEGORIES = [
  'artisans-tools',
  'gaming-set',
  'musical-instrument',
  'other',
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export interface ToolDefinition extends ItemBase {
  category: 'tool';
  toolCategory: ToolCategory;
  /** The attribute used for checks made with the tool. */
  attribute: Attribute;
  /** Things you can do with the tool, each with its DC. */
  utilize: readonly { description: string; dc: number }[];
  /** Item ids the tool can craft. */
  craft: readonly string[];
}

export interface AmmunitionDefinition extends ItemBase {
  category: 'ammunition';
  /** How many rounds come in one purchase; cost and weight are for the whole bundle. */
  bundle: number;
}

export interface GearDefinition extends ItemBase {
  category: 'adventuring-gear';
}

export type ItemDefinition =
  | WeaponDefinition
  | ArmorDefinition
  | ToolDefinition
  | ApparatusDefinition
  | PreparationDefinition
  | AmmunitionDefinition
  | MountDefinition
  | VehicleDefinition
  | GearDefinition;
