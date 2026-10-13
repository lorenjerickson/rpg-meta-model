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

export const LABOURER: ProfessionDefinition = {
  id: 'labourer',
  name: 'Labourer',
  description: 'A worker who earns a living with strength and endurance.',
  category: 'labour',
  hitDie: 12,
  primaryAttributes: ['might'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['might', 'hardiness'],
  skillProficiencies: {
    choose: 2,
    from: ['athletics', 'survival', 'perception', 'intimidation', 'animal-handling', 'mechanics'],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ['carpenters-tools'],
  actions: [
    bonusAction(
      'Put Your Back Into It',
      'Until the end of your turn, you have Advantage on Might checks and Might saving throws.',
      PB_PER_LONG_REST,
    ),
  ],
  specializations: [
    specialization('dockworker', 'apprentice', null, {
      name: 'Dockworker',
      description: 'Loads and unloads the ships of the world.',
      skills: ['athletics'],
      actions: [
        action(
          'Heave',
          'A creature you are grappling that is your size or smaller is thrown up to 15 feet and ' +
            'takes 1d6 plus your Might modifier Bludgeoning damage. It lands Prone and is no ' +
            'longer Grappled.',
        ),
      ],
    }),
    specialization('foreman', 'journeyman', 'dockworker', {
      name: 'Foreman',
      description: 'Runs a gang of workers and sets the pace.',
      skills: ['intimidation'],
      actions: [
        bonusAction(
          'Get to Work',
          'Up to three allies within 30 feet that can hear you have Advantage on their next ' +
            'ability check.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('union-boss', 'master', 'foreman', {
      name: 'Union Boss',
      description: 'Speaks for thousands of workers and can stop a city.',
      skills: ['insight', 'persuasion'],
      actions: [
        action(
          'Solidarity',
          'Allies of your choice within 60 feet that can hear you gain Temporary Hit Points ' +
            'equal to 2d8 plus your Charisma modifier and have Advantage on saving throws against ' +
            'being Frightened for 1 minute.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('miner', 'apprentice', null, {
      name: 'Miner',
      description: 'Digs coal, copper or gold from deep underground.',
      skills: ['survival'],
      tools: ['masons-tools'],
      actions: [
        reaction(
          'Brace',
          'you take damage from a collapse, cave-in or falling debris',
          'You take half the damage.',
        ),
      ],
    }),
    specialization('shift-boss', 'journeyman', 'miner', {
      name: 'Shift Boss',
      description: 'Responsible for a shift of miners and their lives.',
      skills: ['perception'],
      actions: [
        bonusAction(
          'Sound the Alarm',
          'Allies within 60 feet that can hear you can use their Reactions to move up to their ' +
            'Speed without provoking Opportunity Attacks.',
          ONCE_PER_SHORT_REST,
        ),
      ],
    }),
    specialization('mine-superintendent', 'master', 'shift-boss', {
      name: 'Mine Superintendent',
      description: 'Plans the workings and knows the rock.',
      skills: ['investigation', 'natural-history'],
      actions: [
        action(
          'Survey',
          'You learn the location of tunnels, hollows and unstable ground within 120 feet of you.',
        ),
      ],
    }),
  ],
};
