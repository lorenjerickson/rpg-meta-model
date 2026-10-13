import type { Attribute } from '../core/attributes';
import type { DamageType } from '../core/damage';
import type { DiceExpression } from '../core/dice';
import type { ItemBase } from './items';

export const WEAPON_CATEGORIES = ['simple', 'martial'] as const;

export type WeaponCategory = (typeof WEAPON_CATEGORIES)[number];

export const WEAPON_TYPES = ['melee', 'ranged'] as const;

export type WeaponType = (typeof WEAPON_TYPES)[number];

export const WEAPON_PROPERTIES = [
  'ammunition',
  'finesse',
  'heavy',
  'light',
  'loading',
  'range',
  'reach',
  'thrown',
  'two-handed',
  'versatile',
] as const;

export type WeaponProperty = (typeof WEAPON_PROPERTIES)[number];

/** Mastery properties, usable by characters with the Weapon Mastery feature. */
export const WEAPON_MASTERIES = [
  'cleave',
  'graze',
  'nick',
  'push',
  'sap',
  'slow',
  'topple',
  'vex',
] as const;

export type WeaponMastery = (typeof WEAPON_MASTERIES)[number];

export interface WeaponDamage {
  dice: DiceExpression;
  type: DamageType;
}

/** Normal and long range in feet. Attacks beyond normal range have disadvantage. */
export interface WeaponRange {
  normal: number;
  long: number;
}

export interface WeaponDefinition extends ItemBase {
  category: 'weapon';
  weaponCategory: WeaponCategory;
  weaponType: WeaponType;
  damage: WeaponDamage;
  properties: readonly WeaponProperty[];
  mastery: WeaponMastery;
  /** Damage when wielded with two hands; present only with the Versatile property. */
  versatileDamage?: DiceExpression;
  /** Present for ranged weapons and weapons with the Thrown property. */
  range?: WeaponRange;
  /** Item id of the ammunition this weapon fires. */
  ammunition?: string;
}

/** A proficiency that covers a whole category, a category limited by property, or one weapon. */
export type WeaponProficiency =
  { category: WeaponCategory; withAnyProperty?: readonly WeaponProperty[] } | { weaponId: string };

export function hasProperty(weapon: WeaponDefinition, property: WeaponProperty): boolean {
  return weapon.properties.includes(property);
}

/**
 * Melee weapons use Might and ranged weapons use Agility. Finesse weapons use whichever
 * is higher. Thrown melee weapons keep their melee attribute.
 */
export function weaponAttackAttribute(
  weapon: WeaponDefinition,
  modifiers: Readonly<Record<Attribute, number>>,
): Attribute {
  if (hasProperty(weapon, 'finesse')) {
    return modifiers.agility > modifiers.might ? 'agility' : 'might';
  }
  return weapon.weaponType === 'melee' ? 'might' : 'agility';
}

/** Melee reach in feet: 5, or 10 with the Reach property. */
export function weaponReach(weapon: WeaponDefinition): number {
  return hasProperty(weapon, 'reach') ? 10 : 5;
}

export function isProficientWithWeapon(
  weapon: WeaponDefinition,
  proficiencies: readonly WeaponProficiency[],
): boolean {
  return proficiencies.some((proficiency) => {
    if ('weaponId' in proficiency) {
      return proficiency.weaponId === weapon.id;
    }
    if (proficiency.category !== weapon.weaponCategory) {
      return false;
    }
    const required = proficiency.withAnyProperty;
    return required === undefined || required.some((property) => hasProperty(weapon, property));
  });
}
