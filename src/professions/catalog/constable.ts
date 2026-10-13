import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const CONSTABLE: ProfessionDefinition = {
  id: 'constable',
  name: 'Constable',
  description: 'A police officer of a city force or rural constabulary.',
  category: 'law-enforcement',
  hitDie: 8,
  primaryAttributes: ['wisdom', 'intellect'],
  primaryAttributeRequirement: 'any',
  savingThrows: ['wisdom', 'intellect'],
  skillProficiencies: {
    choose: 2,
    from: ['investigation', 'insight', 'perception', 'intimidation', 'athletics', 'history'],
  },
  weaponProficiencies: [{ category: 'simple' }, { weaponId: 'revolver' }],
  armorTraining: [],
  toolProficiencies: [],
  rankTitles: { novice: 'Probationer' },
  actions: [
    bonusAction(
      'Collar',
      'You attempt to Grapple a creature within 5 feet of you.',
      PB_PER_LONG_REST,
    ),
  ],
  specializations: [
    specialization('detective', 'apprentice', null, {
      name: 'Detective',
      description: 'A plain-clothes investigator of crimes.',
      skills: ['investigation'],
      actions: [
        bonusAction(
          'Study Suspect',
          'You take the Study action against a creature. For 1 hour you have Advantage on ' +
            'Wisdom (Insight) checks against it.',
        ),
      ],
    }),
    specialization('inspector', 'journeyman', 'detective', {
      name: 'Inspector',
      description: 'Leads investigations and interrogations.',
      skills: ['insight'],
      actions: [
        reaction(
          'Catch the Lie',
          'a creature you can see and hear makes a Deception check against you',
          'The check has Disadvantage.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('chief-inspector', 'master', 'inspector', {
      name: 'Chief Inspector',
      description: 'Heads the detective branch of a force.',
      skills: ['history', 'persuasion'],
      actions: [
        action(
          'Close the Net',
          'Name a creature you have studied. For 24 hours you have Advantage on checks to find, ' +
            'track or question it, and it has Disadvantage on Stealth checks against you.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('sergeant', 'apprentice', null, {
      name: 'Sergeant',
      description: 'Runs the beat and the men who walk it.',
      skills: ['intimidation'],
      actions: [
        bonusAction(
          'Stop, Police!',
          'A creature within 30 feet that can hear you makes a Wisdom saving throw against your ' +
            'Profession DC. On a failure, its Speed is 0 until the end of its next turn.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('police-captain', 'journeyman', 'sergeant', {
      name: 'Police Captain',
      description: 'Commands a precinct and its riot squads.',
      skills: ['athletics'],
      actions: [
        reaction(
          'Hold the Line',
          'an ally within 10 feet of you is hit by a melee attack',
          'Reduce the damage the ally takes by 1d10 plus your Proficiency Bonus.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('commissioner', 'master', 'police-captain', {
      name: 'Commissioner',
      description: "Runs a city's police and answers only to politicians.",
      skills: ['insight', 'persuasion'],
      actions: [
        action(
          'Call for Reinforcements',
          '2d4 constables arrive in 1d4 rounds and follow your orders for 1 hour.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
