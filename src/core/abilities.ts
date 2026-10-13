export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

export type Ability = (typeof ABILITIES)[number];

export const ABILITY_NAMES: Readonly<Record<Ability, string>> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export type AbilityScores = Record<Ability, number>;

/** Lowest and highest score any creature can have. */
export const MIN_ABILITY_SCORE = 1;
export const MAX_ABILITY_SCORE = 30;

/** Backgrounds and Ability Score Improvements can't raise a character's score above this. */
export const PLAYER_ABILITY_SCORE_CAP = 20;

/** Returns the ability modifier for a given ability score (e.g. 14 -> +2). */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Builds a record with one entry per ability. */
export function mapAbilities<T>(fn: (ability: Ability) => T): Record<Ability, T> {
  return {
    str: fn('str'),
    dex: fn('dex'),
    con: fn('con'),
    int: fn('int'),
    wis: fn('wis'),
    cha: fn('cha'),
  };
}

export function abilityModifiers(scores: AbilityScores): Record<Ability, number> {
  return mapAbilities((ability) => abilityModifier(scores[ability]));
}

/** Formats a modifier with an explicit sign: +2, +0, -1. */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${String(modifier)}` : String(modifier);
}
