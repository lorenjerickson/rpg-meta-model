import { APPARATUS } from '../../science/catalog/apparatus';
import { PREPARATIONS } from '../../science/catalog/preparations';
import { TOOL_CATEGORIES, type ItemDefinition } from '../items';
import { VEHICLE_PROFICIENCIES } from '../transport';
import { ARMOR } from './armor';
import { GEAR } from './gear';
import { TOOLS } from './tools';
import { MOUNTS, VEHICLES } from './transport';
import { AMMUNITION, WEAPONS } from './weapons';

export { AMMUNITION, ARMOR, GEAR, MOUNTS, TOOLS, VEHICLES, WEAPONS };

/** Every item in the catalog, including apparatus and preparations. */
export const ITEMS: readonly ItemDefinition[] = [
  ...WEAPONS,
  ...AMMUNITION,
  ...ARMOR,
  ...TOOLS,
  ...GEAR,
  ...MOUNTS,
  ...VEHICLES,
  ...APPARATUS,
  ...PREPARATIONS,
];

export function findItem(id: string): ItemDefinition | undefined {
  return ITEMS.find((item) => item.id === id);
}

/**
 * Whether a tool proficiency names something that exists: a tool, a kind of tool (e.g. any
 * musical instrument) or a kind of vehicle.
 */
export function isKnownToolProficiency(proficiency: string): boolean {
  return (
    TOOLS.some((entry) => entry.id === proficiency) ||
    (TOOL_CATEGORIES as readonly string[]).includes(proficiency) ||
    (VEHICLE_PROFICIENCIES as readonly string[]).includes(proficiency)
  );
}
