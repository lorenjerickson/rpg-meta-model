import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const JOURNALIST: ProfessionDefinition = {
  id: 'journalist',
  name: 'Journalist',
  description: 'A writer for newspapers, magazines and wire services.',
  category: 'press',
  hitDie: 8,
  primaryAttributes: ['intellect', 'charisma'],
  primaryAttributeRequirement: 'any',
  savingThrows: ['wisdom', 'fortune'],
  skillProficiencies: {
    choose: 2,
    from: ['investigation', 'insight', 'persuasion', 'deception', 'streetwise', 'bureaucracy'],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ['photographers-kit'],
  rankTitles: { novice: 'Copy Boy' },
  actions: [bonusAction('Take Notes', 'You take the Search or Study action.')],
  specializations: [
    specialization('reporter', 'apprentice', null, {
      name: 'Reporter',
      description: 'Chases stories through the city.',
      skills: ['persuasion'],
      actions: [
        action(
          'Leading Question',
          'A creature within 30 feet that can hear and understand you makes a Wisdom saving ' +
            'throw against your Profession roll. On a failure, it truthfully answers one question ' +
            "and doesn't realize it said too much.",
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('investigative-reporter', 'journeyman', 'reporter', {
      name: 'Investigative Reporter',
      description: 'Digs into the stories powerful people want buried.',
      skills: ['investigation'],
      actions: [
        reaction(
          'Dig Deeper',
          'you fail an Investigation or Insight check',
          'You reroll the check and must use the new roll.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('muckraker', 'master', 'investigative-reporter', {
      name: 'Muckraker',
      description: 'Brings down the corrupt with print.',
      skills: ['intimidation'],
      actions: [
        action(
          'Expose',
          'Name a creature you hold evidence against. Once your story is published, it has ' +
            'Disadvantage on Charisma checks with anyone who has read it, for 30 days.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('correspondent', 'apprentice', null, {
      name: 'Foreign Correspondent',
      description: 'Reports from abroad, often from dangerous places.',
      skills: ['survival'],
      actions: [
        reaction(
          'Duck!',
          'you are targeted by a ranged attack',
          'Add your proficiency dice to your defense roll against the attack.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('war-correspondent', 'journeyman', 'correspondent', {
      name: 'War Correspondent',
      description: 'Follows armies to the front.',
      skills: ['stealth'],
      actions: [bonusAction('Keep Your Head Down', 'You take the Dash or Hide action.')],
    }),
    specialization('editor', 'master', 'war-correspondent', {
      name: 'Editor',
      description: 'Decides what the world reads.',
      skills: ['history', 'insight'],
      actions: [
        action(
          'Assign the Story',
          'Up to three allies have Advantage on Investigation and Insight checks for 1 hour. You ' +
            'learn anything they learn as soon as they report to you.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
