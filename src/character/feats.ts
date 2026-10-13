import type { Attribute } from '../core/attributes';
import type { Feature } from '../core/features';

export const FEAT_CATEGORIES = ['origin', 'general', 'fighting-style', 'epic-boon'] as const;

export type FeatCategory = (typeof FEAT_CATEGORIES)[number];

export interface FeatPrerequisite {
  minLevel?: number;
  /** Needs at least `minimum` in any one of `attributes`. */
  attributeScore?: { attributes: readonly Attribute[]; minimum: number };
  /** Ids of features required, e.g. the Fighting Style feature. */
  features?: readonly string[];
  /** e.g. "Medium Armor Training". */
  proficiencies?: readonly string[];
  spellcasting?: boolean;
}

export interface FeatDefinition extends Feature {
  category: FeatCategory;
  prerequisite?: FeatPrerequisite;
  repeatable: boolean;
  /** Increase one of the listed attributes by `amount`, up to `max`. */
  attributeScoreIncrease?: { attributes: readonly Attribute[]; amount: number; max: number };
  benefits: readonly Feature[];
}

/** Default level prerequisites by category. */
export const FEAT_CATEGORY_MIN_LEVEL: Readonly<Record<FeatCategory, number>> = {
  origin: 1,
  'fighting-style': 1,
  general: 4,
  'epic-boon': 19,
};
