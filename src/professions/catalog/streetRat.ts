import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const STREET_RAT: ProfessionDefinition = {
  id: 'street-rat',
  name: 'Street Rat',
  description: 'Someone who grew up surviving by their wits on the streets.',
  category: 'criminal',
  hitDie: 8,
  primaryAttributes: ['agility'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['agility', 'fortune'],
  skillProficiencies: {
    choose: 3,
    from: [
      'acrobatics',
      'athletics',
      'deception',
      'insight',
      'intimidation',
      'perception',
      'legerdemain',
      'stealth',
      'streetwise',
      'gambling',
    ],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: ['light'],
  toolProficiencies: ['burglars-tools'],
  languages: ['flash-cant'],
  rankTitles: { novice: 'Urchin' },
  actions: [bonusAction('Slip Away', 'You take the Disengage or Hide action.')],
  specializations: [
    specialization('gang-leader', 'apprentice', null, {
      name: 'Gang Leader',
      description: 'Runs a crew on a few blocks of turf.',
      skills: ['intimidation', 'streetwise'],
      actions: [
        bonusAction(
          'Rally the Gang',
          'Up to three allies within 30 feet that can hear you have Advantage on their next ' +
            'attack roll before the start of your next turn.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('city-boss', 'journeyman', 'gang-leader', {
      name: 'City Boss',
      description: 'Controls a district: its rackets, its police and its votes.',
      skills: ['persuasion'],
      actions: [
        reaction(
          'Bodyguard',
          'a creature you can see hits you with an attack while an ally is within 5 feet of you',
          'The ally becomes the target of the attack instead.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('crime-lord', 'master', 'city-boss', {
      name: 'Crime Lord',
      description: 'Commands an underworld empire.',
      skills: ['deception', 'insight'],
      actions: [
        action(
          'Make an Example',
          'A creature you can see within 60 feet makes a Wisdom saving throw against your ' +
            'Profession roll. On a failure, it is Frightened of you for 1 minute, and every other ' +
            'creature of your choice that sees this has Disadvantage on attack rolls against you ' +
            'until the end of your next turn.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('pickpocket', 'apprentice', null, {
      name: 'Pickpocket',
      description: "A dip with quick hands and a crowd's anonymity.",
      skills: ['legerdemain'],
      actions: [
        bonusAction(
          'Quick Fingers',
          "You make a Legerdemain check, use burglar's tools, or take the Utilize action.",
        ),
      ],
    }),
    specialization('cat-burglar', 'journeyman', 'pickpocket', {
      name: 'Cat Burglar',
      description: 'Breaks in through windows and over rooftops.',
      skills: ['acrobatics'],
      actions: [
        reaction(
          'Catch Yourself',
          'you fall',
          'You reduce the falling damage by five times your Street Rat level and land on your ' +
            'feet.',
        ),
      ],
    }),
    specialization('master-thief', 'master', 'cat-burglar', {
      name: 'Master Thief',
      description: 'Steals what cannot be stolen.',
      skills: ['investigation'],
      actions: [
        bonusAction(
          'Vanish',
          'You take the Hide action, even while only Lightly Obscured. Until you next move, ' +
            'creatures have Disadvantage on checks to find you.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
