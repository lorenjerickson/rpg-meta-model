import type { Attribute } from './attributes';

export const SKILLS = [
  'acrobatics',
  'animal-handling',
  'athletics',
  'bureaucracy',
  'deception',
  'etiquette',
  'gambling',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'legerdemain',
  'mechanics',
  'medicine',
  'natural-history',
  'occult',
  'perception',
  'performance',
  'persuasion',
  'science',
  'stealth',
  'streetwise',
  'survival',
  'theology',
] as const;

export type Skill = (typeof SKILLS)[number];

export interface SkillDefinition {
  name: string;
  attribute: Attribute;
  description: string;
}

export const SKILL_DEFINITIONS: Readonly<Record<Skill, SkillDefinition>> = {
  acrobatics: {
    name: 'Acrobatics',
    attribute: 'agility',
    description: 'Keeping your footing, tumbling, and moving across rooftops and rigging.',
  },
  'animal-handling': {
    name: 'Animal Handling',
    attribute: 'wisdom',
    description: 'Calming, riding and driving horses, dogs and working animals.',
  },
  athletics: {
    name: 'Athletics',
    attribute: 'might',
    description: 'Climbing, jumping, swimming, wrestling and feats of strength.',
  },
  bureaucracy: {
    name: 'Bureaucracy',
    attribute: 'intellect',
    description: 'Permits, records, archives and officialdom: getting things through the system.',
  },
  deception: {
    name: 'Deception',
    attribute: 'charisma',
    description: 'Lying convincingly, playing a part and spinning a story.',
  },
  etiquette: {
    name: 'Etiquette',
    attribute: 'charisma',
    description: 'Moving through society: precedence, titles, forms of address and the right fork.',
  },
  gambling: {
    name: 'Gambling',
    attribute: 'fortune',
    description: 'Games of chance, reading the odds, and knowing when to push your luck.',
  },
  history: {
    name: 'History',
    attribute: 'intellect',
    description: 'Past events, empires, wars, families and antiquities.',
  },
  insight: {
    name: 'Insight',
    attribute: 'wisdom',
    description: 'Reading people: their moods, motives and lies.',
  },
  intimidation: {
    name: 'Intimidation',
    attribute: 'charisma',
    description: 'Threats, menace and the hint of violence.',
  },
  investigation: {
    name: 'Investigation',
    attribute: 'intellect',
    description: 'Looking for clues, making deductions and following evidence.',
  },
  legerdemain: {
    name: 'Legerdemain',
    attribute: 'agility',
    description: "Picking pockets, palming objects and the conjurer's quick hands.",
  },
  mechanics: {
    name: 'Mechanics',
    attribute: 'intellect',
    description: 'Understanding, operating and fixing engines, clockwork and machinery.',
  },
  medicine: {
    name: 'Medicine',
    attribute: 'wisdom',
    description: 'Diagnosing illness, treating wounds and recognising poisons.',
  },
  'natural-history': {
    name: 'Natural History',
    attribute: 'intellect',
    description: 'Plants, animals, geology and weather, as studied by the naturalists.',
  },
  occult: {
    name: 'Occult',
    attribute: 'sanity',
    description:
      'Grasping the esoteric and the unexplained, from séances to forbidden texts, without ' +
      'losing your grip.',
  },
  perception: {
    name: 'Perception',
    attribute: 'wisdom',
    description: 'Noticing things: a sound in the fog, a face in the crowd.',
  },
  performance: {
    name: 'Performance',
    attribute: 'charisma',
    description: 'Acting, music, oratory and holding an audience.',
  },
  persuasion: {
    name: 'Persuasion',
    attribute: 'charisma',
    description: 'Winning people over with reason, charm or good manners.',
  },
  science: {
    name: 'Science',
    attribute: 'intellect',
    description: 'Chemistry, physics, electricity and the latest theories of the age.',
  },
  stealth: {
    name: 'Stealth',
    attribute: 'agility',
    description: 'Moving unseen and unheard.',
  },
  streetwise: {
    name: 'Streetwise',
    attribute: 'charisma',
    description:
      'The street and the underworld: finding a fence, reading a rookery, knowing who runs what.',
  },
  survival: {
    name: 'Survival',
    attribute: 'wisdom',
    description: 'Tracking, foraging, finding your way and enduring the wild.',
  },
  theology: {
    name: 'Theology',
    attribute: 'intellect',
    description: 'Faiths, scripture, rites and the history of churches and sects.',
  },
};
