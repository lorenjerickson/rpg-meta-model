import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const MECHANIC: ProfessionDefinition = {
  id: 'mechanic',
  name: 'Mechanic',
  description: 'A builder and fixer of engines, machines and devices.',
  category: 'technical',
  hitDie: 8,
  primaryAttributes: ['intellect'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['intellect', 'hardiness'],
  skillProficiencies: {
    choose: 2,
    from: ['investigation', 'athletics', 'perception', 'nature', 'history', 'sleight-of-hand'],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ["tinker's tools"],
  disciplineProficiencies: ['mechanics'],
  actions: [
    action(
      'Jury-Rig',
      'An object or vehicle within 5 feet of you regains 1d8 plus your Intellect modifier in Hit ' +
        'Points, or a broken machine works for 1 minute.',
    ),
  ],
  specializations: [
    specialization('machinist', 'apprentice', null, {
      name: 'Machinist',
      description: 'Shapes metal parts on lathe and mill.',
      skills: ['athletics'],
      tools: ["smith's tools"],
      actions: [bonusAction('Tool in Hand', 'You take the Utilize action.')],
    }),
    specialization('engineer', 'journeyman', 'machinist', {
      name: 'Engineer',
      description: 'Designs and runs engines, from locomotives to dynamos.',
      skills: ['investigation'],
      disciplines: ['galvanism'],
      actions: [
        reaction(
          'Brace the Machine',
          'a vehicle or machine within 30 feet of you takes damage',
          'Reduce the damage by 2d6 plus your Intellect modifier.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('chief-engineer', 'master', 'engineer', {
      name: 'Chief Engineer',
      description: 'Commands the engine room of a ship, mill or railway.',
      skills: ['history', 'persuasion'],
      actions: [
        action(
          'Full Steam',
          'A vehicle you are crewing has its speed doubled for 1 minute.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('tinkerer', 'apprentice', null, {
      name: 'Tinkerer',
      description: 'Builds clever gadgets from scrap.',
      skills: ['sleight-of-hand'],
      disciplines: ['chemistry'],
      actions: [
        action(
          'Gadget',
          'Throw a gadget up to 30 feet. Choose smoke (a 10-foot-radius Sphere is Heavily ' +
            'Obscured until the end of your next turn) or flash (each creature within 10 feet of ' +
            'it makes a Hardiness saving throw against your Profession DC or is Blinded until the ' +
            'end of its next turn).',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('inventor', 'journeyman', 'tinkerer', {
      name: 'Inventor',
      description: 'Patents new machines.',
      skills: ['nature'],
      disciplines: ['optics'],
      actions: [
        bonusAction(
          'Field Modification',
          'A weapon you touch gains a +1 bonus to attack rolls until the end of your next Long ' +
            'Rest. Only one weapon can have this bonus at a time.',
        ),
      ],
    }),
    specialization('visionary', 'master', 'inventor', {
      name: 'Visionary Inventor',
      description: 'Harnesses forces others barely understand.',
      skills: ['science', 'history'],
      disciplines: ['aetherics'],
      actions: [
        action(
          'Lightning Coil',
          'Each creature in a 60-foot-long, 5-foot-wide Line makes an Agility saving throw ' +
            'against your Profession DC, taking 6d6 Lightning damage on a failure or half as much ' +
            'on a success.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
