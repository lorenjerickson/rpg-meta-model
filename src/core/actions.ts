import { bonus as plus, type DefenseBonus, type RollModifier } from './rollModifiers';

/** The actions any creature can take on its turn. */
export const ACTIONS = [
  'attack',
  'compose',
  'dash',
  'defend',
  'disengage',
  'dodge',
  'help',
  'hide',
  'influence',
  'operate',
  'ready',
  'reload',
  'search',
  'study',
  'take-cover',
  'utilize',
] as const;

export type ActionId = (typeof ACTIONS)[number];

/** What part of a creature's turn an activity uses up. */
export type ActionCost = 'action' | 'bonus-action' | 'reaction' | 'free';

export interface ActionDefinition {
  name: string;
  /** The rules, one effect per entry. */
  effects: readonly string[];
  /** Dice the action grants until the start of your next turn. */
  dice?: readonly RollModifier[];
  /** Flat changes to your defense until the start of your next turn. */
  defense?: readonly DefenseBonus[];
}

export const ACTION_DEFINITIONS: Readonly<Record<ActionId, ActionDefinition>> = {
  attack: {
    name: 'Attack',
    effects: [
      'Make one attack with a weapon or an Unarmed Strike: d20 plus your dice against the ' +
        "target's defense.",
      'Firing a firearm spends its rounds; a natural roll at or below its misfire number jams it.',
      'You can draw or stow one weapon as part of each attack.',
    ],
  },
  compose: {
    name: 'Compose Yourself',
    effects: [
      'Steady your nerves with a Sanity saving throw against the roll that frightened or ' +
        'mesmerised you. On a success, the Frightened or Mesmerised condition ends.',
      'If nothing rolled to impose the condition, the save is against DC 10.',
    ],
  },
  dash: {
    name: 'Dash',
    effects: ['For the rest of the turn, you gain extra movement equal to your Speed.'],
  },
  defend: {
    name: 'Defend',
    effects: [
      'Choose a creature or object you can see to guard; this is your action for the turn. ' +
        'Until the start of your next turn, when a creature you can see attacks the guarded ' +
        'target, you automatically use your Reaction to make one attack against the attacker ' +
        'after its attack.',
      'With a melee weapon, you must be within your reach of the guarded target, and your reach ' +
        'is measured from the target instead of from you, so you can strike an attacker on its ' +
        'far side.',
      'With a ranged weapon, the attacker must be within range of a loaded weapon you are ' +
        'holding.',
      'The guard ends early if you are Incapacitated or your Reaction is used for anything else.',
    ],
  },
  disengage: {
    name: 'Disengage',
    effects: ["Your movement doesn't provoke Opportunity Attacks for the rest of the turn."],
  },
  dodge: {
    name: 'Dodge',
    effects: [
      'Until the start of your next turn, your defense increases by 4 and you add 1d6 to ' +
        'Agility saving throws.',
      'You lose these benefits if you are Incapacitated or your Speed is 0.',
    ],
    dice: [plus('save', 1, 6, { attributes: ['agility'] })],
    defense: [{ value: 4 }],
  },
  help: {
    name: 'Help',
    effects: [
      'Assist an ally with a task you could attempt yourself: they add 1d6 to their next ' +
        'ability check for it before the start of your next turn.',
      'Or distract a creature within 5 feet of you: the next attack an ally makes against it ' +
        'before the start of your next turn adds 1d6.',
    ],
  },
  hide: {
    name: 'Hide',
    effects: [
      'While Heavily Obscured or behind three-quarters or total cover, and out of any ' +
        "enemy's line of sight, make a DC 15 Agility (Stealth) check. On a success, you have " +
        'the Unseen condition until you make noise, attack or are found.',
    ],
  },
  influence: {
    name: 'Influence',
    effects: [
      'Urge a creature to do something with a Charisma (Deception, Etiquette, Intimidation, ' +
        'Performance, Persuasion or Streetwise) check, or calm an animal with a Wisdom (Animal ' +
        'Handling) check.',
      'The creature must be able to understand you. A willing creature needs no check, a ' +
        'hesitant one contests with a Wisdom (Insight) check, and an unwilling one refuses.',
    ],
  },
  operate: {
    name: 'Operate',
    effects: [
      'Use an apparatus or a preparation. Its effect takes an action unless it says otherwise, ' +
        'and saving throws against it are contested by your operator roll.',
      'An apparatus effect with Concentration needs your steady hand on the device until it ' +
        'ends.',
    ],
  },
  ready: {
    name: 'Ready',
    effects: [
      'Choose a trigger and an action. When the trigger happens before the start of your next ' +
        'turn, you can take that action as a Reaction, or move up to your Speed.',
      'Readying an apparatus effect needs Concentration until it is released.',
    ],
  },
  reload: {
    name: 'Reload',
    effects: [
      'Reload one firearm or other weapon with the Reload property to capacity.',
      'A jammed weapon must be cleared with the Utilize action before it can be reloaded.',
    ],
  },
  search: {
    name: 'Search',
    effects: [
      'Look for something with a Wisdom (Insight, Medicine, Perception or Survival) check: a ' +
        'lie, an ailment, a hidden foe or a trail.',
    ],
  },
  study: {
    name: 'Study',
    effects: [
      'Recall or work out something with an Intellect (Bureaucracy, History, Investigation, ' +
        'Mechanics, Natural History, Science or Theology) check.',
      'Studying a creature or phenomenon that defies nature uses Sanity (Occult) instead.',
    ],
  },
  'take-cover': {
    name: 'Take Cover',
    effects: [
      'Move up to half your Speed into cover and hunker down. Until the start of your next ' +
        'turn, your cover counts as one step better: none becomes half, half becomes ' +
        'three-quarters, and three-quarters becomes total.',
      'You lose the benefit if you leave the cover or attack.',
    ],
  },
  utilize: {
    name: 'Utilize',
    effects: [
      'Use a nonweapon object or mechanism: pick a lock, bind a wound, clear a jammed firearm, ' +
        'throw a lever or stoke a boiler.',
    ],
  },
};

export const REST_TYPES = ['short', 'long'] as const;

export type RestType = (typeof REST_TYPES)[number];

export const REST_DURATION_HOURS: Readonly<Record<RestType, number>> = {
  short: 1,
  long: 8,
};
