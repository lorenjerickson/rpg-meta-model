# dnd-domain

TypeScript domain model and rules helpers for D&D 5th edition, following the 2024 rules
(SRD 5.2).

## Layout

| Folder            | Contents                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `src/core`        | Attributes, skills, dice and dice pools, roll modifiers, damage types, conditions, currency, time  |
| `src/character`   | Character, human traits, ethnicities, backgrounds and feats (with catalogs), XP and levels, max HP |
| `src/professions` | Professions, ranks, specialization trees and the profession catalog                                |
| `src/science`     | Scientific disciplines, apparatus and preparations, charges and malfunctions, and their catalog    |
| `src/combat`      | Contested attack and soak rolls against fixed defense, cover, hit point state, death saves         |
| `src/equipment`   | Items, body slots, weapons and firearms, armour, tools, gear, mounts and vehicles, and the catalog |
| `src/monsters`    | Stat blocks, challenge ratings, encounter XP budgets, and the bestiary                             |

Closed sets such as attributes, skills and conditions are `as const` arrays with a derived
union type (`SKILLS` / `Skill`).

The setting is the real world of the late 19th and early 20th centuries, with Victorian,
steampunk and gothic horror influences. Every character is human; `ETHNICITIES` takes the place
of species and grants spoken languages and traits. `LANGUAGES` lists real languages of the period
in four categories: spoken languages; classical languages for scholars and the occult (Latin,
Ancient Greek, Ancient Egyptian, Sanskrit and others); cants and codes learned through a trade
(thieves' flash, Polari, rhyming slang, Shelta, Morse code, semaphore, shorthand); and sign
languages. Professions and specializations teach classical languages, cants and codes, and
`characterLanguages` collects them.
`SKILLS` uses period skills: Natural History, Theology and Legerdemain replace Nature, Religion
and Sleight of Hand; Etiquette, Streetwise, Mechanics and Bureaucracy are new; and Occult
(Sanity) and Gambling (Fortune) give the two new attributes skills of their own.
`CONDITIONS` uses period names (Mesmerised, Calcified and Unseen replace Charmed, Petrified and
Invisible) and adds Bleeding, Burning, Intoxicated and Madness, a six-level track like
Exhaustion that failed Sanity saves feed and that penalises Intellect, Wisdom and Sanity tests.

`shortRest` and `longRest` apply rests to a character: Hit Points and Hit Dice, Exhaustion,
Madness recovery, conditions, Heroic Inspiration and apparatus recharge. A Long Rest only
counts somewhere safe; sleeping rough or being interrupted gives Short Rest benefits. `LODGINGS`
runs from sleeping rough and doss-houses to hotels and country houses, each with a nightly cost;
poor lodging recovers less, and good lodging helps with Madness and Exhaustion.

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
along with the science apparatus and preparations. Firearms hold a number of rounds, take the
Reload action to refill, and older or cheaper guns can misfire and jam; machine guns fire bursts.

Something has been experimenting with mutation, grafting and reanimation, and the creatures of
the world show it. There are no magical creatures: `MONSTERS` holds a first-draft bestiary of
mutated beasts and people, hybrids, the galvanically reanimated, automata, aberrations from the
deep, and anomalies (self-sustaining phenomena such as plasma held together by electromagnetic
forces). Each stat block records its `origin`. The stat blocks are built from attribute scores
and challenge rating, so their dice pools, hit points and rules text stay consistent.

## Combat

Rounds have no initiative order: everyone plans 6 seconds in secret, and the plans play out
together second by second. See [docs/combat-rounds.md](docs/combat-rounds.md) for the design (not
yet implemented).

Combat is contested and rolled in dice pools. Attributes and proficiency become dice: a modifier
of +m is a d(2m), so +2 is a d4 and +3 a d6, and negative modifiers subtract the same die.

- **Attack:** d20 + attribute dice + proficiency dice, plus or minus dice from the weapon, other
  equipment and conditions.
- **Defense:** a fixed number, not a roll: base 6 plus a small value for everything worn in the
  seven body slots (head, shoulders, arms, chest, hands, legs, feet) and held (shields, a parrying
  sabre), plus or minus flat condition values. Ordinary clothing gives 1 per slot it covers, so a
  fully dressed clerk has 13 and a soldier in trench kit about 18. Cover adds 2 (half) or 5
  (three-quarters). Creatures with natural armour have a fixed defense instead.
- **Result:** the attacker wins ties; winning by 3 or more is a solid hit, which ignores soak;
  winning by 10 or more is a critical, which also doubles the damage dice.
- **Damage and soak:** weapon dice plus attribute dice, reduced by the defender's soak roll
  (general soak plus soak typed to the damage, from equipment and conditions) to a minimum of 0,
  then immunity, resistance and vulnerability. Soak makes heavy armour hard to hurt, but a solid
  hit always gets through.
- **Saves:** an effect rolls d20 + its attribute and proficiency dice against the target's d20 +
  save attribute dice, proficiency dice if proficient, and condition dice. The effect wins ties.
  Profession and operator DCs are now Profession and operator rolls.

Conditions add and subtract dice instead of granting Advantage or Disadvantage; Exhaustion and
Madness subtract 1d4 per level. Advantage and Disadvantage still apply to the d20 from other
sources. Ability checks and passive scores still use flat modifiers.

`ACTION_DEFINITIONS` gives the rules for every action. The standard actions are reworded for dice
pools and fixed defense (Dodge adds 4 to defense and 1d6 to Agility saves; Help adds 1d6), and
the period adds five: **Operate** an apparatus or preparation, **Reload** a firearm, **Take Cover** (cover counts one step better until your next turn), **Compose Yourself** (a Sanity save to shake off fear or mesmerism), and **Defend** (guard a target until your next turn, and your Reaction automatically attacks the first creature that attacks it; a melee guard stays within reach of the target and measures reach from it).

## Scripts

| Command                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `npm run build`         | Bundle to `dist/` (ESM + CJS + `.d.ts`) via tsdown |
| `npm run dev`           | Rebuild on change                                  |
| `npm test`              | Run tests once with Vitest                         |
| `npm run test:watch`    | Run Vitest in watch mode                           |
| `npm run test:coverage` | Run tests with V8 coverage report                  |
| `npm run simulate`      | Play-test combat and print the results as tables   |
| `npm run typecheck`     | Type-check with `tsc`                              |
| `npm run lint`          | Lint with ESLint (`lint:fix` to auto-fix)          |
| `npm run format`        | Format with Prettier (`format:check` to verify)    |

## Attribution

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of
the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the
Creative Commons Attribution 4.0 International License, available at
https://creativecommons.org/licenses/by/4.0/legalcode.
