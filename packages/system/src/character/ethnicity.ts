import type { Language } from '../core/languages';
import type { Trait } from './traits';

export const WORLD_REGIONS = [
  'europe',
  'middle-east-and-north-africa',
  'sub-saharan-africa',
  'south-asia',
  'central-asia',
  'east-asia',
  'southeast-asia',
  'north-america',
  'latin-america-and-caribbean',
  'oceania',
] as const;

export type WorldRegion = (typeof WORLD_REGIONS)[number];

/**
 * A character's ethnicity. It takes the place of species: everyone is human, and ethnicity adds
 * languages and traits on top of the human traits.
 */
export interface EthnicityDefinition {
  id: string;
  name: string;
  region: WorldRegion;
  /** Where the people live or come from, as Homeland Knowledge describes it. */
  homeland: string;
  /** Languages every member of the ethnicity knows. */
  languages: readonly Language[];
  /** Where the native language varies, e.g. a Chinese dialect; the player picks. */
  languageChoice?: { choose: number; from: readonly Language[] };
  traits: readonly Trait[];
}
