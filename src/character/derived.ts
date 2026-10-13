import { attributeModifier, type Attribute } from '../core/attributes';
import { passiveScore } from '../core/d20';
import { proficiencyContribution } from '../core/proficiency';
import { SKILL_DEFINITIONS, type Skill } from '../core/skills';
import { carryingCapacity } from '../equipment/carrying';
import { MAX_ATTUNED_ITEMS } from '../equipment/items';
import {
  casterLevel,
  pactMagicForLevel,
  spellSlotsForCasterLevel,
  type PactMagicSlots,
  type SpellcastingClassLevel,
  type SpellSlots,
} from '../magic/slots';
import { spellAttackBonus, spellSaveDc } from '../magic/spellcasting';
import type { Character, ClassLevel } from './character';
import { CLASS_CORE, type ClassId, type HitDie } from './classes';
import { proficiencyBonusForLevel } from './progression';

export function totalLevel(character: Character): number {
  return character.classes.reduce((total, entry) => total + entry.level, 0);
}

export function startingClass(character: Character): ClassLevel {
  const [first] = character.classes;
  if (first === undefined) {
    throw new Error(`${character.name} has no class levels`);
  }
  return first;
}

export function classLevel(character: Character, classId: ClassId): number {
  return character.classes.find((entry) => entry.classId === classId)?.level ?? 0;
}

export function characterProficiencyBonus(character: Character): number {
  return proficiencyBonusForLevel(totalLevel(character));
}

export function characterAttributeModifier(character: Character, attribute: Attribute): number {
  return attributeModifier(character.attributeScores[attribute]);
}

/** Does not include the exhaustion penalty, which applies to the roll rather than the bonus. */
export function savingThrowModifier(character: Character, attribute: Attribute): number {
  const proficient = character.proficiencies.savingThrows.includes(attribute);
  return (
    characterAttributeModifier(character, attribute) +
    (proficient ? characterProficiencyBonus(character) : 0)
  );
}

/** Does not include the exhaustion penalty, which applies to the roll rather than the bonus. */
export function skillModifier(character: Character, skill: Skill): number {
  const proficiency = character.proficiencies.skills[skill] ?? 'none';
  return (
    characterAttributeModifier(character, SKILL_DEFINITIONS[skill].attribute) +
    proficiencyContribution(proficiency, characterProficiencyBonus(character))
  );
}

export function passivePerception(character: Character): number {
  return passiveScore(skillModifier(character, 'perception'));
}

export function initiativeModifier(character: Character): number {
  return characterAttributeModifier(character, 'agility');
}

/** Total hit dice by die size, from all class levels. */
export function hitDiceTotal(character: Character): Partial<Record<HitDie, number>> {
  const totals: Partial<Record<HitDie, number>> = {};
  for (const { classId, level } of character.classes) {
    const die = CLASS_CORE[classId].hitDie;
    totals[die] = (totals[die] ?? 0) + level;
  }
  return totals;
}

export function hitDiceRemaining(character: Character): Partial<Record<HitDie, number>> {
  const remaining = hitDiceTotal(character);
  for (const [die, total] of Object.entries(remaining)) {
    const size = Number(die) as HitDie;
    remaining[size] = total - (character.hitDiceSpent[size] ?? 0);
  }
  return remaining;
}

/**
 * Spell slots from every spellcasting class. Subclasses that grant spellcasting (Eldritch
 * Knight, Arcane Trickster) aren't in CLASS_CORE, so pass their progression in `additional`.
 */
export function characterSpellSlots(
  character: Character,
  additional: readonly SpellcastingClassLevel[] = [],
): SpellSlots {
  const fromClasses = character.classes.flatMap(({ classId, level }) => {
    const spellcasting = CLASS_CORE[classId].spellcasting;
    return spellcasting === null ? [] : [{ progression: spellcasting.progression, level }];
  });
  return spellSlotsForCasterLevel(casterLevel([...fromClasses, ...additional]));
}

export function characterPactMagic(character: Character): PactMagicSlots | null {
  const level = classLevel(character, 'warlock');
  return level === 0 ? null : pactMagicForLevel(level);
}

function spellcastingAttributeFor(classId: ClassId): Attribute {
  const spellcasting = CLASS_CORE[classId].spellcasting;
  if (spellcasting === null) {
    throw new Error(`${CLASS_CORE[classId].name} is not a spellcasting class`);
  }
  return spellcasting.attribute;
}

export function characterSpellSaveDc(character: Character, classId: ClassId): number {
  return spellSaveDc(
    characterProficiencyBonus(character),
    characterAttributeModifier(character, spellcastingAttributeFor(classId)),
  );
}

export function characterSpellAttackBonus(character: Character, classId: ClassId): number {
  return spellAttackBonus(
    characterProficiencyBonus(character),
    characterAttributeModifier(character, spellcastingAttributeFor(classId)),
  );
}

export function characterCarryingCapacity(character: Character): number {
  return carryingCapacity(character.attributeScores.might, character.size);
}

export function attunedItemCount(character: Character): number {
  return character.inventory.filter((entry) => entry.attuned).length;
}

export function canAttuneAnotherItem(character: Character): boolean {
  return attunedItemCount(character) < MAX_ATTUNED_ITEMS;
}
