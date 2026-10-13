import type { Attribute, AttributeScores } from '../core/attributes';
import type { Feature } from '../core/features';
import type { Skill } from '../core/skills';
import type { ArmorCategory } from '../equipment/armor';
import type { WeaponProficiency } from '../equipment/weapons';
import type { CasterProgression } from '../magic/slots';
import type { EquipmentOption } from './startingEquipment';

export const CLASSES = [
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
] as const;

export type ClassId = (typeof CLASSES)[number];

export type HitDie = 6 | 8 | 10 | 12;

export interface ClassSpellcasting {
  progression: CasterProgression;
  attribute: Attribute;
}

/** The parts of a class the core rules calculations depend on. */
export interface ClassCore {
  name: string;
  hitDie: HitDie;
  primaryAttributes: readonly Attribute[];
  /** Whether multiclassing needs 13+ in all primary attributes or any one of them. */
  primaryAttributeRequirement: 'all' | 'any';
  /** Only the class you start with grants saving throw proficiencies. */
  savingThrows: readonly [Attribute, Attribute];
  spellcasting: ClassSpellcasting | null;
}

export const CLASS_CORE: Readonly<Record<ClassId, ClassCore>> = {
  barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    primaryAttributes: ['might'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['might', 'hardiness'],
    spellcasting: null,
  },
  bard: {
    name: 'Bard',
    hitDie: 8,
    primaryAttributes: ['charisma'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['agility', 'charisma'],
    spellcasting: { progression: 'full', attribute: 'charisma' },
  },
  cleric: {
    name: 'Cleric',
    hitDie: 8,
    primaryAttributes: ['wisdom'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['wisdom', 'charisma'],
    spellcasting: { progression: 'full', attribute: 'wisdom' },
  },
  druid: {
    name: 'Druid',
    hitDie: 8,
    primaryAttributes: ['wisdom'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['intellect', 'wisdom'],
    spellcasting: { progression: 'full', attribute: 'wisdom' },
  },
  fighter: {
    name: 'Fighter',
    hitDie: 10,
    primaryAttributes: ['might', 'agility'],
    primaryAttributeRequirement: 'any',
    savingThrows: ['might', 'hardiness'],
    spellcasting: null,
  },
  monk: {
    name: 'Monk',
    hitDie: 8,
    primaryAttributes: ['agility', 'wisdom'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['might', 'agility'],
    spellcasting: null,
  },
  paladin: {
    name: 'Paladin',
    hitDie: 10,
    primaryAttributes: ['might', 'charisma'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['wisdom', 'charisma'],
    spellcasting: { progression: 'half', attribute: 'charisma' },
  },
  ranger: {
    name: 'Ranger',
    hitDie: 10,
    primaryAttributes: ['agility', 'wisdom'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['might', 'agility'],
    spellcasting: { progression: 'half', attribute: 'wisdom' },
  },
  rogue: {
    name: 'Rogue',
    hitDie: 8,
    primaryAttributes: ['agility'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['agility', 'intellect'],
    spellcasting: null,
  },
  sorcerer: {
    name: 'Sorcerer',
    hitDie: 6,
    primaryAttributes: ['charisma'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['hardiness', 'charisma'],
    spellcasting: { progression: 'full', attribute: 'charisma' },
  },
  warlock: {
    name: 'Warlock',
    hitDie: 8,
    primaryAttributes: ['charisma'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['wisdom', 'charisma'],
    spellcasting: { progression: 'pact', attribute: 'charisma' },
  },
  wizard: {
    name: 'Wizard',
    hitDie: 6,
    primaryAttributes: ['intellect'],
    primaryAttributeRequirement: 'all',
    savingThrows: ['intellect', 'wisdom'],
    spellcasting: { progression: 'full', attribute: 'intellect' },
  },
};

/** Every class gains its subclass at this level. */
export const SUBCLASS_LEVEL = 3;

/** Multiclassing into or out of a class needs at least this score in its primary attribute. */
export const MULTICLASS_ATTRIBUTE_MINIMUM = 13;

export function meetsMulticlassPrerequisite(classId: ClassId, scores: AttributeScores): boolean {
  const { primaryAttributes, primaryAttributeRequirement } = CLASS_CORE[classId];
  const meets = (attribute: Attribute) => scores[attribute] >= MULTICLASS_ATTRIBUTE_MINIMUM;
  return primaryAttributeRequirement === 'all'
    ? primaryAttributes.every(meets)
    : primaryAttributes.some(meets);
}

export interface ClassFeature extends Feature {
  level: number;
}

export interface SubclassDefinition {
  id: string;
  classId: ClassId;
  name: string;
  features: readonly ClassFeature[];
  /** For subclasses that add spellcasting to a non-spellcasting class. */
  spellcasting?: ClassSpellcasting;
}

/** A full class definition, as a data catalog would provide it. */
export interface ClassDefinition extends ClassCore {
  id: ClassId;
  skillProficiencies: { choose: number; from: readonly Skill[] };
  weaponProficiencies: readonly WeaponProficiency[];
  armorTraining: readonly ArmorCategory[];
  toolProficiencies: readonly string[];
  /** Pick one option. */
  startingEquipment: readonly EquipmentOption[];
  features: readonly ClassFeature[];
  subclasses: readonly SubclassDefinition[];
}
