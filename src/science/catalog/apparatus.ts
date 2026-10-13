import { lsd } from '../../core/currency';
import { dice } from '../../core/dice';
import {
  DEFAULT_RECHARGE,
  type ApparatusDefinition,
  type ApparatusEffect,
  type Recharge,
} from '../apparatus';
import { INSTANTANEOUS, SELF, TOUCH, feet, lasting, slug, sustained } from './builders';

type EffectInput = Omit<ApparatusEffect, 'id'>;

interface DeviceInput extends Omit<ApparatusDefinition, 'id' | 'category' | 'charges' | 'effects'> {
  /** Omit for devices whose effects are all at will. */
  maxCharges?: number;
  /** Defaults to the power source's usual recharge. */
  recharge?: Recharge;
  effects: readonly EffectInput[];
}

function device(id: string, input: DeviceInput): ApparatusDefinition {
  const { maxCharges, recharge, effects, ...rest } = input;
  return {
    id,
    category: 'apparatus',
    ...rest,
    charges:
      maxCharges === undefined
        ? null
        : { max: maxCharges, recharge: recharge ?? DEFAULT_RECHARGE[input.power] },
    effects: effects.map((effect) => ({ id: slug(effect.name), ...effect })),
  };
}

export const APPARATUS: readonly ApparatusDefinition[] = [
  // At-will devices
  device('aether-lamp', {
    name: 'Aether Lamp',
    description: 'A brass lantern with a glass bulb that glows with a cold, steady light.',
    discipline: 'optics',
    power: 'galvanic',
    weightLb: 2,
    cost: lsd(1, 10),
    rarity: 'common',
    effects: [
      {
        name: 'Illuminate',
        cost: 'action',
        charges: 0,
        range: SELF,
        duration: lasting(1, 'hour'),
        description:
          'The lamp sheds Bright Light in a 20-foot radius and Dim Light for 20 feet beyond.',
      },
    ],
  }),
  device('galvanic-gauntlet', {
    name: 'Galvanic Gauntlet',
    description: 'A leather gauntlet wired to a belt battery, with copper contacts on the palm.',
    discipline: 'galvanism',
    power: 'galvanic',
    weightLb: 3,
    cost: lsd(8),
    rarity: 'uncommon',
    effects: [
      {
        name: 'Shock',
        cost: 'action',
        charges: 0,
        range: TOUCH,
        duration: INSTANTANEOUS,
        attack: 'melee',
        damage: [{ dice: dice(1, 8), type: 'lightning' }],
        description:
          "On a hit, the target can't take Reactions until the start of its next turn. You have " +
          'Advantage on the attack if the target is wearing metal armor.',
      },
    ],
  }),
  device('phosphorus-dart-pistol', {
    name: 'Phosphorus Dart Pistol',
    description: 'An air pistol that fires darts tipped with white phosphorus.',
    discipline: 'chemistry',
    power: 'chemical',
    weightLb: 3,
    cost: lsd(6),
    rarity: 'uncommon',
    effects: [
      {
        name: 'Phosphorus Dart',
        cost: 'action',
        charges: 0,
        range: feet(120),
        duration: INSTANTANEOUS,
        attack: 'ranged',
        damage: [{ dice: dice(1, 10), type: 'fire' }],
        description:
          "A flammable object hit by the dart starts burning if it isn't being worn or carried.",
      },
    ],
  }),
  device('liquid-air-sprayer', {
    name: 'Liquid Air Sprayer',
    description: 'A vacuum flask of liquefied air with a pressurized nozzle.',
    discipline: 'chemistry',
    power: 'chemical',
    weightLb: 4,
    cost: lsd(10),
    rarity: 'uncommon',
    effects: [
      {
        name: 'Freezing Spray',
        cost: 'action',
        charges: 0,
        range: feet(60),
        duration: INSTANTANEOUS,
        attack: 'ranged',
        damage: [{ dice: dice(1, 8), type: 'cold' }],
        description:
          "On a hit, the target's Speed is reduced by 10 feet until the start of your next turn.",
      },
    ],
  }),
  device('telescoping-grabber', {
    name: 'Telescoping Grabber',
    description: 'A clockwork arm on a lazy-tongs frame, worked by levers at the wrist.',
    discipline: 'mechanics',
    power: 'clockwork',
    weightLb: 5,
    cost: lsd(3),
    rarity: 'common',
    effects: [
      {
        name: 'Extend Grabber',
        cost: 'action',
        charges: 0,
        range: feet(30),
        duration: lasting(1, 'minute'),
        description:
          'The arm can pick up, move, open or close an object weighing up to 10 pounds, but ' +
          "can't attack. You control it with a Utilize action each turn.",
      },
    ],
  }),

  // Charged devices
  device('phantasmagoria-projector', {
    name: 'Phantasmagoria Projector',
    description: 'A lantern of lenses and painted slides that throws ghosts onto smoke and walls.',
    discipline: 'optics',
    power: 'galvanic',
    weightLb: 12,
    cost: lsd(40),
    rarity: 'rare',
    maxCharges: 4,
    effects: [
      {
        name: 'Projection',
        cost: 'action',
        charges: 0,
        range: feet(30),
        duration: lasting(1, 'minute'),
        description:
          'You project the image of an object no larger than a 5-foot Cube, or play a recorded ' +
          'sound. A creature that studies it can see through it with an Intellect ' +
          '(Investigation) check against your operator DC.',
      },
      {
        name: 'Phantasmagoria',
        cost: 'action',
        charges: 3,
        range: feet(120),
        area: { shape: 'cube', size: 20 },
        duration: sustained(10, 'minute'),
        description:
          'You project a moving image of a creature, object or scene within the Cube, with sound ' +
          'and smoke. A creature that studies it can see through it with an Intellect ' +
          '(Investigation) check against your operator DC.',
      },
    ],
  }),
  device('mesmeric-pendant', {
    name: 'Mesmeric Pendant',
    description:
      'A silver pendant with a lodestone core that, swung just so, channels animal magnetism.',
    discipline: 'mesmerism',
    power: 'aetheric',
    weightLb: 0.5,
    cost: lsd(50),
    rarity: 'rare',
    maxCharges: 6,
    effects: [
      {
        name: 'Fascinate',
        cost: 'action',
        charges: 1,
        range: feet(30),
        duration: lasting(1, 'hour'),
        savingThrow: 'wisdom',
        description:
          'A humanoid you can see makes a Wisdom saving throw, with Advantage if you or your ' +
          'allies are fighting it. On a failure, it is Charmed by you until the effect ends or ' +
          'you or your allies harm it. Afterwards it knows it was mesmerized.',
        overcharge: 'One more humanoid for each extra charge.',
      },
      {
        name: 'Command',
        cost: 'action',
        charges: 1,
        range: feet(60),
        duration: INSTANTANEOUS,
        savingThrow: 'wisdom',
        description:
          'A creature you can see makes a Wisdom saving throw. On a failure, it obeys a ' +
          'one-word command (approach, drop, flee, grovel or halt) on its next turn.',
        overcharge: 'One more creature for each extra charge.',
      },
      {
        name: 'Suggestion',
        cost: 'action',
        charges: 2,
        range: feet(30),
        duration: sustained(8, 'hour'),
        savingThrow: 'wisdom',
        description:
          'A creature you can see that can hear and understand you makes a Wisdom saving throw. ' +
          'On a failure, it follows a reasonable-sounding course of action you suggest in no more ' +
          'than 25 words.',
      },
      {
        name: 'Domination',
        cost: 'action',
        charges: 5,
        range: feet(60),
        duration: sustained(1, 'minute'),
        savingThrow: 'wisdom',
        description:
          'A humanoid you can see makes a Wisdom saving throw. On a failure, it is Charmed and ' +
          'obeys your spoken commands. It repeats the save each time it takes damage.',
        overcharge: 'The duration becomes 10 minutes for one extra charge, or 1 hour for two.',
      },
    ],
  }),
  device('concussion-horn', {
    name: 'Concussion Horn',
    description: 'A steam-driven horn that releases a single crushing blast of sound.',
    discipline: 'acoustics',
    power: 'steam',
    weightLb: 8,
    cost: lsd(15),
    rarity: 'uncommon',
    maxCharges: 3,
    effects: [
      {
        name: 'Concussion Blast',
        cost: 'action',
        charges: 1,
        range: SELF,
        area: { shape: 'cube', size: 15 },
        duration: INSTANTANEOUS,
        savingThrow: 'hardiness',
        damage: [{ dice: dice(2, 8), type: 'thunder' }],
        description:
          'Each creature in a 15-foot Cube originating from you makes a Hardiness saving throw. ' +
          'On a failure, it takes the damage and is pushed 10 feet away; on a success, it takes ' +
          'half damage. The blast is audible 300 feet away.',
        overcharge: '+1d8 Thunder damage for each extra charge.',
      },
    ],
  }),
  device('flame-projector', {
    name: 'Flame Projector',
    description: 'A backpack tank of naphtha feeding a nozzle with a pilot flame.',
    discipline: 'chemistry',
    power: 'chemical',
    weightLb: 25,
    cost: lsd(25),
    rarity: 'uncommon',
    maxCharges: 3,
    effects: [
      {
        name: 'Gout of Flame',
        cost: 'action',
        charges: 1,
        range: SELF,
        area: { shape: 'cone', length: 15 },
        duration: INSTANTANEOUS,
        savingThrow: 'agility',
        damage: [{ dice: dice(3, 6), type: 'fire' }],
        description:
          'Each creature in the Cone makes an Agility saving throw, taking the damage on a ' +
          'failure or half on a success. Unattended flammable objects in the Cone start burning.',
        overcharge: '+1d6 Fire damage for each extra charge.',
      },
    ],
  }),
  device('arc-thrower', {
    name: 'Arc Thrower',
    description: 'A pistol-gripped coil that throws arcs of electricity which seek out bodies.',
    discipline: 'galvanism',
    power: 'galvanic',
    weightLb: 4,
    cost: lsd(35),
    rarity: 'uncommon',
    maxCharges: 4,
    effects: [
      {
        name: 'Seeking Arcs',
        cost: 'action',
        charges: 1,
        range: feet(120),
        duration: INSTANTANEOUS,
        damage: [{ dice: dice(1, 4, 1), type: 'lightning' }],
        description:
          'Three arcs leap from the coil. Each automatically hits a creature of your choice that ' +
          'you can see within range, dealing the damage. Arcs can strike the same creature.',
        overcharge: 'One more arc for each extra charge.',
      },
    ],
  }),
  device('spring-loaded-shield', {
    name: 'Spring-Loaded Shield',
    description: 'A folded fan of steel plates on the forearm that snaps open in an instant.',
    discipline: 'mechanics',
    power: 'clockwork',
    weightLb: 4,
    cost: lsd(12),
    rarity: 'uncommon',
    maxCharges: 2,
    effects: [
      {
        name: 'Snap Open',
        cost: 'reaction',
        trigger: 'you are hit by an attack roll',
        charges: 1,
        range: SELF,
        duration: lasting(1, 'round'),
        description:
          'You gain a +5 bonus to AC until the start of your next turn, including against the ' +
          'triggering attack.',
      },
    ],
  }),
  device('spring-heeled-boots', {
    name: 'Spring-Heeled Boots',
    description: 'Boots with coiled steel springs in the heels, like those of the legendary Jack.',
    discipline: 'mechanics',
    power: 'clockwork',
    weightLb: 4,
    cost: lsd(10),
    rarity: 'uncommon',
    maxCharges: 3,
    effects: [
      {
        name: 'Spring Leap',
        cost: 'bonus-action',
        charges: 1,
        range: SELF,
        duration: lasting(1, 'minute'),
        description:
          'Your jump distance is tripled, and you can jump up to 30 feet by spending 10 feet of ' +
          'movement.',
      },
    ],
  }),
  device('rousing-gramophone', {
    name: 'Rousing Gramophone',
    description: 'A portable gramophone with a wax cylinder of stirring martial music.',
    discipline: 'acoustics',
    power: 'clockwork',
    weightLb: 10,
    cost: lsd(6),
    rarity: 'uncommon',
    maxCharges: 2,
    effects: [
      {
        name: 'Martial Air',
        cost: 'action',
        charges: 1,
        range: feet(30),
        duration: sustained(1, 'minute'),
        description:
          'Up to three creatures within range that can hear the music add 1d4 to their attack ' +
          'rolls and saving throws.',
        overcharge: 'One more creature for each extra charge.',
      },
    ],
  }),
  device('syringe-pistol', {
    name: 'Syringe Pistol',
    description: 'An air pistol that fires darts loaded with a fast-acting stimulant.',
    discipline: 'chemistry',
    power: 'chemical',
    weightLb: 2,
    cost: lsd(15),
    rarity: 'uncommon',
    maxCharges: 3,
    effects: [
      {
        name: 'Stimulant Dart',
        cost: 'bonus-action',
        charges: 1,
        range: feet(60),
        duration: INSTANTANEOUS,
        description:
          'A willing creature you can see regains 2d4 Hit Points plus your Intellect modifier.',
        overcharge: '+2d4 Hit Points for each extra charge.',
      },
    ],
  }),
  device('galvanic-paralyser', {
    name: 'Galvanic Paralyser',
    description: 'A pair of electrode prongs that overwhelm the nerves with current.',
    discipline: 'galvanism',
    power: 'galvanic',
    weightLb: 3,
    cost: lsd(60),
    rarity: 'rare',
    maxCharges: 4,
    effects: [
      {
        name: 'Nerve Lock',
        cost: 'action',
        charges: 2,
        range: feet(60),
        duration: sustained(1, 'minute'),
        savingThrow: 'hardiness',
        description:
          'A humanoid you can see makes a Hardiness saving throw or is Paralyzed. It repeats the ' +
          'save at the end of each of its turns, ending the effect on a success.',
        overcharge: 'One more humanoid for each extra charge.',
      },
    ],
  }),
  device('refraction-cloak', {
    name: 'Refraction Cloak',
    description: 'A cloak of fine wire mesh that bends light around the wearer, imperfectly.',
    discipline: 'optics',
    power: 'aetheric',
    weightLb: 3,
    cost: lsd(400),
    rarity: 'prototype',
    maxCharges: 6,
    effects: [
      {
        name: 'Bend Light',
        cost: 'action',
        charges: 2,
        range: SELF,
        duration: sustained(1, 'hour'),
        description:
          'You have the Invisible condition until the effect ends, or until you make an attack ' +
          'roll, deal damage or use another apparatus.',
      },
      {
        name: 'Total Refraction',
        cost: 'action',
        charges: 4,
        range: SELF,
        duration: sustained(1, 'minute'),
        description: 'You have the Invisible condition until the effect ends.',
      },
    ],
  }),
  device('nocturnal-goggles', {
    name: 'Nocturnal Goggles',
    description: 'Goggles with phosphor-coated lenses that gather the faintest light.',
    discipline: 'optics',
    power: 'chemical',
    weightLb: 1,
    cost: lsd(20),
    rarity: 'uncommon',
    maxCharges: 2,
    effects: [
      {
        name: 'Night Sight',
        cost: 'action',
        charges: 2,
        range: SELF,
        duration: lasting(8, 'hour'),
        description: 'You have Darkvision with a range of 150 feet.',
      },
    ],
  }),
  device('resonance-emitter', {
    name: 'Resonance Emitter',
    description: 'A tuning cylinder that finds the frequency at which things shatter.',
    discipline: 'acoustics',
    power: 'galvanic',
    weightLb: 6,
    cost: lsd(60),
    rarity: 'rare',
    maxCharges: 4,
    effects: [
      {
        name: 'Resonance Burst',
        cost: 'action',
        charges: 2,
        range: feet(60),
        area: { shape: 'sphere', radius: 10 },
        duration: INSTANTANEOUS,
        savingThrow: 'hardiness',
        damage: [{ dice: dice(3, 8), type: 'thunder' }],
        description:
          'Each creature in the Sphere makes a Hardiness saving throw, taking the damage on a ' +
          'failure or half on a success. Constructs have Disadvantage on the save. Unattended ' +
          'brittle objects in the area are destroyed.',
        overcharge: '+1d8 Thunder damage for each extra charge.',
      },
    ],
  }),
  device('pneumatic-blower', {
    name: 'Pneumatic Blower',
    description: 'A steam compressor with a wide brass nozzle.',
    discipline: 'mechanics',
    power: 'steam',
    weightLb: 20,
    cost: lsd(20),
    rarity: 'uncommon',
    maxCharges: 4,
    effects: [
      {
        name: 'Gale',
        cost: 'action',
        charges: 2,
        range: SELF,
        area: { shape: 'line', length: 60, width: 10 },
        duration: sustained(1, 'minute'),
        savingThrow: 'might',
        description:
          'A blast of air fills the Line. Each creature that starts its turn there makes a Might ' +
          'saving throw or is pushed 15 feet along it. Moving toward you through the Line costs ' +
          'double movement, and it disperses gas, smoke and unprotected flames.',
      },
    ],
  }),
  device('tesla-lance', {
    name: 'Tesla Lance',
    description: 'A man-sized coil lance trailing cables to a battery cart.',
    discipline: 'galvanism',
    power: 'galvanic',
    weightLb: 40,
    cost: lsd(300),
    rarity: 'prototype',
    maxCharges: 6,
    effects: [
      {
        name: 'Lightning Discharge',
        cost: 'action',
        charges: 3,
        range: SELF,
        area: { shape: 'line', length: 100, width: 5 },
        duration: INSTANTANEOUS,
        savingThrow: 'agility',
        damage: [{ dice: dice(8, 6), type: 'lightning' }],
        description:
          'Each creature in the Line makes an Agility saving throw, taking the damage on a ' +
          'failure or half on a success.',
        overcharge: '+1d6 Lightning damage for each extra charge.',
      },
    ],
  }),
  device('steam-ornithopter', {
    name: 'Steam Ornithopter Harness',
    description: 'A harness of canvas wings beaten by a compact steam engine.',
    discipline: 'mechanics',
    power: 'steam',
    weightLb: 45,
    cost: lsd(500),
    rarity: 'prototype',
    maxCharges: 3,
    effects: [
      {
        name: 'Take Wing',
        cost: 'action',
        charges: 3,
        range: SELF,
        duration: sustained(10, 'minute'),
        description:
          'You gain a Fly Speed of 60 feet. When the effect ends, you fall if you are still ' +
          'aloft.',
      },
    ],
  }),
  device('galvanic-reanimator', {
    name: 'Galvanic Reanimator',
    description:
      'A battery chest with leads and electrodes, built on the notorious experiments of the age.',
    discipline: 'galvanism',
    power: 'galvanic',
    weightLb: 50,
    cost: lsd(1000),
    rarity: 'prototype',
    maxCharges: 5,
    effects: [
      {
        name: 'Galvanic Revival',
        cost: 'action',
        charges: 3,
        range: TOUCH,
        duration: INSTANTANEOUS,
        description:
          'A creature that died within the last minute returns to life with 1 Hit Point. This ' +
          "doesn't work on a creature that died of old age or is missing vital organs.",
      },
      {
        name: 'Corpse Interrogation',
        cost: 'action',
        charges: 3,
        range: TOUCH,
        duration: lasting(10, 'minute'),
        description:
          'Current makes a corpse with a mouth twitch into speech. It answers up to five ' +
          'questions with what it knew in life, briefly and cryptically.',
      },
      {
        name: 'Reanimation',
        cost: 'action',
        charges: 5,
        setupMinutes: 60,
        range: TOUCH,
        duration: INSTANTANEOUS,
        description:
          'A creature dead for no more than 10 days, with its body mostly whole, returns to life ' +
          'with 1 Hit Point. It takes a -4 penalty to D20 Tests, which is reduced by 1 each time ' +
          'it finishes a Long Rest.',
      },
    ],
  }),
  device('wireless-telegraph', {
    name: 'Wireless Telegraph',
    description: 'A spark-gap transmitter and coherer receiver in a travelling case.',
    discipline: 'galvanism',
    power: 'galvanic',
    weightLb: 30,
    cost: lsd(150),
    rarity: 'rare',
    maxCharges: 3,
    effects: [
      {
        name: 'Wireless Message',
        cost: 'action',
        charges: 3,
        range: { kind: 'distance', feet: 1000 * 5280 },
        duration: INSTANTANEOUS,
        description:
          'You send a message of up to 25 words to someone operating a wireless receiver within ' +
          '1,000 miles, who can reply at once.',
      },
    ],
  }),
  device('infrasound-horn', {
    name: 'Infrasound Horn',
    description: 'A horn tuned below hearing, whose tone fills listeners with nameless dread.',
    discipline: 'acoustics',
    power: 'steam',
    weightLb: 15,
    cost: lsd(80),
    rarity: 'rare',
    maxCharges: 3,
    effects: [
      {
        name: 'Dread Tone',
        cost: 'action',
        charges: 3,
        range: SELF,
        area: { shape: 'cone', length: 30 },
        duration: sustained(1, 'minute'),
        savingThrow: 'sanity',
        description:
          'Each creature in the Cone makes a Sanity saving throw or drops what it is holding and ' +
          'is Frightened, taking the Dash action away from you on its turns. It repeats the save ' +
          "at the end of each turn on which it can't see you.",
      },
    ],
  }),
  device('kaleidoscopic-strobe', {
    name: 'Kaleidoscopic Strobe',
    description: 'A spinning drum of coloured lenses around an arc lamp.',
    discipline: 'optics',
    power: 'galvanic',
    weightLb: 18,
    cost: lsd(200),
    rarity: 'rare',
    maxCharges: 4,
    effects: [
      {
        name: 'Bewildering Strobe',
        cost: 'action',
        charges: 4,
        range: feet(90),
        area: { shape: 'sphere', radius: 10 },
        duration: sustained(1, 'minute'),
        savingThrow: 'sanity',
        description:
          "Each creature in the Sphere makes a Sanity saving throw. On a failure, it can't take " +
          'Reactions and rolls 1d10 at the start of each turn: on 1 it moves in a random ' +
          'direction, on 2-6 it does nothing, on 7-8 it attacks a random creature within reach, ' +
          'and on 9-10 it acts normally. It repeats the save at the end of each of its turns.',
        overcharge: '+5 feet to the radius for each extra charge.',
      },
    ],
  }),
  device('magnetic-manipulator', {
    name: 'Magnetic Manipulator',
    description: 'A great electromagnet on an articulated arm, powered from a dynamo.',
    discipline: 'galvanism',
    power: 'galvanic',
    weightLb: 60,
    cost: lsd(600),
    rarity: 'prototype',
    maxCharges: 5,
    effects: [
      {
        name: 'Magnetic Grip',
        cost: 'action',
        charges: 5,
        range: feet(60),
        duration: sustained(10, 'minute'),
        savingThrow: 'might',
        description:
          'On each of your turns you can take a Utilize action to move an iron or steel object ' +
          'of up to 1,000 pounds up to 30 feet, or a creature wearing or holding substantial ' +
          'iron or steel, which can resist with a Might saving throw.',
      },
    ],
  }),
  device('telectroscope', {
    name: 'Telectroscope',
    description: 'A long brass tube that shows distant places through the aether.',
    discipline: 'aetherics',
    power: 'aetheric',
    weightLb: 25,
    cost: lsd(1000),
    rarity: 'prototype',
    maxCharges: 5,
    effects: [
      {
        name: 'Distant Viewing',
        cost: 'action',
        charges: 5,
        setupMinutes: 10,
        range: { kind: 'unlimited' },
        duration: sustained(10, 'minute'),
        savingThrow: 'wisdom',
        description:
          'You see and hear a creature you know, which can resist with a Wisdom saving throw, or ' +
          'a place you have visited. The view is of a point within 10 feet of the target.',
      },
    ],
  }),
];

export function findApparatus(id: string): ApparatusDefinition | undefined {
  return APPARATUS.find((apparatus) => apparatus.id === id);
}
