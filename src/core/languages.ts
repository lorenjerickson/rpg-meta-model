export const STANDARD_LANGUAGES = [
  'common',
  'common-sign-language',
  'draconic',
  'dwarvish',
  'elvish',
  'giant',
  'gnomish',
  'goblin',
  'halfling',
  'orc',
] as const;

/** Primordial includes the Aquan, Auran, Ignan and Terran dialects. */
export const RARE_LANGUAGES = [
  'abyssal',
  'celestial',
  'deep-speech',
  'druidic',
  'infernal',
  'primordial',
  'sylvan',
  'thieves-cant',
  'undercommon',
] as const;

export type StandardLanguage = (typeof STANDARD_LANGUAGES)[number];
export type RareLanguage = (typeof RARE_LANGUAGES)[number];
export type Language = StandardLanguage | RareLanguage;
