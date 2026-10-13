import type { Attribute } from '../core/attributes';
import type { DamageType } from '../core/damage';
import type { DiceExpression } from '../core/dice';
import type { ItemBase } from './items';

export const WEAPON_CATEGORIES = ['simple', 'martial'] as const;

export type WeaponCategory = (typeof WEAPON_CATEGORIES)[number];

export const WEAPON_TYPES = ['melee', 'ranged'] as const;

export type WeaponType = (typeof WEAPON_TYPES)[number];

/**
 * Firearm properties:
 * - firearm: fires cartridges or powder and ball.
 * - reload: holds `capacity` shots; reloading takes an action.
 * - misfire: on a natural roll at or below `misfireOn`, the shot fails and the weapon jams.
 * - burst-fire: can spray a 10-foot Cube with `BURST_FIRE_ROUNDS` shots instead of one attack.
 */
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
  'firearm',
  'reload',
  'misfire',
  'burst-fire',
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
  /** Shots held when fully loaded; present with the Reload property. */
  capacity?: number;
  /** The highest natural roll that misfires; present with the Misfire property. */
  misfireOn?: number;
}

/** Shots spent and save DC for a burst of automatic fire into a 10-foot Cube. */
export const BURST_FIRE_ROUNDS = 10;
export const BURST_FIRE_DC = 15;

/** The loaded state of a firearm a character carries. */
export interface FirearmState {
  loaded: number;
  jammed: boolean;
}

export function fullyLoaded(weapon: WeaponDefinition): FirearmState {
  return { loaded: weapon.capacity ?? 1, jammed: false };
}

export interface ShotResult {
  firearm: FirearmState;
  /** The shot failed: the attack misses and the weapon is jammed. */
  misfired: boolean;
}

/**
 * Fires one shot (or a burst), spending rounds. A misfire still spends the rounds, the attack
 * misses, and the weapon is jammed until cleared.
 */
export function fire(
  weapon: WeaponDefinition,
  state: FirearmState,
  natural: number,
  rounds = 1,
): ShotResult {
  if (state.jammed) {
    throw new Error(`${weapon.name} is jammed and must be cleared`);
  }
  if (state.loaded < rounds) {
    throw new Error(
      `${weapon.name} has ${String(state.loaded)} rounds loaded, needs ${String(rounds)}`,
    );
  }
  const misfired = hasProperty(weapon, 'misfire') && natural <= (weapon.misfireOn ?? 1);
  return { firearm: { loaded: state.loaded - rounds, jammed: misfired }, misfired };
}

/** Reloading takes an action and refills the weapon to capacity. */
export function reload(weapon: WeaponDefinition, state: FirearmState): FirearmState {
  return { ...state, loaded: weapon.capacity ?? 1 };
}

/** Clearing a jam takes the Utilize action and a successful Agility check against this DC. */
export function clearJamDc(weapon: WeaponDefinition): number {
  return 8 + (weapon.misfireOn ?? 1);
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
