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

export const MERCHANT: ProfessionDefinition = {
  id: 'merchant',
  name: 'Merchant',
  description: 'Someone who buys, sells and trades for profit.',
  category: 'commerce',
  hitDie: 8,
  primaryAttributes: ['charisma', 'intellect'],
  primaryAttributeRequirement: 'any',
  savingThrows: ['intellect', 'fortune'],
  skillProficiencies: {
    choose: 2,
    from: [
      'persuasion',
      'deception',
      'insight',
      'investigation',
      'bureaucracy',
      'etiquette',
      'gambling',
    ],
  },
  weaponProficiencies: [{ category: 'simple' }],
  armorTraining: [],
  toolProficiencies: [],
  actions: [
    bonusAction(
      'Appraise',
      'You learn the market value of an object you can see and whether it is a fake.',
    ),
  ],
  specializations: [
    specialization('shopkeeper', 'apprentice', null, {
      name: 'Shopkeeper',
      description: 'Runs a store and watches every customer.',
      skills: ['insight'],
      actions: [
        reaction(
          'Not So Fast',
          'a creature within 10 feet of you tries to steal or tamper with goods in your care',
          'Its check has Disadvantage.',
        ),
      ],
    }),
    specialization('wholesaler', 'journeyman', 'shopkeeper', {
      name: 'Wholesaler',
      description: 'Buys by the shipload and sells to shops.',
      skills: ['investigation'],
      actions: [
        action(
          'Strike a Bargain',
          'You have Advantage on your next Charisma check to negotiate a price, and on a success ' +
            'you pay a fifth less or receive a fifth more.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('tycoon', 'master', 'wholesaler', {
      name: 'Tycoon',
      description: 'Owns an industry and the politicians who regulate it.',
      skills: ['etiquette', 'intimidation'],
      actions: [
        action(
          'Money Talks',
          'A creature within 30 feet that can hear and understand you makes a Wisdom saving ' +
            'throw against your Profession roll. On a failure, it is Mesmerised by you for 1 hour.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
    specialization('speculator', 'apprentice', null, {
      name: 'Speculator',
      description: 'Bets on prices, ventures and luck.',
      skills: ['gambling'],
      actions: [
        bonusAction(
          'Calculated Risk',
          'You have Advantage on your next D20 Test this round. If that test fails, you have ' +
            'Disadvantage on the next D20 Test you make.',
          PB_PER_LONG_REST,
        ),
      ],
    }),
    specialization('broker', 'journeyman', 'speculator', {
      name: 'Broker',
      description: 'Trades on behalf of others and takes a cut.',
      skills: ['persuasion'],
      actions: [
        reaction(
          'Hedge Your Bets',
          'an ally within 30 feet fails an ability check',
          'The ally rerolls the check and must use the new roll.',
          ONCE_PER_SHORT_REST,
        ),
      ],
    }),
    specialization('financier', 'master', 'broker', {
      name: 'Financier',
      description: 'Moves markets and holds the debts of nations.',
      skills: ['insight', 'investigation'],
      actions: [
        action(
          'Call in the Loan',
          'Choose a creature that owes you money. For 7 days it has Disadvantage on Charisma ' +
            'checks with anyone who knows of the debt.',
          ONCE_PER_LONG_REST,
        ),
      ],
    }),
  ],
};
