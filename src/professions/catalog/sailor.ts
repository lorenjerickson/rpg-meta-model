import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  ONCE_PER_SHORT_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const SAILOR: ProfessionDefinition = {
  id: 'sailor',
  name: 'Sailor',
  description: 'A hand on a merchant ship, whaler, steamer or naval vessel.',
  category: 'maritime',
  hitDie: 10,
  primaryAttributes: ['might', 'agility'],
  primaryAttributeRequirement: 'any',
  savingThrows: ['might', 'agility'],
  skillProficiencies: {
    choose: 2,
    from: [
      'athletics',
      'acrobatics',
      'perception',
      'survival',
      'natural-history',
      'intimidation',
      'gambling',
    ],
  },
  weaponProficiencies: [{ category: 'simple' }, { category: 'martial' }],
  armorTraining: [],
  toolProficiencies: ['navigators-tools', 'vehicles-water'],
  rankTitles: { novice: 'Deckhand', apprentice: 'Able Seaman' },
  actions: [
    reaction(
      'Sea Legs',
      'you would be knocked Prone or moved against your will',
      "You aren't knocked Prone, and you can reduce the distance you're moved by up to 10 feet.",
      PB_PER_LONG_REST,
    ),
  ],
  specializations: [
    specialization('bosun', 'apprentice', null, {
      name: 'Bosun',
      description: 'Keeps the crew working and the rigging sound.',
      skills: ['intimidation'],
      actions: [
        bonusAction(
          'Bellowed Order',
          'An ally that can hear you can use its Reaction to move up to half its Speed or make ' +
            'one weapon attack.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('mate', 'journeyman', 'bosun', {
      name: 'First Mate',
      description: "The captain's right hand and master of the watch.",
      skills: ['insight'],
      actions: [
        bonusAction(
          'Steady the Crew',
          'Up to three allies within 30 feet that can hear you gain Temporary Hit Points equal ' +
            'to 1d6 plus your Proficiency Bonus.',
          ONCE_PER_SHORT_REST,
        ),
      ],
    }),
    specialization('captain', 'master', 'mate', {
      name: 'Captain',
      description: 'Master of a ship and everyone aboard.',
      skills: ['history', 'persuasion'],
      actions: [
        action(
          'Command the Deck',
          'For 1 minute, allies within 30 feet of you have Advantage on saving throws against ' +
            'being Frightened and add your proficiency dice to their Initiative rolls.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('smuggler', 'apprentice', null, {
      name: 'Smuggler',
      description: 'Moves goods past customs and coastguards.',
      skills: ['deception'],
      actions: [
        action(
          'Hidden Compartment',
          'Conceal an object no larger than a rifle on your person or in a vehicle. Finding it ' +
            'takes a successful Intellect (Investigation) check against your Profession roll.',
        ),
      ],
    }),
    specialization('rumrunner', 'journeyman', 'smuggler', {
      name: 'Blockade Runner',
      description: 'Slips fast boats past patrols at night.',
      skills: ['stealth'],
      actions: [
        reaction(
          'Evasive Helm',
          'a vehicle you are steering is targeted by an attack',
          'The attack roll has Disadvantage.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('smuggling-baron', 'master', 'rumrunner', {
      name: 'Smuggling Baron',
      description: 'Owns the boats, the warehouses and the harbour officials.',
      skills: ['insight', 'persuasion'],
      actions: [
        action(
          'Look the Other Way',
          'A guard or official within 30 feet that can hear you makes a Wisdom saving throw ' +
            'against your Profession roll. On a failure, it ignores you, your companions and your ' +
            'cargo for 1 hour.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
