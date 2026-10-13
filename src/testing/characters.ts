import type { Character } from '../character/character';
import { NO_DEATH_SAVES } from '../combat/deathSaves';

/**
 * A 5th-level Scholar (occult researcher) for tests: Intellect 17, proficient in Science with
 * expertise, Perception and History, and in the aetherics discipline.
 */
export function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test',
    name: 'Testa',
    ethnicityId: 'welsh',
    backgroundId: 'graduate',
    professions: [{ professionId: 'scholar', level: 5, specializationPath: ['occult-researcher'] }],
    experience: 6500,
    size: 'medium',
    speed: { walk: 30 },
    senses: {},
    attributeScores: {
      might: 8,
      agility: 14,
      hardiness: 14,
      intellect: 17,
      wisdom: 12,
      charisma: 10,
      fortune: 10,
      sanity: 10,
    },
    hitPoints: { current: 32, max: 32, temporary: 0 },
    hitDiceSpent: {},
    deathSaves: NO_DEATH_SAVES,
    exhaustion: 0,
    conditions: [],
    heroicInspiration: false,
    proficiencies: {
      savingThrows: ['intellect', 'sanity'],
      skills: { science: 'expertise', perception: 'proficient', history: 'proficient' },
      weapons: [{ category: 'simple' }],
      armor: [],
      tools: [],
      languages: ['english', 'welsh'],
      disciplines: ['aetherics'],
    },
    feats: [],
    inventory: [],
    money: 0,
    ...overrides,
  };
}
