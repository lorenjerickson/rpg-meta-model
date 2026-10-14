import type { ActionCost } from '../core/actions';
import type { Attribute, AttributeScores } from '../core/attributes';
import { attributeDice, proficiencyDice, type PoolDie } from '../core/dicePool';
import type { Feature, Usage } from '../core/features';
import type { Skill } from '../core/skills';
import type { EquipmentOption } from '../character/startingEquipment';
import type { ArmorCategory } from '../equipment/armor';
import type { WeaponProficiency } from '../equipment/weapons';
import type { Discipline } from '../science/disciplines';
import type { Rank } from './ranks';

export const PROFESSION_CATEGORIES = [
  'military',
  'law-enforcement',
  'criminal',
  'service',
  'commerce',
  'labour',
  'maritime',
  'frontier',
  'medical',
  'religious',
  'scholarly',
  'press',
  'entertainment',
  'technical',
] as const;

export type ProfessionCategory = (typeof PROFESSION_CATEGORIES)[number];

export type HitDie = 6 | 8 | 10 | 12;

/** An action, bonus action or reaction a profession or specialization grants. */
export interface ProfessionAction extends Feature {
  cost: Exclude<ActionCost, 'free'>;
  /** For reactions: what lets you take it. */
  trigger?: string;
  /** Omit for actions usable at will. */
  usage?: Usage;
}

/** A step in a profession's specialization tree. */
export interface SpecializationDefinition {
  id: string;
  name: string;
  description: string;
  /** The specialization this one follows, or null if it branches from the profession itself. */
  parentId: string | null;
  /** The rank at which it can be chosen; always higher than its parent's. */
  rank: Rank;
  /** Skills it grants proficiency in. */
  skills: readonly Skill[];
  tools?: readonly string[];
  weapons?: readonly WeaponProficiency[];
  armor?: readonly ArmorCategory[];
  /** Scientific disciplines it grants proficiency in. */
  disciplines?: readonly Discipline[];
  actions: readonly ProfessionAction[];
}

export interface ProfessionDefinition {
  id: string;
  name: string;
  description: string;
  category: ProfessionCategory;
  hitDie: HitDie;
  primaryAttributes: readonly Attribute[];
  /** Whether taking up this profession as a second one needs all primary attributes or any one. */
  primaryAttributeRequirement: 'all' | 'any';
  /** Only the profession you start with grants saving throw proficiencies. */
  savingThrows: readonly [Attribute, Attribute];
  skillProficiencies: { choose: number; from: readonly Skill[] };
  weaponProficiencies: readonly WeaponProficiency[];
  armorTraining: readonly ArmorCategory[];
  toolProficiencies: readonly string[];
  /** Scientific disciplines every member is proficient in. */
  disciplineProficiencies?: readonly Discipline[];
  startingEquipment?: readonly EquipmentOption[];
  /** Profession-specific titles for ranks, e.g. "Recruit" instead of "Novice". */
  rankTitles?: Partial<Record<Rank, string>>;
  /** Actions every member of the profession has from novice rank. */
  actions: readonly ProfessionAction[];
  specializations: readonly SpecializationDefinition[];
}

/**
 * The dice rolled, with a d20, against saving throws for a profession's actions ("your
 * Profession roll"): the primary attribute's dice plus proficiency dice.
 */
export function professionPool(
  attributeScore: number,
  attribute: Attribute,
  proficiencyBonus: number,
): PoolDie[] {
  return [...attributeDice(attributeScore, attribute), ...proficiencyDice(proficiencyBonus)];
}

/** Profession levels at which a character gains a General feat, as classes do in 2024. */
export const GENERAL_FEAT_LEVELS = [4, 8, 12, 16] as const;

/** The profession level at which a character gains an Epic Boon feat. */
export const EPIC_BOON_LEVEL = 19;

/** The kind of feat gained on reaching a level in a profession, if any. */
export function featGainedAtLevel(professionLevel: number): 'general' | 'epic-boon' | null {
  if (professionLevel === EPIC_BOON_LEVEL) {
    return 'epic-boon';
  }
  return (GENERAL_FEAT_LEVELS as readonly number[]).includes(professionLevel) ? 'general' : null;
}

/** Taking up a second profession needs at least this score in its primary attribute. */
export const MULTI_PROFESSION_ATTRIBUTE_MINIMUM = 13;

export function meetsProfessionPrerequisite(
  profession: ProfessionDefinition,
  scores: AttributeScores,
): boolean {
  const meets = (attribute: Attribute) => scores[attribute] >= MULTI_PROFESSION_ATTRIBUTE_MINIMUM;
  return profession.primaryAttributeRequirement === 'all'
    ? profession.primaryAttributes.every(meets)
    : profession.primaryAttributes.some(meets);
}
