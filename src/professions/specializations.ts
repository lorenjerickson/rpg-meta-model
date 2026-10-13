import type { Skill } from '../core/skills';
import type { ArmorCategory } from '../equipment/armor';
import type { WeaponProficiency } from '../equipment/weapons';
import type { Discipline } from '../science/disciplines';
import type {
  ProfessionAction,
  ProfessionDefinition,
  SpecializationDefinition,
} from './profession';
import { RANK_NAMES, compareRanks, hasReachedRank } from './ranks';

export function findSpecialization(
  profession: ProfessionDefinition,
  id: string,
): SpecializationDefinition | undefined {
  return profession.specializations.find((specialization) => specialization.id === id);
}

/** The specializations that branch from `parentId` (null for the profession's first tier). */
export function childSpecializations(
  profession: ProfessionDefinition,
  parentId: string | null,
): SpecializationDefinition[] {
  return profession.specializations.filter(
    (specialization) => specialization.parentId === parentId,
  );
}

/**
 * Problems with a chosen specialization path, or an empty list if it's valid. Each step must
 * follow the previous one and be unlocked by the character's level in the profession.
 */
export function validateSpecializationPath(
  profession: ProfessionDefinition,
  professionLevel: number,
  path: readonly string[],
): string[] {
  const problems: string[] = [];
  let parentId: string | null = null;
  for (const id of path) {
    const specialization = findSpecialization(profession, id);
    if (specialization === undefined) {
      problems.push(`${id} is not a ${profession.name} specialization`);
      break;
    }
    if (specialization.parentId !== parentId) {
      problems.push(`${specialization.name} does not follow ${parentId ?? profession.name}`);
    }
    if (!hasReachedRank(professionLevel, specialization.rank)) {
      problems.push(
        `${specialization.name} needs ${RANK_NAMES[specialization.rank]} rank ` +
          `(${profession.name} level ${String(professionLevel)} is too low)`,
      );
    }
    parentId = specialization.id;
  }
  return problems;
}

/** The specializations the character can choose next on this path at this level. */
export function nextSpecializationOptions(
  profession: ProfessionDefinition,
  professionLevel: number,
  path: readonly string[],
): SpecializationDefinition[] {
  const parentId = path.at(-1) ?? null;
  return childSpecializations(profession, parentId).filter((specialization) =>
    hasReachedRank(professionLevel, specialization.rank),
  );
}

export interface ProfessionGrants {
  skills: Skill[];
  tools: string[];
  weapons: WeaponProficiency[];
  armor: ArmorCategory[];
  disciplines: Discipline[];
  actions: ProfessionAction[];
}

/**
 * Everything a profession and a specialization path grant beyond the choices made on entry:
 * the profession's own actions and disciplines, plus every specialization's proficiencies and
 * actions.
 * Duplicate skills, tools and armor are listed once.
 */
export function specializationGrants(
  profession: ProfessionDefinition,
  path: readonly string[],
): ProfessionGrants {
  const steps = path
    .map((id) => findSpecialization(profession, id))
    .filter((step): step is SpecializationDefinition => step !== undefined);
  return {
    skills: [...new Set(steps.flatMap((step) => step.skills))],
    tools: [...new Set(steps.flatMap((step) => step.tools ?? []))],
    weapons: steps.flatMap((step) => step.weapons ?? []),
    armor: [...new Set(steps.flatMap((step) => step.armor ?? []))],
    disciplines: [
      ...new Set([
        ...(profession.disciplineProficiencies ?? []),
        ...steps.flatMap((step) => step.disciplines ?? []),
      ]),
    ],
    actions: [...profession.actions, ...steps.flatMap((step) => step.actions)],
  };
}

/** Structural problems in a profession definition, for validating catalogs. */
export function validateProfession(profession: ProfessionDefinition): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const specialization of profession.specializations) {
    if (ids.has(specialization.id)) {
      problems.push(`Duplicate specialization id ${specialization.id}`);
    }
    ids.add(specialization.id);
  }
  for (const specialization of profession.specializations) {
    if (specialization.parentId === null) {
      if (specialization.rank === 'novice') {
        problems.push(`${specialization.id} can't be chosen at novice rank`);
      }
      continue;
    }
    const parent = findSpecialization(profession, specialization.parentId);
    if (parent === undefined) {
      problems.push(`${specialization.id} follows unknown ${specialization.parentId}`);
    } else if (compareRanks(specialization.rank, parent.rank) <= 0) {
      problems.push(`${specialization.id} must come at a higher rank than ${parent.id}`);
    }
  }
  return problems;
}
