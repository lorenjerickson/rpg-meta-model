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

export const CLERGY: ProfessionDefinition = {
  id: 'clergy',
  name: 'Clergy',
  description: 'A minister of a faith: priest, imam, rabbi, monk or preacher.',
  category: 'religious',
  hitDie: 8,
  primaryAttributes: ['wisdom'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['wisdom', 'sanity'],
  skillProficiencies: {
    choose: 2,
    from: ['theology', 'insight', 'persuasion', 'history', 'medicine', 'performance', 'occult'],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ['writing-kit'],
  actions: [
    action(
      'Blessing',
      'A creature within 30 feet adds 1d4 to its saving throws for 1 minute.',
      PB_PER_LONG_REST,
    ),
  ],
  specializations: [
    specialization('preacher', 'apprentice', null, {
      name: 'Preacher',
      description: 'Moves a congregation with the spoken word.',
      skills: ['persuasion'],
      actions: [
        action(
          'Sermon',
          'Creatures of your choice within 60 feet that can hear you gain Temporary Hit Points ' +
            'equal to 1d8 plus your Wisdom modifier.',
          ONCE_PER_SHORT_REST,
        ),
      ],
    }),
    specialization('evangelist', 'journeyman', 'preacher', {
      name: 'Evangelist',
      description: 'Carries the faith to new people and places.',
      skills: ['performance'],
      actions: [
        bonusAction(
          'Fervour',
          'An ally within 30 feet has Advantage on its next saving throw against being Mesmerised ' +
            'or Frightened and adds 1d4 to its next attack roll.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('revival-leader', 'master', 'evangelist', {
      name: 'Revival Leader',
      description: 'Draws crowds of thousands and sways them as one.',
      skills: ['insight', 'intimidation'],
      actions: [
        action(
          'Awakening',
          'Up to thirty creatures within 120 feet that can hear you make a Wisdom saving throw ' +
            'against your Profession roll. On a failure, a creature is Mesmerised by you for 1 hour.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('confessor', 'apprentice', null, {
      name: 'Confessor',
      description: 'Hears what people cannot tell anyone else.',
      skills: ['insight'],
      actions: [
        reaction(
          'Absolution',
          'a creature within 30 feet fails a saving throw against being Frightened',
          'The creature rerolls the save and must use the new roll.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('spiritual-director', 'journeyman', 'confessor', {
      name: 'Spiritual Director',
      description: 'Guides others through crisis and despair.',
      skills: ['medicine'],
      actions: [
        action(
          'Spiritual Counsel',
          'A creature within 5 feet of you that has rested with you in the last day loses 1 ' +
            'Exhaustion level.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('exorcist', 'master', 'spiritual-director', {
      name: 'Exorcist',
      description: 'Confronts possession, obsession and things that should not be.',
      skills: ['occult', 'theology'],
      disciplines: ['mesmerism'],
      actions: [
        action(
          'Rite of Exorcism',
          'One creature within 30 feet is no longer Mesmerised or Frightened. If another creature ' +
            'or entity is controlling it, that controller makes a Sanity saving throw against ' +
            'your Profession roll and loses control on a failure.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
