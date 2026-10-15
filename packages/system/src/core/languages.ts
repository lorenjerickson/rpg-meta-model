/** Languages widely spoken in the late 19th and early 20th centuries, grouped by region. */
export const SPOKEN_LANGUAGES = [
  // Europe
  'english',
  'scots',
  'scottish-gaelic',
  'irish',
  'welsh',
  'french',
  'german',
  'dutch',
  'swedish',
  'norwegian',
  'danish',
  'finnish',
  'italian',
  'spanish',
  'portuguese',
  'polish',
  'russian',
  'ukrainian',
  'czech',
  'hungarian',
  'greek',
  'serbo-croatian',
  'lithuanian',
  'yiddish',
  'hebrew',
  'ladino',
  'romani',
  // Middle East and North Africa
  'turkish',
  'arabic',
  'persian',
  'armenian',
  'kurdish',
  'tamazight',
  // South and Central Asia
  'hindustani',
  'bengali',
  'punjabi',
  'tamil',
  'gujarati',
  'marathi',
  'sinhala',
  'pashto',
  'kazakh',
  'uzbek',
  // East Asia
  'mandarin',
  'cantonese',
  'hokkien',
  'wu',
  'japanese',
  'korean',
  'mongolian',
  'tibetan',
  // Southeast Asia
  'vietnamese',
  'thai',
  'burmese',
  'tagalog',
  'cebuano',
  'ilocano',
  'malay',
  'javanese',
  // Sub-Saharan Africa
  'yoruba',
  'igbo',
  'hausa',
  'akan',
  'wolof',
  'amharic',
  'somali',
  'swahili',
  'kikuyu',
  'zulu',
  'xhosa',
  'afrikaans',
  'malagasy',
  // The Americas
  'lakota',
  'cherokee',
  'navajo',
  'ojibwe',
  'inuktitut',
  'nahuatl',
  'yucatec-maya',
  'kiche',
  'quechua',
  'haitian-creole',
  // Oceania
  'maori',
  'hawaiian',
  'samoan',
  'arrernte',
  'pitjantjatjara',
  'wiradjuri',
  'yolngu-matha',
] as const;

/** Dead and scholarly languages, read in libraries, liturgy and excavations rather than spoken. */
export const CLASSICAL_LANGUAGES = [
  'latin',
  'ancient-greek',
  'aramaic',
  'coptic',
  'ancient-egyptian',
  'sanskrit',
  'classical-chinese',
  'classical-arabic',
  'old-norse',
] as const;

/**
 * Cants, slang and codes of the period. They are learned through a trade or a life, never
 * inherited: thieves' flash, Polari of the theatres and fairgrounds, Cockney rhyming slang,
 * Shelta, and the signalling and shorthand systems of telegraphists, sailors and reporters.
 */
export const CANTS_AND_CODES = [
  'flash-cant',
  'polari',
  'rhyming-slang',
  'shelta',
  'morse-code',
  'semaphore',
  'shorthand',
] as const;

/** Signed languages, including the Plains trade sign language. */
export const SIGN_LANGUAGES = [
  'british-sign-language',
  'french-sign-language',
  'american-sign-language',
  'plains-sign-talk',
] as const;

export const LANGUAGES = [
  ...SPOKEN_LANGUAGES,
  ...CLASSICAL_LANGUAGES,
  ...CANTS_AND_CODES,
  ...SIGN_LANGUAGES,
] as const;

export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_CATEGORIES = ['spoken', 'classical', 'cant-or-code', 'sign'] as const;

export type LanguageCategory = (typeof LANGUAGE_CATEGORIES)[number];

const CATEGORY_LISTS: readonly (readonly [LanguageCategory, readonly Language[]])[] = [
  ['classical', CLASSICAL_LANGUAGES],
  ['cant-or-code', CANTS_AND_CODES],
  ['sign', SIGN_LANGUAGES],
];

export function languageCategory(language: Language): LanguageCategory {
  return CATEGORY_LISTS.find(([, list]) => list.includes(language))?.[0] ?? 'spoken';
}

/** Languages of trade, empire and administration that travellers of the period were likely to meet. */
export const LINGUA_FRANCAS: readonly Language[] = [
  'english',
  'french',
  'spanish',
  'portuguese',
  'russian',
  'arabic',
  'turkish',
  'persian',
  'hindustani',
  'mandarin',
  'malay',
  'swahili',
  'hausa',
];
