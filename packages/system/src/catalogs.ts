import { BACKGROUNDS } from './character/catalog/backgrounds';
import { FEATS } from './character/catalog/feats';
import { ETHNICITIES } from './character/ethnicities';
import { LODGINGS } from './character/rests';
import { ACTION_DEFINITIONS } from './core/actions';
import { CONDITION_DEFINITIONS } from './core/conditions';
import { formatMoney } from './core/currency';
import { SKILL_DEFINITIONS } from './core/skills';
import { ARMOR } from './equipment/catalog/armor';
import { GEAR } from './equipment/catalog/gear';
import { TOOLS } from './equipment/catalog/tools';
import { MOUNTS, VEHICLES } from './equipment/catalog/transport';
import { AMMUNITION, WEAPONS } from './equipment/catalog/weapons';
import { MONSTERS } from './monsters/catalog';
import { PROFESSIONS } from './professions/catalog';
import { APPARATUS } from './science/catalog/apparatus';
import { PREPARATIONS } from './science/catalog/preparations';

/** An entry in a catalog: any seeded definition with an id and a name. */
export interface CatalogEntry {
  id: string;
  name: string;
  [field: string]: unknown;
}

/** One line of description and a short tag, for showing an entry in a list. */
export interface CatalogSummary {
  description?: string;
  meta?: string;
}

/** A seeded catalog that can be browsed and edited. */
export interface CatalogDefinition {
  /** The catalog's key, which is also its page under System (`/system/<key>`). */
  key: string;
  label: string;
  entries: readonly CatalogEntry[];
  /**
   * The seed lists the catalog is made from, when there are several kinds of thing in it (gear,
   * tools and ammunition). Each part has its own shape.
   */
  parts: readonly (readonly CatalogEntry[])[];
  /** What one entry of each part is called, such as "weapon", or "tool" and "vehicle". */
  kinds: readonly string[];
  summarize: (entry: CatalogEntry) => CatalogSummary;
}

/** A catalog made from one or more seed lists. */
function catalog(
  key: string,
  label: string,
  parts: readonly (readonly object[])[],
  summarize: (entry: CatalogEntry) => CatalogSummary,
): CatalogDefinition {
  const typed = parts as readonly (readonly CatalogEntry[])[];
  const kinds = typed.map((part) =>
    typed.length > 1 && typeof part[0]?.category === 'string'
      ? part[0].category.replace(/-/g, ' ')
      : singular(label.toLowerCase()),
  );
  return { key, label, entries: typed.flat(), parts: typed, kinds, summarize };
}

/** "Ethnicities" → "ethnicities" → "ethnicity", "Weapons" → "weapon"; "apparatus" stays. */
function singular(noun: string): string {
  if (noun.endsWith('ies')) return `${noun.slice(0, -3)}y`;
  if (noun.endsWith('s') && !/(us|ss)$/.test(noun)) return noun.slice(0, -1);
  return noun;
}

function entriesOf(record: Readonly<Record<string, object>>): CatalogEntry[] {
  return Object.entries(record).map(([id, definition]) => ({ id, ...definition }) as CatalogEntry);
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** The entry's description, and a tag from the field that best classifies it. */
function describe(...metaFields: string[]) {
  return (entry: CatalogEntry): CatalogSummary => {
    const meta = metaFields.map((field) => text(entry[field])).find(Boolean);
    const description = text(entry.description);
    return {
      ...(description === undefined ? {} : { description }),
      ...(meta === undefined ? {} : { meta: meta.replace(/-/g, ' ') }),
    };
  };
}

function priced(entry: CatalogEntry): CatalogSummary {
  const description = text(entry.description);
  return {
    ...(description === undefined ? {} : { description }),
    ...(typeof entry.cost === 'number' ? { meta: formatMoney(entry.cost) } : {}),
  };
}

function firstLine(value: unknown): string | undefined {
  return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : undefined;
}

/** Every seeded catalog, keyed as its System page is. */
export const CATALOGS: readonly CatalogDefinition[] = [
  catalog('skills', 'Skills', [entriesOf(SKILL_DEFINITIONS)], describe('attribute')),
  catalog('ethnicities', 'Ethnicities', [ETHNICITIES], (entry) => {
    const homeland = text(entry.homeland);
    const region = text(entry.region);
    return {
      ...(homeland === undefined ? {} : { description: homeland }),
      ...(region === undefined ? {} : { meta: region.replace(/-/g, ' ') }),
    };
  }),
  catalog('backgrounds', 'Backgrounds', [BACKGROUNDS], describe()),
  catalog('professions', 'Professions', [PROFESSIONS], describe('category')),
  catalog('feats', 'Feats', [FEATS], describe('category')),
  catalog('weapons', 'Weapons', [WEAPONS], priced),
  catalog('armour', 'Armour', [ARMOR], priced),
  catalog('gear', 'Gear', [GEAR, TOOLS, AMMUNITION], priced),
  catalog('transport', 'Transport', [MOUNTS, VEHICLES], priced),
  catalog('apparatus', 'Apparatus', [APPARATUS], describe('discipline')),
  catalog('preparations', 'Preparations', [PREPARATIONS], describe('discipline')),
  catalog('actions', 'Actions', [entriesOf(ACTION_DEFINITIONS)], (entry) => {
    const description = firstLine(entry.effects);
    return description === undefined ? {} : { description };
  }),
  catalog('conditions', 'Conditions', [entriesOf(CONDITION_DEFINITIONS)], (entry) => {
    const description = firstLine(entry.effects);
    return description === undefined ? {} : { description };
  }),
  catalog('rests', 'Lodgings', [LODGINGS], priced),
  catalog('bestiary', 'Creatures', [MONSTERS], (entry) => {
    const description = text(entry.description);
    return {
      ...(description === undefined ? {} : { description }),
      ...(typeof entry.challengeRating === 'number'
        ? { meta: `CR ${String(entry.challengeRating)}` }
        : {}),
    };
  }),
];

export function findCatalog(key: string): CatalogDefinition | undefined {
  return CATALOGS.find((catalog) => catalog.key === key);
}
