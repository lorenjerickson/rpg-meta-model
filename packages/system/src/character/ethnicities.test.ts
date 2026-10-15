import { describe, expect, it } from 'vitest';
import { languageCategory } from '../core/languages';
import { WORLD_REGIONS } from './ethnicity';
import { ETHNICITIES, findEthnicity, homelandKnowledge } from './ethnicities';
import { HUMAN_TRAITS } from './human';

describe('ethnicities', () => {
  it('have unique ids', () => {
    const ids = ETHNICITIES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cover every world region', () => {
    const regions = new Set(ETHNICITIES.map((entry) => entry.region));
    expect([...regions].sort()).toEqual([...WORLD_REGIONS].sort());
  });

  it('each give at least one language', () => {
    for (const entry of ETHNICITIES) {
      const choices = entry.languageChoice?.from.length ?? 0;
      expect(entry.languages.length + choices, entry.id).toBeGreaterThan(0);
    }
  });

  it('only pass on spoken languages, not classical languages, cants or signs', () => {
    for (const entry of ETHNICITIES) {
      for (const language of [...entry.languages, ...(entry.languageChoice?.from ?? [])]) {
        expect(languageCategory(language), `${entry.id} ${language}`).toBe('spoken');
      }
    }
  });

  it('only offer language choices with more than one option', () => {
    for (const entry of ETHNICITIES) {
      if (entry.languageChoice) {
        expect(entry.languageChoice.from.length, entry.id).toBeGreaterThan(1);
      }
    }
  });

  it('each grant Homeland Knowledge for their own homeland', () => {
    for (const entry of ETHNICITIES) {
      expect(entry.traits[0], entry.id).toEqual(homelandKnowledge(entry.homeland));
    }
  });

  it('can be looked up by id', () => {
    expect(findEthnicity('han-chinese')?.languageChoice?.from).toContain('cantonese');
    expect(findEthnicity('elf')).toBeUndefined();
  });
});

describe('homeland knowledge', () => {
  it('grants advantage on Intellect checks about the homeland', () => {
    expect(homelandKnowledge('Wales').effects).toEqual([
      {
        kind: 'roll-modifier',
        test: 'attribute-check',
        attributes: ['intellect'],
        mode: 'advantage',
        when: 'recalling information about Wales',
      },
    ]);
  });
});

describe('human traits', () => {
  it('match the 2024 Human', () => {
    expect(HUMAN_TRAITS.map((trait) => trait.id)).toEqual(['resourceful', 'skillful', 'versatile']);
  });
});
