import type { Attribute, AttributeScores } from '../core/attributes';
import type { Condition } from '../core/conditions';
import type { Alignment, Senses, Size, Speed } from '../core/creatures';
import type { Currency } from '../core/currency';
import type { Language } from '../core/languages';
import type { ProficiencyLevel } from '../core/proficiency';
import type { Skill } from '../core/skills';
import type { DeathSaves } from '../combat/deathSaves';
import type { HitPoints } from '../combat/hitPoints';
import type { ArmorCategory } from '../equipment/armor';
import type { WeaponProficiency } from '../equipment/weapons';
import type { HitDie } from '../professions/profession';

export interface ProfessionLevel {
  professionId: string;
  /** Levels in this profession; its rank follows from this. */
  level: number;
  /** Specializations chosen so far, in order, e.g. ['rifleman', 'sniper']. */
  specializationPath: readonly string[];
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
  equipped: boolean;
  attuned: boolean;
}

export interface CharacterProficiencies {
  savingThrows: readonly Attribute[];
  skills: Partial<Record<Skill, ProficiencyLevel>>;
  weapons: readonly WeaponProficiency[];
  armor: readonly ArmorCategory[];
  tools: readonly string[];
  languages: readonly Language[];
}

/**
 * A player character. Values that come from being human, ethnicity, background and profession
 * (size, speed, senses, proficiencies) are stored resolved, so the character can be used without
 * its source definitions.
 */
export interface Character {
  id: string;
  name: string;
  ethnicityId: string;
  backgroundId: string;
  alignment?: Alignment;
  /** In the order taken; the first entry is the starting profession. */
  professions: readonly ProfessionLevel[];
  experience: number;
  size: Size;
  speed: Speed;
  senses: Senses;
  attributeScores: AttributeScores;
  hitPoints: HitPoints;
  hitDiceSpent: Partial<Record<HitDie, number>>;
  deathSaves: DeathSaves;
  exhaustion: number;
  conditions: readonly Condition[];
  heroicInspiration: boolean;
  proficiencies: CharacterProficiencies;
  feats: readonly string[];
  inventory: readonly InventoryEntry[];
  currency: Currency;
}
