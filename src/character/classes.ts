import type { Ability, AbilityScores } from '../core/abilities';
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
  ability: Ability;
}

/** The parts of a class the core rules calculations depend on. */
export interface ClassCore {
  name: string;
  hitDie: HitDie;
  primaryAbilities: readonly Ability[];
  /** Whether multiclassing needs 13+ in all primary abilities or any one of them. */
  primaryAbilityRequirement: 'all' | 'any';
  /** Only the class you start with grants saving throw proficiencies. */
  savingThrows: readonly [Ability, Ability];
  spellcasting: ClassSpellcasting | null;
}

export const CLASS_CORE: Readonly<Record<ClassId, ClassCore>> = {
  barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    primaryAbilities: ['str'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['str', 'con'],
    spellcasting: null,
  },
  bard: {
    name: 'Bard',
    hitDie: 8,
    primaryAbilities: ['cha'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['dex', 'cha'],
    spellcasting: { progression: 'full', ability: 'cha' },
  },
  cleric: {
    name: 'Cleric',
    hitDie: 8,
    primaryAbilities: ['wis'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['wis', 'cha'],
    spellcasting: { progression: 'full', ability: 'wis' },
  },
  druid: {
    name: 'Druid',
    hitDie: 8,
    primaryAbilities: ['wis'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['int', 'wis'],
    spellcasting: { progression: 'full', ability: 'wis' },
  },
  fighter: {
    name: 'Fighter',
    hitDie: 10,
    primaryAbilities: ['str', 'dex'],
    primaryAbilityRequirement: 'any',
    savingThrows: ['str', 'con'],
    spellcasting: null,
  },
  monk: {
    name: 'Monk',
    hitDie: 8,
    primaryAbilities: ['dex', 'wis'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['str', 'dex'],
    spellcasting: null,
  },
  paladin: {
    name: 'Paladin',
    hitDie: 10,
    primaryAbilities: ['str', 'cha'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['wis', 'cha'],
    spellcasting: { progression: 'half', ability: 'cha' },
  },
  ranger: {
    name: 'Ranger',
    hitDie: 10,
    primaryAbilities: ['dex', 'wis'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['str', 'dex'],
    spellcasting: { progression: 'half', ability: 'wis' },
  },
  rogue: {
    name: 'Rogue',
    hitDie: 8,
    primaryAbilities: ['dex'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['dex', 'int'],
    spellcasting: null,
  },
  sorcerer: {
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbilities: ['cha'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['con', 'cha'],
    spellcasting: { progression: 'full', ability: 'cha' },
  },
  warlock: {
    name: 'Warlock',
    hitDie: 8,
    primaryAbilities: ['cha'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['wis', 'cha'],
    spellcasting: { progression: 'pact', ability: 'cha' },
  },
  wizard: {
    name: 'Wizard',
    hitDie: 6,
    primaryAbilities: ['int'],
    primaryAbilityRequirement: 'all',
    savingThrows: ['int', 'wis'],
    spellcasting: { progression: 'full', ability: 'int' },
  },
};

/** Every class gains its subclass at this level. */
export const SUBCLASS_LEVEL = 3;

/** Multiclassing into or out of a class needs at least this score in its primary ability. */
export const MULTICLASS_ABILITY_MINIMUM = 13;

export function meetsMulticlassPrerequisite(classId: ClassId, scores: AbilityScores): boolean {
  const { primaryAbilities, primaryAbilityRequirement } = CLASS_CORE[classId];
  const meets = (ability: Ability) => scores[ability] >= MULTICLASS_ABILITY_MINIMUM;
  return primaryAbilityRequirement === 'all'
    ? primaryAbilities.every(meets)
    : primaryAbilities.some(meets);
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
