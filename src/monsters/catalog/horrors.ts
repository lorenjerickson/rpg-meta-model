import { bonus } from '../../core/rollModifiers';
import type { MonsterStatBlock } from '../statBlock';
import {
  RECHARGE_5,
  attack,
  feature,
  horrifyingPresence,
  monster,
  multiattack,
  save,
} from './builders';

/** Protoplasm, fungi, giants and the things from the deep. */
export const HORRORS: readonly MonsterStatBlock[] = [
  // Protoplasm and growths
  monster('protoplasmic-mass', {
    name: 'Protoplasmic Mass',
    description:
      'A clear, cube-shaped mass of living jelly that fills a corridor and digests what it ' +
      'flows over. Objects hang suspended inside it.',
    origin: 'unknown',
    size: 'large',
    creatureType: 'ooze',
    alignment: 'unaligned',
    armorClass: 6,
    hitDice: '8d10+40',
    speed: { walk: 15 },
    scores: [14, 3, 20, 1, 6, 1, 10, 10],
    damageImmunities: ['acid'],
    conditionImmunities: ['blinded', 'mesmerised', 'deafened', 'exhaustion', 'frightened', 'prone'],
    senses: { blindsight: 60 },
    challengeRating: 2,
    traits: [
      feature(
        'Transparent',
        'Even when in plain sight, noticing it takes a DC 15 Wisdom (Perception) check.',
      ),
    ],
    actions: [
      attack('Pseudopod', { reach: 5, damage: [['3d6', 'acid']] }),
      save('Engulf', {
        save: 'agility',
        dcAttribute: 'might',
        target: "each creature in the mass's path as it moves up to its Speed",
        damage: [['3d6', 'acid']],
        failure:
          "The target is engulfed: it has the Restrained condition, can't breathe, and takes " +
          "the Acid damage again at the start of each of the mass's turns.",
        success: 'The target is pushed 5 feet out of the way.',
      }),
    ],
  }),
  monster('black-slime', {
    name: 'Black Slime',
    description:
      'A heaving pool of tar-black protoplasm that climbs walls and dissolves flesh and wood. ' +
      'Cutting it only makes more.',
    origin: 'unknown',
    size: 'large',
    creatureType: 'ooze',
    alignment: 'unaligned',
    armorClass: 7,
    hitDice: '10d10+30',
    speed: { walk: 20, climb: 20 },
    scores: [16, 5, 16, 1, 6, 1, 10, 10],
    damageImmunities: ['acid', 'cold', 'lightning', 'slashing'],
    conditionImmunities: [
      'blinded',
      'mesmerised',
      'deafened',
      'exhaustion',
      'frightened',
      'grappled',
      'prone',
      'restrained',
    ],
    senses: { blindsight: 60 },
    challengeRating: 4,
    traits: [
      feature('Amorphous', 'It can move through a space as narrow as 1 inch.'),
      feature(
        'Corrosive Form',
        'A creature that touches it or hits it with a melee attack while within 5 feet takes ' +
          '9 (2d8) Acid damage. Nonmetal weapons that hit it corrode.',
      ),
      feature(
        'Spider Climb',
        'It can climb difficult surfaces, including ceilings, without a check.',
      ),
    ],
    actions: [
      attack('Pseudopod', {
        reach: 5,
        damage: [
          ['1d6', 'bludgeoning'],
          ['4d8', 'acid'],
        ],
      }),
    ],
    reactions: [
      feature(
        'Split',
        'Trigger: While it has 10 or more Hit Points, it takes Lightning or Slashing damage. ' +
          'Response: It splits into two slimes, each with half its Hit Points.',
      ),
    ],
  }),
  monster('violet-fungus', {
    name: 'Violet Fungus',
    description: 'A man-high purple mushroom with whip-like tendrils that rot whatever they touch.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'plant',
    alignment: 'unaligned',
    armorClass: 5,
    hitDice: '4d8',
    speed: { walk: 5 },
    scores: [3, 1, 10, 1, 3, 1, 10, 10],
    conditionImmunities: ['blinded', 'deafened', 'frightened'],
    senses: { blindsight: 30 },
    challengeRating: 1 / 4,
    traits: [
      feature('False Appearance', 'While motionless, it looks like an ordinary large fungus.'),
    ],
    actions: [
      multiattack('The fungus makes two Rotting Touch attacks.'),
      attack('Rotting Touch', { attribute: 'hardiness', reach: 10, damage: [['1d8', 'decay']] }),
    ],
  }),
  monster('shambling-mound', {
    name: 'Shambling Mound',
    description:
      'A heap of rotting vegetation from a dumping ground beside a power station, now moving, ' +
      'feeding, and stronger after every storm.',
    origin: 'mutation',
    size: 'large',
    creatureType: 'plant',
    alignment: 'unaligned',
    armorClass: 15,
    hitDice: '13d10+39',
    speed: { walk: 20, swim: 20 },
    scores: [18, 8, 16, 5, 10, 5, 10, 10],
    damageImmunities: ['lightning'],
    resistances: ['cold', 'fire'],
    conditionImmunities: ['blinded', 'deafened', 'exhaustion'],
    senses: { blindsight: 60 },
    challengeRating: 5,
    traits: [
      feature(
        'Galvanic Absorption',
        'Whenever it is subjected to Lightning damage, it takes no damage and regains Hit ' +
          'Points equal to the Lightning damage dealt.',
      ),
    ],
    actions: [
      multiattack('The mound makes three Charged Slam attacks.'),
      attack('Charged Slam', {
        reach: 5,
        damage: [
          ['1d8', 'bludgeoning'],
          ['1d6', 'lightning'],
        ],
        extra: 'If the target is Medium or smaller, it has the Grappled condition (escape DC 14).',
      }),
    ],
  }),

  // Aberrations
  monster('gibbering-mass', {
    name: 'Gibbering Mass',
    description:
      'A heap of flesh covered in mouths and eyes, babbling in a dozen voices. It liquefies the ' +
      'ground around it.',
    origin: 'unknown',
    size: 'medium',
    creatureType: 'aberration',
    alignment: 'chaotic-neutral',
    armorClass: 9,
    hitDice: '9d8+27',
    speed: { walk: 20, swim: 20 },
    scores: [10, 8, 16, 3, 10, 6, 10, 1],
    conditionImmunities: ['prone'],
    senses: { darkvision: 60 },
    challengeRating: 2,
    traits: [
      feature(
        'Aberrant Ground',
        'The ground within 10 feet of it is Difficult Terrain, the consistency of dough.',
      ),
      save('Gibbering', {
        save: 'sanity',
        dcAttribute: 'hardiness',
        target: 'each creature that starts its turn within 20 feet and can hear it',
        failure:
          "The target can't take Reactions and rolls a d8: on 1–4 it does nothing, on 5–6 it " +
          'moves in a random direction, and on 7–8 it attacks a random creature within reach.',
        success: 'Nothing happens.',
      }),
    ],
    actions: [
      multiattack('The mass makes two Bite attacks.'),
      attack('Bite', {
        reach: 5,
        damage: [['2d6', 'piercing']],
        extra: 'If the target is Medium or smaller, it has the Prone condition.',
      }),
      save('Blinding Spittle', {
        save: 'agility',
        dcAttribute: 'hardiness',
        target: 'each creature in a 5-foot-radius Sphere within 30 feet',
        damage: [['2d6', 'acid']],
        failure: "The target has the Blinded condition until the end of the mass's next turn.",
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('grick', {
    name: 'Grick',
    description:
      'A grey worm the length of a man with a ring of hooked tentacles around a beak. It waits ' +
      'on cave walls, looking like stone.',
    origin: 'unknown',
    size: 'medium',
    creatureType: 'aberration',
    alignment: 'unaligned',
    armorClass: 14,
    hitDice: '6d8',
    speed: { walk: 30, climb: 30 },
    scores: [14, 14, 11, 3, 14, 5, 10, 10],
    senses: { darkvision: 60 },
    challengeRating: 2,
    traits: [feature('Stone Camouflage', 'It has Advantage on Stealth checks in rocky terrain.')],
    actions: [
      multiattack('The grick makes one Beak attack and one Tentacles attack.'),
      attack('Beak', { reach: 5, damage: [['2d6', 'piercing']] }),
      attack('Tentacles', {
        reach: 5,
        damage: [['1d10', 'slashing']],
        extra: 'If the target is Medium or smaller, it has the Grappled condition (escape DC 12).',
      }),
    ],
  }),
  monster('harbour-horror', {
    name: 'Harbour Horror',
    description:
      'A lobster-like thing the size of a cart horse, with pincers and a mouth ringed by ' +
      'paralysing tentacles. It is drawn to running machinery.',
    origin: 'unknown',
    size: 'large',
    creatureType: 'aberration',
    alignment: 'chaotic-evil',
    armorClass: 16,
    soak: [bonus('soak', 1, 6)],
    hitDice: '11d10+33',
    speed: { walk: 30, swim: 30 },
    scores: [19, 10, 16, 5, 11, 5, 10, 10],
    damageImmunities: ['poison'],
    conditionImmunities: ['poisoned'],
    senses: { darkvision: 60 },
    languages: ["Understands English but can't speak"],
    challengeRating: 4,
    traits: [
      feature('Amphibious', 'It can breathe air and water.'),
      feature(
        'Sense Machinery',
        'It senses the location of working apparatus and engines within 120 feet of it.',
      ),
    ],
    actions: [
      multiattack('The horror makes two Pincer attacks and uses Paralysing Tentacles.'),
      attack('Pincer', {
        reach: 10,
        damage: [['2d6', 'bludgeoning']],
        extra: 'If the target is Large or smaller, it has the Grappled condition (escape DC 14).',
      }),
      save('Paralysing Tentacles', {
        save: 'hardiness',
        dcAttribute: 'hardiness',
        target: 'one creature Grappled by the horror',
        failure:
          'The target has the Poisoned condition, and is Paralyzed while Poisoned, for 1 minute. ' +
          'It repeats the save at the end of each of its turns.',
        success: 'Nothing happens.',
      }),
    ],
  }),
  monster('refuse-horror', {
    name: 'Refuse Horror',
    description:
      'A three-legged bloated mouth that lives in city middens and sewage outfalls, lashing ' +
      'out with spiked tentacles.',
    origin: 'mutation',
    size: 'large',
    creatureType: 'aberration',
    alignment: 'neutral',
    armorClass: 14,
    hitDice: '11d10+44',
    speed: { walk: 30 },
    scores: [16, 11, 19, 6, 13, 6, 10, 8],
    saves: ['hardiness'],
    senses: { darkvision: 120 },
    challengeRating: 5,
    actions: [
      multiattack('The horror makes one Bite attack and two Tentacle attacks.'),
      attack('Bite', {
        reach: 5,
        damage: [['2d8', 'piercing']],
        extra:
          'The target must succeed on a Hardiness saving throw against {effect:hardiness} or have the Poisoned ' +
          'condition until it finishes a Long Rest.',
      }),
      attack('Tentacle', {
        reach: 10,
        damage: [
          ['1d8', 'bludgeoning'],
          ['1d8', 'piercing'],
        ],
        extra: 'If the target is Medium or smaller, it has the Grappled condition (escape DC 13).',
      }),
    ],
  }),
  monster('abyssal-progenitor', {
    name: 'Abyssal Progenitor',
    description:
      'An immense, ancient fish-thing in a flooded cistern beneath the city. Its mucus rewrites ' +
      'the flesh of those it touches, and its mind reaches into theirs. It may be where the ' +
      'experiments began.',
    origin: 'unknown',
    size: 'large',
    creatureType: 'aberration',
    alignment: 'lawful-evil',
    armorClass: 17,
    hitDice: '20d10+40',
    speed: { walk: 10, swim: 40 },
    scores: [21, 9, 15, 18, 15, 18, 10, 20],
    saves: ['hardiness', 'intellect', 'wisdom', 'sanity'],
    skills: { history: 'expertise', perception: 'expertise' },
    senses: { darkvision: 120 },
    languages: ['Understands English, Latin and Greek but speaks only into minds'],
    challengeRating: 10,
    traits: [
      feature('Amphibious', 'It can breathe air and water.'),
      horrifyingPresence('charisma'),
      feature(
        'Transforming Mucus',
        'A creature that touches it or is hit by its Tentacle must succeed on a Hardiness ' +
          'saving throw against {effect:hardiness} or begin to change: over 1 minute its skin ' +
          'turns translucent and slimy, ' +
          'and it can breathe only water until cured.',
      ),
    ],
    actions: [
      multiattack('The progenitor makes two Tentacle attacks and uses Enslave if available.'),
      attack('Tentacle', { reach: 15, damage: [['2d6', 'bludgeoning']] }),
      save('Enslave', {
        save: 'sanity',
        dcAttribute: 'charisma',
        target: 'one creature the progenitor can see within 30 feet',
        failure:
          'The target has the Mesmerised condition until the progenitor dies or is more than a mile ' +
          'away, and obeys its silent commands. It repeats the save whenever it takes damage.',
        success: 'Nothing happens.',
        usage: RECHARGE_5,
      }),
    ],
    legendary: {
      uses: 3,
      usesInLair: 4,
      actions: [
        attack('Lash', { reach: 15, damage: [['2d6', 'bludgeoning']] }),
        save('Mind Drain', {
          save: 'sanity',
          dcAttribute: 'charisma',
          target: 'one Mesmerised creature the progenitor can see',
          damage: [['3d6', 'psychic']],
          success: 'Half damage.',
        }),
      ],
    },
  }),
  monster('leviathan-of-the-deep', {
    name: 'Leviathan of the Deep',
    description:
      'Seen once by the crew of a cable-laying ship, who were not believed: a tentacled mass ' +
      'larger than their vessel, rising from a trench where nothing should live.',
    origin: 'unknown',
    size: 'gargantuan',
    creatureType: 'aberration',
    alignment: 'chaotic-evil',
    armorClass: 18,
    soak: [bonus('soak', 1, 10)],
    hitDice: '25d20+175',
    speed: { walk: 30, swim: 120 },
    scores: [30, 11, 25, 22, 18, 20, 10, 24],
    saves: ['might', 'hardiness', 'wisdom', 'sanity'],
    damageImmunities: ['cold', 'lightning'],
    conditionImmunities: ['frightened', 'paralyzed'],
    senses: { darkvision: 120, blindsight: 120 },
    languages: ["Understands English but can't speak"],
    challengeRating: 23,
    traits: [
      feature('Amphibious', 'It can breathe air and water.'),
      horrifyingPresence('charisma'),
      feature('Siege Monster', 'It deals double damage to objects, structures and vessels.'),
    ],
    actions: [
      multiattack('The leviathan makes two Tentacle attacks and one Bite attack.'),
      attack('Bite', {
        reach: 10,
        damage: [['3d8', 'piercing']],
        extra:
          'If the target is Large or smaller, it is swallowed: it has the Blinded and Restrained ' +
          "conditions and takes 42 (12d6) Acid damage at the start of each of the leviathan's " +
          'turns.',
      }),
      attack('Tentacle', {
        reach: 30,
        damage: [['3d6', 'bludgeoning']],
        extra: 'The target has the Grappled condition (escape DC 20).',
      }),
      save('Electric Discharge', {
        save: 'hardiness',
        dcAttribute: 'hardiness',
        target: 'each creature in water within 120 feet of the leviathan',
        damage: [['10d10', 'lightning']],
        usage: RECHARGE_5,
      }),
    ],
    legendary: {
      uses: 3,
      actions: [
        attack('Tentacle', { reach: 30, damage: [['3d6', 'bludgeoning']] }),
        feature(
          'Fling',
          'It throws a Large or smaller creature it is grappling up to 60 feet. The creature ' +
            'lands Prone and takes 1d6 Bludgeoning damage per 10 feet thrown.',
        ),
        feature(
          'Ink Cloud',
          'While underwater, it releases ink in a 60-foot radius that is Heavily Obscured for 1 ' +
            'minute, then moves up to its Swim Speed.',
        ),
      ],
    },
  }),

  // Giants
  monster('acromegalic-brute', {
    name: 'Acromegalic Brute',
    description:
      'A man grown to ten feet by glandular treatments, with oversized jaw and hands, and a ' +
      'temper to match his pain.',
    origin: 'mutation',
    size: 'large',
    creatureType: 'giant',
    alignment: 'chaotic-evil',
    armorClass: 11,
    hitDice: '8d10+16',
    speed: { walk: 40 },
    scores: [19, 8, 16, 5, 7, 7, 10, 8],
    senses: { darkvision: 60 },
    languages: ['English'],
    challengeRating: 2,
    actions: [
      attack('Sledgehammer', { reach: 5, damage: [['2d8', 'bludgeoning']] }),
      attack('Thrown Rubble', {
        attack: 'ranged',
        attribute: 'might',
        range: { normal: 30, long: 120 },
        damage: [['2d6', 'bludgeoning']],
      }),
    ],
  }),
  monster('regenerating-brute', {
    name: 'Regenerating Brute',
    description:
      'A gangling, green-grey giant whose wounds close as you watch. Only fire or acid stops the ' +
      'healing, so they burn the bodies.',
    origin: 'mutation',
    size: 'large',
    creatureType: 'giant',
    alignment: 'chaotic-evil',
    armorClass: 15,
    hitDice: '9d10+45',
    speed: { walk: 30 },
    scores: [18, 13, 20, 7, 9, 7, 10, 6],
    skills: { perception: 'proficient' },
    senses: { darkvision: 60 },
    languages: ['English'],
    challengeRating: 5,
    traits: [
      feature(
        'Regeneration',
        'It regains 15 Hit Points at the start of each of its turns unless it took Acid or Fire ' +
          'damage since its last turn. It dies only if it starts its turn with 0 Hit Points and ' +
          "doesn't regenerate.",
      ),
      feature(
        'Loathsome Limbs',
        'Whenever it takes 15 or more Slashing damage in one turn, one of its limbs is severed and ' +
          "fights on as a separate creature until the brute's next turn.",
      ),
    ],
    actions: [
      multiattack('The brute makes three Rend attacks.'),
      attack('Rend', { reach: 10, damage: [['2d6', 'slashing']] }),
    ],
  }),
];
