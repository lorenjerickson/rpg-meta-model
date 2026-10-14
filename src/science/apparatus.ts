import type { ActionCost, RestType } from '../core/actions';
import type { Attribute } from '../core/attributes';
import type { DamageType } from '../core/damage';
import { rollDice, type DiceExpression, type Rng } from '../core/dice';
import { attributeDice, proficiencyDice, type PoolDie } from '../core/dicePool';
import type { AreaOfEffect, EffectRange } from '../core/targeting';
import type { Duration } from '../core/time';
import type { ItemBase } from '../equipment/items';
import type { Discipline } from './disciplines';

/** What drives an apparatus, which decides how it recharges. */
export const POWER_SOURCES = ['clockwork', 'steam', 'galvanic', 'chemical', 'aetheric'] as const;

export type PowerSource = (typeof POWER_SOURCES)[number];

/** How spent charges come back: all of them, or a rolled amount, after a rest. */
export interface Recharge {
  rest: RestType;
  amount: 'all' | DiceExpression;
}

/** The usual recharge for each power source. Aetheric devices are unpredictable. */
export const DEFAULT_RECHARGE: Readonly<Record<PowerSource, Recharge>> = {
  clockwork: { rest: 'short', amount: 'all' },
  steam: { rest: 'short', amount: 'all' },
  galvanic: { rest: 'long', amount: 'all' },
  chemical: { rest: 'long', amount: 'all' },
  aetheric: { rest: 'long', amount: { terms: [{ count: 1, die: 4 }], modifier: 1 } },
};

export interface EffectDamage {
  dice: DiceExpression;
  type: DamageType;
}

/** What an apparatus or preparation does when used. */
export interface ScientificEffect {
  id: string;
  name: string;
  cost: Exclude<ActionCost, 'free'>;
  /** Minutes of setup needed before the effect starts, for slow apparatus. */
  setupMinutes?: number;
  /** For reactions: what lets you use it. */
  trigger?: string;
  range: EffectRange;
  area?: AreaOfEffect;
  /** Concentration means the operator must keep the device running steadily. */
  duration: Duration;
  attack?: 'melee' | 'ranged';
  savingThrow?: Attribute;
  damage?: readonly EffectDamage[];
  description: string;
  /** What each extra charge adds when the effect is overcharged. */
  overcharge?: string;
}

export interface ApparatusEffect extends ScientificEffect {
  /** Charges spent per use; 0 means it can be used at will. */
  charges: number;
}

/** A reusable scientific device. */
export interface ApparatusDefinition extends ItemBase {
  category: 'apparatus';
  discipline: Discipline;
  power: PowerSource;
  /** Null for devices with only at-will effects. */
  charges: { max: number; recharge: Recharge } | null;
  effects: readonly ApparatusEffect[];
}

/** A single-use concoction, grenade or injection, consumed when used. */
export interface PreparationDefinition extends ItemBase {
  category: 'preparation';
  discipline: Discipline;
  effect: ScientificEffect;
}

/** The runtime state of one apparatus a character carries. */
export interface ApparatusState {
  charges: number;
  malfunctioning: boolean;
}

/** DC to repair a malfunctioning apparatus with the Utilize action and the right tools. */
export const REPAIR_DC = 15;

/**
 * The dice an operator rolls, with a d20, for a discipline's attacks and effects ("your
 * operator roll"): the discipline attribute's dice, plus proficiency dice if proficient.
 */
export function operatorPool(
  attributeScore: number,
  attribute: Attribute,
  proficiencyBonus: number,
  proficient: boolean,
): PoolDie[] {
  return [
    ...attributeDice(attributeScore, attribute),
    ...(proficient ? proficiencyDice(proficiencyBonus) : []),
  ];
}

export function freshApparatusState(apparatus: ApparatusDefinition): ApparatusState {
  return { charges: apparatus.charges?.max ?? 0, malfunctioning: false };
}

function findEffect(apparatus: ApparatusDefinition, effectId: string): ApparatusEffect {
  const effect = apparatus.effects.find((entry) => entry.id === effectId);
  if (effect === undefined) {
    throw new Error(`${apparatus.name} has no effect ${effectId}`);
  }
  return effect;
}

/** Charges needed for an effect, plus any extra charges spent overcharging it. */
export function chargeCost(
  apparatus: ApparatusDefinition,
  effectId: string,
  extraCharges = 0,
): number {
  const effect = findEffect(apparatus, effectId);
  if (extraCharges > 0 && effect.overcharge === undefined) {
    throw new Error(`${effect.name} can't be overcharged`);
  }
  return effect.charges + extraCharges;
}

export function canActivate(
  apparatus: ApparatusDefinition,
  state: ApparatusState,
  effectId: string,
  extraCharges = 0,
): boolean {
  return !state.malfunctioning && state.charges >= chargeCost(apparatus, effectId, extraCharges);
}

/** Spends the charges for an effect. Throws if the apparatus is malfunctioning or too low. */
export function activate(
  apparatus: ApparatusDefinition,
  state: ApparatusState,
  effectId: string,
  extraCharges = 0,
): ApparatusState {
  if (state.malfunctioning) {
    throw new Error(`${apparatus.name} is malfunctioning and must be repaired`);
  }
  const cost = chargeCost(apparatus, effectId, extraCharges);
  if (state.charges < cost) {
    throw new Error(
      `${apparatus.name} needs ${String(cost)} charges but has ${String(state.charges)}`,
    );
  }
  return { ...state, charges: state.charges - cost };
}

/**
 * After overcharging, roll a d20. If the roll is no higher than the extra charges spent, the
 * apparatus malfunctions and does nothing until repaired.
 */
export function overchargeMalfunctions(natural: number, extraCharges: number): boolean {
  return extraCharges > 0 && natural <= extraCharges;
}

/** Recharges an apparatus after a rest. A Long Rest also counts as a Short Rest. */
export function recharge(
  apparatus: ApparatusDefinition,
  state: ApparatusState,
  rest: RestType,
  rng?: Rng,
): ApparatusState {
  const { charges } = apparatus;
  if (charges === null || (charges.recharge.rest === 'long' && rest === 'short')) {
    return state;
  }
  const { amount } = charges.recharge;
  const regained = amount === 'all' ? charges.max : rollDice(amount, rng ? { rng } : {}).total;
  return { ...state, charges: Math.min(charges.max, state.charges + regained) };
}
