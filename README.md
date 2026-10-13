# dnd-domain

TypeScript domain model and rules helpers for D&D 5th edition, following the 2024 rules
(SRD 5.2).

## Layout

| Folder            | Contents                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `src/core`        | Attributes, skills, dice, D20 Tests, damage types, conditions, sizes, languages, currency, time       |
| `src/character`   | Character, human traits, ethnicities, backgrounds, feats, XP and levels, attribute generation, max HP |
| `src/professions` | Professions, ranks, specialization trees and the profession catalog                                   |
| `src/science`     | Scientific disciplines, apparatus and preparations, charges and malfunctions, and their catalog       |
| `src/combat`      | Hit point state, death saves, attack resolution, cover                                                |
| `src/equipment`   | Items, weapons (properties, mastery), armor and AC, carrying capacity                                 |
| `src/monsters`    | Stat blocks, challenge ratings, encounter XP budgets                                                  |

Closed sets such as attributes, skills and conditions are `as const` arrays with a derived
union type (`SKILLS` / `Skill`). Weapons, armor, gear and monsters are modelled as types only;
no catalogs are included for them.

The setting is the real world of the late 19th and early 20th centuries, with Victorian,
steampunk and gothic horror influences. Every character is human; `ETHNICITIES` takes the place
of species and grants languages and traits, and `LANGUAGES` lists real languages of the period.

There is no magic, only poorly understood science. Effects that would be spells come from
apparatus (galvanic gauntlets, mesmeric pendants, Tesla lances) that hold charges, and
single-use preparations (chloroform bombs, restorative tonics). Charges recharge according to
the device's power source: clockwork and steam on a Short Rest, galvanic and chemical on a Long
Rest, and aetheric by an unpredictable amount. Overcharging a device strengthens an effect but
risks a malfunction. Characters are proficient in scientific disciplines (chemistry, galvanism,
mechanics, optics, acoustics, mesmerism, aetherics), which add their proficiency bonus to the
operator DC. `APPARATUS` and `PREPARATIONS` hold a first-draft catalog.

Classes are replaced by professions. A character starts with one profession and can take up
more later. Each profession's level sets its rank: novice (1), apprentice (5), journeyman (9),
master (13) and grand master (17). From apprentice rank, each new rank lets the character choose
the next specialization in the profession's tree, e.g. Soldier → Rifleman → Sniper → Assassin.
Each specialization grants skill proficiencies and actions, bonus actions or reactions.
`PROFESSIONS` holds a first-draft catalog of 14 period professions.

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
