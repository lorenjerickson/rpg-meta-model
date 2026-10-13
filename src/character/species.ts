import type { CreatureType, Senses, Size } from '../core/creatures';
import type { Feature } from '../core/features';

export interface SpeciesTrait extends Feature {
  /** Character level at which the trait takes effect, if not 1. */
  level?: number;
}

/** A variant within a species, such as an elven or tiefling lineage or a draconic ancestry. */
export interface Lineage {
  id: string;
  name: string;
  traits: readonly SpeciesTrait[];
}

export interface SpeciesDefinition {
  id: string;
  name: string;
  creatureType: CreatureType;
  /** Some species let the player choose between sizes, e.g. Small or Medium. */
  sizes: readonly Size[];
  speed: number;
  senses?: Senses;
  traits: readonly SpeciesTrait[];
  lineages?: readonly Lineage[];
}
