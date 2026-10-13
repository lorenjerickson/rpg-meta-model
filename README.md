# dnd-domain

TypeScript domain model and rules helpers for D&D 5th edition, following the 2024 rules
(SRD 5.2).

## Layout

| Folder            | Contents                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `src/core`        | Attributes, skills, dice, D20 Tests, damage types, conditions, sizes, languages, currency, time    |
| `src/character`   | Character, human traits, ethnicities, backgrounds and feats (with catalogs), XP and levels, max HP |
| `src/professions` | Professions, ranks, specialization trees and the profession catalog                                |
| `src/science`     | Scientific disciplines, apparatus and preparations, charges and malfunctions, and their catalog    |
| `src/combat`      | Hit point state, death saves, attack resolution, cover                                             |
| `src/equipment`   | Items, weapons and firearms, armour and AC, tools, gear, mounts and vehicles, and the item catalog |
| `src/monsters`    | Stat blocks, challenge ratings, encounter XP budgets, and the bestiary                             |

Closed sets such as attributes, skills and conditions are `as const` arrays with a derived
union type (`SKILLS` / `Skill`).

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
`PROFESSIONS` holds a first-draft catalog of 14 period professions. As classes did in 2024, each
profession grants a General feat at levels 4, 8, 12 and 16 and an Epic Boon at 19.

`BACKGROUNDS` holds period backgrounds from aristocrat to asylum survivor, each granting three
attributes to raise, an Origin feat, two skills, a tool and £15 of equipment or money. `FEATS`
holds the feats, with magical ones reframed (Magic Initiate became Amateur Scientist) and new
ones that draw on Fortune and Sanity.

Money is British pounds, shillings and pence, held as a number of pence: `lsd(1, 2, 6)` is
£1 2s 6d, and `formatMoney` and `parseMoney` handle period notation such as "2/6" and "3 gns".
`ITEMS` holds a first-draft catalog of period weapons, armour, tools, gear, mounts and vehicles,
along with the science apparatus and preparations. Firearms hold a number of rounds, take an
action to reload, and older or cheaper guns can misfire and jam; machine guns can fire bursts.

Something has been experimenting with mutation, grafting and reanimation, and the creatures of
the world show it. There are no magical creatures: `MONSTERS` holds a first-draft bestiary of
mutated beasts and people, hybrids, the galvanically reanimated, automata, aberrations from the
deep, and anomalies (self-sustaining phenomena such as plasma held together by electromagnetic
forces). Each stat block records its `origin`. The stat blocks are built from attribute scores
and challenge rating, so attack bonuses, save DCs, hit points and rules text stay consistent.

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
