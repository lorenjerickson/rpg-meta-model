import type { Attribute } from '../core/attributes';
import type { ItemBase } from './items';

export const ARMOR_CATEGORIES = ['light', 'medium', 'heavy', 'shield'] as const;

export type ArmorCategory = (typeof ARMOR_CATEGORIES)[number];

export interface ArmorDefinition extends ItemBase {
  category: 'armor';
  armorCategory: ArmorCategory;
  armorClass: {
    /** Base AC for armor; the AC bonus for a shield. */
    base: number;
    /** Most Agility modifier that can be added: null for no limit, 0 for none. */
    agilityCap: number | null;
  };
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

export const UNARMORED_BASE_AC = 10;

export interface ArmorClassInput {
  attributeModifiers: Readonly<Record<Attribute, number>>;
  armor?: ArmorDefinition;
  shield?: ArmorDefinition;
  /**
   * An extra attribute added while unarmored, e.g. Hardiness for a Barbarian's or Wisdom for a
   * Monk's Unarmored Defense.
   */
  unarmoredDefenseAttribute?: Attribute;
  /** Flat bonuses from magic items, spells and features. */
  bonus?: number;
}

export function calculateArmorClass(input: ArmorClassInput): number {
  const { attributeModifiers: modifiers, armor, shield } = input;
  if (armor?.armorCategory === 'shield') {
    throw new Error(`${armor.name} is a shield; pass it as \`shield\`, not \`armor\``);
  }
  if (shield !== undefined && shield.armorCategory !== 'shield') {
    throw new Error(`${shield.name} is not a shield`);
  }

  let armorClass: number;
  if (armor === undefined) {
    const extra = input.unarmoredDefenseAttribute ? modifiers[input.unarmoredDefenseAttribute] : 0;
    armorClass = UNARMORED_BASE_AC + modifiers.agility + extra;
  } else {
    const { base, agilityCap } = armor.armorClass;
    const agility =
      agilityCap === null ? modifiers.agility : Math.min(modifiers.agility, agilityCap);
    armorClass = base + agility + (armor.magic?.bonus ?? 0);
  }

  if (shield !== undefined) {
    armorClass += shield.armorClass.base + (shield.magic?.bonus ?? 0);
  }
  return armorClass + (input.bonus ?? 0);
}

/** Speed reduction in feet for wearing armor without meeting its Might requirement. */
export function armorSpeedPenalty(armor: ArmorDefinition, mightScore: number): number {
  const requirement = armor.mightRequirement;
  return requirement !== undefined && mightScore < requirement ? 10 : 0;
}
