# dnd-domain

TypeScript domain model and rules helpers for D&D 5th edition, following the 2024 rules
(SRD 5.2).

## Layout

| Folder          | Contents                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `src/core`      | Attributes, skills, dice, D20 Tests, damage types, conditions, sizes, languages, currency, time |
| `src/character` | Character, classes, species, backgrounds, feats, XP and levels, attribute generation, max HP    |
| `src/combat`    | Hit point state, death saves, attack resolution, cover                                          |
| `src/equipment` | Items, weapons (properties, mastery), armor and AC, carrying capacity                           |
| `src/magic`     | Spells, spell slot and Pact Magic tables, multiclass caster level, save DC                      |
| `src/monsters`  | Stat blocks, challenge ratings, encounter XP budgets                                            |

Closed sets such as attributes, skills and conditions are `as const` arrays with a derived
union type (`SKILLS` / `Skill`). Content such as classes, species, spells and monsters is
modelled as types only; no catalogs are included.

## Scripts

| Command                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `npm run build`         | Bundle to `dist/` (ESM + CJS + `.d.ts`) via tsdown |
| `npm run dev`           | Rebuild on change                                  |
| `npm test`              | Run tests once with Vitest                         |
| `npm run test:watch`    | Run Vitest in watch mode                           |
| `npm run test:coverage` | Run tests with V8 coverage report                  |
| `npm run typecheck`     | Type-check with `tsc`                              |
| `npm run lint`          | Lint with ESLint (`lint:fix` to auto-fix)          |
| `npm run format`        | Format with Prettier (`format:check` to verify)    |

## Attribution

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of
the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the
Creative Commons Attribution 4.0 International License, available at
https://creativecommons.org/licenses/by/4.0/legalcode.
