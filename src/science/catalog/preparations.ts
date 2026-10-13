import { lsd } from '../../core/currency';
import { dice } from '../../core/dice';
import type { PreparationDefinition, ScientificEffect } from '../apparatus';
import { INSTANTANEOUS, TOUCH, feet, lasting, slug } from './builders';

type PreparationInput = Omit<PreparationDefinition, 'id' | 'category' | 'effect'> & {
  effect: Omit<ScientificEffect, 'id'>;
};

function preparation(id: string, input: PreparationInput): PreparationDefinition {
  const { effect, ...rest } = input;
  return { id, category: 'preparation', ...rest, effect: { id: slug(effect.name), ...effect } };
}

/** Single-use preparations. Saving throws use the user's operator DC. */
export const PREPARATIONS: readonly PreparationDefinition[] = [
  preparation('smelling-salts', {
    name: 'Smelling Salts',
    description: 'A vial of ammonium carbonate, sharp enough to wake the dying.',
    discipline: 'chemistry',
    weightLb: 0.1,
    cost: lsd(0, 0, 6),
    rarity: 'common',
    effect: {
      name: 'Revive',
      cost: 'action',
      range: TOUCH,
      duration: INSTANTANEOUS,
      description: 'A creature with 0 Hit Points becomes Stable.',
    },
  }),
  preparation('restorative-tonic', {
    name: 'Restorative Tonic',
    description: 'A bitter patent tonic of laudanum, quinine and things best left unnamed.',
    discipline: 'chemistry',
    weightLb: 0.5,
    cost: lsd(0, 5),
    rarity: 'common',
    effect: {
      name: 'Restorative Draught',
      cost: 'bonus-action',
      range: TOUCH,
      duration: INSTANTANEOUS,
      description: 'The creature that drinks it regains 2d8 + 2 Hit Points.',
    },
  }),
  preparation('universal-antidote', {
    name: 'Universal Antidote',
    description: 'An expensive compound of charcoal and alkaloids that counters most toxins.',
    discipline: 'chemistry',
    weightLb: 0.5,
    cost: lsd(1),
    rarity: 'uncommon',
    effect: {
      name: 'Antidote',
      cost: 'action',
      range: TOUCH,
      duration: INSTANTANEOUS,
      description:
        'The creature that takes it is no longer Blinded, Deafened, Paralyzed or Poisoned, or is ' +
        'cured of one disease.',
    },
  }),
  preparation('chloroform-bomb', {
    name: 'Chloroform Bomb',
    description: 'A thin glass globe of chloroform that shatters into a stupefying vapour.',
    discipline: 'chemistry',
    weightLb: 1,
    cost: lsd(0, 10),
    rarity: 'uncommon',
    effect: {
      name: 'Chloroform Cloud',
      cost: 'action',
      range: feet(60),
      area: { shape: 'sphere', radius: 5 },
      duration: lasting(1, 'minute'),
      savingThrow: 'hardiness',
      description:
        'Each creature in the Sphere makes a Hardiness saving throw or is Incapacitated until ' +
        'the end of its next turn, when it repeats the save. If it fails again, it is ' +
        'Unconscious for the duration or until it takes damage or someone shakes it awake.',
    },
  }),
  preparation('smoke-canister', {
    name: 'Smoke Canister',
    description: 'A tin of saltpetre and sugar that pours out thick white smoke.',
    discipline: 'chemistry',
    weightLb: 1,
    cost: lsd(0, 2, 6),
    rarity: 'common',
    effect: {
      name: 'Smoke Screen',
      cost: 'action',
      range: feet(60),
      area: { shape: 'sphere', radius: 20 },
      duration: lasting(1, 'hour'),
      description:
        'The Sphere is Heavily Obscured until the duration ends or a strong wind disperses it.',
    },
  }),
  preparation('adhesive-foam-grenade', {
    name: 'Adhesive Foam Grenade',
    description: 'A canister of rubber solution that erupts into a sticky, setting foam.',
    discipline: 'chemistry',
    weightLb: 2,
    cost: lsd(1, 10),
    rarity: 'uncommon',
    effect: {
      name: 'Adhesive Foam',
      cost: 'action',
      range: feet(60),
      area: { shape: 'cube', size: 20 },
      duration: lasting(1, 'hour'),
      savingThrow: 'agility',
      description:
        'The Cube is Difficult Terrain. Each creature that starts its turn there or enters it ' +
        'makes an Agility saving throw or is Restrained. It can escape with a Might (Athletics) ' +
        'check against the same DC. The foam is flammable.',
    },
  }),
  preparation('phosphorescent-dust', {
    name: 'Phosphorescent Dust',
    description: 'A pouch of luminous powder that clings to anything it touches.',
    discipline: 'chemistry',
    weightLb: 0.5,
    cost: lsd(0, 5),
    rarity: 'common',
    effect: {
      name: 'Luminous Cloud',
      cost: 'action',
      range: feet(60),
      area: { shape: 'cube', size: 20 },
      duration: lasting(1, 'minute'),
      savingThrow: 'agility',
      description:
        'Each creature in the Cube makes an Agility saving throw. On a failure, it glows with Dim ' +
        "Light in a 10-foot radius, attack rolls against it have Advantage, and it can't benefit " +
        'from the Invisible condition.',
    },
  }),
  preparation('dynamite-stick', {
    name: 'Stick of Dynamite',
    description: 'Nitroglycerine in sawdust, wrapped in paper with a short fuse.',
    discipline: 'chemistry',
    weightLb: 1,
    cost: lsd(0, 1),
    rarity: 'common',
    effect: {
      name: 'Dynamite Blast',
      cost: 'action',
      range: feet(60),
      area: { shape: 'sphere', radius: 5 },
      duration: INSTANTANEOUS,
      savingThrow: 'agility',
      damage: [{ dice: dice(3, 6), type: 'concussive' }],
      description:
        'Light the fuse and throw it. Each creature in the Sphere makes an Agility saving ' +
        'throw, taking the damage on a failure or half on a success. Sticks bundled together ' +
        'add 1d6 damage each (up to 10d6) and 5 feet of radius for every 5 sticks.',
    },
  }),
  preparation('hand-grenade', {
    name: 'Hand Grenade',
    description: 'A segmented iron grenade with a pin and striker lever.',
    discipline: 'chemistry',
    weightLb: 1.5,
    cost: lsd(0, 5),
    rarity: 'uncommon',
    effect: {
      name: 'Grenade Burst',
      cost: 'action',
      range: feet(60),
      area: { shape: 'sphere', radius: 10 },
      duration: INSTANTANEOUS,
      savingThrow: 'agility',
      damage: [{ dice: dice(3, 6), type: 'piercing' }],
      description:
        'Pull the pin and throw it. Each creature in the Sphere makes an Agility saving throw, ' +
        'taking the damage on a failure or half on a success.',
    },
  }),
  preparation('incendiary-shell', {
    name: 'Incendiary Shell',
    description: 'A thermite-packed shell, thrown by hand or fired from a launcher.',
    discipline: 'chemistry',
    weightLb: 3,
    cost: lsd(5),
    rarity: 'rare',
    effect: {
      name: 'Incendiary Burst',
      cost: 'action',
      range: feet(150),
      area: { shape: 'sphere', radius: 20 },
      duration: INSTANTANEOUS,
      savingThrow: 'agility',
      damage: [{ dice: dice(8, 6), type: 'fire' }],
      description:
        'Thrown up to 60 feet or fired from a launcher up to 150 feet. Each creature in the ' +
        'Sphere makes an Agility saving throw, taking the damage on a failure or half on a ' +
        'success. Flammable objects in the area start burning.',
    },
  }),
  preparation('adrenal-injector', {
    name: 'Adrenal Injector',
    description: 'A spring syringe of adrenal extract that speeds the body to its limits.',
    discipline: 'chemistry',
    weightLb: 0.5,
    cost: lsd(10),
    rarity: 'rare',
    effect: {
      name: 'Adrenal Surge',
      cost: 'action',
      range: TOUCH,
      duration: lasting(1, 'minute'),
      description:
        'For the duration, the creature has double Speed, a +2 bonus to AC and Advantage on ' +
        'Agility saving throws, and can take one extra action each turn: a single weapon ' +
        "attack, Dash, Disengage, Hide or Utilize. When it ends, the creature can't move or take " +
        'actions until after its next turn.',
    },
  }),
  preparation('chlorine-gas-canister', {
    name: 'Chlorine Gas Canister',
    description: 'A steel cylinder of chlorine gas, as used in the new war.',
    discipline: 'chemistry',
    weightLb: 5,
    cost: lsd(8),
    rarity: 'rare',
    effect: {
      name: 'Poison Gas',
      cost: 'action',
      range: feet(60),
      area: { shape: 'sphere', radius: 20 },
      duration: lasting(10, 'minute'),
      savingThrow: 'hardiness',
      damage: [{ dice: dice(5, 8), type: 'poison' }],
      description:
        'The Sphere is Heavily Obscured. A creature makes a Hardiness saving throw when the gas ' +
        'first reaches it and when it starts its turn there, taking the damage on a failure or ' +
        'half on a success. The gas drifts 10 feet downwind at the start of each round and sinks ' +
        'into low ground.',
    },
  }),
];

export function findPreparation(id: string): PreparationDefinition | undefined {
  return PREPARATIONS.find((entry) => entry.id === id);
}
