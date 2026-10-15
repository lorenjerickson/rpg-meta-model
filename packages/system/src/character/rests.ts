import type { RestType } from '../core/actions';
import { guineas, lsd, type Money } from '../core/currency';
import { rollD20, type RollMode } from '../core/d20';
import { rollDie, type Rng } from '../core/dice';
import { rollPool } from '../core/dicePool';
import { MADNESS_RECOVERY_DC } from '../core/conditions';
import { NO_DEATH_SAVES } from '../combat/deathSaves';
import { heal } from '../combat/hitPoints';
import { findItem } from '../equipment/catalog';
import { PROFESSIONS } from '../professions/catalog';
import type { HitDie } from '../professions/profession';
import { recharge } from '../science/apparatus';
import type { Character, InventoryEntry } from './character';
import { characterSavePool } from './combat';
import { characterAttributeModifier, hitDiceTotal, type ProfessionCatalog } from './derived';

export interface LodgingDefinition {
  id: string;
  name: string;
  description: string;
  /** Typical price of a night's stay, in pence. */
  costPerNight: Money;
  /** A Long Rest only counts somewhere safe; elsewhere it gives Short Rest benefits. */
  safe: boolean;
  /** Exhaustion levels removed by a Long Rest here. */
  exhaustionRemoved: number;
  /** How the Sanity save to recover from Madness is rolled after a Long Rest here. */
  madnessSave: RollMode;
  /** Spent Hit Dice regained by a Long Rest here: all of them, or up to half the total. */
  hitDiceRecovered: 'all' | 'half';
}

/** Where a character might spend the night, from worst to best. */
export const LODGINGS: readonly LodgingDefinition[] = [
  {
    id: 'sleeping-rough',
    name: 'Sleeping Rough',
    description: 'A doorway, a railway arch or a hedge, with one eye open.',
    costPerNight: 0,
    safe: false,
    exhaustionRemoved: 0,
    madnessSave: 'disadvantage',
    hitDiceRecovered: 'half',
  },
  {
    id: 'doss-house',
    name: 'Doss-House',
    description: 'A bench or a rope to lean on in a crowded, verminous common room.',
    costPerNight: lsd(0, 0, 4),
    safe: true,
    exhaustionRemoved: 0,
    madnessSave: 'disadvantage',
    hitDiceRecovered: 'half',
  },
  {
    id: 'lodging-house',
    name: 'Lodging House',
    description: 'A clean bed in a shared room, and a landlady who asks no questions.',
    costPerNight: lsd(0, 1),
    safe: true,
    exhaustionRemoved: 1,
    madnessSave: 'normal',
    hitDiceRecovered: 'all',
  },
  {
    id: 'inn',
    name: 'Coaching Inn',
    description: 'A private room, a fire and a hot supper.',
    costPerNight: lsd(0, 2, 6),
    safe: true,
    exhaustionRemoved: 1,
    madnessSave: 'normal',
    hitDiceRecovered: 'all',
  },
  {
    id: 'hotel',
    name: 'Hotel',
    description: 'A good hotel with electric light, a bath and attentive staff.',
    costPerNight: lsd(0, 10),
    safe: true,
    exhaustionRemoved: 1,
    madnessSave: 'advantage',
    hitDiceRecovered: 'all',
  },
  {
    id: 'country-house',
    name: 'Country House',
    description: 'A guest room in a great house, with servants, fresh air and quiet.',
    costPerNight: guineas(1),
    safe: true,
    exhaustionRemoved: 2,
    madnessSave: 'advantage',
    hitDiceRecovered: 'all',
  },
];

export function findLodging(id: string): LodgingDefinition | undefined {
  return LODGINGS.find((entry) => entry.id === id);
}

export interface MadnessRecovery {
  natural: number;
  total: number;
  success: boolean;
}

export interface RestResult {
  character: Character;
  /** The kind of rest that actually took effect. */
  countedAs: RestType;
  hitPointsRegained: number;
  exhaustionRemoved: number;
  madnessRecovery: MadnessRecovery | null;
  /** Inventory item ids of apparatus that regained charges. */
  apparatusRecharged: string[];
}

export interface ShortRestOptions {
  /** Hit Dice to spend, by die size. */
  hitDice?: Partial<Record<HitDie, number>>;
  rng?: Rng;
  professions?: ProfessionCatalog;
}

export interface LongRestOptions {
  lodging: LodgingDefinition;
  /** A Long Rest interrupted by combat or alarm only counts as a Short Rest. */
  interrupted?: boolean;
  rng?: Rng;
  professions?: ProfessionCatalog;
}

function rechargeInventory(
  inventory: readonly InventoryEntry[],
  rest: RestType,
  rng: Rng,
): { inventory: InventoryEntry[]; recharged: string[] } {
  const recharged: string[] = [];
  const updated = inventory.map((entry) => {
    const item = findItem(entry.itemId);
    if (entry.apparatus === undefined || item?.category !== 'apparatus') {
      return entry;
    }
    const apparatus = recharge(item, entry.apparatus, rest, rng);
    if (apparatus.charges === entry.apparatus.charges) {
      return entry;
    }
    recharged.push(entry.itemId);
    return { ...entry, apparatus };
  });
  return { inventory: updated, recharged };
}

function withoutCondition(character: Character, condition: 'intoxicated'): Character['conditions'] {
  return character.conditions.filter((entry) => entry !== condition);
}

/**
 * A Short Rest: spend Hit Dice to regain Hit Points (each die plus the Hardiness modifier,
 * at least 1), sober up, and recharge clockwork and steam apparatus.
 */
export function shortRest(character: Character, options: ShortRestOptions = {}): RestResult {
  const rng = options.rng ?? Math.random;
  const totals = hitDiceTotal(character, options.professions ?? PROFESSIONS);
  const hardiness = characterAttributeModifier(character, 'hardiness');
  const hitDiceSpent = { ...character.hitDiceSpent };
  let regained = 0;

  for (const [die, count = 0] of Object.entries(options.hitDice ?? {})) {
    const size = Number(die) as HitDie;
    const available = (totals[size] ?? 0) - (hitDiceSpent[size] ?? 0);
    if (count > available) {
      throw new RangeError(
        `${character.name} has ${String(available)} d${String(size)} Hit Dice, not ${String(count)}`,
      );
    }
    for (let i = 0; i < count; i++) {
      regained += Math.max(1, rollDie(size, rng) + hardiness);
    }
    hitDiceSpent[size] = (hitDiceSpent[size] ?? 0) + count;
  }

  const hitPoints = heal(character.hitPoints, regained);
  const { inventory, recharged } = rechargeInventory(character.inventory, 'short', rng);
  return {
    character: {
      ...character,
      hitPoints,
      hitDiceSpent,
      conditions: withoutCondition(character, 'intoxicated'),
      inventory,
    },
    countedAs: 'short',
    hitPointsRegained: hitPoints.current - character.hitPoints.current,
    exhaustionRemoved: 0,
    madnessRecovery: null,
    apparatusRecharged: recharged,
  };
}

/** Regains spent Hit Dice up to `limit`, largest dice first. */
function regainHitDice(
  spent: Partial<Record<HitDie, number>>,
  limit: number,
): Partial<Record<HitDie, number>> {
  const result = { ...spent };
  let remaining = limit;
  for (const size of [12, 10, 8, 6] as const) {
    const regained = Math.min(result[size] ?? 0, remaining);
    if (regained > 0) {
      result[size] = (result[size] ?? 0) - regained;
      remaining -= regained;
    }
  }
  return result;
}

/**
 * A Long Rest in the given lodging. Somewhere unsafe, or if interrupted, it only counts as a
 * Short Rest. Otherwise the character regains all Hit Points and Hit Dice (half the Hit Dice in
 * poor lodging), loses Exhaustion and temporary Hit Points, resets death saves, sobers up,
 * regains Heroic Inspiration (the human Resourceful trait), recharges apparatus, and can make
 * a Sanity save to recover from one level of Madness.
 */
export function longRest(character: Character, options: LongRestOptions): RestResult {
  const { lodging } = options;
  const rng = options.rng ?? Math.random;
  if (!lodging.safe || options.interrupted) {
    return shortRest(character, {
      rng,
      ...(options.professions && { professions: options.professions }),
    });
  }

  const totalHitDice = Object.values(
    hitDiceTotal(character, options.professions ?? PROFESSIONS),
  ).reduce((sum, count) => sum + count, 0);
  const hitDiceSpent =
    lodging.hitDiceRecovered === 'all'
      ? {}
      : regainHitDice(character.hitDiceSpent, Math.max(1, Math.floor(totalHitDice / 2)));

  const exhaustion = Math.max(0, character.exhaustion - lodging.exhaustionRemoved);

  let madness = character.madness;
  let madnessRecovery: MadnessRecovery | null = null;
  if (madness > 0) {
    const { natural } = rollD20(lodging.madnessSave, rng);
    const total =
      natural + rollPool(characterSavePool({ ...character, exhaustion }, 'sanity'), rng).total;
    madnessRecovery = { natural, total, success: total >= MADNESS_RECOVERY_DC };
    if (madnessRecovery.success) {
      madness -= 1;
    }
  }

  const { inventory, recharged } = rechargeInventory(character.inventory, 'long', rng);
  return {
    character: {
      ...character,
      hitPoints: { ...character.hitPoints, current: character.hitPoints.max, temporary: 0 },
      hitDiceSpent,
      exhaustion,
      madness,
      deathSaves: NO_DEATH_SAVES,
      heroicInspiration: true,
      conditions: withoutCondition(character, 'intoxicated'),
      inventory,
    },
    countedAs: 'long',
    hitPointsRegained: character.hitPoints.max - character.hitPoints.current,
    exhaustionRemoved: character.exhaustion - exhaustion,
    madnessRecovery,
    apparatusRecharged: recharged,
  };
}
