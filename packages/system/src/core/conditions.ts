import type { Attribute } from './attributes';
import { poolDie, type PoolDie } from './dicePool';
import {
  applicableDice,
  bonus as plus,
  penalty as minus,
  defenseTotal,
  type DefenseBonus,
  type RollContext,
  type RollKind,
  type RollModifier,
} from './rollModifiers';
import { assertIntegerInRange } from './validation';

export const CONDITIONS = [
  'bleeding',
  'blinded',
  'burning',
  'calcified',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'intoxicated',
  'madness',
  'mesmerised',
  'paralyzed',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
  'unseen',
] as const;

export type Condition = (typeof CONDITIONS)[number];

export interface ConditionDefinition {
  name: string;
  /** The rules, one effect per entry. */
  effects: readonly string[];
  /** Dice the condition adds to or subtracts from rolls. */
  dice: readonly RollModifier[];
  /** Flat changes to the creature's defense. */
  defense?: readonly DefenseBonus[];
}

const AUTO_FAIL_PHYSICAL_SAVES = 'You automatically fail Might and Agility saving throws.';

export const CONDITION_DEFINITIONS: Readonly<Record<Condition, ConditionDefinition>> = {
  bleeding: {
    name: 'Bleeding',
    effects: [
      'You lose 1d4 Hit Points at the start of each round.',
      'The condition ends when you regain Hit Points, or when someone within 5 feet takes the ' +
        'Utilize action to bind the wound with a first-aid kit or a DC 10 Wisdom (Medicine) check.',
    ],
    dice: [],
  },
  blinded: {
    name: 'Blinded',
    effects: [
      "You can't see and automatically fail any ability check that requires sight.",
      'Subtract 1d8 from your attack rolls, and your defense is reduced by 4.',
    ],
    dice: [minus('attack', 1, 8)],
    defense: [{ value: -4 }],
  },
  burning: {
    name: 'Burning',
    effects: [
      'You take 1d4 Fire damage at the start of each round.',
      'The condition ends when you or a creature within 5 feet takes an action to put out the ' +
        'flames, or when you are doused or immersed in water.',
    ],
    dice: [],
  },
  calcified: {
    name: 'Calcified',
    effects: [
      'Mineral deposits have hardened your flesh to stone. You have the Incapacitated condition, ' +
        "can't move or speak, and are unaware of your surroundings.",
      'Your weight increases tenfold, and you stop ageing.',
      'Your defense is reduced by 4, and you add 2d8 to your soak rolls.',
      AUTO_FAIL_PHYSICAL_SAVES,
      'You are immune to the Poisoned condition.',
      'An antidote that dissolves the mineral ends the condition.',
    ],
    dice: [plus('soak', 2, 8)],
    defense: [{ value: -4 }],
  },
  deafened: {
    name: 'Deafened',
    effects: ["You can't hear and automatically fail any ability check that requires hearing."],
    dice: [],
  },
  exhaustion: {
    name: 'Exhaustion',
    effects: [
      'This condition is cumulative, from level 1 to 6. You die at level 6.',
      'Subtract 1d4 per Exhaustion level from your attack, save, check and Initiative rolls.',
      'Your Speed is reduced by 5 feet times your Exhaustion level.',
      'Finishing a Long Rest removes 1 level.',
    ],
    dice: [],
  },
  frightened: {
    name: 'Frightened',
    effects: [
      'While the source of your fear is within line of sight, subtract 1d4 from your attack ' +
        'rolls and ability checks.',
      "You can't willingly move closer to the source of your fear.",
    ],
    dice: [minus('attack', 1, 4), minus('check', 1, 4)],
  },
  grappled: {
    name: 'Grappled',
    effects: [
      "Your Speed is 0 and can't increase.",
      'Subtract 1d4 from attack rolls against any target other than the grappler.',
      'The grappler can drag or carry you when it moves, at the cost of extra movement.',
    ],
    dice: [minus('attack', 1, 4)],
  },
  incapacitated: {
    name: 'Incapacitated',
    effects: [
      "You can't take any action, Bonus Action or Reaction.",
      "Your Concentration is broken, and you can't speak.",
      'Subtract 1d6 from your Initiative rolls.',
    ],
    dice: [minus('initiative', 1, 6)],
  },
  intoxicated: {
    name: 'Intoxicated',
    effects: [
      'Gin, absinthe, laudanum or ether has you under its influence.',
      'Subtract 1d6 from your attack rolls and ability checks.',
      'Add 1d6 to saving throws to avoid or end the Frightened condition.',
      'The condition ends after 1 hour, or when you finish a Short or Long Rest.',
    ],
    dice: [minus('attack', 1, 6), minus('check', 1, 6)],
  },
  madness: {
    name: 'Madness',
    effects: [
      'This condition is cumulative, from level 1 to 6, and is usually gained by failing ' +
        'Sanity saving throws against horrors.',
      'Subtract 1d4 per Madness level from your saves and checks using Intellect, Wisdom or ' +
        'Sanity.',
      "At level 6 you are lost to madness, and the character leaves the player's control.",
      'Finishing a Long Rest in a safe place removes 1 level if you succeed on a DC 15 Sanity ' +
        'saving throw. Treatment by an alienist gives you Advantage on the save.',
    ],
    dice: [],
  },
  mesmerised: {
    name: 'Mesmerised',
    effects: [
      "You can't attack the mesmerist or target it with damaging abilities or harmful effects.",
      'The mesmerist has Advantage on any ability check to interact with you socially.',
    ],
    dice: [],
  },
  paralyzed: {
    name: 'Paralyzed',
    effects: [
      "You have the Incapacitated condition, and your Speed is 0 and can't increase.",
      AUTO_FAIL_PHYSICAL_SAVES,
      'Your defense is reduced by 5. Any hit from within 5 feet of you is a Critical Hit.',
    ],
    dice: [],
    defense: [{ value: -5 }],
  },
  poisoned: {
    name: 'Poisoned',
    effects: ['Subtract 1d6 from your attack rolls and ability checks.'],
    dice: [minus('attack', 1, 6), minus('check', 1, 6)],
  },
  prone: {
    name: 'Prone',
    effects: [
      'Your only movement options are to crawl, or to spend half your Speed to stand up.',
      'Subtract 1d6 from your attack rolls.',
      'Your defense is reduced by 3 against melee attacks and increased by 3 against ranged ' +
        'attacks.',
    ],
    dice: [minus('attack', 1, 6)],
    defense: [
      { value: -3, attack: 'melee' },
      { value: 3, attack: 'ranged' },
    ],
  },
  restrained: {
    name: 'Restrained',
    effects: [
      "Your Speed is 0 and can't increase.",
      'Subtract 1d6 from your attack rolls and Agility saving throws, and your defense is ' +
        'reduced by 3.',
    ],
    dice: [minus('attack', 1, 6), minus('save', 1, 6, { attributes: ['agility'] })],
    defense: [{ value: -3 }],
  },
  stunned: {
    name: 'Stunned',
    effects: [
      'You have the Incapacitated condition.',
      AUTO_FAIL_PHYSICAL_SAVES,
      'Your defense is reduced by 4.',
    ],
    dice: [],
    defense: [{ value: -4 }],
  },
  unconscious: {
    name: 'Unconscious',
    effects: [
      'You have the Incapacitated and Prone conditions, and you drop whatever you are holding.',
      "Your Speed is 0 and can't increase.",
      AUTO_FAIL_PHYSICAL_SAVES,
      'Your defense is reduced by 5. Any hit from within 5 feet of you is a Critical Hit.',
      "You're unaware of your surroundings.",
    ],
    dice: [],
    defense: [{ value: -5 }],
  },
  unseen: {
    name: 'Unseen',
    effects: [
      'Whether hidden, cloaked by a refraction device or lost in darkness, you cannot be seen.',
      'You are not affected by anything that requires its target to be seen.',
      'Against creatures that cannot see you, add 1d6 to your attack and Initiative rolls, and ' +
        'your defense is increased by 3.',
    ],
    dice: [plus('attack', 1, 6), plus('initiative', 1, 6)],
    defense: [{ value: 3 }],
  },
};

/** Conditions that give a creature other conditions while they last. */
export const IMPLIED_CONDITIONS: Readonly<Partial<Record<Condition, readonly Condition[]>>> = {
  calcified: ['incapacitated'],
  paralyzed: ['incapacitated'],
  stunned: ['incapacitated'],
  unconscious: ['incapacitated', 'prone'],
};

/** Returns the given conditions plus every condition they imply. */
export function expandConditions(conditions: Iterable<Condition>): Set<Condition> {
  const result = new Set<Condition>();
  for (const condition of conditions) {
    result.add(condition);
    for (const implied of IMPLIED_CONDITIONS[condition] ?? []) {
      result.add(implied);
    }
  }
  return result;
}

/** The dice a set of conditions (and the conditions they imply) adds to one kind of roll. */
export function conditionDice(
  conditions: Iterable<Condition>,
  kind: RollKind,
  context: RollContext = {},
): PoolDie[] {
  return [...expandConditions(conditions)].flatMap((condition) => {
    const { name, dice } = CONDITION_DEFINITIONS[condition];
    return applicableDice(dice, name, kind, context);
  });
}

/** The flat change a set of conditions (and those they imply) makes to defense. */
export function conditionDefense(
  conditions: Iterable<Condition>,
  attack?: 'melee' | 'ranged',
): number {
  return [...expandConditions(conditions)].reduce(
    (total, condition) =>
      total + defenseTotal(CONDITION_DEFINITIONS[condition].defense ?? [], attack),
    0,
  );
}

/** Exhaustion is cumulative from 1 to 6; a creature dies at level 6. */
export const MAX_EXHAUSTION_LEVEL = 6;

/** The rolls exhaustion penalises. */
export const EXHAUSTION_ROLLS: readonly RollKind[] = ['attack', 'save', 'check', 'initiative'];

/** Exhaustion subtracts 1d4 per level from attack, save, check and Initiative rolls. */
export function exhaustionDice(level: number, kind: RollKind): PoolDie[] {
  assertIntegerInRange(level, 0, MAX_EXHAUSTION_LEVEL, 'Exhaustion level');
  return level > 0 && EXHAUSTION_ROLLS.includes(kind) ? [poolDie(level, 4, 'Exhaustion', -1)] : [];
}

/** Speed is reduced by 5 feet per exhaustion level. */
export function exhaustionSpeedReduction(level: number): number {
  assertIntegerInRange(level, 0, MAX_EXHAUSTION_LEVEL, 'Exhaustion level');
  return 5 * level;
}

export function diesFromExhaustion(level: number): boolean {
  return level >= MAX_EXHAUSTION_LEVEL;
}

/** Madness is cumulative from 1 to 6; a character is lost to madness at level 6. */
export const MAX_MADNESS_LEVEL = 6;

/** The attributes whose saves and checks madness penalises. */
export const MADNESS_ATTRIBUTES: readonly Attribute[] = ['intellect', 'wisdom', 'sanity'];

/** DC of the Sanity save to recover one madness level on a Long Rest in a safe place. */
export const MADNESS_RECOVERY_DC = 15;

/** Madness subtracts 1d4 per level from saves and checks using Intellect, Wisdom or Sanity. */
export function madnessDice(level: number, kind: RollKind, attribute: Attribute): PoolDie[] {
  assertIntegerInRange(level, 0, MAX_MADNESS_LEVEL, 'Madness level');
  const applies = (kind === 'save' || kind === 'check') && MADNESS_ATTRIBUTES.includes(attribute);
  return level > 0 && applies ? [poolDie(level, 4, 'Madness', -1)] : [];
}

export function isLostToMadness(level: number): boolean {
  return level >= MAX_MADNESS_LEVEL;
}
