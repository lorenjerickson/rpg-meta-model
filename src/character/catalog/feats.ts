import { ATTRIBUTES } from '../../core/attributes';
import type { Feature } from '../../core/features';
import type { FeatDefinition } from '../feats';

function benefit(name: string, description: string): Feature {
  return {
    id: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name,
    description,
  };
}

function feat(id: string, input: Omit<FeatDefinition, 'id'>): FeatDefinition {
  return { id, ...input };
}

const EPIC_INCREASE = { attributes: ATTRIBUTES, amount: 1, max: 30 } as const;

export const FEATS: readonly FeatDefinition[] = [
  // Origin feats
  feat('alert', {
    name: 'Alert',
    description: 'Always watching for the knife in the dark.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit('Initiative Proficiency', 'Add your proficiency dice to Initiative rolls.'),
      benefit(
        'Initiative Swap',
        'Immediately after you roll Initiative, you can swap your Initiative with one willing ' +
          'ally in the same combat who is not Incapacitated.',
      ),
    ],
  }),
  feat('amateur-scientist', {
    name: 'Amateur Scientist',
    description: 'A self-taught tinkerer with a workbench and a head full of half-proven theories.',
    category: 'origin',
    repeatable: true,
    benefits: [
      benefit('Discipline', 'Choose a scientific discipline. You gain proficiency in it.'),
      benefit(
        'Field Trial',
        'Once per Long Rest, you can use a 1-charge effect of an apparatus of that discipline ' +
          'without spending its charge.',
      ),
      benefit('Repeatable', 'You can take this feat more than once, choosing a new discipline.'),
    ],
  }),
  feat('charmed-life', {
    name: 'Charmed Life',
    description: 'Things just seem to work out, somehow.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit(
        'Luck',
        'You have a number of Luck Points equal to your Proficiency Bonus, regained on a Long ' +
          'Rest. Spend one to give yourself Advantage on a D20 Test, or to give Disadvantage to ' +
          'an attack roll against you.',
      ),
    ],
  }),
  feat('crowd-pleaser', {
    name: 'Crowd-Pleaser',
    description: 'You can lift a room with a song or a story.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit('Repertoire', 'You gain proficiency with three musical instruments of your choice.'),
      benefit(
        'Rousing Tune',
        'When you finish a Short or Long Rest, you can perform to give Heroic Inspiration to ' +
          'allies who heard you, up to your Proficiency Bonus.',
      ),
    ],
  }),
  feat('field-medic', {
    name: 'Field Medic',
    description: 'You have patched people up where no doctor would come.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit(
        'Battle Medic',
        'As a Utilize action, you can expend one use of a first-aid kit to let a creature within ' +
          '5 feet of you spend one of its Hit Dice and regain that many Hit Points plus your ' +
          'Proficiency Bonus.',
      ),
      benefit('Steady Hands', 'When you roll a die to restore Hit Points, you can reroll a 1.'),
    ],
  }),
  feat('hard-hitter', {
    name: 'Hard Hitter',
    description: 'You learned to fight where nobody fought fair.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit(
        'Hard Hitter',
        'Once per turn when you hit with a weapon, you can roll its damage dice twice and use ' +
          'either roll.',
      ),
    ],
  }),
  feat('iron-nerves', {
    name: 'Iron Nerves',
    description: 'You have seen things, and kept your head.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit(
        'Steady',
        'You have Advantage on Sanity saving throws to avoid or end the Frightened condition.',
      ),
      benefit(
        'Second Look',
        'Once per Long Rest, when you fail a Sanity saving throw, you can reroll it.',
      ),
    ],
  }),
  feat('mesmerist', {
    name: 'Mesmerist',
    description: 'You trained in animal magnetism under a stage hypnotist or a doctor.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit('Mesmerism', 'You gain proficiency in the mesmerism discipline.'),
      benefit(
        'Pocket-Watch Trance',
        'Once per Long Rest, with any small swinging object, you can use the Fascinate effect of ' +
          'a mesmeric pendant without one.',
      ),
    ],
  }),
  feat('polyglot', {
    name: 'Polyglot',
    description: 'You grew up between languages, in ports and on borders.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit('Languages', 'You learn three languages of your choice.'),
      benefit(
        'Interpreter',
        'You have Advantage on checks to communicate with a creature that shares no language ' +
          'with you.',
      ),
    ],
  }),
  feat('skilled', {
    name: 'Skilled',
    description: 'A quick study in everything you put your hand to.',
    category: 'origin',
    repeatable: true,
    benefits: [
      benefit('Skills', 'You gain proficiency in any combination of three skills or tools.'),
      benefit('Repeatable', 'You can take this feat more than once.'),
    ],
  }),
  feat('tough-constitution', {
    name: 'Tough Constitution',
    description: 'Hard work and hard winters made you hard to kill.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit(
        'Tough',
        'Your Hit Point maximum increases by twice your character level, and by 2 more whenever ' +
          'you gain a level.',
      ),
    ],
  }),
  feat('well-connected', {
    name: 'Well-Connected',
    description: 'You know people, and people know you.',
    category: 'origin',
    repeatable: false,
    benefits: [
      benefit(
        'Contacts',
        'Once per Long Rest in a town or city, you can call on a contact for a modest favour: ' +
          'lodging, an introduction, or a piece of information.',
      ),
      benefit(
        'Standing',
        'You have Advantage on Charisma (Persuasion) checks with officials and the upper classes.',
      ),
    ],
  }),

  // General feats
  feat('attribute-score-improvement', {
    name: 'Attribute Score Improvement',
    description: 'Practice and experience pay off.',
    category: 'general',
    repeatable: true,
    attributeScoreIncrease: { attributes: ATTRIBUTES, amount: 2, max: 20 },
    benefits: [
      benefit(
        'Improvement',
        'Increase one attribute score by 2, or two attribute scores by 1, to a maximum of 20.',
      ),
    ],
  }),
  feat('grappler', {
    name: 'Grappler',
    description: 'A wrestler from the fairground booths.',
    category: 'general',
    repeatable: false,
    prerequisite: { attributeScore: { attributes: ['might', 'agility'], minimum: 13 } },
    attributeScoreIncrease: { attributes: ['might', 'agility'], amount: 1, max: 20 },
    benefits: [
      benefit(
        'Punch and Grab',
        'When you hit with an Unarmed Strike as part of the Attack action, you can both deal ' +
          'damage and Grapple, once per turn.',
      ),
      benefit(
        'Attack Advantage',
        'You have Advantage on attack rolls against creatures you are grappling.',
      ),
      benefit(
        'Fast Wrestler',
        "You don't spend extra movement to move a creature you are grappling if it is your size " +
          'or smaller.',
      ),
    ],
  }),
  feat('crack-shot', {
    name: 'Crack Shot',
    description: 'Prize-winning marksmanship.',
    category: 'general',
    repeatable: false,
    prerequisite: { attributeScore: { attributes: ['agility'], minimum: 13 } },
    attributeScoreIncrease: { attributes: ['agility'], amount: 1, max: 20 },
    benefits: [
      benefit('Bypass Cover', 'Your ranged attacks ignore Half Cover and Three-Quarters Cover.'),
      benefit(
        'Long Shots',
        "Attacking at long range doesn't impose Disadvantage on your ranged weapon attack rolls.",
      ),
    ],
  }),
  feat('gunslinger', {
    name: 'Gunslinger',
    description: 'Fast hands and a faster draw.',
    category: 'general',
    repeatable: false,
    prerequisite: { attributeScore: { attributes: ['agility'], minimum: 13 } },
    attributeScoreIncrease: { attributes: ['agility'], amount: 1, max: 20 },
    benefits: [
      benefit(
        'Quick Reload',
        'You can reload a firearm with the Reload property as a Bonus Action.',
      ),
      benefit(
        'Point Blank',
        "Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with " +
          'Light firearms.',
      ),
    ],
  }),
  feat('resilient-mind', {
    name: 'Resilient Mind',
    description: 'You have made your mind a fortress.',
    category: 'general',
    repeatable: false,
    attributeScoreIncrease: { attributes: ['wisdom', 'sanity'], amount: 1, max: 20 },
    benefits: [
      benefit(
        'Fortified',
        'You gain proficiency in Sanity saving throws, or in Wisdom saving throws if you already ' +
          'have it.',
      ),
    ],
  }),
  feat('gadgeteer', {
    name: 'Gadgeteer',
    description: 'You keep your apparatus in better order than their makers do.',
    category: 'general',
    repeatable: false,
    prerequisite: { discipline: 'any' },
    attributeScoreIncrease: { attributes: ['intellect'], amount: 1, max: 20 },
    benefits: [
      benefit(
        'Safe Margins',
        'When you overcharge an apparatus, it malfunctions only on a natural 1.',
      ),
      benefit(
        'Extra Capacity',
        'One apparatus you maintain holds one more charge than its maximum.',
      ),
    ],
  }),

  // Fighting styles
  feat('marksmanship', {
    name: 'Marksmanship',
    description: 'Drilled on the range until it became instinct.',
    category: 'fighting-style',
    repeatable: false,
    prerequisite: { weaponCategory: 'martial' },
    benefits: [benefit('Marksmanship', 'Add 1d4 to your ranged weapon attack rolls.')],
  }),
  feat('defense', {
    name: 'Defense',
    description: 'You make the most of whatever protection you have.',
    category: 'fighting-style',
    repeatable: false,
    prerequisite: { weaponCategory: 'martial' },
    benefits: [benefit('Defense', 'While wearing armour, your defense increases by 1.')],
  }),
  feat('heavy-weapon-fighting', {
    name: 'Heavy Weapon Fighting',
    description: 'Swinging sledges and axes taught you to make every blow count.',
    category: 'fighting-style',
    repeatable: false,
    prerequisite: { weaponCategory: 'martial' },
    benefits: [
      benefit(
        'Heavy Blows',
        'When you roll damage for a melee weapon you are holding with two hands, treat any 1 or 2 ' +
          'on a damage die as a 3.',
      ),
    ],
  }),
  feat('two-weapon-fighting', {
    name: 'Two-Weapon Fighting',
    description: 'A blade or pistol in each hand.',
    category: 'fighting-style',
    repeatable: false,
    prerequisite: { weaponCategory: 'martial' },
    benefits: [
      benefit(
        'Off Hand',
        'When you make an extra attack from attacking with a Light weapon in each hand, you add ' +
          'your attribute modifier to its damage.',
      ),
    ],
  }),

  // Epic boons
  feat('boon-of-combat-prowess', {
    name: 'Boon of Combat Prowess',
    description: 'Years of fighting have made you nearly impossible to evade.',
    category: 'epic-boon',
    repeatable: false,
    attributeScoreIncrease: EPIC_INCREASE,
    benefits: [
      benefit(
        'Peerless Aim',
        'Once per turn, when you miss with an attack roll, you can hit instead.',
      ),
    ],
  }),
  feat('boon-of-fate', {
    name: 'Boon of Fate',
    description: 'Fortune bends around you, for better and worse.',
    category: 'epic-boon',
    repeatable: false,
    attributeScoreIncrease: EPIC_INCREASE,
    benefits: [
      benefit(
        'Improve Fate',
        'When you or a creature within 60 feet of you succeeds or fails a D20 Test, you can roll ' +
          '2d4 and add it to or subtract it from the roll. Once per Initiative roll or Short or ' +
          'Long Rest.',
      ),
    ],
  }),
  feat('boon-of-irresistible-offense', {
    name: 'Boon of Irresistible Offense',
    description: 'Nothing turns your blows aside.',
    category: 'epic-boon',
    repeatable: false,
    attributeScoreIncrease: EPIC_INCREASE,
    benefits: [
      benefit(
        'Overcome Defenses',
        'Bludgeoning, Piercing and Slashing damage you deal ignores Resistance.',
      ),
      benefit(
        'Overwhelming Strike',
        'When you roll a 20 on an attack roll, you deal extra damage equal to the attribute ' +
          'score you increased with this feat.',
      ),
    ],
  }),
  feat('boon-of-the-vanishing-act', {
    name: 'Boon of the Vanishing Act',
    description: 'A puff of smoke and you are elsewhere.',
    category: 'epic-boon',
    repeatable: false,
    attributeScoreIncrease: EPIC_INCREASE,
    benefits: [
      benefit(
        'Vanish',
        'Immediately after you take the Attack action, you can move up to 30 feet without ' +
          'provoking Opportunity Attacks and take the Hide action.',
      ),
    ],
  }),
  feat('boon-of-inspired-genius', {
    name: 'Boon of Inspired Genius',
    description: 'Your apparatus do things their makers never designed.',
    category: 'epic-boon',
    repeatable: false,
    attributeScoreIncrease: EPIC_INCREASE,
    benefits: [
      benefit(
        'Free Charge',
        'Once per Short or Long Rest, you can use an apparatus effect costing up to 3 charges ' +
          'without spending them.',
      ),
    ],
  }),
  feat('boon-of-the-night', {
    name: 'Boon of the Night',
    description: 'You belong to the fog and the gaslight.',
    category: 'epic-boon',
    repeatable: false,
    attributeScoreIncrease: EPIC_INCREASE,
    benefits: [
      benefit(
        'Shadow Walker',
        'While in Dim Light or Darkness, you can take the Hide action as a Bonus Action, and ' +
          "attack rolls against you have Disadvantage if you haven't attacked since your last turn.",
      ),
    ],
  }),
  feat('boon-of-keen-perception', {
    name: 'Boon of Keen Perception',
    description: 'Nothing escapes your notice.',
    category: 'epic-boon',
    repeatable: false,
    attributeScoreIncrease: EPIC_INCREASE,
    benefits: [
      benefit('Blindsight', 'You have Blindsight with a range of 30 feet.'),
      benefit(
        "Can't Be Surprised",
        "You can't be surprised and have Advantage on Wisdom (Perception) checks.",
      ),
    ],
  }),
];

export function findFeat(id: string): FeatDefinition | undefined {
  return FEATS.find((entry) => entry.id === id);
}
