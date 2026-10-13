import type { Attribute } from '../core/attributes';
import type { Skill } from '../core/skills';
import type { EquipmentOption } from './startingEquipment';

export interface BackgroundDefinition {
  id: string;
  name: string;
  description: string;
  /** The three attributes the background can increase. */
  attributes: readonly [Attribute, Attribute, Attribute];
  /** Id of the Origin feat the background grants. */
  feat: string;
  skillProficiencies: readonly [Skill, Skill];
  /** A tool id, or a kind of tool such as a musical instrument. */
  toolProficiency: string;
  /** Pick one option: a kit of items plus spare money, or the same value in money alone. */
  equipment: readonly EquipmentOption[];
}
