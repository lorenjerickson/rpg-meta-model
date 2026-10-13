import type { Attribute } from '../core/attributes';

/** Branches of science, half-understood, that apparatus and preparations draw on. */
export const DISCIPLINES = [
  'chemistry',
  'galvanism',
  'mechanics',
  'optics',
  'acoustics',
  'mesmerism',
  'aetherics',
] as const;

export type Discipline = (typeof DISCIPLINES)[number];

export interface DisciplineDefinition {
  name: string;
  description: string;
  /** The attribute that sets save DCs and attack bonuses for this discipline's effects. */
  attribute: Attribute;
}

export const DISCIPLINE_DEFINITIONS: Readonly<Record<Discipline, DisciplineDefinition>> = {
  chemistry: {
    name: 'Chemistry',
    description: 'Reagents, gases, explosives, tonics and poisons.',
    attribute: 'intellect',
  },
  galvanism: {
    name: 'Galvanism',
    description: 'Electricity and its effects on matter and living flesh.',
    attribute: 'intellect',
  },
  mechanics: {
    name: 'Mechanics',
    description: 'Clockwork, springs, steam and pneumatics.',
    attribute: 'intellect',
  },
  optics: {
    name: 'Optics',
    description: 'Lenses, lamps, mirrors and projections.',
    attribute: 'intellect',
  },
  acoustics: {
    name: 'Acoustics',
    description: 'Sound, resonance and vibration, including what cannot be heard.',
    attribute: 'intellect',
  },
  mesmerism: {
    name: 'Mesmerism',
    description: 'Animal magnetism and the influence of one mind over another.',
    attribute: 'charisma',
  },
  aetherics: {
    name: 'Aetherics',
    description: 'The luminiferous aether, which nobody fully understands.',
    attribute: 'intellect',
  },
};
