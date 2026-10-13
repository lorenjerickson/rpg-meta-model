import { attributeModifier, type Attribute } from '../core/attributes';
import { passiveScore } from '../core/d20';
import { proficiencyContribution } from '../core/proficiency';
import { SKILL_DEFINITIONS, type Skill } from '../core/skills';
import { carryingCapacity } from '../equipment/carrying';
import { PROFESSIONS } from '../professions/catalog';
import {
  professionDc,
  type HitDie,
  type ProfessionAction,
  type ProfessionDefinition,
} from '../professions/profession';
import { rankForLevel, type Rank } from '../professions/ranks';
import { specializationGrants } from '../professions/specializations';
import { operatorAttackBonus, operatorDc } from '../science/apparatus';
import { DISCIPLINE_DEFINITIONS, type Discipline } from '../science/disciplines';
import type { Character, ProfessionLevel } from './character';
import { proficiencyBonusForLevel } from './progression';

/** Where profession definitions are looked up. Defaults to the built-in catalog. */
export type ProfessionCatalog = readonly ProfessionDefinition[];

function professionFrom(catalog: ProfessionCatalog, id: string): ProfessionDefinition {
  const profession = catalog.find((entry) => entry.id === id);
  if (profession === undefined) {
    throw new Error(`Unknown profession: ${id}`);
  }
  return profession;
}

export function totalLevel(character: Character): number {
  return character.professions.reduce((total, entry) => total + entry.level, 0);
}

export function startingProfession(character: Character): ProfessionLevel {
  const [first] = character.professions;
  if (first === undefined) {
    throw new Error(`${character.name} has no profession`);
  }
  return first;
}

export function professionLevel(character: Character, professionId: string): number {
  return character.professions.find((entry) => entry.professionId === professionId)?.level ?? 0;
}

/** The character's rank in each of their professions. */
export function professionRanks(character: Character): Record<string, Rank> {
  return Object.fromEntries(
    character.professions.map((entry) => [entry.professionId, rankForLevel(entry.level)]),
  );
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

/** Total hit dice by die size, from all profession levels. */
export function hitDiceTotal(
  character: Character,
  catalog: ProfessionCatalog = PROFESSIONS,
): Partial<Record<HitDie, number>> {
  const totals: Partial<Record<HitDie, number>> = {};
  for (const { professionId, level } of character.professions) {
    const die = professionFrom(catalog, professionId).hitDie;
    totals[die] = (totals[die] ?? 0) + level;
  }
  return totals;
}

export function hitDiceRemaining(
  character: Character,
  catalog: ProfessionCatalog = PROFESSIONS,
): Partial<Record<HitDie, number>> {
  const remaining = hitDiceTotal(character, catalog);
  for (const [die, total] of Object.entries(remaining)) {
    const size = Number(die) as HitDie;
    remaining[size] = total - (character.hitDiceSpent[size] ?? 0);
  }
  return remaining;
}

/**
 * The save DC for one of the character's professions. With several primary attributes, the
 * highest modifier among them is used.
 */
export function characterProfessionDc(
  character: Character,
  professionId: string,
  catalog: ProfessionCatalog = PROFESSIONS,
): number {
  const { primaryAttributes } = professionFrom(catalog, professionId);
  const best = Math.max(
    ...primaryAttributes.map((attribute) => characterAttributeModifier(character, attribute)),
  );
  return professionDc(characterProficiencyBonus(character), best);
}

export interface CharacterActions {
  actions: ProfessionAction[];
  bonusActions: ProfessionAction[];
  reactions: ProfessionAction[];
}

/** Every action, bonus action and reaction the character's professions and paths grant. */
export function characterActions(
  character: Character,
  catalog: ProfessionCatalog = PROFESSIONS,
): CharacterActions {
  const all = character.professions.flatMap(
    (entry) =>
      specializationGrants(professionFrom(catalog, entry.professionId), entry.specializationPath)
        .actions,
  );
  return {
    actions: all.filter((entry) => entry.cost === 'action'),
    bonusActions: all.filter((entry) => entry.cost === 'bonus-action'),
    reactions: all.filter((entry) => entry.cost === 'reaction'),
  };
}

export function characterCarryingCapacity(character: Character): number {
  return carryingCapacity(character.attributeScores.might, character.size);
}

export function isProficientInDiscipline(character: Character, discipline: Discipline): boolean {
  return character.proficiencies.disciplines.includes(discipline);
}

function disciplineModifier(character: Character, discipline: Discipline): number {
  return characterAttributeModifier(character, DISCIPLINE_DEFINITIONS[discipline].attribute);
}

/** Save DC for apparatus and preparations of a discipline that this character operates. */
export function characterOperatorDc(character: Character, discipline: Discipline): number {
  return operatorDc(
    characterProficiencyBonus(character),
    disciplineModifier(character, discipline),
    isProficientInDiscipline(character, discipline),
  );
}

/** Attack bonus for apparatus of a discipline that this character operates. */
export function characterOperatorAttackBonus(character: Character, discipline: Discipline): number {
  return operatorAttackBonus(
    characterProficiencyBonus(character),
    disciplineModifier(character, discipline),
    isProficientInDiscipline(character, discipline),
  );
}
