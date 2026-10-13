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

export const FRONTIER_HAND: ProfessionDefinition = {
  id: 'frontier-hand',
  name: 'Frontier Hand',
  description: 'Someone who makes a living in wild country: trapping, herding or scouting.',
  category: 'frontier',
  hitDie: 10,
  primaryAttributes: ['agility', 'wisdom'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['hardiness', 'wisdom'],
  skillProficiencies: {
    choose: 3,
    from: ['survival', 'nature', 'animal-handling', 'perception', 'stealth', 'athletics'],
  },
  weaponProficiencies: [{ category: 'simple' }, { category: 'martial' }],
  armorTraining: ['light'],
  toolProficiencies: ["leatherworker's tools"],
  actions: [bonusAction('Keen Eye', 'You take the Search action.')],
  specializations: [
    specialization('trapper', 'apprentice', null, {
      name: 'Trapper',
      description: 'Lives off furs and the animals that wear them.',
      skills: ['stealth'],
      actions: [
        action(
          'Set Snare',
          'Set a snare in a 5-foot square within 5 feet of you. The first creature to enter it ' +
            'makes an Agility saving throw against your Profession DC or is Restrained. It can ' +
            'escape with a successful Might (Athletics) check against the same DC.',
        ),
      ],
    }),
    specialization('tracker', 'journeyman', 'trapper', {
      name: 'Tracker',
      description: 'Can follow anything across any ground.',
      skills: ['survival'],
      actions: [
        bonusAction(
          'Read the Trail',
          'You learn how many creatures left a trail, their sizes and how long ago they passed. ' +
            'For 1 hour you have Advantage on checks to follow it.',
        ),
      ],
    }),
    specialization('scout', 'master', 'tracker', {
      name: 'Scout',
      description: 'Goes ahead of armies and expeditions, unseen.',
      skills: ['nature', 'perception'],
      actions: [
        reaction(
          'Ambush',
          'a creature you can see moves within 30 feet of you while you are hidden',
          'Make one weapon attack against it. On a hit it deals an extra 2d6 damage.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('cowhand', 'apprentice', null, {
      name: 'Cowhand',
      description: 'Herds cattle across open range.',
      skills: ['animal-handling'],
      actions: [
        action(
          'Lasso',
          'A creature within 30 feet makes an Agility saving throw against your Profession DC. ' +
            'On a failure, it is Restrained and you can pull it up to 10 feet toward you.',
        ),
      ],
    }),
    specialization('trail-boss', 'journeyman', 'cowhand', {
      name: 'Trail Boss',
      description: 'Drives herds and the hands who move them.',
      skills: ['intimidation'],
      actions: [
        bonusAction(
          "Keep 'Em Moving",
          'Allies within 30 feet that can hear you have their Speed increased by 10 feet until ' +
            'the end of their next turns.',
          ONCE_PER_SHORT_REST,
        ),
      ],
    }),
    specialization('cattle-baron', 'master', 'trail-boss', {
      name: 'Cattle Baron',
      description: 'Owns the range, the water and the law.',
      skills: ['insight', 'persuasion'],
      actions: [
        action(
          'Hired Guns',
          'Up to three allies within 60 feet that can hear you can each use their Reaction to ' +
            'make one weapon attack.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
