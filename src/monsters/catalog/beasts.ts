import { bonus } from '../../core/rollModifiers';
import type { MonsterStatBlock } from '../statBlock';
import { RECHARGE_5, attack, feature, monster, multiattack, save } from './builders';

const PACK_TACTICS = feature(
  'Pack Tactics',
  'It has Advantage on attack rolls against a creature if at least one of its allies is within ' +
    '5 feet of the creature and the ally does not have the Incapacitated condition.',
);

/** Natural animals, and animals that something has altered. */
export const BEASTS: readonly MonsterStatBlock[] = [
  monster('wolf', {
    name: 'Wolf',
    description: 'A grey wolf of the northern forests, hunting in packs.',
    origin: 'natural',
    size: 'medium',
    creatureType: 'beast',
    alignment: 'unaligned',
    armorClass: 12,
    hitDice: '2d8+2',
    speed: { walk: 40 },
    scores: [14, 15, 12, 3, 12, 6, 10, 10],
    skills: { perception: 'proficient', stealth: 'proficient' },
    senses: { darkvision: 60 },
    challengeRating: 1 / 4,
    traits: [PACK_TACTICS],
    actions: [
      attack('Bite', {
        reach: 5,
        damage: [['1d6', 'piercing']],
        extra: 'If the target is Medium or smaller, it has the Prone condition.',
      }),
    ],
  }),
  monster('brown-bear', {
    name: 'Brown Bear',
    description: 'A great bear of the forests and mountains.',
    origin: 'natural',
    size: 'large',
    creatureType: 'beast',
    alignment: 'unaligned',
    armorClass: 11,
    hitDice: '3d10+6',
    speed: { walk: 40, climb: 30 },
    scores: [19, 10, 16, 2, 13, 7, 10, 10],
    skills: { perception: 'proficient' },
    senses: { darkvision: 60 },
    challengeRating: 1,
    actions: [
      multiattack('The bear makes one Bite attack and one Claw attack.'),
      attack('Bite', { reach: 5, damage: [['1d8', 'piercing']] }),
      attack('Claw', {
        reach: 5,
        damage: [['1d4', 'slashing']],
        extra: 'If the target is Large or smaller, it has the Prone condition.',
      }),
    ],
  }),
  monster('bloated-rat', {
    name: 'Bloated Rat',
    description:
      'A sewer rat the size of a terrier, swollen by whatever has been poured into the drains.',
    origin: 'mutation',
    size: 'small',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 13,
    hitDice: '2d6',
    speed: { walk: 30 },
    scores: [7, 16, 11, 2, 10, 4, 10, 10],
    skills: { perception: 'proficient' },
    senses: { darkvision: 60 },
    challengeRating: 1 / 8,
    traits: [PACK_TACTICS],
    actions: [attack('Bite', { attribute: 'agility', reach: 5, damage: [['1d4', 'piercing']] })],
  }),
  monster('plague-rat-swarm', {
    name: 'Plague Rat Swarm',
    description: 'A seething tide of diseased rats, pouring out of the walls.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'beast',
    tags: ['Swarm'],
    alignment: 'unaligned',
    armorClass: 10,
    hitDice: '7d8-7',
    speed: { walk: 30, climb: 30 },
    scores: [9, 11, 9, 2, 10, 3, 10, 10],
    resistances: ['bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: [
      'mesmerised',
      'frightened',
      'grappled',
      'paralyzed',
      'calcified',
      'prone',
      'restrained',
      'stunned',
    ],
    senses: { darkvision: 30 },
    challengeRating: 1 / 4,
    traits: [
      feature(
        'Swarm',
        "The swarm can occupy another creature's space and can move through any opening large " +
          "enough for a Tiny rat. It can't regain Hit Points.",
      ),
    ],
    actions: [
      attack('Bites', {
        attribute: 'agility',
        reach: 5,
        damage: [['2d4', 'piercing']],
        extra:
          'The target must succeed on a Hardiness saving throw against {effect:hardiness} or have the Poisoned ' +
          'condition until the end of its next turn.',
      }),
    ],
  }),
  monster('bloodfly', {
    name: 'Bloodfly',
    description: 'A mosquito grown to the size of a sparrow, with a proboscis like a needle.',
    origin: 'mutation',
    size: 'tiny',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 13,
    hitDice: '1d4',
    speed: { walk: 10, fly: 40 },
    scores: [4, 16, 11, 2, 8, 6, 10, 10],
    senses: { darkvision: 60 },
    challengeRating: 1 / 8,
    actions: [
      attack('Proboscis', {
        attribute: 'agility',
        reach: 5,
        damage: [['1d4', 'piercing']],
        extra:
          'The bloodfly attaches to the target and drains 5 (1d4 + 3) Hit Points at the start ' +
          'of each of its turns until it is pulled off (no check) or has drained 10 Hit Points.',
      }),
    ],
  }),
  monster('corrosion-beetle', {
    name: 'Corrosion Beetle',
    description:
      'A beetle the size of a pony that secretes an enzyme which turns iron to rust in moments. ' +
      'Machinists fear it more than any predator.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 14,
    soak: [bonus('soak', 1, 4)],
    hitDice: '5d8+5',
    speed: { walk: 40 },
    scores: [13, 12, 13, 2, 13, 6, 10, 10],
    senses: { darkvision: 60 },
    challengeRating: 1 / 2,
    traits: [
      feature(
        'Iron Scent',
        'The beetle can pinpoint, by scent, the location of iron or steel within 30 feet of it.',
      ),
      feature(
        'Corrosive Shell',
        'An iron or steel weapon that hits the beetle corrodes, and is destroyed after five ' +
          'such hits. Ammunition that hits it is destroyed.',
      ),
    ],
    actions: [
      attack('Bite', { reach: 5, damage: [['1d8', 'piercing']] }),
      feature(
        'Corrode',
        'The beetle touches an iron or steel object within 5 feet of it. If the object is worn or ' +
          'carried, its owner can make an Agility saving throw to pull it away. Otherwise ' +
          'armour gives 1 less defense (it is destroyed when it gives none), a weapon ' +
          'corrodes as with Corrosive Shell, and an unattended object up to a 5-foot Cube ' +
          'corrodes away.',
      ),
    ],
  }),
  monster('engorged-spider', {
    name: 'Engorged Spider',
    description: 'A spider as large as a carriage horse, spinning webs across abandoned mills.',
    origin: 'mutation',
    size: 'large',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 14,
    hitDice: '4d10+4',
    speed: { walk: 30, climb: 30 },
    scores: [14, 16, 12, 2, 11, 4, 10, 10],
    skills: { perception: 'proficient', stealth: 'expertise' },
    senses: { darkvision: 60 },
    challengeRating: 1,
    traits: [
      feature(
        'Spider Climb',
        'It can climb difficult surfaces, including ceilings, without a check.',
      ),
      feature('Web Walker', 'It ignores movement restrictions caused by webs.'),
    ],
    actions: [
      attack('Bite', {
        attribute: 'agility',
        reach: 5,
        damage: [
          ['1d8', 'piercing'],
          ['2d8', 'poison'],
        ],
      }),
      save('Web', {
        save: 'agility',
        dcAttribute: 'hardiness',
        target: 'one creature the spider can see within 60 feet',
        failure:
          'The target has the Restrained condition until the web is destroyed (5 Hit ' +
          'Points, Vulnerable to Fire) or it escapes with a DC 12 Might (Athletics) check.',
        success: 'Nothing happens.',
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('hybrid-wolf', {
    name: 'Hybrid Wolf',
    description:
      'A wolf bred with something larger and more patient. It hunts like a pack animal and ' +
      'thinks like a stalker.',
    origin: 'hybrid',
    size: 'large',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 14,
    hitDice: '5d10+10',
    speed: { walk: 50 },
    scores: [17, 15, 15, 3, 12, 7, 10, 10],
    skills: { perception: 'proficient', stealth: 'proficient' },
    senses: { darkvision: 60 },
    challengeRating: 1,
    traits: [PACK_TACTICS],
    actions: [
      attack('Bite', {
        reach: 5,
        damage: [['1d10', 'piercing']],
        extra: 'If the target is Huge or smaller, it has the Prone condition.',
      }),
    ],
  }),
  monster('harpy', {
    name: 'Harpy',
    description:
      'A woman grafted with the wings and talons of a vulture. Her song is pitched below hearing ' +
      'and pulls listeners toward her.',
    origin: 'hybrid',
    size: 'medium',
    creatureType: 'monstrosity',
    alignment: 'chaotic-evil',
    armorClass: 11,
    hitDice: '7d8',
    speed: { walk: 20, fly: 40 },
    scores: [12, 13, 12, 7, 10, 13, 10, 8],
    senses: { darkvision: 60 },
    languages: ['English'],
    challengeRating: 1,
    actions: [
      attack('Talons', { reach: 5, damage: [['2d4', 'slashing']] }),
      save('Luring Song', {
        save: 'sanity',
        dcAttribute: 'charisma',
        target: 'each humanoid within 300 feet that can hear the song',
        failure:
          'The target has the Mesmerised condition until the song ends, and on its turns moves ' +
          'toward the harpy by the most direct route. It repeats the save whenever it takes ' +
          'damage. The harpy can keep singing as a Bonus Action on later turns.',
        success: "The target is immune to this harpy's song for 24 hours.",
      }),
    ],
  }),
  monster('quillback', {
    name: 'Quillback',
    description:
      "A lion-bodied thing with leathery wings, a man's leering face and a tail that fires " +
      'bony quills. It talks, and enjoys it.',
    origin: 'hybrid',
    size: 'large',
    creatureType: 'monstrosity',
    alignment: 'lawful-evil',
    armorClass: 14,
    hitDice: '8d10+24',
    speed: { walk: 30, fly: 50 },
    scores: [17, 16, 17, 7, 12, 8, 10, 8],
    senses: { darkvision: 60 },
    languages: ['English'],
    challengeRating: 3,
    actions: [
      multiattack(
        'The quillback makes three attacks, using Rend or Tail Quill in any combination.',
      ),
      attack('Rend', { reach: 5, damage: [['1d8', 'slashing']] }),
      attack('Tail Quill', {
        attack: 'ranged',
        range: { normal: 100, long: 200 },
        damage: [['1d8', 'piercing']],
        extra: 'The barbed quill leaves the target with the Bleeding condition.',
      }),
    ],
  }),
  monster('ursine-chimera', {
    name: 'Ursine Chimera',
    description:
      'A grizzly bear grafted with the hooked beak and feathered hide of a great raptor. It ' +
      'screeches like an eagle and kills like a bear.',
    origin: 'hybrid',
    size: 'large',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 13,
    hitDice: '7d10+21',
    speed: { walk: 40, climb: 40 },
    scores: [20, 12, 17, 3, 12, 7, 10, 10],
    skills: { perception: 'proficient' },
    senses: { darkvision: 60 },
    challengeRating: 3,
    actions: [
      multiattack('The chimera makes two Rend attacks.'),
      attack('Rend', {
        reach: 5,
        damage: [['2d8', 'slashing']],
        extra: 'The target has the Bleeding condition.',
      }),
    ],
  }),
  monster('petrifying-lizard', {
    name: 'Petrifying Lizard',
    description:
      'An eight-legged lizard whose spittle carries dissolved minerals that set in living tissue ' +
      'like plaster. Its lair is full of calcified victims.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 15,
    hitDice: '8d8+16',
    speed: { walk: 20 },
    scores: [16, 8, 15, 2, 8, 7, 10, 10],
    senses: { darkvision: 60 },
    challengeRating: 3,
    actions: [
      attack('Bite', {
        reach: 5,
        damage: [
          ['2d6', 'piercing'],
          ['2d6', 'poison'],
        ],
      }),
      save('Calcifying Spittle', {
        save: 'hardiness',
        dcAttribute: 'hardiness',
        target: 'each creature in a 15-foot Cone',
        failure:
          'The target has the Restrained condition as its flesh stiffens, and repeats the save ' +
          'at the end of its next turn. On a second failure, it has the Calcified condition ' +
          'until an antidote dissolves the mineral.',
        success: 'Nothing happens.',
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('bull-man', {
    name: 'Bull-Man',
    description:
      'A hulking man with the horned head and shoulders of a bull, bred for labour and kept for ' +
      'blood sport.',
    origin: 'hybrid',
    size: 'large',
    creatureType: 'monstrosity',
    alignment: 'chaotic-evil',
    armorClass: 14,
    hitDice: '10d10+30',
    speed: { walk: 40 },
    scores: [18, 11, 16, 6, 16, 9, 10, 8],
    skills: { perception: 'expertise' },
    senses: { darkvision: 60 },
    languages: ["Understands English but can't speak"],
    challengeRating: 3,
    actions: [
      attack('Felling Axe', { reach: 10, damage: [['2d12', 'slashing']] }),
      attack('Gore', {
        reach: 5,
        damage: [['4d8', 'piercing']],
        extra:
          'If it moved at least 10 feet straight toward the target first, the target is pushed ' +
          '10 feet and has the Prone condition.',
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('incendiary-hound', {
    name: 'Incendiary Hound',
    description:
      'A mastiff with naphtha glands in its throat and a flint-like jaw that strikes sparks as ' +
      'it breathes.',
    origin: 'mutation',
    size: 'medium',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 15,
    hitDice: '7d8+14',
    speed: { walk: 50 },
    scores: [17, 12, 14, 6, 13, 6, 10, 10],
    skills: { perception: 'proficient' },
    damageImmunities: ['fire'],
    senses: { darkvision: 60 },
    challengeRating: 3,
    traits: [PACK_TACTICS],
    actions: [
      multiattack('The hound makes two Bite attacks.'),
      attack('Bite', {
        reach: 5,
        damage: [
          ['1d8', 'piercing'],
          ['1d6', 'fire'],
        ],
      }),
      save('Naphtha Breath', {
        save: 'agility',
        dcAttribute: 'hardiness',
        target: 'each creature in a 15-foot Cone',
        damage: [['5d6', 'fire']],
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('laboratory-chimera', {
    name: 'Laboratory Chimera',
    description:
      'Lion, goat and serpent sewn into one body, with a reservoir of flammable oil feeding the ' +
      "goat's mouth. Proof that someone has been working at scale.",
    origin: 'hybrid',
    size: 'large',
    creatureType: 'monstrosity',
    alignment: 'chaotic-evil',
    armorClass: 14,
    hitDice: '13d10+52',
    speed: { walk: 30, fly: 60 },
    scores: [19, 11, 19, 3, 14, 10, 10, 8],
    skills: { perception: 'expertise' },
    senses: { darkvision: 60 },
    challengeRating: 6,
    actions: [
      multiattack(
        'The chimera makes one Ram, one Bite and one Claw attack. It can replace the Bite with Fire Breath if available.',
      ),
      attack('Bite', { reach: 5, damage: [['2d6', 'piercing']] }),
      attack('Claw', { reach: 5, damage: [['2d6', 'slashing']] }),
      attack('Ram', {
        reach: 5,
        damage: [['1d12', 'bludgeoning']],
        extra: 'If the target is Medium or smaller, it has the Prone condition.',
      }),
      save('Fire Breath', {
        save: 'agility',
        dcAttribute: 'hardiness',
        target: 'each creature in a 15-foot Cone',
        damage: [['7d8', 'fire']],
        usage: RECHARGE_5,
      }),
    ],
  }),
  monster('wyvern', {
    name: 'Wyvern',
    description:
      'A great winged reptile, bred from monitor lizards and something that should have stayed ' +
      'extinct. Its tail carries a venomous sting.',
    origin: 'mutation',
    size: 'large',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 14,
    hitDice: '13d10+39',
    speed: { walk: 20, fly: 80 },
    scores: [19, 10, 16, 5, 12, 6, 10, 10],
    skills: { perception: 'expertise' },
    senses: { darkvision: 120 },
    challengeRating: 6,
    actions: [
      multiattack('The wyvern makes one Bite attack and one Sting attack.'),
      attack('Bite', { reach: 10, damage: [['2d8', 'piercing']] }),
      attack('Sting', {
        reach: 10,
        damage: [
          ['2d6', 'piercing'],
          ['7d6', 'poison'],
        ],
        extra: 'The target has the Poisoned condition until the end of its next turn.',
      }),
    ],
  }),
  monster('regenerating-serpent', {
    name: 'Regenerating Serpent',
    description:
      'A many-headed serpent of the fens. Cut off a head and two grow back from the stump, ' +
      'unless the wound is cauterised.',
    origin: 'mutation',
    size: 'huge',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 15,
    hitDice: '15d12+75',
    speed: { walk: 30, swim: 30 },
    scores: [20, 12, 20, 2, 10, 7, 10, 10],
    skills: { perception: 'expertise' },
    senses: { darkvision: 60 },
    challengeRating: 8,
    traits: [
      feature('Hold Breath', 'It can hold its breath for 1 hour.'),
      feature(
        'Hyper-Regeneration',
        'The serpent has five heads. Whenever it takes 25 or more damage on a single turn, one ' +
          'head dies. At the end of its turn, it grows two heads for each head that died since ' +
          'its last turn, unless it has taken Fire or Acid damage since then. It dies if all its ' +
          'heads are dead.',
      ),
    ],
    actions: [
      multiattack('The serpent makes as many Bite attacks as it has heads.'),
      attack('Bite', { reach: 10, damage: [['1d10', 'piercing']] }),
    ],
  }),
  monster('burrowing-leviathan', {
    name: 'Burrowing Leviathan',
    description:
      'A segmented worm big enough to swallow an omnibus, first sighted when a coal seam ' +
      'collapsed. Nobody knows how deep it goes.',
    origin: 'mutation',
    size: 'gargantuan',
    creatureType: 'monstrosity',
    alignment: 'unaligned',
    armorClass: 18,
    soak: [bonus('soak', 1, 8)],
    hitDice: '16d20+80',
    speed: { walk: 50, burrow: 50 },
    scores: [28, 7, 22, 1, 8, 4, 10, 10],
    saves: ['hardiness', 'wisdom'],
    senses: { blindsight: 30, tremorsense: 60 },
    challengeRating: 15,
    traits: [
      feature(
        'Tunneler',
        'It can burrow through solid rock at half its Burrow Speed, leaving a 10-foot-wide tunnel.',
      ),
    ],
    actions: [
      multiattack('The leviathan makes one Bite attack and one Tail Stinger attack.'),
      attack('Bite', {
        reach: 10,
        damage: [['3d8', 'piercing']],
        extra:
          'If the target is Large or smaller, it is swallowed: it has the Blinded and Restrained ' +
          "conditions and takes 15 (6d4) Acid damage at the start of each of the leviathan's " +
          'turns.',
      }),
      attack('Tail Stinger', {
        reach: 10,
        damage: [
          ['3d6', 'piercing'],
          ['10d6', 'poison'],
        ],
      }),
    ],
  }),
];
