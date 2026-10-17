import { describe, expect, it } from 'vitest';
import {
  SEED_COMPENDIUM,
  entryProblems,
  indexOf,
  validateCompendium,
  type Compendium,
} from './compendium';
import type { ItemDefinition } from './equipment/items';
import type { WeaponDefinition } from './equipment/weapons';

const { items, professions, backgrounds, feats, monsters, ethnicities } = SEED_COMPENDIUM;

function weapon(id: string): WeaponDefinition {
  const found = items.require(id);
  if (found.category !== 'weapon') throw new Error(`${id} is not a weapon`);
  return found;
}

/** The first value that matches, or a failed test. */
function seed<T>(list: readonly T[], matches: (value: T) => boolean = () => true): T {
  const found = list.find(matches);
  if (found === undefined) throw new Error('No seed matches');
  return found;
}

const sabre = weapon('cavalry-sabre');
const versatile = seed(
  items.all,
  (item) => item.category === 'weapon' && item.properties.includes('versatile'),
);
const revolver = weapon('service-revolver');
const pistol = weapon('automatic-pistol');
const machineGun = weapon('machine-gun');
const heavyArmour = seed(
  items.all,
  (item) => item.category === 'armor' && item.armorCategory === 'heavy',
);
const profession = seed(professions.all);
const otherProfession = seed(professions.all, (entry) => entry !== profession);
const background = seed(backgrounds.all);
const ethnicity = seed(ethnicities.all);
const creature = seed(monsters.all);
const dressed = seed(monsters.all, (entry) => (entry.gear ?? []).length > 0);
const epicBoon = seed(
  feats.all,
  (feat) => feat.category === 'epic-boon' && feat.attributeScoreIncrease !== undefined,
);

/** A copy of `entry` without some of its fields, as stored JSON would have it. */
function omit(entry: object, ...fields: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(entry).filter(([field]) => !fields.includes(field)));
}

/** The messages for an entry's problems, as "path: message". */
function problemsWith(catalog: string, entry: unknown): string[] {
  return entryProblems(catalog, entry).map(({ path, message }) => `${path.join('.')}: ${message}`);
}

/** The seeds, with some entries replaced or added. */
function withItems(...changed: ItemDefinition[]): Compendium {
  const ids = new Set(changed.map((item) => item.id));
  return {
    ...SEED_COMPENDIUM,
    items: indexOf('item', [...items.all.filter((item) => !ids.has(item.id)), ...changed]),
  };
}

describe('the built-in catalogs', () => {
  it('have no problems', () => {
    expect(validateCompendium(SEED_COMPENDIUM)).toEqual([]);
  });

  it('can be looked up by id', () => {
    expect(items.get('service-revolver')?.name).toBe(revolver.name);
    expect(items.get('wand')).toBeUndefined();
    expect(() => items.require('wand')).toThrow('Unknown item: wand');
    expect(SEED_COMPENDIUM.skills.require('occult').attribute).toBe('sanity');
    expect(SEED_COMPENDIUM.actions.require('dodge').name).toBe('Dodge');
  });
});

describe('entry problems', () => {
  it('reports missing, mistyped and unknown fields', () => {
    expect(problemsWith('weapons', { ...omit(sabre, 'name'), weightLb: 'heavy', edge: 1 })).toEqual(
      [
        'name: is required',
        'weightLb: Invalid input: expected number, received string',
        'edge: is not a field of this entry',
      ],
    );
  });

  it('checks an item against the catalog it is edited in', () => {
    expect(problemsWith('weapons', { ...sabre, category: 'armor' })).toEqual([
      'category: must be one of: weapon',
    ]);
    expect(problemsWith('gear', { ...sabre })).toEqual([
      'category: must be one of: tool, adventuring-gear, ammunition',
    ]);
    expect(problemsWith('spells', {})).toEqual([': spells is not a catalog']);
  });

  it.each([
    [
      'Versatile without versatile damage',
      omit(versatile, 'versatileDamage'),
      'versatileDamage: goes with the Versatile property, and only with it',
    ],
    [
      'versatile damage without Versatile',
      { ...sabre, versatileDamage: { terms: [{ count: 1, die: 10 }], modifier: 0 } },
      'versatileDamage: goes with the Versatile property, and only with it',
    ],
    [
      'Reload without a capacity',
      omit(revolver, 'capacity'),
      'capacity: goes with the Reload property, and only with it',
    ],
    [
      'a firearm with neither Reload nor Loading',
      {
        ...omit(revolver, 'capacity'),
        properties: revolver.properties.filter((property) => property !== 'reload'),
      },
      'properties: a firearm has either Reload or Loading',
    ],
    [
      'Misfire without a misfire number',
      omit(pistol, 'misfireOn'),
      'misfireOn: goes with the Misfire property, and only with it',
    ],
    [
      'Burst Fire with too small a magazine',
      { ...machineGun, capacity: 6 },
      'capacity: must be at least 10 for Burst Fire',
    ],
    [
      'Ammunition without an ammunition id',
      omit(revolver, 'ammunition'),
      'ammunition: goes with the Ammunition property, and only with it',
    ],
    [
      'a ranged weapon without a range',
      omit(revolver, 'range'),
      'range: is required for ranged and thrown weapons',
    ],
    [
      'a long range shorter than the normal range',
      { ...revolver, range: { normal: 50, long: 20 } },
      'range.long: long range must be at least the normal range',
    ],
  ])('rejects a weapon with %s', (_case, entry, problem) => {
    expect(problemsWith('weapons', entry)).toEqual([problem]);
  });

  it('needs a Might requirement on heavy armour', () => {
    expect(problemsWith('armour', omit(heavyArmour, 'mightRequirement'))).toEqual([
      'mightRequirement: is required for heavy armour',
    ]);
  });

  it('keeps apparatus charges within the device', () => {
    const device = seed(
      items.all,
      (item) => item.category === 'apparatus' && item.charges !== null,
    );
    if (device.category !== 'apparatus' || device.charges === null) throw new Error('Not charged');
    const { max } = device.charges;
    const effect = seed(device.effects);
    expect(
      problemsWith('apparatus', { ...device, effects: [{ ...effect, charges: max + 1 }] }),
    ).toEqual([`effects.0.charges: can't be more than the device holds (${String(max)})`]);
    expect(problemsWith('apparatus', { ...device, charges: null })).toEqual([
      'charges: is required when an effect spends charges',
    ]);
    expect(
      problemsWith('apparatus', {
        ...device,
        effects: device.effects.map((entry) =>
          entry === effect ? { ...omit(entry, 'trigger'), cost: 'reaction' } : entry,
        ),
      }),
    ).toEqual(['effects.0.trigger: is required for a reaction']);
  });

  it('caps attribute increases at 20, or 30 for epic boons', () => {
    const increase = epicBoon.attributeScoreIncrease;
    expect(
      problemsWith('feats', { ...epicBoon, attributeScoreIncrease: { ...increase, max: 20 } }),
    ).toEqual(['attributeScoreIncrease.max: must be 30 for an epic boon']);
  });

  it('needs different attributes and skills on a background', () => {
    expect(
      problemsWith('backgrounds', {
        ...background,
        attributes: ['might', 'might', 'wisdom'],
        skillProficiencies: ['history', 'history'],
      }),
    ).toEqual([
      'attributes: must be three different attributes',
      'skillProficiencies: must be two different skills',
    ]);
  });

  it('checks a profession and its specialization tree', () => {
    const [first, ...rest] = profession.specializations;
    if (first === undefined) throw new Error('No specializations');
    expect(problemsWith('professions', { ...profession, actions: [] })).toEqual([
      'actions: needs at least one action',
    ]);
    expect(
      problemsWith('professions', {
        ...profession,
        savingThrows: ['might', 'might'],
        specializations: [{ ...first, rank: 'novice' }, ...rest],
      }),
    ).toEqual(
      expect.arrayContaining([
        'savingThrows: must be two different attributes',
        "specializations.0.rank: can't be novice",
      ]),
    );
    expect(
      problemsWith('professions', {
        ...profession,
        specializations: [first, { ...first, id: 'orphan', parentId: 'nowhere' }, ...rest],
      }),
    ).toEqual(
      expect.arrayContaining([
        "specializations.1.parentId: follows nowhere, which isn't one of this profession's specializations",
        'specializations.1.rank: ends its branch below master rank: add a specialization that follows it',
      ]),
    );
  });

  it('only passes on spoken languages, and at least one', () => {
    expect(
      problemsWith('ethnicities', { ...omit(ethnicity, 'languageChoice'), languages: ['latin'] }),
    ).toEqual(['languages.0: must be a spoken language']);
    expect(
      problemsWith('ethnicities', { ...omit(ethnicity, 'languageChoice'), languages: [] }),
    ).toEqual(['languages: needs at least one language']);
  });

  it("keeps a creature's average hit points in line with its formula", () => {
    expect(
      problemsWith('bestiary', {
        ...creature,
        hitPoints: { ...creature.hitPoints, average: creature.hitPoints.average + 1 },
      }),
    ).toEqual([
      `hitPoints.average: must be the formula's average, ${String(creature.hitPoints.average)}`,
    ]);
    expect(problemsWith('bestiary', { ...creature, challengeRating: 0.3 })).toEqual([
      'challengeRating: is not a challenge rating',
    ]);
  });
});

describe('references between entries', () => {
  it('needs ammunition to be ammunition', () => {
    const problems = validateCompendium(withItems({ ...revolver, ammunition: 'cavalry-sabre' }));
    expect(problems).toEqual([
      {
        catalog: 'weapons',
        id: 'service-revolver',
        path: ['ammunition'],
        message: 'cavalry-sabre is not ammunition',
      },
    ]);
  });

  it('notices when an entry another depends on is gone', () => {
    const ammunition = items.require(revolver.ammunition ?? '');
    const compendium = {
      ...SEED_COMPENDIUM,
      items: indexOf(
        'item',
        items.all.filter((item) => item.id !== ammunition.id),
      ),
    };
    const ids = validateCompendium(compendium).map(({ catalog, id }) => `${catalog}/${id}`);
    expect(ids).toContain('weapons/service-revolver');
  });

  it('reports ids used twice in a catalog', () => {
    const compendium = {
      ...SEED_COMPENDIUM,
      items: indexOf('item', [...items.all, { ...sabre, id: 'service-revolver' }]),
    };
    const problems = validateCompendium(compendium);
    expect(problems).toContainEqual({
      catalog: 'weapons',
      id: 'service-revolver',
      path: ['id'],
      message: 'is used by another entry',
    });
  });

  it("checks a background's feat, tool and kit", () => {
    const nonOrigin = feats.all.find((feat) => feat.category !== 'origin');
    const compendium = {
      ...SEED_COMPENDIUM,
      backgrounds: indexOf('background', [
        {
          ...background,
          feat: nonOrigin?.id ?? '',
          toolProficiency: 'harp-of-the-elves',
          equipment: [{ label: 'A', items: [{ itemId: 'wand', quantity: 1 }], money: 0 }],
        },
      ]),
    };
    expect(
      validateCompendium(compendium).map(({ path, message }) => `${path.join('.')}: ${message}`),
    ).toEqual([
      `feat: ${nonOrigin?.id ?? ''} is not an origin feat`,
      'toolProficiency: harp-of-the-elves is not a tool, kind of tool or kind of vehicle',
      'equipment.0.items.0.itemId: wand is not an item',
    ]);
  });

  it("checks a profession's tools and weapons, and specialization ids across professions", () => {
    const compendium = {
      ...SEED_COMPENDIUM,
      professions: indexOf('profession', [
        {
          ...profession,
          toolProficiencies: ['wand'],
          weaponProficiencies: [{ weaponId: 'service-revolver' }, { weaponId: 'top-hat' }],
        },
        {
          ...otherProfession,
          specializations: [
            { ...seed(otherProfession.specializations), id: seed(profession.specializations).id },
          ],
        },
      ]),
    };
    const problems = validateCompendium(compendium).map(
      ({ id, path, message }) => `${id} ${path.join('.')}: ${message}`,
    );
    expect(problems).toEqual(
      expect.arrayContaining([
        `${profession.id} toolProficiencies.0: wand is not a tool, kind of tool or kind of vehicle`,
        `${profession.id} weaponProficiencies.1.weaponId: top-hat is not a weapon`,
        `${otherProfession.id} specializations.0.id: is used by a specialization of another profession`,
      ]),
    );
  });

  it("checks a creature's gear exists and fits", () => {
    const compendium = {
      ...SEED_COMPENDIUM,
      monsters: indexOf('creature', [
        { ...dressed, gear: [...(dressed.gear ?? []), seed(dressed.gear ?? []), 'wand'] },
      ]),
    };
    const problems = validateCompendium(compendium).map(
      ({ path, message }) => `${path.join('.')}: ${message}`,
    );
    expect(problems).toContain(
      `gear.${String((dressed.gear?.length ?? 0) + 1)}: wand is not an item`,
    );
    expect(
      problems.some((problem) => problem.startsWith('gear: wears more than one thing on')),
    ).toBe(true);
  });
});
