import type { Attribute } from '../core/attributes';
import type { Feature } from '../core/features';
import type { ArmorCategory } from '../equipment/armor';
import type { WeaponCategory } from '../equipment/weapons';
import type { Discipline } from '../science/disciplines';
import type { Character } from './character';
import { totalLevel } from './derived';

export const FEAT_CATEGORIES = ['origin', 'general', 'fighting-style', 'epic-boon'] as const;

export type FeatCategory = (typeof FEAT_CATEGORIES)[number];

export interface FeatPrerequisite {
  /** Minimum character level. */
  minLevel?: number;
  /** Needs at least `minimum` in any one of `attributes`. */
  attributeScore?: { attributes: readonly Attribute[]; minimum: number };
  /** Proficiency with every weapon in this category. */
  weaponCategory?: WeaponCategory;
  armorTraining?: ArmorCategory;
  /** Proficiency in this discipline, or in any discipline. */
  discipline?: Discipline | 'any';
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

/** Whether a character meets a feat's prerequisite, including its category's minimum level. */
export function meetsFeatPrerequisite(feat: FeatDefinition, character: Character): boolean {
  const { prerequisite = {} } = feat;
  const minLevel = Math.max(FEAT_CATEGORY_MIN_LEVEL[feat.category], prerequisite.minLevel ?? 1);
  if (totalLevel(character) < minLevel) {
    return false;
  }
  const { attributeScore, weaponCategory, armorTraining, discipline } = prerequisite;
  const { proficiencies, attributeScores } = character;
  if (
    attributeScore &&
    !attributeScore.attributes.some(
      (attribute) => attributeScores[attribute] >= attributeScore.minimum,
    )
  ) {
    return false;
  }
  if (
    weaponCategory &&
    !proficiencies.weapons.some(
      (entry) => 'category' in entry && entry.category === weaponCategory && !entry.withAnyProperty,
    )
  ) {
    return false;
  }
  if (armorTraining && !proficiencies.armor.includes(armorTraining)) {
    return false;
  }
  if (discipline === 'any') {
    return proficiencies.disciplines.length > 0;
  }
  return discipline === undefined || proficiencies.disciplines.includes(discipline);
}
