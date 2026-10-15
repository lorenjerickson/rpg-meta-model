import type { Attribute } from '../core/attributes';
import { attributeModifiers } from '../core/attributes';
import { BASE_DEFENSE } from '../combat/attacks';
import { FIRING_MODE_DEFINITIONS, type FiringMode } from '../combat/timing';
import { conditionDefense, conditionDice, exhaustionDice, madnessDice } from '../core/conditions';
import type { DamageType } from '../core/damage';
import type { DiceExpression } from '../core/dice';
import { attributeDice, proficiencyDice, type PoolDie } from '../core/dicePool';
import type { RollContext, RollKind } from '../core/rollModifiers';
import { findItem } from '../equipment/catalog';
import type { ItemDefinition } from '../equipment/items';
import { equipmentDefense, equipmentDice } from '../equipment/protection';
import {
  hasProperty,
  isProficientWithWeapon,
  weaponAttackAttribute,
  type WeaponDefinition,
} from '../equipment/weapons';
import type { Character } from './character';
import { characterProficiencyBonus } from './derived';

/**
 * The items the character has equipped. Armour they lack training for is carried but gives
 * no dice, so it is left out.
 */
export function equippedItems(character: Character): ItemDefinition[] {
  return character.inventory
    .filter((entry) => entry.equipped)
    .map((entry) => findItem(entry.itemId))
    .filter((item): item is ItemDefinition => item !== undefined)
    .filter(
      (item) =>
        item.category !== 'armor' || character.proficiencies.armor.includes(item.armorCategory),
    );
}

/** Dice from equipment, conditions, exhaustion and madness that apply to a roll. */
function situationalDice(
  character: Character,
  kind: RollKind,
  context: RollContext = {},
  weapon?: WeaponDefinition,
): PoolDie[] {
  return [
    ...equipmentDice(equippedItems(character), kind, context, weapon),
    ...conditionDice(character.conditions, kind, context),
    ...exhaustionDice(character.exhaustion, kind),
    ...(context.attribute ? madnessDice(character.madness, kind, context.attribute) : []),
  ];
}

/**
 * The dice added to the d20 when attacking with a weapon: the attack attribute's dice,
 * proficiency dice if proficient, and dice from the weapon, other equipment and conditions.
 * Ranged attacks also add their firing mode's dice.
 */
export function characterAttackPool(
  character: Character,
  weapon: WeaponDefinition,
  firingMode: FiringMode = 'standard',
): PoolDie[] {
  const attribute = weaponAttackAttribute(weapon, attributeModifiers(character.attributeScores));
  const proficient = isProficientWithWeapon(weapon, character.proficiencies.weapons);
  return [
    ...attributeDice(character.attributeScores[attribute], attribute),
    ...(proficient ? proficiencyDice(characterProficiencyBonus(character)) : []),
    ...situationalDice(character, 'attack', { attack: weapon.weaponType }, weapon),
    ...(weapon.weaponType === 'ranged' ? FIRING_MODE_DEFINITIONS[firingMode].dice : []),
  ];
}

export interface DamageRoll {
  dice: DiceExpression;
  pool: PoolDie[];
}

/**
 * The damage a weapon hit deals: the weapon's dice (versatile dice if held in two hands) plus
 * the attack attribute's dice.
 */
export function characterDamageRoll(
  character: Character,
  weapon: WeaponDefinition,
  twoHanded = false,
): DamageRoll {
  const attribute = weaponAttackAttribute(weapon, attributeModifiers(character.attributeScores));
  const dice =
    twoHanded && hasProperty(weapon, 'versatile') && weapon.versatileDamage
      ? weapon.versatileDamage
      : weapon.damage.dice;
  return { dice, pool: attributeDice(character.attributeScores[attribute], attribute) };
}

/**
 * The defense an attack must meet: the base defense, plus worn and held equipment the
 * character is trained in, plus or minus conditions. Add cover separately.
 */
export function characterDefense(character: Character, attack: 'melee' | 'ranged'): number {
  return (
    BASE_DEFENSE +
    equipmentDefense(equippedItems(character), attack) +
    conditionDefense(character.conditions, attack)
  );
}

/** The dice rolled to soak a hit's damage: general soak plus soak for that damage type. */
export function characterSoakPool(character: Character, damageType: DamageType): PoolDie[] {
  return situationalDice(character, 'soak', { damageType });
}

/**
 * The dice added to the d20 for a saving throw: the attribute's dice, proficiency dice if
 * proficient, and dice from equipment, conditions, exhaustion and madness.
 */
export function characterSavePool(character: Character, attribute: Attribute): PoolDie[] {
  const proficient = character.proficiencies.savingThrows.includes(attribute);
  return [
    ...attributeDice(character.attributeScores[attribute], attribute),
    ...(proficient ? proficiencyDice(characterProficiencyBonus(character)) : []),
    ...situationalDice(character, 'save', { attribute }),
  ];
}

/** The dice added to the d20 for Initiative: Agility dice plus equipment and conditions. */
export function characterInitiativePool(character: Character): PoolDie[] {
  return [
    ...attributeDice(character.attributeScores.agility, 'agility'),
    ...situationalDice(character, 'initiative', { attribute: 'agility' }),
  ];
}
