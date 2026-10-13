/** Spell save DC = 8 + proficiency bonus + spellcasting attribute modifier. */
export function spellSaveDc(proficiencyBonus: number, spellcastingModifier: number): number {
  return 8 + proficiencyBonus + spellcastingModifier;
}

/** Spell attack modifier = proficiency bonus + spellcasting attribute modifier. */
export function spellAttackBonus(proficiencyBonus: number, spellcastingModifier: number): number {
  return proficiencyBonus + spellcastingModifier;
}

/** Character levels at which damaging cantrips gain an extra die. */
export const CANTRIP_UPGRADE_LEVELS = [5, 11, 17] as const;

/** How many times a cantrip's base damage dice are rolled at a given character level. */
export function cantripDiceMultiplier(characterLevel: number): number {
  return 1 + CANTRIP_UPGRADE_LEVELS.filter((level) => characterLevel >= level).length;
}

/** A ritual takes 10 minutes longer to cast than the spell normally does. */
export const RITUAL_EXTRA_MINUTES = 10;
