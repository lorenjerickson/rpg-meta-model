import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const SCHOLAR: ProfessionDefinition = {
  id: 'scholar',
  name: 'Scholar',
  description: 'A student of history, nature or hidden knowledge.',
  category: 'scholarly',
  hitDie: 6,
  primaryAttributes: ['intellect'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['intellect', 'sanity'],
  skillProficiencies: {
    choose: 3,
    from: [
      'science',
      'history',
      'investigation',
      'natural-history',
      'theology',
      'medicine',
      'occult',
    ],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ['writing-kit'],
  languages: ['latin', 'ancient-greek'],
  actions: [bonusAction('Recall Lore', 'You take the Study action.')],
  specializations: [
    specialization('antiquarian', 'apprentice', null, {
      name: 'Antiquarian',
      description: 'A collector and student of old things.',
      skills: ['history'],
      actions: [
        action(
          'Date and Provenance',
          'You learn the age and origin of an object you are holding, and whether it is a ' +
            'forgery.',
        ),
      ],
    }),
    specialization('archaeologist', 'journeyman', 'antiquarian', {
      name: 'Archaeologist',
      description: 'Excavates ruins and tombs.',
      skills: ['survival'],
      languages: ['ancient-egyptian'],
      actions: [
        reaction(
          'Sense Trap',
          'you or an ally within 10 feet triggers a trap',
          'The creature has Advantage on any saving throw against the trap, or the trap fails to ' +
            'go off if you succeed on an Intellect (Investigation) check against its DC.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('expedition-leader', 'master', 'archaeologist', {
      name: 'Expedition Leader',
      description: 'Takes teams to the ends of the earth and back.',
      skills: ['perception', 'persuasion'],
      actions: [
        action(
          'Press On',
          'Allies within 30 feet that can hear you each lose 1 Exhaustion level or regain Hit ' +
            'Points equal to one roll of their Hit Die.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('occult-researcher', 'apprentice', null, {
      name: 'Occult Researcher',
      description: 'Studies the esoteric, the unexplained and the forbidden.',
      skills: ['occult'],
      languages: ['sanskrit'],
      disciplines: ['aetherics'],
      actions: [
        bonusAction(
          'Forbidden Insight',
          'You learn the resistances, immunities and one weakness of a creature you can see. ' +
            'You then make a DC 10 Sanity saving throw, taking 1d4 Psychic damage on a failure.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('occultist', 'journeyman', 'occult-researcher', {
      name: 'Occultist',
      description: 'Practises the rites others only read about.',
      skills: ['theology'],
      languages: ['coptic'],
      disciplines: ['mesmerism'],
      actions: [
        reaction(
          'Ward of Will',
          'you or an ally within 30 feet makes a Sanity saving throw',
          'Add your Intellect modifier (minimum of +1) to the save.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('keeper-of-secrets', 'master', 'occultist', {
      name: 'Keeper of Secrets',
      description: 'Knows truths that break lesser minds.',
      skills: ['deception', 'insight'],
      actions: [
        action(
          'Unspeakable Truth',
          'A creature within 60 feet that can hear you makes a Sanity saving throw against your ' +
            'Profession roll. On a failure, it is Stunned until the end of your next turn, ' +
            'Frightened of you for 1 minute, and gains 1 level of Madness.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
