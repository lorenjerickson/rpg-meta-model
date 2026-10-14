import type { Attribute } from './attributes';
import type { DamageType } from './damage';
import type { DieSize } from './dice';
import { poolDie, type PoolDie } from './dicePool';

/** The rolls that equipment and conditions can add dice to or subtract dice from. */
export const ROLL_KINDS = ['attack', 'defense', 'soak', 'save', 'check', 'initiative'] as const;

export type RollKind = (typeof ROLL_KINDS)[number];

/** Dice added to (sign 1) or subtracted from (sign -1) one kind of roll. */
export interface RollModifier {
  kind: RollKind;
  count: number;
  die: DieSize;
  sign: 1 | -1;
  /** Saves and checks: only those using these attributes. */
  attributes?: readonly Attribute[];
  /** Attack and defense: only with, or against, melee or ranged attacks. */
  attack?: 'melee' | 'ranged';
  /** Soak: only against these damage types. */
  damageTypes?: readonly DamageType[];
}

/** What a roll is for, used to decide which modifiers apply. */
export interface RollContext {
  /** The attribute a save or check uses. */
  attribute?: Attribute;
  /** Whether the attack being made or defended against is melee or ranged. */
  attack?: 'melee' | 'ranged';
  /** The damage type being soaked. */
  damageType?: DamageType;
}

export function bonus(
  kind: RollKind,
  count: number,
  die: DieSize,
  limits: Omit<RollModifier, 'kind' | 'count' | 'die' | 'sign'> = {},
): RollModifier {
  return { kind, count, die, sign: 1, ...limits };
}

export function penalty(
  kind: RollKind,
  count: number,
  die: DieSize,
  limits: Omit<RollModifier, 'kind' | 'count' | 'die' | 'sign'> = {},
): RollModifier {
  return { kind, count, die, sign: -1, ...limits };
}

export function modifierApplies(
  modifier: RollModifier,
  kind: RollKind,
  context: RollContext = {},
): boolean {
  return (
    modifier.kind === kind &&
    (modifier.attributes === undefined ||
      (context.attribute !== undefined && modifier.attributes.includes(context.attribute))) &&
    (modifier.attack === undefined || modifier.attack === context.attack) &&
    (modifier.damageTypes === undefined ||
      (context.damageType !== undefined && modifier.damageTypes.includes(context.damageType)))
  );
}

/** The dice from a source's modifiers that apply to a roll, labelled with the source. */
export function applicableDice(
  modifiers: readonly RollModifier[],
  source: string,
  kind: RollKind,
  context: RollContext = {},
): PoolDie[] {
  return modifiers
    .filter((modifier) => modifierApplies(modifier, kind, context))
    .map((modifier) => poolDie(modifier.count, modifier.die, source, modifier.sign));
}
