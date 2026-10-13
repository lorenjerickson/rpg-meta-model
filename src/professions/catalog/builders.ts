import type { Usage } from '../../core/features';
import type { Skill } from '../../core/skills';
import type { ArmorCategory } from '../../equipment/armor';
import type { WeaponProficiency } from '../../equipment/weapons';
import type { Discipline } from '../../science/disciplines';
import type { ProfessionAction, SpecializationDefinition } from '../profession';
import type { Rank } from '../ranks';

/** Uses equal to the proficiency bonus, regained on a Long Rest. */
export const PB_PER_LONG_REST: Usage = {
  kind: 'per-rest',
  uses: 'proficiency-bonus',
  recovery: 'long',
};
export const ONCE_PER_SHORT_REST: Usage = { kind: 'per-rest', uses: 1, recovery: 'short' };
export const ONCE_PER_LONG_REST: Usage = { kind: 'per-rest', uses: 1, recovery: 'long' };

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function withUsage(entry: ProfessionAction, usage: Usage | undefined): ProfessionAction {
  return usage === undefined ? entry : { ...entry, usage };
}

export function action(name: string, description: string, usage?: Usage): ProfessionAction {
  return withUsage({ id: slug(name), name, description, cost: 'action' }, usage);
}

export function bonusAction(name: string, description: string, usage?: Usage): ProfessionAction {
  return withUsage({ id: slug(name), name, description, cost: 'bonus-action' }, usage);
}

export function reaction(
  name: string,
  trigger: string,
  description: string,
  usage?: Usage,
): ProfessionAction {
  return withUsage({ id: slug(name), name, description, cost: 'reaction', trigger }, usage);
}

interface SpecializationInput {
  name: string;
  description: string;
  skills: readonly Skill[];
  tools?: readonly string[];
  weapons?: readonly WeaponProficiency[];
  armor?: readonly ArmorCategory[];
  disciplines?: readonly Discipline[];
  actions: readonly ProfessionAction[];
}

export function specialization(
  id: string,
  rank: Rank,
  parentId: string | null,
  input: SpecializationInput,
): SpecializationDefinition {
  const { tools, weapons, armor, disciplines, ...rest } = input;
  return {
    id,
    rank,
    parentId,
    ...rest,
    ...(tools && { tools }),
    ...(weapons && { weapons }),
    ...(armor && { armor }),
    ...(disciplines && { disciplines }),
  };
}
