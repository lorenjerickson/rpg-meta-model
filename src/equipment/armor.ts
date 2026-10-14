import type { ItemBase } from './items';

export const ARMOR_CATEGORIES = ['light', 'medium', 'heavy', 'shield'] as const;

export type ArmorCategory = (typeof ARMOR_CATEGORIES)[number];

/**
 * Protective wear. Its defense and soak come from its roll modifiers; worn pieces cover one
 * or more body slots, and shields are held.
 */
export interface ArmorDefinition extends ItemBase {
  category: 'armor';
  armorCategory: ArmorCategory;
  /** Wearers with a lower Might score have their speed reduced by 10 feet. */
  mightRequirement?: number;
  stealthDisadvantage: boolean;
}

/** Minutes to don and doff each kind of armor. A shield takes the Utilize action either way. */
export const ARMOR_DON_DOFF_MINUTES: Readonly<
  Record<Exclude<ArmorCategory, 'shield'>, { don: number; doff: number }>
> = {
  light: { don: 1, doff: 1 },
  medium: { don: 5, doff: 1 },
  heavy: { don: 10, doff: 5 },
};

/** Speed reduction in feet for wearing armor without meeting its Might requirement. */
export function armorSpeedPenalty(armor: ArmorDefinition, mightScore: number): number {
  const requirement = armor.mightRequirement;
  return requirement !== undefined && mightScore < requirement ? 10 : 0;
}
