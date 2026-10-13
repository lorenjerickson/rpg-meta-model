import type { Ability } from '../core/abilities';
import type { Skill } from '../core/skills';
import type { EquipmentOption } from './startingEquipment';

export interface BackgroundDefinition {
  id: string;
  name: string;
  /** The three abilities the background can increase. */
  abilityScores: readonly [Ability, Ability, Ability];
  /** Id of the Origin feat the background grants. */
  feat: string;
  skillProficiencies: readonly [Skill, Skill];
  toolProficiency: string;
  /** Pick one option; the second is normally 50 GP. */
  equipment: readonly EquipmentOption[];
}
