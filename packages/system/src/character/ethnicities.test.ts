import { describe, expect, it } from 'vitest';
import { WORLD_REGIONS } from './ethnicity';
import { ETHNICITIES, findEthnicity, homelandKnowledge } from './ethnicities';
import { HUMAN_TRAITS } from './human';

describe('ethnicities', () => {
  it('cover every world region', () => {
    const regions = new Set(ETHNICITIES.map((entry) => entry.region));
    expect([...regions].sort()).toEqual([...WORLD_REGIONS].sort());
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
