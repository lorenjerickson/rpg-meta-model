import type { PoolDie } from '../core/dicePool';
import { applicableDice, type RollContext, type RollKind } from '../core/rollModifiers';
import type { ItemBase } from './items';

/** The places on the body where clothing and armour are worn. */
export const EQUIPMENT_SLOTS = [
  'head',
  'shoulders',
  'arms',
  'chest',
  'hands',
  'legs',
  'feet',
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

/** Slots covered by more than one of the given items. */
export function slotConflicts(items: readonly ItemBase[]): EquipmentSlot[] {
  const seen = new Set<EquipmentSlot>();
  const conflicts = new Set<EquipmentSlot>();
  for (const slot of items.flatMap((item) => item.slots ?? [])) {
    (seen.has(slot) ? conflicts : seen).add(slot);
  }
  return [...conflicts];
}

/**
 * The dice that equipped items add to a roll. Worn and held items count for every matching
 * roll, but a weapon's attack dice only count for attacks made with that weapon.
 */
export function equipmentDice(
  equipped: readonly ItemBase[],
  kind: RollKind,
  context: RollContext = {},
  weapon?: ItemBase,
): PoolDie[] {
  const items =
    weapon && !equipped.some((item) => item.id === weapon.id) ? [...equipped, weapon] : equipped;
  return items.flatMap((item) => {
    if (kind === 'attack' && item.category === 'weapon' && item.id !== weapon?.id) {
      return [];
    }
    return applicableDice(item.modifiers ?? [], item.name, kind, context);
  });
}
