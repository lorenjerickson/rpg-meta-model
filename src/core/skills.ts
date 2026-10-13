import type { Attribute } from './attributes';

export const SKILLS = [
  'acrobatics',
  'animal-handling',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'science',
  'sleight-of-hand',
  'stealth',
  'survival',
] as const;

export type Skill = (typeof SKILLS)[number];

export interface SkillDefinition {
  name: string;
  attribute: Attribute;
}

export const SKILL_DEFINITIONS: Readonly<Record<Skill, SkillDefinition>> = {
  acrobatics: { name: 'Acrobatics', attribute: 'agility' },
  'animal-handling': { name: 'Animal Handling', attribute: 'wisdom' },
  athletics: { name: 'Athletics', attribute: 'might' },
  deception: { name: 'Deception', attribute: 'charisma' },
  history: { name: 'History', attribute: 'intellect' },
  insight: { name: 'Insight', attribute: 'wisdom' },
  intimidation: { name: 'Intimidation', attribute: 'charisma' },
  investigation: { name: 'Investigation', attribute: 'intellect' },
  medicine: { name: 'Medicine', attribute: 'wisdom' },
  nature: { name: 'Nature', attribute: 'intellect' },
  perception: { name: 'Perception', attribute: 'wisdom' },
  performance: { name: 'Performance', attribute: 'charisma' },
  persuasion: { name: 'Persuasion', attribute: 'charisma' },
  religion: { name: 'Religion', attribute: 'intellect' },
  science: { name: 'Science', attribute: 'intellect' },
  'sleight-of-hand': { name: 'Sleight of Hand', attribute: 'agility' },
  stealth: { name: 'Stealth', attribute: 'agility' },
  survival: { name: 'Survival', attribute: 'wisdom' },
};
