export const SIZES = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'] as const;

export type Size = (typeof SIZES)[number];

/** Width of the square a creature of each size controls, in feet. */
export const SIZE_SPACE_FEET: Readonly<Record<Size, number>> = {
  tiny: 2.5,
  small: 5,
  medium: 5,
  large: 10,
  huge: 15,
  gargantuan: 20,
};

/**
 * Undead are the reanimated dead, constructs are automata and machines, and aberrations are the
 * things gothic horror warns of that science cannot yet explain.
 */
export const CREATURE_TYPES = [
  'aberration',
  'beast',
  'construct',
  'giant',
  'humanoid',
  'monstrosity',
  'ooze',
  'plant',
  'undead',
] as const;

export type CreatureType = (typeof CREATURE_TYPES)[number];

export const ALIGNMENTS = [
  'lawful-good',
  'neutral-good',
  'chaotic-good',
  'lawful-neutral',
  'neutral',
  'chaotic-neutral',
  'lawful-evil',
  'neutral-evil',
  'chaotic-evil',
  'unaligned',
] as const;

export type Alignment = (typeof ALIGNMENTS)[number];

export const MOVEMENT_MODES = ['walk', 'burrow', 'climb', 'fly', 'swim'] as const;

export type MovementMode = (typeof MOVEMENT_MODES)[number];

/** Speeds in feet. Every creature has a walking speed, even if it's 0. */
export interface Speed {
  walk: number;
  burrow?: number;
  climb?: number;
  fly?: number;
  swim?: number;
  /** Can stay aloft without moving, so it doesn't fall when knocked prone or stopped. */
  hover?: boolean;
}

export const SENSES = ['blindsight', 'darkvision', 'tremorsense'] as const;

export type Sense = (typeof SENSES)[number];

/** Special senses and their ranges in feet. */
export type Senses = Partial<Record<Sense, number>>;
