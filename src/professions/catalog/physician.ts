import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const PHYSICIAN: ProfessionDefinition = {
  id: 'physician',
  name: 'Physician',
  description: 'A trained doctor of the body or the mind.',
  category: 'medical',
  hitDie: 6,
  primaryAttributes: ['intellect'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['intellect', 'sanity'],
  skillProficiencies: {
    choose: 2,
    from: ['medicine', 'insight', 'nature', 'investigation', 'persuasion', 'history'],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ["physician's kit"],
  disciplineProficiencies: ['chemistry'],
  rankTitles: { novice: 'Medical Student', apprentice: 'Doctor' },
  actions: [
    action(
      'Treat Wounds',
      "Using a physician's kit, a creature within 5 feet of you regains 1d6 plus your Intellect " +
        'modifier plus your Proficiency Bonus in Hit Points. Each creature can benefit only once ' +
        'per Short or Long Rest.',
    ),
  ],
  specializations: [
    specialization('surgeon', 'apprentice', null, {
      name: 'Surgeon',
      description: 'Cuts, sutures and saves.',
      skills: ['medicine'],
      actions: [
        action(
          'Emergency Surgery',
          'A creature within 5 feet of you with 0 Hit Points regains 2d8 plus your Intellect ' +
            'modifier in Hit Points.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('field-surgeon', 'journeyman', 'surgeon', {
      name: 'Field Surgeon',
      description: 'Works under fire, in tents and trenches.',
      skills: ['survival'],
      actions: [
        bonusAction(
          'Triage',
          'A creature within 5 feet of you becomes Stable, or its Poisoned condition ends.',
        ),
      ],
    }),
    specialization('chief-surgeon', 'master', 'field-surgeon', {
      name: 'Chief Surgeon',
      description: 'A pioneer of the operating theatre.',
      skills: ['insight', 'persuasion'],
      actions: [
        action(
          'Back from the Brink',
          'A creature that died from injury within the last round returns to life with 1 Hit ' +
            'Point and gains 1 Exhaustion level.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('alienist', 'apprentice', null, {
      name: 'Alienist',
      description: 'A doctor of the mind and its disorders.',
      skills: ['insight'],
      disciplines: ['mesmerism'],
      actions: [
        action(
          'Calming Words',
          'A creature within 30 feet that can hear you is no longer Frightened or Charmed, or has ' +
            'Advantage on its next Sanity saving throw.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('psychoanalyst', 'journeyman', 'alienist', {
      name: 'Psychoanalyst',
      description: 'Uncovers what the patient will not say.',
      skills: ['persuasion'],
      actions: [
        reaction(
          'Steady Mind',
          'a creature within 30 feet that can hear you fails a Sanity or Wisdom saving throw',
          'The creature rerolls the save and must use the new roll.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('asylum-director', 'master', 'psychoanalyst', {
      name: 'Asylum Director',
      description: 'An authority on madness, with power over the committed.',
      skills: ['history', 'intimidation'],
      actions: [
        action(
          'Breakthrough',
          'A creature within 30 feet is no longer Charmed or Frightened and has Advantage on ' +
            'Sanity saving throws for 24 hours.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
