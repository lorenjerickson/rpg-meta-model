import type { ProfessionDefinition } from '../profession';
import {
  ONCE_PER_LONG_REST,
  PB_PER_LONG_REST,
  action,
  bonusAction,
  reaction,
  specialization,
} from './builders';

export const HOSPITALITY: ProfessionDefinition = {
  id: 'hospitality',
  name: 'Hospitality',
  description: 'Someone who feeds, waters and houses others for a living.',
  category: 'service',
  hitDie: 8,
  primaryAttributes: ['charisma'],
  primaryAttributeRequirement: 'all',
  savingThrows: ['hardiness', 'charisma'],
  skillProficiencies: {
    choose: 2,
    from: ['insight', 'persuasion', 'perception', 'deception', 'performance', 'medicine'],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: ["cook's utensils"],
  actions: [
    bonusAction(
      'Read the Room',
      'Choose a creature you can see. You learn whether it is Hostile, Indifferent or Friendly ' +
        'toward you.',
      PB_PER_LONG_REST,
    ),
  ],
  specializations: [
    specialization('barkeep', 'apprentice', null, {
      name: 'Barkeep',
      description: 'Pours drinks, hears confessions and keeps the peace.',
      skills: ['insight'],
      actions: [
        bonusAction(
          'Stiff Drink',
          'A creature within 5 feet of you takes a drink and gains Temporary Hit Points equal to ' +
            '1d6 plus your Charisma modifier.',
          PB_PER_LONG_REST,
        ),
        reaction(
          'Settle Down',
          'a creature you can see within 30 feet makes an attack roll',
          'The attacker makes a Wisdom saving throw against your Profession DC. On a failure, ' +
            'it has Disadvantage on the attack roll.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('innkeeper', 'journeyman', 'barkeep', {
      name: 'Innkeeper',
      description: 'Runs a house where travellers eat, drink and sleep.',
      skills: ['persuasion'],
      actions: [
        action(
          'Make Welcome',
          'Up to six Indifferent creatures within 30 feet that can hear you become Friendly ' +
            'toward you for 1 hour.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('landlord', 'master', 'innkeeper', {
      name: 'Landlord',
      description: 'Owns property and the people who depend on it.',
      skills: ['intimidation', 'investigation'],
      actions: [
        action(
          'Eviction Notice',
          'A creature within 30 feet that can hear you makes a Wisdom saving throw against your ' +
            'Profession DC. On a failure, it is Frightened of you for 1 minute. It repeats the ' +
            'save at the end of each of its turns.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('cook', 'apprentice', null, {
      name: 'Cook',
      description: 'Feeds a kitchen, a camp or a ship.',
      skills: ['survival'],
      actions: [
        bonusAction(
          'Quick Bite',
          'A creature within 5 feet of you eats food you prepared and regains 1d8 plus your ' +
            'Proficiency Bonus in Hit Points.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('chef', 'journeyman', 'cook', {
      name: 'Chef',
      description: 'Runs a professional kitchen and knows every taste.',
      skills: ['perception'],
      actions: [
        reaction(
          'Taste Test',
          'you or a creature within 5 feet of you is about to eat or drink something',
          'You can tell whether it is poisoned or drugged. If it is and the creature consumes it ' +
            'anyway, the creature has Advantage on saving throws against it.',
        ),
      ],
    }),
    specialization('restaurateur', 'master', 'chef', {
      name: 'Restaurateur',
      description: 'Owns the table where deals are made.',
      skills: ['history', 'persuasion'],
      actions: [
        bonusAction(
          'Favoured Patron',
          'Choose a creature that has eaten at your table in the last 24 hours. For 1 hour, you ' +
            'have Advantage on Charisma checks to influence it.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
