import type { Language } from '../core/languages';
import type { EthnicityDefinition, WorldRegion } from './ethnicity';
import type { Trait } from './traits';

/** Advantage on recalling facts about one's homeland and people. Every ethnicity has it. */
export function homelandKnowledge(homeland: string): Trait {
  return {
    id: 'homeland-knowledge',
    name: 'Homeland Knowledge',
    description:
      `You have Advantage on Intellect checks to recall the history, geography, customs, ` +
      `politics and notable people of ${homeland}.`,
    effects: [
      {
        kind: 'roll-modifier',
        test: 'attribute-check',
        attributes: ['intellect'],
        mode: 'advantage',
        when: `recalling information about ${homeland}`,
      },
    ],
  };
}

interface EthnicityInput {
  name: string;
  region: WorldRegion;
  homeland: string;
  languages?: readonly Language[];
  languageChoice?: readonly Language[];
  traits?: readonly Trait[];
}

function ethnicity(id: string, input: EthnicityInput): EthnicityDefinition {
  const { name, region, homeland, languages = [], languageChoice, traits = [] } = input;
  return {
    id,
    name,
    region,
    homeland,
    languages,
    ...(languageChoice && { languageChoice: { choose: 1, from: languageChoice } }),
    traits: [homelandKnowledge(homeland), ...traits],
  };
}

/** Ethnicities common in the late 19th and early 20th centuries. A first draft. */
export const ETHNICITIES: readonly EthnicityDefinition[] = [
  // Europe
  ethnicity('english', {
    name: 'English',
    region: 'europe',
    homeland: 'England',
    languages: ['english'],
  }),
  ethnicity('scottish', {
    name: 'Scottish',
    region: 'europe',
    homeland: 'Scotland',
    languages: ['english'],
    languageChoice: ['scots', 'scottish-gaelic'],
  }),
  ethnicity('irish', {
    name: 'Irish',
    region: 'europe',
    homeland: 'Ireland',
    languages: ['english', 'irish'],
  }),
  ethnicity('welsh', {
    name: 'Welsh',
    region: 'europe',
    homeland: 'Wales',
    languages: ['english', 'welsh'],
  }),
  ethnicity('french', {
    name: 'French',
    region: 'europe',
    homeland: 'France',
    languages: ['french'],
  }),
  ethnicity('german', {
    name: 'German',
    region: 'europe',
    homeland: 'the German-speaking lands of Central Europe',
    languages: ['german'],
  }),
  ethnicity('dutch', {
    name: 'Dutch',
    region: 'europe',
    homeland: 'the Netherlands and Flanders',
    languages: ['dutch'],
  }),
  ethnicity('swedish', {
    name: 'Swedish',
    region: 'europe',
    homeland: 'Sweden',
    languages: ['swedish'],
  }),
  ethnicity('norwegian', {
    name: 'Norwegian',
    region: 'europe',
    homeland: 'Norway',
    languages: ['norwegian'],
  }),
  ethnicity('danish', {
    name: 'Danish',
    region: 'europe',
    homeland: 'Denmark',
    languages: ['danish'],
  }),
  ethnicity('finnish', {
    name: 'Finnish',
    region: 'europe',
    homeland: 'Finland',
    languages: ['finnish'],
  }),
  ethnicity('italian', {
    name: 'Italian',
    region: 'europe',
    homeland: 'Italy',
    languages: ['italian'],
  }),
  ethnicity('spanish', {
    name: 'Spanish',
    region: 'europe',
    homeland: 'Spain',
    languages: ['spanish'],
  }),
  ethnicity('portuguese', {
    name: 'Portuguese',
    region: 'europe',
    homeland: 'Portugal',
    languages: ['portuguese'],
  }),
  ethnicity('polish', {
    name: 'Polish',
    region: 'europe',
    homeland: 'the Polish lands partitioned among Russia, Prussia and Austria',
    languages: ['polish'],
  }),
  ethnicity('lithuanian', {
    name: 'Lithuanian',
    region: 'europe',
    homeland: 'Lithuania',
    languages: ['lithuanian'],
  }),
  ethnicity('russian', {
    name: 'Russian',
    region: 'europe',
    homeland: 'Russia',
    languages: ['russian'],
  }),
  ethnicity('ukrainian', {
    name: 'Ukrainian',
    region: 'europe',
    homeland: 'Ukraine and Galicia',
    languages: ['ukrainian'],
  }),
  ethnicity('czech', {
    name: 'Czech',
    region: 'europe',
    homeland: 'Bohemia and Moravia',
    languages: ['czech'],
  }),
  ethnicity('hungarian', {
    name: 'Hungarian',
    region: 'europe',
    homeland: 'Hungary',
    languages: ['hungarian'],
  }),
  ethnicity('greek', {
    name: 'Greek',
    region: 'europe',
    homeland: 'Greece and the Greek communities of the Ottoman Empire',
    languages: ['greek'],
  }),
  ethnicity('serb', {
    name: 'Serb',
    region: 'europe',
    homeland: 'Serbia',
    languages: ['serbo-croatian'],
  }),
  ethnicity('croat', {
    name: 'Croat',
    region: 'europe',
    homeland: 'Croatia and Dalmatia',
    languages: ['serbo-croatian'],
  }),
  ethnicity('ashkenazi-jewish', {
    name: 'Ashkenazi Jewish',
    region: 'europe',
    homeland: 'the Jewish communities of Central and Eastern Europe',
    languages: ['yiddish', 'hebrew'],
  }),
  ethnicity('sephardi-jewish', {
    name: 'Sephardi Jewish',
    region: 'europe',
    homeland: 'the Sephardic communities of the Mediterranean and the Ottoman Empire',
    languages: ['ladino', 'hebrew'],
  }),
  ethnicity('romani', {
    name: 'Romani',
    region: 'europe',
    homeland: 'the Romani communities of Europe',
    languages: ['romani'],
  }),

  // Middle East and North Africa
  ethnicity('turkish', {
    name: 'Turkish',
    region: 'middle-east-and-north-africa',
    homeland: 'Anatolia and the Ottoman heartland',
    languages: ['turkish'],
  }),
  ethnicity('arab', {
    name: 'Arab',
    region: 'middle-east-and-north-africa',
    homeland: 'the Arabic-speaking lands from the Maghreb to Mesopotamia',
    languages: ['arabic'],
  }),
  ethnicity('persian', {
    name: 'Persian',
    region: 'middle-east-and-north-africa',
    homeland: 'Persia',
    languages: ['persian'],
  }),
  ethnicity('armenian', {
    name: 'Armenian',
    region: 'middle-east-and-north-africa',
    homeland: 'Armenia and the Armenian communities of the Ottoman and Russian Empires',
    languages: ['armenian'],
  }),
  ethnicity('kurdish', {
    name: 'Kurdish',
    region: 'middle-east-and-north-africa',
    homeland: 'Kurdistan',
    languages: ['kurdish'],
  }),
  ethnicity('amazigh', {
    name: 'Amazigh (Berber)',
    region: 'middle-east-and-north-africa',
    homeland: 'the Maghreb and the Sahara',
    languages: ['tamazight', 'arabic'],
  }),

  // South Asia
  ethnicity('bengali', {
    name: 'Bengali',
    region: 'south-asia',
    homeland: 'Bengal',
    languages: ['bengali'],
  }),
  ethnicity('punjabi', {
    name: 'Punjabi',
    region: 'south-asia',
    homeland: 'the Punjab',
    languages: ['punjabi'],
  }),
  ethnicity('tamil', {
    name: 'Tamil',
    region: 'south-asia',
    homeland: 'the Tamil country of southern India and Ceylon',
    languages: ['tamil'],
  }),
  ethnicity('gujarati', {
    name: 'Gujarati',
    region: 'south-asia',
    homeland: 'Gujarat',
    languages: ['gujarati'],
  }),
  ethnicity('marathi', {
    name: 'Marathi',
    region: 'south-asia',
    homeland: 'Maharashtra',
    languages: ['marathi'],
  }),
  ethnicity('sinhalese', {
    name: 'Sinhalese',
    region: 'south-asia',
    homeland: 'Ceylon',
    languages: ['sinhala'],
  }),
  ethnicity('pashtun', {
    name: 'Pashtun',
    region: 'south-asia',
    homeland: 'Afghanistan and the North-West Frontier',
    languages: ['pashto'],
  }),

  // Central Asia
  ethnicity('kazakh', {
    name: 'Kazakh',
    region: 'central-asia',
    homeland: 'the Kazakh steppe',
    languages: ['kazakh'],
  }),
  ethnicity('uzbek', {
    name: 'Uzbek',
    region: 'central-asia',
    homeland: 'Turkestan',
    languages: ['uzbek'],
  }),

  // East Asia
  ethnicity('han-chinese', {
    name: 'Han Chinese',
    region: 'east-asia',
    homeland: 'China',
    languageChoice: ['mandarin', 'cantonese', 'hokkien', 'wu'],
  }),
  ethnicity('japanese', {
    name: 'Japanese',
    region: 'east-asia',
    homeland: 'Japan',
    languages: ['japanese'],
  }),
  ethnicity('korean', {
    name: 'Korean',
    region: 'east-asia',
    homeland: 'Korea',
    languages: ['korean'],
  }),
  ethnicity('mongol', {
    name: 'Mongol',
    region: 'east-asia',
    homeland: 'Mongolia',
    languages: ['mongolian'],
  }),
  ethnicity('tibetan', {
    name: 'Tibetan',
    region: 'east-asia',
    homeland: 'Tibet',
    languages: ['tibetan'],
  }),

  // Southeast Asia
  ethnicity('vietnamese', {
    name: 'Vietnamese',
    region: 'southeast-asia',
    homeland: 'Vietnam',
    languages: ['vietnamese'],
  }),
  ethnicity('thai', {
    name: 'Thai',
    region: 'southeast-asia',
    homeland: 'Siam',
    languages: ['thai'],
  }),
  ethnicity('burmese', {
    name: 'Burmese',
    region: 'southeast-asia',
    homeland: 'Burma',
    languages: ['burmese'],
  }),
  ethnicity('filipino', {
    name: 'Filipino',
    region: 'southeast-asia',
    homeland: 'the Philippines',
    languageChoice: ['tagalog', 'cebuano', 'ilocano'],
  }),
  ethnicity('malay', {
    name: 'Malay',
    region: 'southeast-asia',
    homeland: 'the Malay Peninsula and Archipelago',
    languages: ['malay'],
  }),
  ethnicity('javanese', {
    name: 'Javanese',
    region: 'southeast-asia',
    homeland: 'Java',
    languages: ['javanese', 'malay'],
  }),

  // Sub-Saharan Africa
  ethnicity('yoruba', {
    name: 'Yoruba',
    region: 'sub-saharan-africa',
    homeland: 'Yorubaland',
    languages: ['yoruba'],
  }),
  ethnicity('igbo', {
    name: 'Igbo',
    region: 'sub-saharan-africa',
    homeland: 'Igboland',
    languages: ['igbo'],
  }),
  ethnicity('hausa', {
    name: 'Hausa',
    region: 'sub-saharan-africa',
    homeland: 'Hausaland and the Sokoto Caliphate',
    languages: ['hausa'],
  }),
  ethnicity('akan', {
    name: 'Akan',
    region: 'sub-saharan-africa',
    homeland: 'the Gold Coast and Asante',
    languages: ['akan'],
  }),
  ethnicity('wolof', {
    name: 'Wolof',
    region: 'sub-saharan-africa',
    homeland: 'Senegambia',
    languages: ['wolof'],
  }),
  ethnicity('amhara', {
    name: 'Amhara',
    region: 'sub-saharan-africa',
    homeland: 'Abyssinia',
    languages: ['amharic'],
  }),
  ethnicity('somali', {
    name: 'Somali',
    region: 'sub-saharan-africa',
    homeland: 'the Somali coast and interior',
    languages: ['somali'],
  }),
  ethnicity('swahili', {
    name: 'Swahili',
    region: 'sub-saharan-africa',
    homeland: 'the Swahili coast of East Africa',
    languages: ['swahili'],
  }),
  ethnicity('kikuyu', {
    name: 'Kikuyu',
    region: 'sub-saharan-africa',
    homeland: 'the central highlands of Kenya',
    languages: ['kikuyu'],
  }),
  ethnicity('zulu', {
    name: 'Zulu',
    region: 'sub-saharan-africa',
    homeland: 'Zululand',
    languages: ['zulu'],
  }),
  ethnicity('xhosa', {
    name: 'Xhosa',
    region: 'sub-saharan-africa',
    homeland: 'the Eastern Cape',
    languages: ['xhosa'],
  }),
  ethnicity('afrikaner', {
    name: 'Afrikaner',
    region: 'sub-saharan-africa',
    homeland: 'the Cape and the Boer republics',
    languages: ['afrikaans'],
  }),
  ethnicity('malagasy', {
    name: 'Malagasy',
    region: 'sub-saharan-africa',
    homeland: 'Madagascar',
    languages: ['malagasy'],
  }),

  // North America
  ethnicity('anglo-american', {
    name: 'Anglo-American',
    region: 'north-america',
    homeland: 'the United States',
    languages: ['english'],
  }),
  ethnicity('african-american', {
    name: 'African American',
    region: 'north-america',
    homeland: 'the United States',
    languages: ['english'],
  }),
  ethnicity('french-canadian', {
    name: 'French Canadian',
    region: 'north-america',
    homeland: 'Quebec and French Canada',
    languages: ['french'],
  }),
  ethnicity('lakota', {
    name: 'Lakota',
    region: 'north-america',
    homeland: 'the northern Great Plains',
    languages: ['lakota'],
  }),
  ethnicity('cherokee', {
    name: 'Cherokee',
    region: 'north-america',
    homeland: 'the Cherokee Nation',
    languages: ['cherokee'],
  }),
  ethnicity('dine', {
    name: 'Diné (Navajo)',
    region: 'north-america',
    homeland: 'Dinétah, in the American Southwest',
    languages: ['navajo'],
  }),
  ethnicity('anishinaabe', {
    name: 'Anishinaabe',
    region: 'north-america',
    homeland: 'the Great Lakes',
    languages: ['ojibwe'],
  }),
  ethnicity('inuit', {
    name: 'Inuit',
    region: 'north-america',
    homeland: 'the North American Arctic',
    languages: ['inuktitut'],
  }),

  // Latin America and the Caribbean
  ethnicity('mexican', {
    name: 'Mexican',
    region: 'latin-america-and-caribbean',
    homeland: 'Mexico',
    languages: ['spanish'],
  }),
  ethnicity('nahua', {
    name: 'Nahua',
    region: 'latin-america-and-caribbean',
    homeland: 'central Mexico',
    languages: ['nahuatl', 'spanish'],
  }),
  ethnicity('maya', {
    name: 'Maya',
    region: 'latin-america-and-caribbean',
    homeland: 'the Yucatán and Guatemala',
    languageChoice: ['yucatec-maya', 'kiche'],
  }),
  ethnicity('quechua', {
    name: 'Quechua',
    region: 'latin-america-and-caribbean',
    homeland: 'the Andes',
    languages: ['quechua'],
  }),
  ethnicity('afro-brazilian', {
    name: 'Afro-Brazilian',
    region: 'latin-america-and-caribbean',
    homeland: 'Brazil',
    languages: ['portuguese'],
  }),
  ethnicity('afro-caribbean', {
    name: 'Afro-Caribbean',
    region: 'latin-america-and-caribbean',
    homeland: 'the Caribbean',
    languageChoice: ['english', 'spanish', 'french'],
  }),
  ethnicity('haitian', {
    name: 'Haitian',
    region: 'latin-america-and-caribbean',
    homeland: 'Haiti',
    languages: ['haitian-creole', 'french'],
  }),

  // Oceania
  ethnicity('maori', {
    name: 'Māori',
    region: 'oceania',
    homeland: 'Aotearoa (New Zealand)',
    languages: ['maori'],
  }),
  ethnicity('native-hawaiian', {
    name: 'Native Hawaiian',
    region: 'oceania',
    homeland: 'Hawaiʻi',
    languages: ['hawaiian'],
  }),
  ethnicity('samoan', {
    name: 'Samoan',
    region: 'oceania',
    homeland: 'Samoa',
    languages: ['samoan'],
  }),
  ethnicity('aboriginal-australian', {
    name: 'Aboriginal Australian',
    region: 'oceania',
    homeland: "your people's Country in Australia",
    languageChoice: ['arrernte', 'pitjantjatjara', 'wiradjuri', 'yolngu-matha'],
  }),
];

export function findEthnicity(id: string): EthnicityDefinition | undefined {
  return ETHNICITIES.find((entry) => entry.id === id);
}
