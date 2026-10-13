import type { Attribute } from '../core/attributes';
import type { Price } from '../core/currency';
import type { ArmorDefinition } from './armor';
import type { WeaponDefinition } from './weapons';

export const ITEM_CATEGORIES = [
  'weapon',
  'armor',
  'tool',
  'adventuring-gear',
  'ammunition',
  'spellcasting-focus',
  'mount',
  'vehicle',
  'wondrous-item',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const RARITIES = [
  'common',
  'uncommon',
  'rare',
  'very-rare',
  'legendary',
  'artifact',
] as const;

export type Rarity = (typeof RARITIES)[number];

export const MAGIC_ITEM_CATEGORIES = [
  'armor',
  'potion',
  'ring',
  'rod',
  'scroll',
  'staff',
  'wand',
  'weapon',
  'wondrous-item',
] as const;

export type MagicItemCategory = (typeof MAGIC_ITEM_CATEGORIES)[number];

/** A creature can be attuned to at most this many magic items at once. */
export const MAX_ATTUNED_ITEMS = 3;

export interface MagicItemProperties {
  rarity: Rarity;
  magicCategory: MagicItemCategory;
  /** False if no attunement is needed; otherwise who can attune, e.g. "by a Wizard". */
  attunement: false | { restriction?: string };
  /** Bonus to attack and damage rolls (weapons) or AC (armor), e.g. +1. */
  bonus?: number;
  charges?: { max: number; recharge: string };
}

export interface ItemBase {
  id: string;
  name: string;
  category: ItemCategory;
  weightLb: number;
  cost?: Price;
  description?: string;
  /** Present on magic items, including magic versions of mundane items. */
  magic?: MagicItemProperties;
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

export interface GearDefinition extends ItemBase {
  category: Exclude<ItemCategory, 'weapon' | 'armor' | 'tool'>;
}

export type ItemDefinition = WeaponDefinition | ArmorDefinition | ToolDefinition | GearDefinition;

export function requiresAttunement(item: ItemBase): boolean {
  return item.magic !== undefined && item.magic.attunement !== false;
}
