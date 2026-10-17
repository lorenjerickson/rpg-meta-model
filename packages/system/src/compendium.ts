import type { z } from 'zod';
import { BACKGROUNDS } from './character/catalog/backgrounds';
import { FEATS } from './character/catalog/feats';
import { ETHNICITIES } from './character/ethnicities';
import type { BackgroundDefinition } from './character/backgrounds';
import type { EthnicityDefinition } from './character/ethnicity';
import type { FeatDefinition } from './character/feats';
import { LODGINGS, type LodgingDefinition } from './character/rests';
import { BackgroundSchema, EthnicitySchema, FeatSchema, LodgingSchema } from './character/schemas';
import type { EquipmentOption } from './character/startingEquipment';
import { ACTION_DEFINITIONS, type ActionDefinition, type ActionId } from './core/actions';
import { CONDITION_DEFINITIONS, type Condition, type ConditionDefinition } from './core/conditions';
import { ActionEntrySchema, ConditionEntrySchema, SkillEntrySchema } from './core/schemas';
import { SKILL_DEFINITIONS, type Skill, type SkillDefinition } from './core/skills';
import { ITEMS } from './equipment/catalog';
import { TOOL_CATEGORIES, type ItemCategory, type ItemDefinition } from './equipment/items';
import { slotConflicts } from './equipment/protection';
import {
  AmmunitionSchema,
  ArmorSchema,
  GearSchema,
  MountSchema,
  ToolSchema,
  VehicleSchema,
  WeaponSchema,
} from './equipment/schemas';
import { VEHICLE_PROFICIENCIES } from './equipment/transport';
import type { WeaponProficiency } from './equipment/weapons';
import { MONSTERS } from './monsters/catalog';
import { MonsterSchema } from './monsters/schemas';
import type { MonsterStatBlock } from './monsters/statBlock';
import { PROFESSIONS } from './professions/catalog';
import type { ProfessionDefinition } from './professions/profession';
import { ProfessionSchema } from './professions/schemas';
import { ApparatusSchema, PreparationSchema } from './science/schemas';

/** The definitions of one catalog, by id. */
export interface Index<T extends { id: string }> {
  readonly all: readonly T[];
  get(id: string): T | undefined;
  /** Throws for an unknown id, naming the catalog. */
  require(id: string): T;
}

/** An index of `entries`. When ids repeat, the first entry wins; `validateCompendium` reports it. */
export function indexOf<T extends { id: string }>(label: string, entries: readonly T[]): Index<T> {
  const byId = new Map<string, T>();
  for (const entry of entries) {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  }
  return {
    all: entries,
    get: (id) => byId.get(id),
    require(id) {
      const entry = byId.get(id);
      if (entry === undefined) {
        throw new Error(`Unknown ${label}: ${id}`);
      }
      return entry;
    },
  };
}

export type SkillEntry = SkillDefinition & { id: Skill };
export type ActionEntry = ActionDefinition & { id: ActionId };
export type ConditionEntry = ConditionDefinition & { id: Condition };

/** Everything the rules look up. */
export interface Compendium {
  /** Weapons, ammunition, armour, tools, gear, mounts, vehicles, apparatus and preparations. */
  items: Index<ItemDefinition>;
  professions: Index<ProfessionDefinition>;
  backgrounds: Index<BackgroundDefinition>;
  feats: Index<FeatDefinition>;
  ethnicities: Index<EthnicityDefinition>;
  lodgings: Index<LodgingDefinition>;
  monsters: Index<MonsterStatBlock>;
  skills: Index<SkillEntry>;
  actions: Index<ActionEntry>;
  conditions: Index<ConditionEntry>;
}

function withIds<K extends string, T>(record: Readonly<Record<K, T>>): (T & { id: K })[] {
  return (Object.entries(record) as [K, T][]).map(([id, definition]) => ({ id, ...definition }));
}

/** The built-in catalogs, with no edits or additions. */
export const SEED_COMPENDIUM: Compendium = {
  items: indexOf('item', ITEMS),
  professions: indexOf('profession', PROFESSIONS),
  backgrounds: indexOf('background', BACKGROUNDS),
  feats: indexOf('feat', FEATS),
  ethnicities: indexOf('ethnicity', ETHNICITIES),
  lodgings: indexOf('lodging', LODGINGS),
  monsters: indexOf('creature', MONSTERS),
  skills: indexOf('skill', withIds(SKILL_DEFINITIONS)),
  actions: indexOf('action', withIds(ACTION_DEFINITIONS)),
  conditions: indexOf('condition', withIds(CONDITION_DEFINITIONS)),
};

/** A problem with one entry: where in it, and what's wrong. */
export interface EntryProblem {
  path: (string | number)[];
  message: string;
}

/** A problem with one entry of a catalog, keyed as `CATALOGS` is. */
export interface CompendiumProblem extends EntryProblem {
  catalog: string;
  id: string;
}

const NOT_A_TOOL = 'is not a tool, kind of tool or kind of vehicle';

/** The catalog (System page) each kind of item is edited in. */
export const ITEM_CATALOGS: Readonly<Record<ItemCategory, string>> = {
  weapon: 'weapons',
  armor: 'armour',
  tool: 'gear',
  'adventuring-gear': 'gear',
  ammunition: 'gear',
  mount: 'transport',
  vehicle: 'transport',
  apparatus: 'apparatus',
  preparation: 'preparations',
};

const ITEM_SCHEMAS: Readonly<Record<ItemCategory, z.ZodType>> = {
  weapon: WeaponSchema,
  armor: ArmorSchema,
  tool: ToolSchema,
  'adventuring-gear': GearSchema,
  ammunition: AmmunitionSchema,
  mount: MountSchema,
  vehicle: VehicleSchema,
  apparatus: ApparatusSchema,
  preparation: PreparationSchema,
};

/** The schema for each catalog other than the item catalogs, which go by item category. */
const CATALOG_SCHEMAS: Readonly<Record<string, z.ZodType>> = {
  skills: SkillEntrySchema,
  ethnicities: EthnicitySchema,
  backgrounds: BackgroundSchema,
  professions: ProfessionSchema,
  feats: FeatSchema,
  actions: ActionEntrySchema,
  conditions: ConditionEntrySchema,
  rests: LodgingSchema,
  bestiary: MonsterSchema,
};

function isItemCategory(value: unknown): value is ItemCategory {
  return typeof value === 'string' && value in ITEM_SCHEMAS;
}

function schemaFor(catalog: string, entry: unknown): z.ZodType | EntryProblem {
  const known = CATALOG_SCHEMAS[catalog];
  if (known) return known;
  if (!Object.values(ITEM_CATALOGS).includes(catalog)) {
    return { path: [], message: `${catalog} is not a catalog` };
  }
  const category = (entry as { category?: unknown } | null)?.category;
  if (!isItemCategory(category) || ITEM_CATALOGS[category] !== catalog) {
    const kinds = Object.entries(ITEM_CATALOGS)
      .filter(([, key]) => key === catalog)
      .map(([kind]) => kind);
    return { path: ['category'], message: `must be one of: ${kinds.join(', ')}` };
  }
  return ITEM_SCHEMAS[category];
}

/**
 * Problems with one entry on its own: its fields, and rules within it such as a Versatile
 * weapon needing versatile damage. References to other entries are checked by
 * `validateCompendium`.
 */
export function entryProblems(catalog: string, entry: unknown): EntryProblem[] {
  const schema = schemaFor(catalog, entry);
  if (!('safeParse' in schema)) return [schema];
  const result = schema.safeParse(entry, {
    error: (issue) =>
      issue.code === 'invalid_type' && issue.input === undefined ? 'is required' : undefined,
  });
  if (result.success) return [];
  return result.error.issues.flatMap((issue) => {
    const path = issue.path.map((key) => (typeof key === 'number' ? key : String(key)));
    return issue.code === 'unrecognized_keys'
      ? issue.keys.map((key) => ({ path: [...path, key], message: 'is not a field of this entry' }))
      : [{ path, message: issue.message }];
  });
}

/** Records problems against one entry, into a list shared by every entry. */
class Problems {
  constructor(
    readonly list: CompendiumProblem[],
    private readonly catalog = '',
    private readonly id = '',
  ) {}

  /** Records against another entry, into the same list. */
  for(catalog: string, id: string): Problems {
    return new Problems(this.list, catalog, id);
  }

  add(path: (string | number)[], message: string): void {
    this.list.push({ catalog: this.catalog, id: this.id, path, message });
  }
}

function checkUniqueIds(
  problems: Problems,
  entries: readonly { id: string }[],
  catalogOf: (entry: { id: string }) => string,
): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      problems.for(catalogOf(entry), entry.id).add(['id'], 'is used by another entry');
    }
    seen.add(entry.id);
  }
}

/**
 * Checks every entry of a compendium, then the references between entries: a weapon's
 * ammunition, a tool's crafts, a background's feat, kit and tool, a profession's tools,
 * weapons and kit, a creature's gear. Returns an empty list when all is well.
 */
export function validateCompendium(compendium: Compendium): CompendiumProblem[] {
  const problems = new Problems([]);
  const { items } = compendium;
  const itemCatalog = (item: { id: string }) => {
    const category = items.get(item.id)?.category;
    return category === undefined ? 'items' : ITEM_CATALOGS[category];
  };

  const catalogs: [string, Index<{ id: string }>][] = [
    ['skills', compendium.skills],
    ['ethnicities', compendium.ethnicities],
    ['backgrounds', compendium.backgrounds],
    ['professions', compendium.professions],
    ['feats', compendium.feats],
    ['actions', compendium.actions],
    ['conditions', compendium.conditions],
    ['rests', compendium.lodgings],
    ['bestiary', compendium.monsters],
  ];
  for (const item of items.all) {
    for (const { path, message } of entryProblems(ITEM_CATALOGS[item.category], item)) {
      problems.for(ITEM_CATALOGS[item.category], item.id).add(path, message);
    }
  }
  checkUniqueIds(problems, items.all, itemCatalog);
  for (const [catalog, index] of catalogs) {
    for (const entry of index.all) {
      for (const { path, message } of entryProblems(catalog, entry)) {
        problems.for(catalog, entry.id).add(path, message);
      }
    }
    checkUniqueIds(problems, index.all, () => catalog);
  }

  const isItem = (id: string, category?: ItemCategory) => {
    const item = items.get(id);
    return item !== undefined && (category === undefined || item.category === category);
  };
  const isToolProficiency = (id: string) =>
    items.get(id)?.category === 'tool' ||
    (TOOL_CATEGORIES as readonly string[]).includes(id) ||
    (VEHICLE_PROFICIENCIES as readonly string[]).includes(id);
  const checkKit = (
    entry: Problems,
    path: (string | number)[],
    options: readonly EquipmentOption[],
  ) => {
    options.forEach((option, i) => {
      option.items.forEach(({ itemId }, j) => {
        if (!isItem(itemId))
          entry.add([...path, i, 'items', j, 'itemId'], `${itemId} is not an item`);
      });
    });
  };
  const checkTools = (entry: Problems, path: (string | number)[], tools: readonly string[]) => {
    tools.forEach((tool, i) => {
      if (!isToolProficiency(tool)) {
        entry.add([...path, i], `${tool} ${NOT_A_TOOL}`);
      }
    });
  };
  const checkWeapons = (
    entry: Problems,
    path: (string | number)[],
    weapons: readonly WeaponProficiency[],
  ) => {
    weapons.forEach((proficiency, i) => {
      if ('weaponId' in proficiency && !isItem(proficiency.weaponId, 'weapon')) {
        entry.add([...path, i, 'weaponId'], `${proficiency.weaponId} is not a weapon`);
      }
    });
  };

  for (const item of items.all) {
    const entry = problems.for(ITEM_CATALOGS[item.category], item.id);
    if (item.category === 'weapon' && item.ammunition !== undefined) {
      if (!isItem(item.ammunition, 'ammunition')) {
        entry.add(['ammunition'], `${item.ammunition} is not ammunition`);
      }
    }
    if (item.category === 'tool') {
      item.craft.forEach((id, i) => {
        if (!isItem(id)) entry.add(['craft', i], `${id} is not an item`);
      });
    }
  }

  for (const background of compendium.backgrounds.all) {
    const entry = problems.for('backgrounds', background.id);
    const feat = compendium.feats.get(background.feat);
    if (feat?.category !== 'origin') {
      entry.add(['feat'], `${background.feat} is not an origin feat`);
    }
    if (!isToolProficiency(background.toolProficiency)) {
      entry.add(['toolProficiency'], `${background.toolProficiency} ${NOT_A_TOOL}`);
    }
    checkKit(entry, ['equipment'], background.equipment);
  }

  const specializationIds = new Set<string>();
  for (const profession of compendium.professions.all) {
    const entry = problems.for('professions', profession.id);
    checkTools(entry, ['toolProficiencies'], profession.toolProficiencies);
    checkWeapons(entry, ['weaponProficiencies'], profession.weaponProficiencies);
    checkKit(entry, ['startingEquipment'], profession.startingEquipment ?? []);
    profession.specializations.forEach((specialization, i) => {
      const path = ['specializations', i];
      if (specializationIds.has(specialization.id)) {
        entry.add([...path, 'id'], 'is used by a specialization of another profession');
      }
      specializationIds.add(specialization.id);
      checkTools(entry, [...path, 'tools'], specialization.tools ?? []);
      checkWeapons(entry, [...path, 'weapons'], specialization.weapons ?? []);
    });
  }

  for (const ethnicity of compendium.ethnicities.all) {
    const entry = problems.for('ethnicities', ethnicity.id);
    ethnicity.traits.forEach((trait, i) => {
      trait.effects.forEach((effect, j) => {
        if (effect.kind === 'tool-proficiency' && effect.from !== 'any') {
          checkTools(entry, ['traits', i, 'effects', j, 'from'], effect.from);
        }
      });
    });
  }

  for (const monster of compendium.monsters.all) {
    const entry = problems.for('bestiary', monster.id);
    const gear = monster.gear ?? [];
    gear.forEach((id, i) => {
      if (!isItem(id)) entry.add(['gear', i], `${id} is not an item`);
    });
    const worn = gear.flatMap((id) => items.get(id) ?? []);
    const conflicts = slotConflicts(worn);
    if (conflicts.length > 0) {
      entry.add(['gear'], `wears more than one thing on: ${conflicts.join(', ')}`);
    }
  }

  return problems.list;
}
