export const ATTRIBUTES = [
  'might',
  'agility',
  'hardiness',
  'intellect',
  'wisdom',
  'charisma',
  'fortune',
  'sanity',
] as const;

export type Attribute = (typeof ATTRIBUTES)[number];

export const ATTRIBUTE_NAMES: Readonly<Record<Attribute, string>> = {
  might: 'Might',
  agility: 'Agility',
  hardiness: 'Hardiness',
  intellect: 'Intellect',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
  fortune: 'Fortune',
  sanity: 'Sanity',
};

export type AttributeScores = Record<Attribute, number>;

/** Lowest and highest score any creature can have. */
export const MIN_ATTRIBUTE_SCORE = 1;
export const MAX_ATTRIBUTE_SCORE = 30;

/** Backgrounds and Attribute Score Improvements can't raise a character's score above this. */
export const PLAYER_ATTRIBUTE_SCORE_CAP = 20;

/** Returns the attribute modifier for a given attribute score (e.g. 14 -> +2). */
export function attributeModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Builds a record with one entry per attribute. */
export function mapAttributes<T>(fn: (attribute: Attribute) => T): Record<Attribute, T> {
  return {
    might: fn('might'),
    agility: fn('agility'),
    hardiness: fn('hardiness'),
    intellect: fn('intellect'),
    wisdom: fn('wisdom'),
    charisma: fn('charisma'),
    fortune: fn('fortune'),
    sanity: fn('sanity'),
  };
}

export function attributeModifiers(scores: AttributeScores): Record<Attribute, number> {
  return mapAttributes((attribute) => attributeModifier(scores[attribute]));
}

/** Formats a modifier with an explicit sign: +2, +0, -1. */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${String(modifier)}` : String(modifier);
}
