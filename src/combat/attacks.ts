export function attackBonus(
  abilityModifier: number,
  proficiencyBonus: number,
  proficient: boolean,
  bonus = 0,
): number {
  return abilityModifier + (proficient ? proficiencyBonus : 0) + bonus;
}

export type AttackOutcome = 'miss' | 'hit' | 'critical-hit';

/**
 * A natural 1 always misses. A natural roll at or above the critical range (normally 20) is a
 * critical hit regardless of AC. Otherwise the attack hits if the total meets the AC.
 */
export function resolveAttack(
  natural: number,
  bonus: number,
  targetArmorClass: number,
  criticalRange = 20,
): AttackOutcome {
  if (natural === 1) {
    return 'miss';
  }
  if (natural >= criticalRange) {
    return 'critical-hit';
  }
  return natural + bonus >= targetArmorClass ? 'hit' : 'miss';
}

export const COVER_LEVELS = ['none', 'half', 'three-quarters', 'total'] as const;

export type Cover = (typeof COVER_LEVELS)[number];

/**
 * Bonus to AC and Dexterity saving throws from cover, or null for total cover, which means the
 * target can't be targeted directly.
 */
export function coverBonus(cover: Cover): number | null {
  switch (cover) {
    case 'none':
      return 0;
    case 'half':
      return 2;
    case 'three-quarters':
      return 5;
    case 'total':
      return null;
  }
}
