# Plan: make catalog edits and additions visible to the rules

Status: proposal, nothing built yet. All open questions are settled (see Decisions).

## Decisions

1. **Scope: global.** Rules live in System, separate from Worlds and Campaigns. A rule change
   applies immediately to every World and Campaign; there is no per-World/Campaign ruleset or
   pinned version.
2. **Validation: zod.**
3. **Derived values follow edits.** Editing an item re-prices background kits and re-resolves the
   monsters that wear it.
4. **Code updates the seed; user edits override it.** A code change to a seed reaches every field
   the user hasn't edited. Fields the user edited keep the user's value.
5. **Skills, actions and conditions accept additions**, like every other catalog.
6. **A missing entry is skipped.** When something refers to an entry that no longer exists (a
   character's item after the added item is deleted), the rules leave it out, as `equippedItems`
   does today. Deletes are not blocked by characters. (Catalog entries referring to each other
   are still checked on save: see "Validation".)
7. **Entries have access levels.** Seeds and added entries alike can be withheld from some
   viewers: a campaign villain is visible to the GM and invisible to players. See "Access".
8. **`gm` is global.** An entry marked `gm` is hidden from players in every campaign. There are no
   per-campaign reveals.
9. **The bestiary defaults to `gm`.** Players don't see creatures in the catalog.
10. **Every GM may edit System.** GMs work toward common goals there, so there is no separate
    admin role: GMs edit, players only view what they're allowed to.

## Where things stand

- `packages/system` defines each catalog as a seed constant (`WEAPONS`, `PROFESSIONS`, …) and
  `catalogs.ts` lists them as `CATALOGS` for the System pages.
- `apps/api` overlays `catalog_edits` (today: full copies of edited seeds) and adds
  `catalog_additions` rows, and checks them with a `Shape` inferred from the seeds
  (`validateShape`). Nothing in the rules ever sees those rows.
- The rules read the seeds directly. Most of the global finds (`findFeat`, `findBackground`,
  `findEthnicity`, `findMonster`, `findApparatus`, `findPreparation`, `findLodging`,
  `findProfession`/`getProfession`) are used only by tests, `scripts/simulate.ts` and the catalog
  pages. **The real dependencies are:**

| Lookup | Rules call sites |
| --- | --- |
| `findItem` | `character/combat.ts:29` (`equippedItems`, so every pool in that file), `character/rests.ts:140` (`rechargeInventory`), `character/catalog/backgrounds.ts:12` (`equipmentOptionValue`, also at seed build), `monsters/catalog/builders.ts:314` (seed build) |
| `PROFESSIONS` (as `ProfessionCatalog` default) | `character/derived.ts:93,105,122,144,161`, `character/rests.ts:164,236` |
| `SKILL_DEFINITIONS` | `character/derived.ts:77` (`skillModifier`), `monsters/catalog/builders.ts:307` (seed build) |
| `CONDITION_DEFINITIONS`, `IMPLIED_CONDITIONS` | `core/conditions.ts:250-279` (`expandConditions`, `conditionDice`, `conditionDefense`) |
| `ACTION_DEFINITIONS` | `combat/timing.ts:18` (`actionSeconds`) |
| `TOOLS` | `equipment/catalog/index.ts:36` (`isKnownToolProficiency`) |

Two catalogs are **built from other catalogs when the module loads**, so today they ignore edits:

- each background's option A money is `£15 − kit value` at seed prices (`background()`);
- each monster stat block is resolved from a `MonsterInput` (worn items → defense and soak,
  skill levels → modifiers) by `monster()`. The bestiary catalog stores and edits the
  *resolved* block, so its inputs are lost.

Decision 3 moves both builds into the compendium (see "Derived entries").

## Why the seeds stay in code (rather than copying them into the database once)

The alternative: on first boot, insert every seed into the database; from then on the database is
the only catalog and the System pages edit it directly. That is simpler at runtime: one table per
catalog, no overlay, seeds can be deleted. But decision 4 rules it out on its own: once the seeds
are copied, a code change to a seed never reaches the database unless someone writes a data
migration for it, and that migration can't tell a user's edit from the old seed unless the old
seed is kept somewhere. Keeping the seed is the overlay model with extra steps.

Keeping the seeds in code also gives:

- **The rules package works without a database.** Tests, `scripts/simulate.ts` and anything that
  renders catalogs without the API use `SEED_COMPENDIUM`. The seeds must live in code for those
  anyway; copying them to the database would give two copies to keep in step.
- **Revert** ("go back to the original") and an "edited" marker stay possible, with no history
  table.
- **Validation of the seeds happens in CI.** `validateCompendium(SEED_COMPENDIUM)` is a unit test,
  so a bad seed never reaches a database.
- **Fresh environments are the same.** A new database (tests, Docker, another developer) starts
  with exactly the current seeds; there is no "which version of the seeds was this database first
  booted with".

What the overlay costs: the merge step (`buildCompendium`), and seeds that can't be deleted.
They can be retired instead (see "Access").

## 1. The Compendium

A new `packages/system/src/compendium.ts`:

```ts
/** The definitions of one catalog, by id. */
export interface Index<T extends { id: string }> {
  readonly all: readonly T[];
  get(id: string): T | undefined;
  /** Throws for an unknown id, naming the catalog. */
  require(id: string): T;
}

/** Everything the rules look up: the seeds, overlaid with edits and additions. */
export interface Compendium {
  items: Index<ItemDefinition>; // weapons, ammunition, armour, tools, gear, mounts, vehicles, apparatus, preparations
  professions: Index<ProfessionDefinition>;
  backgrounds: Index<BackgroundDefinition>; // equipment money computed from current item prices
  feats: Index<FeatDefinition>;
  ethnicities: Index<EthnicityDefinition>;
  lodgings: Index<LodgingDefinition>;
  monsters: Index<MonsterStatBlock>; // resolved from MonsterInput against current items and skills
  skills: Index<SkillDefinition>;
  actions: Index<ActionDefinition>;
  conditions: Index<ConditionDefinition>;
}

/** Edits and additions for one catalog, keyed as CATALOGS is. */
export interface CatalogOverlay {
  /** Per seeded entry: only the top-level fields the user changed. */
  edits: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  additions: readonly { part: number; entry: unknown }[];
}

export interface CompendiumProblem {
  catalog: string;
  id: string;
  path: (string | number)[];
  message: string;
}

/** The seeds alone. */
export const SEED_COMPENDIUM: Compendium;

/**
 * Overlays edits and additions on the seeds, builds the derived entries, and validates each
 * entry and then the whole set. Never throws: an invalid edit falls back to its seed, an invalid
 * addition is left out, and both are reported.
 */
export function buildCompendium(
  overlay: Readonly<Record<string, CatalogOverlay>>,
): { compendium: Compendium; problems: CompendiumProblem[] };
```

Notes:

- The mapping from catalog key/part to compendium field lives next to `CATALOGS` (each
  `CatalogDefinition` part gains its schema and the compendium field it feeds), so a new catalog
  is registered once.
- `Index` is built on a `Map`, replacing the linear `.find` the global finds use.
- One global compendium (decision 1). Worlds and Campaigns read the same one.
- The seed constants and `findX` helpers stay exported for seeds, tests and the catalog pages;
  the rules stop using them.

### Edits as field-level overrides (decision 4)

Today an edit is a full copy of the entry, so once a seed is edited, *every* later code change to
it is hidden. Store only the top-level fields the user changed, and apply them over the current
seed: `{ ...seed, ...edit }`.

- The API computes the override on save: the top-level fields whose value differs from the
  current seed (compared as JSON). Saving an entry identical to its seed removes the edit.
- Arrays and nested objects are replaced whole: if the user changes one of a weapon's
  properties, the user's `properties` list wins entirely. Going deeper (per array element)
  isn't worth it: arrays have no stable keys.
- If code removes or renames a field, an override for it is dropped by the schema (`strip`) and
  reported, rather than resurrecting a field the rules no longer know.
- A one-off migration turns existing full-copy rows into overrides by diffing them against the
  seeds as they are when it runs.

### Derived entries (decision 3)

- **Monsters.** Export the seeds as `MONSTER_INPUTS` (`MonsterInput & { id }`) instead of
  resolved blocks. The bestiary catalog edits and adds inputs (its shape changes: `worn`, skill
  *levels*, ability specs). `buildCompendium` runs `monster(id, input, compendium)` for each one
  after items and skills are merged, so editing a coat or adding armour shows up in defense and
  soak. `MONSTERS` stays as `SEED_COMPENDIUM.monsters.all` for existing callers.
- **Backgrounds.** Store the kit (item ids) and compute option A's money in the compendium from
  current item prices, the way `background()` does now. Edits to a background override `kit`, not
  the computed money.
- Order inside `buildCompendium`: merge the independent catalogs (items, skills, actions,
  conditions, feats, professions, ethnicities, lodgings), then build backgrounds and monsters from
  them, then validate references across everything.

### Additions to skills, actions and conditions (decision 5)

These are keyed by closed unions (`Skill`, `ActionId`, `Condition`) that appear in many types:
`Character.proficiencies.skills`, `Character.conditions`, `ProfessionDefinition.skills`,
`MonsterInput.skills`/`conditionImmunities`, traits, specializations. To accept added ids:

- Add string id types (`SkillId`, `ActionId`, `ConditionId` as `string`) and use them in data
  types; keep the unions as `SEED_SKILLS` etc. for seeds and for code that names a specific one.
  References are then checked by `validateCompendium`, not the compiler.
- Make the rules data-driven where they aren't yet:
  - `IMPLIED_CONDITIONS` becomes an `implies` field on `ConditionDefinition`, so an added condition
    can imply Incapacitated;
  - conditions already carry `dice` and `defense`, actions carry `seconds`, skills carry
    `attribute`: those work for added entries as they are.
- Behaviour coded for a specific id stays coded for that id (rests remove `intoxicated`;
  exhaustion and madness are levels, not catalog entries). An added condition gets what its data
  says and nothing more; that is stated on the editor page.

### Threading it through the rules

`compendium` is a **required** parameter on every rules function that looks something up. A
default of `SEED_COMPENDIUM` would reproduce today's bug quietly: a caller that forgets it gets
seeds. There are few call sites, and tests pass `SEED_COMPENDIUM`.

| Function(s) | Change |
| --- | --- |
| `equippedItems`, `characterAttackPool`, `characterDamageRoll`, `characterDefense`, `characterSoakPool`, `characterSavePool`, `characterInitiativePool` (`character/combat.ts`) | add `compendium`; `equippedItems` uses `compendium.items.get` (unknown items stay skipped, as now) |
| `hitDiceTotal`, `hitDiceRemaining`, `characterProfessionPool`, `characterActions`, `characterLanguages` (`character/derived.ts`) | `catalog: ProfessionCatalog = PROFESSIONS` → `compendium: Compendium`; `professionFrom` → `compendium.professions.require`; drop `ProfessionCatalog` |
| `skillModifier`, `passivePerception` (`character/derived.ts`) | add `compendium` for `compendium.skills` |
| `shortRest`, `longRest` (`character/rests.ts`) | `options.professions` → `options.compendium` (required); pass it to `rechargeInventory` |
| `expandConditions`, `conditionDice`, `conditionDefense` (`core/conditions.ts`), and their callers in `combat.ts` and `monsters/statBlock.ts` | add `compendium` |
| `actionSeconds` (`combat/timing.ts`) | add `compendium` |
| `equipmentOptionValue` (`character/catalog/backgrounds.ts`) | add `compendium` |
| `monster()` (`monsters/catalog/builders.ts`) | add `compendium`, for items and skills |
| `isKnownToolProficiency` (`equipment/catalog/index.ts`) | add `compendium` |
| `scripts/simulate.ts:120,128` | use `SEED_COMPENDIUM.items` / `.monsters` |

## 2. Validation the rules can trust

`Shape` is inferred from sample data, so it knows types and value sets but not rules such as
"Versatile needs `versatileDamage`". The seeds are kept honest today by **tests**
(`equipment/catalog.test.ts`, `character/catalog.test.ts`, `science/science.test.ts`,
`professions/professions.test.ts`, `monsters/bestiary.test.ts`). Stored entries need the same
checks at runtime. Three levels:

1. **Structure** of one entry: required fields, types, enums, ranges, dice expressions.
2. **Consistency within one entry**, all currently in tests:
   - Versatile ⇔ `versatileDamage`; Ammunition ⇒ `ammunition` and `range`;
   - firearms: Reload xor Loading, Reload ⇔ `capacity`, Misfire ⇔ `misfireOn`,
     Burst Fire ⇒ `capacity ≥ BURST_FIRE_ROUNDS`;
   - heavy armour ⇒ `mightRequirement`; feat attribute increases capped at 20 (30 for epic boons);
   - apparatus: charged effects only on charged devices, within capacity; reactions have a trigger,
     saves have a target;
   - professions: every rank in order, branches specialize through to master.
3. **References across entries**, checked on the merged set:
   - a weapon's `ammunition` is an ammunition item; a tool's `craft` ids exist;
   - a background's `feat` exists and is an origin feat; its kit items exist;
   - a monster's `worn` items exist; skills, condition immunities and `implies` name entries that
     exist (now that these can be added, the compiler no longer checks them);
   - profession and specialization skills exist; specialization ids are unique across
     professions; ids are unique within each catalog.

Level 3 runs over the whole compendium, because deleting an added ammunition can break an added
weapon that is itself unchanged.

### zod

- A schema next to each definition type, covering levels 1–2 (`superRefine` for the
  consistency rules). Each is tied to its hand-written interface
  (`export const WeaponSchema: z.ZodType<WeaponDefinition> = …`) so the compiler catches drift;
  the interfaces stay the documented types.
- Level 3 is plain functions over a `Compendium`: `validateCompendium(compendium):
  CompendiumProblem[]`.
- The invariant tests become one test, `expect(validateCompendium(SEED_COMPENDIUM)).toEqual([])`,
  plus a few cases proving each rule rejects a bad entry. Tests and the API then check the same
  rules. Taste checks with no rules effect ("no magical terms") stay tests only.
- Problems use `{ path, message }`, the same as `ShapeError`, so the editor shows them on the
  field. The API keeps `Shape` to build the form; the schema decides what may be saved. Later,
  `z.toJSONSchema` could replace shape inference for the form.

## 3. The API

- **Load.** Add `CatalogStore.overlay()`: every edit and addition across catalogs in two queries.
  A `CompendiumService` builds the compendium on module init and holds it, with its `problems`.
- **Write.** `CatalogService.create/save/revert/remove` build a *candidate* compendium with the
  change applied and reject it (400, field-level errors as now) if it adds problems. This also
  covers deletes: removing an added entry that another entry refers to fails with the referrers
  listed. Saving an edit stores only the changed fields (above).
- **Keep current.** After a successful write, swap in the candidate. With one API process that is
  enough. Before running more than one, add a `catalog_revision` counter bumped in the same
  transaction as each write; each process compares it (a cheap select, or Postgres
  `LISTEN/NOTIFY`) and rebuilds when it moves.
- **Bad stored rows.** A row that no longer validates (a schema tightened, a seed changed) is
  reported, not fatal: the entry falls back to its seed (edit) or is left out (addition), and the
  list and detail views flag it so it can be fixed in the editor. Startup never fails on data.
- **Detail view.** Show the merged entry, and mark which fields are overridden, so "edited" is
  per field and a field can be reverted on its own.
- **Serving it.** Rules results are computed in the API at first. If the web needs to run rules
  client-side, add `GET /compendium` with an ETag of the revision.

## 4. Access (decision 7)

Access decides **who can see** an entry; it doesn't change what the rules know. The GM's villain
still has to roll its attacks, so the compendium stays complete and access is a filter applied
where entries reach a person: catalog lists and details, pickers, and `GET /compendium` if it is
added. Keeping the two apart means a rules function never gives different answers depending on
who asked.

### Levels

| Level | Who sees it | Use |
| --- | --- | --- |
| `everyone` | players and GMs | equipment, professions, feats: the default for most catalogs |
| `gm` | GMs only | villains, secret preparations, a plot-specific apparatus |
| `retired` | no one is offered it | a seed taken out of play. Still resolvable by id, so a character that already has it keeps working; it just isn't in pickers or lists (a filter in System shows it to GMs) |

`retired` answers "seeds should be hideable": it's the closest thing to deleting a seed while
still letting code update it.

### Storage

Access is metadata about an entry, not part of its rules data, so it isn't in the entry schema
and isn't a seed override:

- a `catalog_access (catalog, id, level)` table, one row per entry whose level differs from its
  catalog's default;
- each `CatalogDefinition` gets a default level in code: `gm` for the bestiary (decision 9),
  `everyone` for the rest;
- `Compendium` stays access-free. The API holds a separate `Map<catalog, Map<id, level>>` and
  filters with it.

### What it depends on

There are no accounts or roles yet (the app has a placeholder account). Access needs at least:

- a viewer who is either a **GM** or a **player**. Because `gm` is global (decision 8), the check
  is "is this person a GM", not "a GM of this campaign": someone who runs one campaign and plays
  in another sees `gm` entries in both. Since a GM can open System anyway, that is no extra leak;
- GMs edit System and set access levels; players get read-only, filtered views (decision 10);
- the API to resolve the viewer per request and filter with it.

Until accounts exist, every viewer is treated as a GM, so the levels can be built and set now and
start hiding things once roles arrive.

### Leaks to watch

Filtering lists isn't enough on its own:

- **Details by id.** `GET /catalogs/bestiary/entries/<id>` for a `gm` entry answers Not Found to a
  player, the same as a missing id, so players can't probe for hidden ids.
- **References.** A visible entry can name a hidden one (a visible weapon whose ammunition is
  `gm`). Player-facing views show such references as unknown rather than leaking the name.
  `validateCompendium` could warn when an `everyone` entry refers to a `gm` one.
- **Rules output.** Results computed with hidden entries (a combat log) are for the GM's view;
  what players see of them belongs to the future combat/campaign UI, not this plan.

## Order of work

Each step leaves the tests green.

1. **Validation in system.** *Done.* zod 4.6.5; a `schemas.ts` beside each area's types
   (`core`, `equipment`, `science`, `character`, `professions`, `monsters`), each schema tied to
   its interface with `satisfies`; `compendium.ts` with `Index`, `Compendium`, `SEED_COMPENDIUM`,
   `entryProblems(catalog, entry)` and `validateCompendium`. The invariant tests became
   `compendium.test.ts`. The bestiary schema checks the resolved stat block for now; the
   `MonsterInput` schema comes with step 3.
2. **Open the closed catalogs.** String id types for skills, actions and conditions;
   `IMPLIED_CONDITIONS` → `implies`. Seeds unchanged.
3. **Compendium in system.** `Index`, `Compendium`, `SEED_COMPENDIUM`, `buildCompendium` with
   field-level overrides; `MONSTER_INPUTS` and backgrounds-by-kit built inside it. Link `CATALOGS`
   parts to schemas and compendium fields.
4. **Thread it through the rules.** The call sites above, `compendium` required; update tests and
   `simulate.ts`. Remove `ProfessionCatalog`.
5. **API.** `CatalogStore.overlay()`, `CompendiumService`, candidate validation on every write,
   field-level edits plus the migration of existing rows, invalid-row flags. The bestiary editor
   switches to monster inputs.
6. **Web.** Problems on entries and in lists; per-field "edited" marks and revert.
7. **Access levels.** `catalog_access` table, per-catalog defaults, an access control in the
   entry editor, `retired` left out of lists and pickers. Every viewer counts as GM until accounts
   exist.
8. **Later, with accounts:** GM and player roles, read-only filtered views for players, Not Found
   for hidden ids; `catalog_revision` before running more than one API process.
