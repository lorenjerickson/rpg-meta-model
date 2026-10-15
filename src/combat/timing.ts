import { ACTION_DEFINITIONS, type ActionId } from '../core/actions';
import { poolDie, type PoolDie } from '../core/dicePool';
import type { WeaponDefinition } from '../equipment/weapons';
import type { ScientificEffect } from '../science/apparatus';

/** A round lasts 6 seconds, and every step in a plan costs whole seconds of it. */
export const ROUND_SECONDS = 6;

/** What any action, bonus action or reaction costs unless it says otherwise. */
export const DEFAULT_STEP_SECONDS = 1;

export const OPPORTUNITY_ATTACK_SECONDS = 1;
export const DEATH_SAVE_SECONDS = 1;
export const CLEAR_JAM_SECONDS = 2;

/** How long an action takes. */
export function actionSeconds(action: ActionId): number {
  return ACTION_DEFINITIONS[action].seconds ?? DEFAULT_STEP_SECONDS;
}

/** Ranged attacks trade time for accuracy. */
export const FIRING_MODES = ['snap', 'standard', 'aimed'] as const;

export type FiringMode = (typeof FIRING_MODES)[number];

export interface FiringModeDefinition {
  name: string;
  seconds: number;
  /** Dice added to or subtracted from the attack roll. */
  dice: readonly PoolDie[];
}

export const FIRING_MODE_DEFINITIONS: Readonly<Record<FiringMode, FiringModeDefinition>> = {
  snap: { name: 'Snap shot', seconds: 1, dice: [poolDie(1, 4, 'Snap shot', -1)] },
  standard: { name: 'Shot', seconds: 2, dice: [] },
  aimed: { name: 'Aimed shot', seconds: 3, dice: [poolDie(1, 6, 'Aimed shot')] },
};

/**
 * How long one attack with a weapon takes. Ranged attacks take their firing mode's time; melee
 * attacks take 1 second, or 2 with a heavy or two-handed weapon (or a versatile one held in two
 * hands).
 */
export function weaponAttackSeconds(
  weapon: WeaponDefinition,
  options: { firingMode?: FiringMode; twoHanded?: boolean } = {},
): number {
  if (weapon.weaponType === 'ranged') {
    return FIRING_MODE_DEFINITIONS[options.firingMode ?? 'standard'].seconds;
  }
  const { properties } = weapon;
  const heavy =
    properties.includes('heavy') ||
    properties.includes('two-handed') ||
    (properties.includes('versatile') && options.twoHanded === true);
  return heavy ? 2 : DEFAULT_STEP_SECONDS;
}

/** How long it takes to reload a weapon to capacity. */
export function reloadSeconds(weapon: WeaponDefinition): number {
  return weapon.reloadSeconds ?? DEFAULT_STEP_SECONDS;
}

/** How long an apparatus or preparation effect takes: 2 seconds for an action, otherwise 1. */
export function effectSeconds(effect: ScientificEffect): number {
  return effect.seconds ?? (effect.cost === 'action' ? 2 : DEFAULT_STEP_SECONDS);
}

/**
 * How long it takes to move a distance: its share of the round at the creature's Speed, rounded
 * up to a whole second. Running doubles Speed.
 */
export function movementSeconds(distance: number, speed: number, running = false): number {
  if (speed <= 0) {
    throw new RangeError('A creature with Speed 0 cannot move');
  }
  return Math.ceil((ROUND_SECONDS * distance) / (running ? speed * 2 : speed));
}
