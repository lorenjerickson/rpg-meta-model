export const PROFICIENCY_LEVELS = ['none', 'half', 'proficient', 'expertise'] as const;

/** `half` covers features like Jack of All Trades; `expertise` doubles the bonus. */
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

/** How much of the proficiency bonus a roll adds at the given proficiency level. */
export function proficiencyContribution(proficiency: ProficiencyLevel, bonus: number): number {
  switch (proficiency) {
    case 'none':
      return 0;
    case 'half':
      return Math.floor(bonus / 2);
    case 'proficient':
      return bonus;
    case 'expertise':
      return bonus * 2;
  }
}
