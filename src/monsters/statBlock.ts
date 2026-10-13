import type { Attribute, AttributeScores } from '../core/attributes';
import type { Condition } from '../core/conditions';
import type { Alignment, CreatureType, Senses, Size, Speed } from '../core/creatures';
import type { DamageType } from '../core/damage';
import type { DiceExpression } from '../core/dice';
import type { Feature, Usage } from '../core/features';
import type { Skill } from '../core/skills';
import { challengeRatingInfo } from './challenge';

export interface MonsterDamage {
  dice: DiceExpression;
  type: DamageType;
}

export interface MonsterAttack {
  kind: 'melee' | 'ranged' | 'melee-or-ranged';
  bonus: number;
  /** Melee reach in feet. */
  reach?: number;
  /** Ranged normal and long range in feet. */
  range?: { normal: number; long?: number };
  damage: readonly MonsterDamage[];
}

export interface MonsterSavingThrowEffect {
  attribute: Attribute;
  dc: number;
  damage?: readonly MonsterDamage[];
}

/** A trait, action, bonus action, reaction or legendary action in a stat block. */
export interface MonsterAbility extends Feature {
  usage?: Usage;
  attack?: MonsterAttack;
  savingThrow?: MonsterSavingThrowEffect;
}

export interface LegendaryActions {
  uses: number;
  /** Some creatures get more uses while in their lair. */
  usesInLair?: number;
  actions: readonly MonsterAbility[];
}

export interface MonsterStatBlock {
  id: string;
  name: string;
  /** Usually one size; swarms and some creatures list a choice. */
  size: Size;
  creatureType: CreatureType;
  /** Descriptive tags such as "Wizard" or "Goblinoid". */
  tags?: readonly string[];
  alignment: Alignment;
  armorClass: number;
  initiative: { modifier: number; score: number };
  hitPoints: { average: number; formula: DiceExpression };
  speed: Speed;
  attributeScores: AttributeScores;
  /** Saving throw bonuses where they differ from the attribute modifier. */
  savingThrows?: Partial<Record<Attribute, number>>;
  skills?: Partial<Record<Skill, number>>;
  vulnerabilities?: readonly DamageType[];
  resistances?: readonly DamageType[];
  damageImmunities?: readonly DamageType[];
  conditionImmunities?: readonly Condition[];
  /** Item ids of gear the monster carries and can drop. */
  gear?: readonly string[];
  senses: Senses;
  passivePerception: number;
  languages: readonly string[];
  /** Telepathy range in feet. */
  telepathy?: number;
  challengeRating: number;
  /** XP when encountered in its lair, if different. */
  xpInLair?: number;
  traits: readonly MonsterAbility[];
  actions: readonly MonsterAbility[];
  bonusActions: readonly MonsterAbility[];
  reactions: readonly MonsterAbility[];
  legendaryActions?: LegendaryActions;
}

export function monsterProficiencyBonus(monster: MonsterStatBlock): number {
  return challengeRatingInfo(monster.challengeRating).proficiencyBonus;
}

export function monsterXp(monster: MonsterStatBlock, inLair = false): number {
  if (inLair && monster.xpInLair !== undefined) {
    return monster.xpInLair;
  }
  return challengeRatingInfo(monster.challengeRating).xp;
}
