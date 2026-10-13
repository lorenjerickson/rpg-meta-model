import type { MonsterStatBlock } from '../statBlock';
import { RECHARGE_5, RECHARGE_6, attack, feature, monster, multiattack, save } from './builders';

const SUNLIGHT_HYPERSENSITIVITY = feature(
  'Sunlight Hypersensitivity',
  'Its blood cannot tolerate daylight. While in sunlight it has Disadvantage on attack rolls and ' +
    'ability checks, and it takes 20 Radiation damage if it starts its turn there.',
);

/** Ordinary people, and people who have been changed. */
export const PEOPLE: readonly MonsterStatBlock[] = [
  monster('cultist', {
    name: 'Cultist',
    description: 'A devotee of whatever is behind the experiments, believing it will remake them.',
    origin: 'human',
    size: 'medium',
    creatureType: 'humanoid',
    tags: ['Cultist'],
    alignment: 'neutral-evil',
    armorClass: 12,
    hitDice: '2d8',
    speed: { walk: 30 },
    scores: [11, 12, 10, 10, 11, 10, 10, 8],
    skills: { deception: 'proficient', religion: 'proficient' },
    languages: ['English'],
    challengeRating: 1 / 8,
    actions: [
      attack('Ritual Knife', { attribute: 'agility', reach: 5, damage: [['1d4', 'piercing']] }),
    ],
  }),
  monster('cult-zealot', {
    name: 'Cult Zealot',
    description: 'A cult leader whose sermons leave listeners shaking.',
    origin: 'human',
    size: 'medium',
    creatureType: 'humanoid',
    tags: ['Cultist'],
    alignment: 'neutral-evil',
    armorClass: 13,
    hitDice: '6d8',
    speed: { walk: 30 },
    scores: [11, 14, 12, 10, 13, 14, 10, 6],
    saves: ['wisdom'],
    skills: { deception: 'proficient', persuasion: 'proficient', religion: 'proficient' },
    languages: ['English'],
    challengeRating: 2,
    actions: [
      multiattack('The zealot makes two Ritual Knife attacks.'),
      attack('Ritual Knife', { attribute: 'agility', reach: 5, damage: [['1d4', 'piercing']] }),
      save('Rapturous Sermon', {
        save: 'sanity',
        dcAttribute: 'charisma',
        target: 'one creature within 30 feet that can hear the zealot',
        damage: [['3d6', 'psychic']],
        failure: 'The target has the Frightened condition until the end of its next turn.',
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('thug', {
    name: 'Thug',
    description: 'A street tough who works for whoever is paying.',
    origin: 'human',
    size: 'medium',
    creatureType: 'humanoid',
    alignment: 'neutral',
    armorClass: 11,
    hitDice: '5d8+10',
    speed: { walk: 30 },
    scores: [15, 11, 14, 10, 10, 11, 10, 10],
    skills: { intimidation: 'proficient' },
    languages: ['English'],
    challengeRating: 1 / 2,
    actions: [
      multiattack(
        'The thug makes two attacks, using Cudgel or Pocket Revolver in any combination.',
      ),
      attack('Cudgel', { reach: 5, damage: [['1d6', 'bludgeoning']] }),
      attack('Pocket Revolver', {
        attack: 'ranged',
        range: { normal: 30, long: 90 },
        damage: [['1d8', 'piercing']],
      }),
    ],
  }),
  monster('constable', {
    name: 'Constable',
    description: 'A police officer on the beat.',
    origin: 'human',
    size: 'medium',
    creatureType: 'humanoid',
    alignment: 'lawful-neutral',
    armorClass: 12,
    hitDice: '3d8+3',
    speed: { walk: 30 },
    scores: [13, 12, 12, 10, 11, 10, 10, 10],
    skills: { perception: 'proficient' },
    languages: ['English'],
    challengeRating: 1 / 8,
    actions: [
      attack('Truncheon', { reach: 5, damage: [['1d4', 'bludgeoning']] }),
      attack('Service Revolver', {
        attack: 'ranged',
        range: { normal: 50, long: 150 },
        damage: [['1d10', 'piercing']],
      }),
    ],
  }),
  monster('veteran-soldier', {
    name: 'Veteran Soldier',
    description: 'A hardened soldier of colonial wars, steady under fire.',
    origin: 'human',
    size: 'medium',
    creatureType: 'humanoid',
    alignment: 'neutral',
    armorClass: 14,
    hitDice: '9d8+18',
    speed: { walk: 30 },
    scores: [16, 13, 14, 10, 11, 10, 10, 10],
    skills: { athletics: 'proficient', perception: 'proficient' },
    languages: ['English'],
    challengeRating: 3,
    actions: [
      multiattack('The soldier makes two attacks, using Bayonet or Rifle in any combination.'),
      attack('Bayonet', { reach: 5, damage: [['1d8', 'piercing']] }),
      attack('Rifle', {
        attack: 'ranged',
        range: { normal: 150, long: 600 },
        damage: [['1d12', 'piercing']],
      }),
    ],
  }),
  monster('mad-scientist', {
    name: 'Mad Scientist',
    description:
      'A brilliant mind that has seen too much of the work and wants more. Fights with whatever ' +
      'apparatus is to hand.',
    origin: 'human',
    size: 'medium',
    creatureType: 'humanoid',
    tags: ['Scientist'],
    alignment: 'chaotic-neutral',
    armorClass: 12,
    hitDice: '18d8',
    speed: { walk: 30 },
    scores: [9, 14, 11, 20, 12, 11, 10, 6],
    saves: ['intellect', 'wisdom'],
    skills: { science: 'expertise', history: 'proficient' },
    languages: ['English', 'German', 'French', 'Latin'],
    challengeRating: 6,
    actions: [
      multiattack('The scientist makes three Seeking Arc attacks.'),
      attack('Seeking Arc', {
        attack: 'ranged',
        attribute: 'intellect',
        range: { normal: 120 },
        damage: [['2d10', 'lightning']],
      }),
      save('Lightning Discharge', {
        save: 'agility',
        dcAttribute: 'intellect',
        target: 'each creature in a 100-foot-long, 5-foot-wide Line',
        damage: [['8d6', 'lightning']],
        usage: RECHARGE_5,
      }),
    ],
    reactions: [
      feature(
        'Spring-Loaded Shield',
        'Trigger: The scientist is hit by an attack roll. Response: The scientist gains a +5 ' +
          'bonus to AC until the start of its next turn, including against the triggering attack.',
        { kind: 'per-day', uses: 3 },
      ),
    ],
  }),
  monster('ghoul', {
    name: 'Ghoul',
    description:
      'Once human, now a pallid eater of the dead. A paralytic toxin coats its claws, and the ' +
      'condition spreads through bites.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    tags: ['Mutant'],
    alignment: 'chaotic-evil',
    armorClass: 12,
    hitDice: '5d8',
    speed: { walk: 30 },
    scores: [13, 15, 10, 7, 10, 6, 10, 4],
    damageImmunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'],
    senses: { darkvision: 60 },
    languages: ['English (garbled)'],
    challengeRating: 1,
    actions: [
      multiattack('The ghoul makes one Bite attack and one Claw attack.'),
      attack('Bite', {
        attribute: 'agility',
        reach: 5,
        damage: [
          ['1d6', 'piercing'],
          ['2d6', 'decay'],
        ],
      }),
      attack('Claw', {
        attribute: 'agility',
        reach: 5,
        damage: [['1d4', 'slashing']],
        extra:
          'The target must succeed on a DC 10 Hardiness saving throw or have the Paralyzed ' +
          'condition until the end of its next turn.',
      }),
    ],
  }),
  monster('shoreline-hybrid', {
    name: 'Shoreline Hybrid',
    description:
      'A fishing-village dweller far along a hereditary change: gills, bulging eyes and ' +
      'webbed, clawed hands. They gather in the sea caves on certain nights.',
    origin: 'hybrid',
    size: 'medium',
    creatureType: 'monstrosity',
    tags: ['Mutant'],
    alignment: 'lawful-evil',
    armorClass: 12,
    hitDice: '4d8+4',
    speed: { walk: 30, swim: 40 },
    scores: [13, 11, 12, 12, 13, 9, 10, 7],
    skills: { perception: 'proficient' },
    senses: { darkvision: 120 },
    languages: ['English'],
    challengeRating: 1 / 2,
    traits: [
      feature('Amphibious', 'It can breathe air and water.'),
      feature('Blood Frenzy', 'It has Advantage on attack rolls against Bloodied creatures.'),
    ],
    actions: [
      multiattack('The hybrid makes one Bite attack and one Claws attack.'),
      attack('Bite', { reach: 5, damage: [['1d4', 'piercing']] }),
      attack('Claws', { reach: 5, damage: [['1d4', 'slashing']] }),
    ],
  }),
  monster('lycanthrope', {
    name: 'Lycanthrope',
    description:
      'A carrier of the wolf-change, a retroviral condition passed by bite. Under stress its ' +
      'glands flood its body and bones and muscles twist into a wolfish shape.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    tags: ['Mutant'],
    alignment: 'chaotic-evil',
    armorClass: 12,
    hitDice: '11d8+22',
    speed: { walk: 30 },
    scores: [15, 14, 14, 10, 11, 10, 10, 8],
    skills: { perception: 'expertise', stealth: 'proficient' },
    resistances: ['bludgeoning', 'piercing', 'slashing'],
    senses: { darkvision: 60 },
    languages: ['English'],
    challengeRating: 3,
    traits: [
      feature(
        'Silver Sensitivity',
        'Its altered tissue reacts violently to silver: it has no Resistance to damage from ' +
          'silvered weapons.',
      ),
    ],
    actions: [
      multiattack('The lycanthrope makes two attacks, using Bite or Claw in any combination.'),
      attack('Bite', {
        reach: 5,
        damage: [['1d8', 'piercing']],
        extra:
          'A humanoid target must succeed on a DC 12 Hardiness saving throw or contract the ' +
          'wolf-change.',
      }),
      attack('Claw', { reach: 5, damage: [['2d4', 'slashing']] }),
    ],
    bonusActions: [
      feature(
        'Change',
        'It shifts between human form, a wolf-headed hybrid and a Large wolf, keeping its ' +
          'statistics but gaining a Speed of 40 feet in wolf form.',
      ),
    ],
  }),
  monster('doppelganger', {
    name: 'Doppelganger',
    description:
      'A subject whose cells will take any shape they are shown. It studies a face, then wears it.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    tags: ['Mutant'],
    alignment: 'neutral',
    armorClass: 14,
    hitDice: '13d8+26',
    speed: { walk: 30 },
    scores: [11, 18, 14, 11, 12, 14, 10, 10],
    skills: { deception: 'expertise', insight: 'proficient' },
    senses: { darkvision: 60 },
    languages: ['English', 'French'],
    challengeRating: 3,
    actions: [
      multiattack('The doppelganger makes two Slam attacks.'),
      attack('Slam', { attribute: 'agility', reach: 5, damage: [['1d6', 'bludgeoning']] }),
      save('True Face', {
        save: 'sanity',
        dcAttribute: 'charisma',
        target: 'each creature within 15 feet that can see the doppelganger',
        failure: 'The target has the Frightened condition until the end of its next turn.',
        success: 'Nothing happens.',
        usage: RECHARGE_6,
      }),
    ],
    bonusActions: [
      feature(
        'Metamorphosis',
        'It takes the shape of a Small or Medium humanoid it has seen, or its own shape. Its ' +
          'clothing does not change.',
      ),
    ],
  }),
  monster('haemophage', {
    name: 'Haemophage',
    description:
      "A person whose blood no longer makes its own blood. It must drink others' to live, and " +
      'its body heals almost anything while it does.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    tags: ['Mutant'],
    alignment: 'neutral-evil',
    armorClass: 16,
    hitDice: '11d8+33',
    speed: { walk: 30, climb: 30 },
    scores: [16, 16, 16, 11, 10, 12, 10, 8],
    saves: ['agility', 'wisdom'],
    skills: { perception: 'proficient', stealth: 'proficient' },
    resistances: ['decay'],
    senses: { darkvision: 60 },
    languages: ['English'],
    challengeRating: 5,
    traits: [
      feature(
        'Regeneration',
        'It regains 10 Hit Points at the start of each of its turns unless it took Fire or ' +
          'Radiation damage since its last turn or is in sunlight.',
      ),
      feature(
        'Spider Climb',
        'It can climb difficult surfaces, including ceilings, without a check.',
      ),
      SUNLIGHT_HYPERSENSITIVITY,
    ],
    actions: [
      multiattack('The haemophage makes one Claw attack and one Bite attack.'),
      attack('Claw', {
        reach: 5,
        damage: [['2d4', 'slashing']],
        extra: 'The target has the Grappled condition (escape DC 13).',
      }),
      attack('Bite', {
        reach: 5,
        damage: [
          ['1d6', 'piercing'],
          ['3d6', 'decay'],
        ],
        extra: 'The haemophage regains Hit Points equal to the Decay damage dealt.',
      }),
    ],
  }),
  monster('haemophage-progenitor', {
    name: 'Haemophage Progenitor',
    description:
      'The first of its line: an aristocrat of uncertain age who has bred a household of ' +
      'haemophages and rules them with the gaze of a master mesmerist.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    tags: ['Mutant'],
    alignment: 'lawful-evil',
    armorClass: 16,
    hitDice: '17d8+68',
    speed: { walk: 40, climb: 40 },
    scores: [18, 18, 18, 17, 15, 18, 14, 12],
    saves: ['agility', 'wisdom', 'charisma'],
    skills: { perception: 'expertise', stealth: 'expertise' },
    resistances: ['decay'],
    senses: { darkvision: 120 },
    languages: ['English', 'German', 'Hungarian'],
    challengeRating: 13,
    traits: [
      feature(
        'Implacable Will',
        'If the progenitor fails a saving throw, it can choose to succeed instead.',
        { kind: 'per-day', uses: 3 },
      ),
      feature(
        'Regeneration',
        'It regains 20 Hit Points at the start of each of its turns unless it took Fire or ' +
          'Radiation damage since its last turn or is in sunlight.',
      ),
      feature(
        'Spider Climb',
        'It can climb difficult surfaces, including ceilings, without a check.',
      ),
      SUNLIGHT_HYPERSENSITIVITY,
    ],
    actions: [
      multiattack('The progenitor makes two Claw attacks and one Bite attack.'),
      attack('Claw', {
        reach: 5,
        damage: [['2d6', 'slashing']],
        extra: 'The target has the Grappled condition (escape DC 17).',
      }),
      attack('Bite', {
        reach: 5,
        damage: [
          ['1d8', 'piercing'],
          ['6d6', 'decay'],
        ],
        extra: 'The progenitor regains Hit Points equal to the Decay damage dealt.',
      }),
      save('Mesmeric Gaze', {
        save: 'wisdom',
        dcAttribute: 'charisma',
        target: 'one humanoid the progenitor can see within 30 feet',
        failure: 'The target has the Charmed condition for 24 hours or until it takes damage.',
        success: 'The target is immune to this gaze for 24 hours.',
      }),
    ],
    legendary: {
      uses: 3,
      actions: [
        feature(
          'Move',
          'The progenitor moves up to its Speed without provoking Opportunity Attacks.',
        ),
        attack('Claw', { reach: 5, damage: [['2d6', 'slashing']] }),
        feature('Drink', 'The progenitor makes one Bite attack against a Grappled creature.'),
      ],
    },
  }),
];
