import { attributeDice, type DicePool, type PoolDie } from '../core/dicePool';
import type { Attribute, AttributeScores } from '../core/attributes';
import { conditionDefense, conditionDice, type Condition } from '../core/conditions';
import type { Alignment, CreatureType, Senses, Size, Speed } from '../core/creatures';
import type { DamageType } from '../core/damage';
import type { DiceExpression } from '../core/dice';
import type { Feature, Usage } from '../core/features';
import { applicableDice, type RollModifier } from '../core/rollModifiers';
import type { Skill } from '../core/skills';
import { challengeRatingInfo } from './challenge';

export interface MonsterDamage {
  dice: DiceExpression;
  /** Dice added to the damage, such as the attack attribute's dice. */
  pool?: DicePool;
  type: DamageType;
}

export interface MonsterAttack {
  kind: 'melee' | 'ranged' | 'melee-or-ranged';
  /** Dice rolled with a d20 for the attack. */
  pool: DicePool;
  /** Melee reach in feet. */
  reach?: number;
  /** Ranged normal and long range in feet. */
  range?: { normal: number; long?: number };
  damage: readonly MonsterDamage[];
}

export interface MonsterSavingThrowEffect {
  attribute: Attribute;
  /** Dice rolled with a d20 for the effect, contested by the target's saving throw. */
  pool: DicePool;
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

/**
 * How a creature came to be. Most monsters are the work of whoever has been experimenting with
 * mutation and grafting; some are natural, reanimated, built, or phenomena of nature.
 */
export const MONSTER_ORIGINS = [
  'natural',
  'human',
  'mutation',
  'hybrid',
  'reanimation',
  'automaton',
  'anomaly',
  'unknown',
] as const;

export type MonsterOrigin = (typeof MONSTER_ORIGINS)[number];

export interface MonsterStatBlock {
  id: string;
  name: string;
  description?: string;
  origin?: MonsterOrigin;
  /** Usually one size; swarms and some creatures list a choice. */
  size: Size;
  creatureType: CreatureType;
  /** Descriptive tags such as "Cultist" or "Soldier". */
  tags?: readonly string[];
  alignment: Alignment;
  /** The defense an attack must meet: natural armour, or base defense plus what it wears. */
  defense: number;
  /** Soak dice from hide, shell, plating or worn gear. */
  soak: readonly RollModifier[];
  /** Dice rolled with a d20 for Initiative. */
  initiative: DicePool;
  hitPoints: { average: number; formula: DiceExpression };
  speed: Speed;
  attributeScores: AttributeScores;
  /** Saving throw pools for attributes it is proficient in. */
  savingThrows?: Partial<Record<Attribute, DicePool>>;
  skills?: Partial<Record<Skill, number>>;
  vulnerabilities?: readonly DamageType[];
  resistances?: readonly DamageType[];
  damageImmunities?: readonly DamageType[];
  conditionImmunities?: readonly Condition[];
  /** Item ids of gear the monster wears or carries and can drop. */
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

/** A monster's defense against an attack, with any conditions it has. Add cover separately. */
export function monsterDefense(
  monster: MonsterStatBlock,
  attack: 'melee' | 'ranged',
  conditions: readonly Condition[] = [],
): number {
  return monster.defense + conditionDefense(conditions, attack);
}

/** The dice a monster rolls to soak damage of a type, with any conditions it has. */
export function monsterSoakPool(
  monster: MonsterStatBlock,
  damageType: DamageType,
  conditions: readonly Condition[] = [],
): PoolDie[] {
  return [
    ...applicableDice(monster.soak, 'Soak', 'soak', { damageType }),
    ...conditionDice(conditions, 'soak', { damageType }),
  ];
}

/** The dice a monster adds to a saving throw's d20, with any conditions it has. */
export function monsterSavePool(
  monster: MonsterStatBlock,
  attribute: Attribute,
  conditions: readonly Condition[] = [],
): PoolDie[] {
  return [
    ...(monster.savingThrows?.[attribute] ??
      attributeDice(monster.attributeScores[attribute], attribute)),
    ...conditionDice(conditions, 'save', { attribute }),
  ];
}
