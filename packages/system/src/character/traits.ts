import type { Attribute } from '../core/attributes';
import type { RestType } from '../core/actions';
import type { D20Test, RollMode } from '../core/d20';
import type { Feature } from '../core/features';
import type { Language } from '../core/languages';
import type { Skill } from '../core/skills';
import type { FeatCategory } from './feats';

/**
 * A mechanical effect a trait grants. Penalties are roll modifiers with a negative bonus or
 * disadvantage.
 */
export type TraitEffect =
  | { kind: 'skill-proficiency'; choose: number; from: readonly Skill[] | 'any' }
  | { kind: 'tool-proficiency'; choose: number; from: readonly string[] | 'any' }
  | { kind: 'language'; choose: number; from: readonly Language[] | 'any' }
  | {
      kind: 'roll-modifier';
      test: D20Test;
      /** Limits the modifier to rolls using these attributes. */
      attributes?: readonly Attribute[];
      /** Limits the modifier to checks using these skills. */
      skills?: readonly Skill[];
      mode?: Exclude<RollMode, 'normal'>;
      bonus?: number;
      /** The circumstances in which the modifier applies. */
      when: string;
    }
  | { kind: 'feat'; category: FeatCategory }
  | { kind: 'heroic-inspiration'; recovery: RestType };

/** A trait granted by being human or by an ethnicity. */
export interface Trait extends Feature {
  effects: readonly TraitEffect[];
}
