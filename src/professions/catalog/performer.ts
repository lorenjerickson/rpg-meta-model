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

export const PERFORMER: ProfessionDefinition = {
  id: 'performer',
  name: 'Performer',
  description: 'An entertainer of the stage, music hall, circus or travelling show.',
  category: 'entertainment',
  hitDie: 8,
  primaryAttributes: ['charisma'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['agility', 'charisma'],
  skillProficiencies: {
    choose: 3,
    from: ['performance', 'acrobatics', 'deception', 'persuasion', 'sleight-of-hand', 'insight'],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ['disguise kit', 'musical instrument'],
  actions: [
    bonusAction(
      'Captivate',
      'A creature within 30 feet that can see or hear you has Disadvantage on its next Wisdom ' +
        '(Perception) check.',
    ),
  ],
  specializations: [
    specialization('actor', 'apprentice', null, {
      name: 'Actor',
      description: 'Becomes someone else every night.',
      skills: ['deception'],
      actions: [
        bonusAction(
          'Quick Change',
          'Using a disguise kit, you change your appearance to that of a different person of ' +
            'your general build.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('leading-player', 'journeyman', 'actor', {
      name: 'Leading Player',
      description: 'The name on the bill that fills the house.',
      skills: ['persuasion'],
      actions: [
        action(
          'Showstopper',
          'Creatures of your choice within 60 feet that can see you make a Wisdom saving throw ' +
            'against your Profession DC. On a failure, a creature is Incapacitated until the end ' +
            'of your next turn, watching you.',
          ONCE_PER_SHORT_REST,
        ),
      ],
    }),
    specialization('impresario', 'master', 'leading-player', {
      name: 'Impresario',
      description: 'Produces shows and makes stars.',
      skills: ['insight', 'investigation'],
      actions: [
        reaction(
          'Encore',
          'an ally within 60 feet fails a Charisma check',
          'The ally rerolls the check with a bonus equal to your Proficiency Bonus and must use ' +
            'the new roll.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('conjurer', 'apprentice', null, {
      name: 'Conjurer',
      description: 'A stage magician with quick hands.',
      skills: ['sleight-of-hand'],
      actions: [
        bonusAction(
          'Misdirection',
          'A creature within 30 feet has Disadvantage on its next Perception check, and you can ' +
            'take the Utilize action.',
        ),
      ],
    }),
    specialization('illusionist', 'journeyman', 'conjurer', {
      name: 'Illusionist',
      description: 'Makes the impossible seem real with mirrors and smoke.',
      skills: ['insight'],
      actions: [
        action(
          'Stage Illusion',
          'With smoke and props, you make a 10-foot Cube within 30 feet Heavily Obscured until ' +
            'the end of your next turn.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('escapologist', 'master', 'illusionist', {
      name: 'Escapologist',
      description: 'No lock, chain or cell can hold them.',
      skills: ['acrobatics', 'athletics'],
      actions: [
        reaction(
          'Slip the Bonds',
          'you become Grappled or Restrained',
          'The condition ends.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
