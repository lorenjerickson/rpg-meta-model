import type { Attribute } from './attributes';
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
}

export const CONDITION_DEFINITIONS: Readonly<Record<Condition, ConditionDefinition>> = {
  bleeding: {
    name: 'Bleeding',
    effects: [
      'You lose 1d4 Hit Points at the start of each of your turns.',
      'The condition ends when you regain Hit Points, or when someone within 5 feet takes the ' +
        'Utilize action to bind the wound with a first-aid kit or a DC 10 Wisdom (Medicine) check.',
    ],
  },
  blinded: {
    name: 'Blinded',
    effects: [
      "You can't see and automatically fail any ability check that requires sight.",
      'Attack rolls against you have Advantage, and your attack rolls have Disadvantage.',
    ],
  },
  burning: {
    name: 'Burning',
    effects: [
      'You take 1d4 Fire damage at the start of each of your turns.',
      'The condition ends when you or a creature within 5 feet takes an action to put out the ' +
        'flames, or when you are doused or immersed in water.',
    ],
  },
  calcified: {
    name: 'Calcified',
    effects: [
      'Mineral deposits have hardened your flesh to stone. You have the Incapacitated condition, ' +
        "can't move or speak, and are unaware of your surroundings.",
      'Your weight increases tenfold, and you stop ageing.',
      'Attack rolls against you have Advantage. You automatically fail Might and Agility saving ' +
        'throws.',
      'You have Resistance to all damage and Immunity to the Poisoned condition.',
      'An antidote that dissolves the mineral ends the condition.',
    ],
  },
  deafened: {
    name: 'Deafened',
    effects: ["You can't hear and automatically fail any ability check that requires hearing."],
  },
  exhaustion: {
    name: 'Exhaustion',
    effects: [
      'This condition is cumulative, from level 1 to 6. You die at level 6.',
      'Your D20 Tests are reduced by 2 times your Exhaustion level.',
      'Your Speed is reduced by 5 feet times your Exhaustion level.',
      'Finishing a Long Rest removes 1 level.',
    ],
  },
  frightened: {
    name: 'Frightened',
    effects: [
      'You have Disadvantage on ability checks and attack rolls while the source of your fear ' +
        'is within line of sight.',
      "You can't willingly move closer to the source of your fear.",
    ],
  },
  grappled: {
    name: 'Grappled',
    effects: [
      "Your Speed is 0 and can't increase.",
      'You have Disadvantage on attack rolls against any target other than the grappler.',
      'The grappler can drag or carry you when it moves, at the cost of extra movement.',
    ],
  },
  incapacitated: {
    name: 'Incapacitated',
    effects: [
      "You can't take any action, Bonus Action or Reaction.",
      "Your Concentration is broken, and you can't speak.",
      'If you are Incapacitated when you roll Initiative, you have Disadvantage on the roll.',
    ],
  },
  intoxicated: {
    name: 'Intoxicated',
    effects: [
      'Gin, absinthe, laudanum or ether has you under its influence.',
      'You have Disadvantage on attack rolls and ability checks.',
      'You have Advantage on saving throws to avoid or end the Frightened condition.',
      'The condition ends after 1 hour, or when you finish a Short or Long Rest.',
    ],
  },
  madness: {
    name: 'Madness',
    effects: [
      'This condition is cumulative, from level 1 to 6, and is usually gained by failing ' +
        'Sanity saving throws against horrors.',
      'Your D20 Tests using Intellect, Wisdom or Sanity are reduced by 2 times your Madness level.',
      "At level 6 you are lost to madness, and the character leaves the player's control.",
      'Finishing a Long Rest in a safe place removes 1 level if you succeed on a DC 15 Sanity ' +
        'saving throw. Treatment by an alienist gives you Advantage on the save.',
    ],
  },
  mesmerised: {
    name: 'Mesmerised',
    effects: [
      "You can't attack the mesmerist or target it with damaging abilities or harmful effects.",
      'The mesmerist has Advantage on any ability check to interact with you socially.',
    ],
  },
  paralyzed: {
    name: 'Paralyzed',
    effects: [
      "You have the Incapacitated condition, and your Speed is 0 and can't increase.",
      'You automatically fail Might and Agility saving throws.',
      'Attack rolls against you have Advantage, and any attack that hits you is a Critical Hit ' +
        'if the attacker is within 5 feet of you.',
    ],
  },
  poisoned: {
    name: 'Poisoned',
    effects: ['You have Disadvantage on attack rolls and ability checks.'],
  },
  prone: {
    name: 'Prone',
    effects: [
      'Your only movement options are to crawl, or to spend half your Speed to stand up.',
      'You have Disadvantage on attack rolls.',
      'Attack rolls against you have Advantage if the attacker is within 5 feet of you, and ' +
        'Disadvantage otherwise.',
    ],
  },
  restrained: {
    name: 'Restrained',
    effects: [
      "Your Speed is 0 and can't increase.",
      'Attack rolls against you have Advantage, and your attack rolls have Disadvantage.',
      'You have Disadvantage on Agility saving throws.',
    ],
  },
  stunned: {
    name: 'Stunned',
    effects: [
      'You have the Incapacitated condition.',
      'You automatically fail Might and Agility saving throws.',
      'Attack rolls against you have Advantage.',
    ],
  },
  unconscious: {
    name: 'Unconscious',
    effects: [
      'You have the Incapacitated and Prone conditions, and you drop whatever you are holding.',
      "Your Speed is 0 and can't increase.",
      'You automatically fail Might and Agility saving throws.',
      'Attack rolls against you have Advantage, and any attack that hits you is a Critical Hit ' +
        'if the attacker is within 5 feet of you.',
      "You're unaware of your surroundings.",
    ],
  },
  unseen: {
    name: 'Unseen',
    effects: [
      'Whether hidden, cloaked by a refraction device or lost in darkness, you cannot be seen.',
      'You are not affected by anything that requires its target to be seen.',
      'You have Advantage on Initiative rolls.',
      'Attack rolls against you have Disadvantage, and your attack rolls have Advantage, ' +
        'unless the other creature can somehow see you.',
    ],
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

/** Exhaustion is cumulative from 1 to 6; a creature dies at level 6. */
export const MAX_EXHAUSTION_LEVEL = 6;

/** D20 Tests are reduced by 2 per exhaustion level. */
export function exhaustionD20Penalty(level: number): number {
  assertIntegerInRange(level, 0, MAX_EXHAUSTION_LEVEL, 'Exhaustion level');
  return 0 - 2 * level;
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

/** The attributes whose D20 Tests madness penalises. */
export const MADNESS_ATTRIBUTES: readonly Attribute[] = ['intellect', 'wisdom', 'sanity'];

/** DC of the Sanity save to recover one madness level on a Long Rest in a safe place. */
export const MADNESS_RECOVERY_DC = 15;

/** D20 Tests using Intellect, Wisdom or Sanity are reduced by 2 per madness level. */
export function madnessD20Penalty(level: number, attribute: Attribute): number {
  assertIntegerInRange(level, 0, MAX_MADNESS_LEVEL, 'Madness level');
  return MADNESS_ATTRIBUTES.includes(attribute) ? 0 - 2 * level : 0;
}

export function isLostToMadness(level: number): boolean {
  return level >= MAX_MADNESS_LEVEL;
}
