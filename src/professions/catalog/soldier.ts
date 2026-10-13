import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const SOLDIER: ProfessionDefinition = {
  id: 'soldier',
  name: 'Soldier',
  description: 'A trained fighter in an army, militia or colonial force.',
  category: 'military',
  hitDie: 10,
  primaryAttributes: ['might', 'agility'],
  primaryAttributeRequirement: 'any',
  savingThrows: ['might', 'hardiness'],
  skillProficiencies: {
    choose: 2,
    from: [
      'athletics',
      'intimidation',
      'perception',
      'survival',
      'medicine',
      'animal-handling',
      'gambling',
    ],
  },
  weaponProficiencies: [{ category: 'simple' }, { category: 'martial' }],
  armorTraining: ['light'],
  toolProficiencies: [],
  rankTitles: {
    novice: 'Recruit',
    apprentice: 'Private',
    journeyman: 'Corporal',
    master: 'Sergeant',
    'grand-master': 'Sergeant Major',
  },
  actions: [
    bonusAction(
      'Field Grit',
      'You regain Hit Points equal to 1d10 plus your Soldier level.',
      PB_PER_LONG_REST,
    ),
  ],
  specializations: [
    specialization('rifleman', 'apprentice', null, {
      name: 'Rifleman',
      description: 'A marksman trained to fight with the service rifle.',
      skills: ['perception'],
      actions: [
        bonusAction(
          'Steady Aim',
          "If you haven't moved this turn, you have Advantage on your next ranged weapon attack " +
            'this turn. Your Speed is 0 until the end of the turn.',
        ),
      ],
    }),
    specialization('sniper', 'journeyman', 'rifleman', {
      name: 'Sniper',
      description: 'A concealed shooter who strikes from long range.',
      skills: ['stealth'],
      actions: [
        action(
          'Hidden Shot',
          'Make a ranged weapon attack while hidden. On a hit it deals an extra 2d8 damage, and ' +
            'you stay hidden if you succeed on a DC 15 Agility (Stealth) check.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('assassin', 'master', 'sniper', {
      name: 'Assassin',
      description: 'A killer who chooses the target and the moment.',
      skills: ['deception', 'insight'],
      actions: [
        action(
          'Killing Shot',
          "Make a weapon attack against a creature that hasn't noticed you. If it hits, it's a " +
            'Critical Hit.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('grenadier', 'apprentice', null, {
      name: 'Grenadier',
      description: 'A soldier trained to throw explosives.',
      skills: ['athletics'],
      disciplines: ['chemistry'],
      actions: [
        action(
          'Grenade',
          'Throw a grenade at a point up to 60 feet away. Each creature in a 10-foot-radius ' +
            'Sphere there makes an Agility saving throw against your Profession DC, taking 3d6 ' +
            'Piercing damage on a failure or half as much on a success.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('demolitions', 'journeyman', 'grenadier', {
      name: 'Demolitions Expert',
      description: 'A sapper who mines, breaches and blows up obstacles.',
      skills: ['investigation'],
      tools: ['demolitions-kit'],
      actions: [
        action(
          'Set Charge',
          'Fix an explosive charge to an object or surface within 5 feet of you. It stays armed ' +
            'for 1 hour.',
        ),
        reaction(
          'Detonate',
          'a creature you can see moves within 10 feet of a charge you set',
          'The charge explodes. Each creature within 10 feet of it makes an Agility saving ' +
            'throw against your Profession DC, taking 6d6 Thunder damage on a failure or half as ' +
            'much on a success. Objects in the area take double damage.',
        ),
      ],
    }),
    specialization('artillery', 'master', 'demolitions', {
      name: 'Artillery Officer',
      description: 'A gunnery expert who directs heavy guns.',
      skills: ['perception'],
      actions: [
        action(
          'Barrage',
          'While you can signal an artillery battery, choose a point you can see within 1 mile. ' +
            'Each creature in a 30-foot-radius Sphere there makes an Agility saving throw against ' +
            'your Profession DC, taking 8d6 Thunder damage on a failure or half as much on a ' +
            'success.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
