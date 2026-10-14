import type { Condition } from '../../core/conditions';
import { bonus } from '../../core/rollModifiers';
import type { MonsterStatBlock } from '../statBlock';
import { RECHARGE_5, RECHARGE_6, attack, feature, monster, multiattack, save } from './builders';

const MINDLESS: readonly Condition[] = [
  'mesmerised',
  'exhaustion',
  'frightened',
  'paralyzed',
  'calcified',
  'poisoned',
];

const RESIDUAL_CHARGE = feature(
  'Residual Charge',
  'If damage reduces it to 0 Hit Points, it makes a Hardiness saving throw (DC 5 plus the ' +
    'damage taken) unless the damage was Fire or from a Critical Hit. On a success, current ' +
    'still twitching in its nerves leaves it at 1 Hit Point.',
);

const GALVANIC_ABSORPTION = feature(
  'Galvanic Absorption',
  'Whenever it is subjected to Lightning damage, it takes no damage and regains Hit Points equal ' +
    'to the Lightning damage dealt.',
);

const PHENOMENON: readonly Condition[] = [
  'exhaustion',
  'grappled',
  'paralyzed',
  'calcified',
  'poisoned',
  'prone',
  'restrained',
  'unconscious',
];

/** The reanimated dead, automata, and self-sustaining phenomena. */
export const MACHINES: readonly MonsterStatBlock[] = [
  // Reanimated
  monster('galvanised-corpse', {
    name: 'Galvanised Corpse',
    description:
      'A body brought back to jerking motion by electrodes in the spine. It obeys simple ' +
      'commands and never stops.',
    origin: 'reanimation',
    size: 'medium',
    creatureType: 'undead',
    alignment: 'unaligned',
    armorClass: 8,
    hitDice: '2d8+6',
    speed: { walk: 20 },
    scores: [13, 6, 16, 3, 6, 5, 10, 1],
    saves: ['wisdom'],
    damageImmunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'],
    senses: { darkvision: 60 },
    languages: ["Understands English but can't speak"],
    challengeRating: 1 / 4,
    traits: [RESIDUAL_CHARGE],
    actions: [attack('Slam', { reach: 5, damage: [['1d8', 'bludgeoning']] })],
  }),
  monster('galvanised-brute', {
    name: 'Galvanised Brute',
    description: 'The reanimated corpse of a very large man, wired with heavier cables.',
    origin: 'reanimation',
    size: 'large',
    creatureType: 'undead',
    alignment: 'unaligned',
    armorClass: 8,
    hitDice: '9d10+36',
    speed: { walk: 30 },
    scores: [19, 6, 18, 3, 6, 5, 10, 1],
    saves: ['wisdom'],
    damageImmunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'],
    senses: { darkvision: 60 },
    languages: ["Understands English but can't speak"],
    challengeRating: 2,
    traits: [RESIDUAL_CHARGE],
    actions: [attack('Slam', { reach: 5, damage: [['2d8', 'bludgeoning']] })],
  }),
  monster('preserved-specimen', {
    name: 'Preserved Specimen',
    description:
      "A body embalmed in a museum's chemical bath and reanimated. The preserving fluids rot " +
      'whatever they touch.',
    origin: 'reanimation',
    size: 'medium',
    creatureType: 'undead',
    alignment: 'lawful-evil',
    armorClass: 11,
    hitDice: '9d8+18',
    speed: { walk: 20 },
    scores: [16, 8, 15, 6, 12, 12, 10, 6],
    saves: ['wisdom'],
    vulnerabilities: ['fire'],
    damageImmunities: ['decay', 'poison'],
    conditionImmunities: MINDLESS,
    senses: { darkvision: 60 },
    languages: ['Ancient Egyptian'],
    challengeRating: 3,
    actions: [
      multiattack('The specimen makes one Rotting Fist attack and uses Dreadful Glare.'),
      attack('Rotting Fist', {
        reach: 5,
        damage: [
          ['2d6', 'bludgeoning'],
          ['3d6', 'decay'],
        ],
        extra:
          "The target must succeed on a Hardiness saving throw against {effect:hardiness} or contract embalmer's rot: " +
          'its Hit Point maximum cannot be restored until the rot is treated.',
      }),
      save('Dreadful Glare', {
        save: 'sanity',
        dcAttribute: 'wisdom',
        target: 'one creature the specimen can see within 60 feet',
        failure: 'The target has the Frightened condition until the end of its next turn.',
        success: 'Nothing happens.',
      }),
    ],
  }),
  monster('patchwork-man', {
    name: 'Patchwork Man',
    description:
      'A giant sewn together from many corpses and brought to life by lightning. It is strong, ' +
      'confused and terrified of fire.',
    origin: 'reanimation',
    size: 'medium',
    creatureType: 'construct',
    alignment: 'neutral',
    armorClass: 9,
    hitDice: '11d8+44',
    speed: { walk: 30 },
    scores: [19, 9, 18, 6, 10, 5, 10, 4],
    damageImmunities: ['lightning', 'poison'],
    conditionImmunities: MINDLESS,
    senses: { darkvision: 60 },
    languages: ["Understands English but can't speak"],
    challengeRating: 5,
    traits: [
      feature(
        'Aversion to Fire',
        'If it takes Fire damage, it has Disadvantage on attack rolls and ability checks until ' +
          'the end of its next turn.',
      ),
      feature(
        'Berserk',
        'Whenever it starts its turn Bloodied, roll a d6. On a 6, it attacks the nearest ' +
          'creature it can see until it is destroyed or regains all its Hit Points.',
      ),
      GALVANIC_ABSORPTION,
    ],
    actions: [
      multiattack('The patchwork man makes two Slam attacks.'),
      attack('Slam', { reach: 5, damage: [['2d8', 'bludgeoning']] }),
    ],
  }),

  // Automata
  monster('homunculus', {
    name: 'Homunculus',
    description:
      'A tiny, vat-grown person with grafted bat wings, kept as a laboratory servant. Its bite ' +
      'carries a sedative.',
    origin: 'hybrid',
    size: 'tiny',
    creatureType: 'construct',
    alignment: 'neutral',
    armorClass: 13,
    hitDice: '2d4',
    speed: { walk: 20, fly: 40 },
    scores: [4, 15, 11, 10, 10, 7, 10, 10],
    damageImmunities: ['poison'],
    conditionImmunities: ['poisoned'],
    senses: { darkvision: 60 },
    languages: ['Understands English'],
    challengeRating: 0,
    actions: [
      attack('Bite', {
        attribute: 'agility',
        reach: 5,
        damage: [['1', 'piercing']],
        extra:
          'The target must succeed on a Hardiness saving throw against {effect:hardiness} or have the Poisoned ' +
          'condition for 1 minute. If it fails by 5 or more, it is also Unconscious until it ' +
          'takes damage or the minute ends.',
      }),
    ],
  }),
  monster('wired-skeleton', {
    name: 'Wired Skeleton',
    description:
      'A medical skeleton strung with wire and driven by clockwork servos, sent to do what ' +
      'living staff will not.',
    origin: 'automaton',
    size: 'medium',
    creatureType: 'construct',
    alignment: 'unaligned',
    armorClass: 13,
    hitDice: '2d8+4',
    speed: { walk: 30 },
    scores: [10, 14, 15, 6, 8, 5, 10, 10],
    vulnerabilities: ['bludgeoning'],
    damageImmunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'],
    senses: { darkvision: 60 },
    challengeRating: 1 / 4,
    actions: [
      attack('Scalpel Hand', { attribute: 'agility', reach: 5, damage: [['1d6', 'slashing']] }),
    ],
  }),
  monster('clockwork-soldier', {
    name: 'Clockwork Soldier',
    description: 'An empty suit of steel plate driven by a mainspring, built to guard and march.',
    origin: 'automaton',
    size: 'medium',
    creatureType: 'construct',
    alignment: 'unaligned',
    armorClass: 18,
    soak: [bonus('soak', 1, 6)],
    hitDice: '6d8+6',
    speed: { walk: 25 },
    scores: [14, 11, 13, 1, 3, 1, 10, 10],
    damageImmunities: ['poison', 'psychic'],
    conditionImmunities: [...MINDLESS, 'deafened'],
    senses: { blindsight: 60 },
    challengeRating: 1,
    traits: [
      feature(
        'Mainspring',
        'It must be wound every 24 hours. Unwound, it has the Incapacitated condition.',
      ),
    ],
    actions: [
      multiattack('The soldier makes two Slam attacks.'),
      attack('Slam', { reach: 5, damage: [['1d6', 'bludgeoning']] }),
    ],
  }),
  monster('steam-juggernaut', {
    name: 'Steam Juggernaut',
    description:
      'A ten-foot automaton of riveted boiler plate, its fists driven by pistons and its ' +
      'chest venting scalding steam.',
    origin: 'automaton',
    size: 'large',
    creatureType: 'construct',
    alignment: 'unaligned',
    armorClass: 18,
    soak: [bonus('soak', 2, 6)],
    hitDice: '17d10+85',
    speed: { walk: 30 },
    scores: [22, 9, 20, 3, 11, 1, 10, 10],
    damageImmunities: ['poison', 'psychic'],
    conditionImmunities: MINDLESS,
    senses: { darkvision: 120 },
    challengeRating: 10,
    traits: [
      feature(
        'Boiler',
        'If it takes Cold damage, its Speed is halved and it has Disadvantage on attack rolls ' +
          'until the end of its next turn.',
      ),
      feature('Siege Engine', 'It deals double damage to objects and structures.'),
    ],
    actions: [
      multiattack('The juggernaut makes two Piston Fist attacks.'),
      attack('Piston Fist', { reach: 5, damage: [['3d8', 'bludgeoning']] }),
      save('Scalding Vent', {
        save: 'agility',
        dcAttribute: 'hardiness',
        target: 'each creature in a 15-foot Cone',
        damage: [['8d6', 'fire']],
        usage: RECHARGE_5,
      }),
    ],
  }),

  // Anomalies
  monster('ball-lightning', {
    name: 'Ball Lightning',
    description:
      'A drifting sphere of charged plasma that lingers where storms and dynamos have been. It ' +
      'is drawn to frightened, sweating people.',
    origin: 'anomaly',
    size: 'tiny',
    creatureType: 'anomaly',
    alignment: 'unaligned',
    armorClass: 19,
    hitDice: '9d4',
    speed: { walk: 0, fly: 50, hover: true },
    scores: [1, 28, 10, 13, 14, 11, 10, 10],
    damageImmunities: ['lightning', 'poison'],
    resistances: ['acid', 'cold', 'fire', 'thunder', 'bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: PHENOMENON,
    senses: { darkvision: 120 },
    challengeRating: 2,
    traits: [
      feature(
        'Variable Glow',
        'It sheds Bright Light in a 5- to 20-foot radius and Dim Light for that distance beyond. ' +
          'As a Bonus Action it can change the radius or go dark.',
      ),
    ],
    actions: [attack('Shock', { attribute: 'wisdom', reach: 5, damage: [['2d8', 'lightning']] })],
  }),
  monster('plasma-anomaly', {
    name: 'Plasma Anomaly',
    description:
      'A localised fire that will not go out, held in a roughly human shape by electromagnetic ' +
      'forces nobody has managed to measure.',
    origin: 'anomaly',
    size: 'large',
    creatureType: 'anomaly',
    alignment: 'unaligned',
    armorClass: 13,
    hitDice: '11d10+33',
    speed: { walk: 50 },
    scores: [10, 17, 16, 6, 10, 7, 10, 10],
    vulnerabilities: ['cold'],
    damageImmunities: ['fire', 'poison'],
    resistances: ['bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: PHENOMENON,
    senses: { darkvision: 60 },
    challengeRating: 5,
    traits: [
      feature(
        'Contained Fire',
        'It can move through a space as narrow as 1 inch. A creature that touches it or hits it ' +
          'with a melee attack while within 5 feet of it takes 5 (1d10) Fire damage.',
      ),
      feature('Water Susceptibility', 'It takes 1 Cold damage for every 5 feet it moves in water.'),
    ],
    actions: [
      multiattack('The anomaly makes two Burn attacks.'),
      attack('Burn', {
        attribute: 'agility',
        reach: 5,
        damage: [['2d6', 'fire']],
        extra: 'A creature hit has the Burning condition; a flammable object hit catches fire.',
      }),
    ],
  }),
  monster('vortex-anomaly', {
    name: 'Vortex Anomaly',
    description:
      'A whirlwind that formed over an experimental site and never dispersed. It moves against ' +
      'the wind.',
    origin: 'anomaly',
    size: 'large',
    creatureType: 'anomaly',
    alignment: 'unaligned',
    armorClass: 15,
    hitDice: '12d10+24',
    speed: { walk: 0, fly: 90, hover: true },
    scores: [14, 20, 14, 6, 10, 6, 10, 10],
    damageImmunities: ['poison'],
    resistances: ['lightning', 'thunder', 'bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: PHENOMENON,
    senses: { darkvision: 60 },
    challengeRating: 5,
    actions: [
      multiattack('The anomaly makes two Slam attacks.'),
      attack('Slam', { attribute: 'agility', reach: 10, damage: [['2d8', 'bludgeoning']] }),
      save('Whirlwind', {
        save: 'might',
        dcAttribute: 'agility',
        target: 'each creature in its space or within 5 feet of it',
        damage: [['3d8', 'bludgeoning']],
        failure: 'The target is pushed up to 20 feet away and has the Prone condition.',
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('magnetic-aggregate', {
    name: 'Magnetic Aggregate',
    description:
      'Stone, iron filings and scrap pulled together by a moving magnetic field into a ' +
      'lumbering, roughly human mass.',
    origin: 'anomaly',
    size: 'large',
    creatureType: 'anomaly',
    alignment: 'unaligned',
    armorClass: 17,
    soak: [bonus('soak', 1, 6)],
    hitDice: '12d10+60',
    speed: { walk: 30, burrow: 30 },
    scores: [20, 8, 20, 5, 10, 5, 10, 10],
    vulnerabilities: ['thunder'],
    damageImmunities: ['poison'],
    resistances: ['bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: PHENOMENON,
    senses: { darkvision: 60, tremorsense: 60 },
    challengeRating: 5,
    traits: [
      feature(
        'Magnetic Field',
        'An iron or steel weapon that hits it sticks fast. Pulling it free takes an action and ' +
          'a DC 15 Might (Athletics) check.',
      ),
      feature('Earth Glide', 'It can burrow through earth and stone without disturbing it.'),
    ],
    actions: [
      multiattack('The aggregate makes two Slam attacks.'),
      attack('Slam', { reach: 10, damage: [['2d8', 'bludgeoning']] }),
    ],
  }),
  monster('electromagnetic-apparition', {
    name: 'Electromagnetic Apparition',
    description:
      'The electrical imprint of a person, lingering where they died. It flickers like a bad ' +
      'photograph and interferes with living nerves.',
    origin: 'anomaly',
    size: 'medium',
    creatureType: 'anomaly',
    alignment: 'chaotic-neutral',
    armorClass: 11,
    hitDice: '10d8',
    speed: { walk: 5, fly: 40, hover: true },
    scores: [7, 13, 10, 10, 12, 17, 10, 10],
    vulnerabilities: ['lightning'],
    damageImmunities: ['cold', 'decay', 'poison'],
    resistances: ['acid', 'fire', 'thunder', 'bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: [...PHENOMENON, 'mesmerised', 'frightened'],
    senses: { darkvision: 60 },
    languages: ['English'],
    challengeRating: 4,
    traits: [
      feature(
        'Incorporeal',
        'It can move through creatures and objects as Difficult Terrain. It takes 5 (1d10) ' +
          'Concussive damage if it ends its turn inside an object.',
      ),
    ],
    actions: [
      attack('Chilling Touch', { attribute: 'charisma', reach: 5, damage: [['3d8', 'cold']] }),
      save('Horrifying Visage', {
        save: 'sanity',
        dcAttribute: 'charisma',
        target: 'each creature within 60 feet that can see the apparition',
        failure:
          'The target has the Frightened condition for 1 minute, repeating the save at the end of each of its turns.',
        success: 'Nothing happens.',
      }),
      save('Neural Interference', {
        save: 'charisma',
        dcAttribute: 'charisma',
        target: 'one humanoid within 5 feet',
        failure:
          "The apparition enters the target's body and controls it; the target has the " +
          "Incapacitated condition and can't act on its own. It repeats the save whenever it " +
          'takes damage, ending the effect on a success.',
        success: "The target is immune to this apparition's interference for 24 hours.",
        usage: RECHARGE_6,
      }),
    ],
  }),
];
