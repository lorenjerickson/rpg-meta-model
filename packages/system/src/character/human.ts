import type { CreatureType, Size, Speed } from '../core/creatures';
import type { Trait } from './traits';

/** Every character is human. */
export const HUMAN_CREATURE_TYPE: CreatureType = 'humanoid';
export const HUMAN_SIZE: Size = 'medium';
export const HUMAN_SPEED: Speed = { walk: 30 };

/** Traits every character has, whatever their ethnicity. */
export const HUMAN_TRAITS: readonly Trait[] = [
  {
    id: 'resourceful',
    name: 'Resourceful',
    description: 'You gain Heroic Inspiration whenever you finish a Long Rest.',
    effects: [{ kind: 'heroic-inspiration', recovery: 'long' }],
  },
  {
    id: 'skillful',
    name: 'Skillful',
    description: 'You gain proficiency in one skill of your choice.',
    effects: [{ kind: 'skill-proficiency', choose: 1, from: 'any' }],
  },
  {
    id: 'versatile',
    name: 'Versatile',
    description: 'You gain an Origin feat of your choice.',
    effects: [{ kind: 'feat', category: 'origin' }],
  },
];
