import { describe, expect, it } from 'vitest';
import { SKILLS, type Skill } from '../core/skills';
import { findItem, isKnownToolProficiency } from '../equipment/catalog';
import { PROFESSIONS } from '../professions/catalog';
import { featGainedAtLevel } from '../professions/profession';
import { makeCharacter } from '../testing/characters';
import {
  BACKGROUNDS,
  BACKGROUND_EQUIPMENT_VALUE,
  FEATS,
  equipmentOptionValue,
  findFeat,
} from './catalog';
import { FEAT_CATEGORIES, meetsFeatPrerequisite, type FeatDefinition } from './feats';

function feat(id: string): FeatDefinition {
  const found = findFeat(id);
  if (found === undefined) {
    throw new Error(`Missing ${id}`);
  }
  return found;
}

const MAGICAL_TERMS = [
  'magic',
  'spell',
  'arcan',
  'mystic',
  'wizard',
  'enchant',
  'divine',
  'planar',
  'teleport',
];

describe('backgrounds', () => {
  it('has a broad selection with unique ids', () => {
    const ids = BACKGROUNDS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(BACKGROUNDS.length).toBeGreaterThanOrEqual(15);
  });

  it.each(BACKGROUNDS.map((entry) => [entry.id, entry] as const))(
    '%s is well-formed',
    (_id, entry) => {
      expect(new Set(entry.attributes).size).toBe(3);
      expect(new Set(entry.skillProficiencies).size).toBe(2);
      expect(findFeat(entry.feat)?.category).toBe('origin');
      expect(isKnownToolProficiency(entry.toolProficiency)).toBe(true);

      const [kit, money] = entry.equipment;
      expect(kit?.items.map((item) => item.itemId)).toContain(entry.toolProficiency);
      for (const item of kit?.items ?? []) {
        expect(findItem(item.itemId), item.itemId).toBeDefined();
      }
      expect(kit?.money).toBeGreaterThanOrEqual(0);
      expect(equipmentOptionValue(kit ?? { label: '', items: [], money: 0 })).toBe(
        BACKGROUND_EQUIPMENT_VALUE,
      );
      expect(money).toEqual({ label: 'B', items: [], money: BACKGROUND_EQUIPMENT_VALUE });
    },
  );

  it('lets backgrounds raise Fortune and Sanity', () => {
    const raised = new Set(BACKGROUNDS.flatMap((entry) => entry.attributes));
    expect(raised.has('fortune')).toBe(true);
    expect(raised.has('sanity')).toBe(true);
  });
});

describe('feats', () => {
  it('has unique ids and every category', () => {
    const ids = FEATS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(FEATS.map((entry) => entry.category))).toEqual(new Set(FEAT_CATEGORIES));
  });

  it('caps attribute increases at 20, or 30 for epic boons', () => {
    for (const entry of FEATS) {
      if (entry.attributeScoreIncrease) {
        expect(entry.attributeScoreIncrease.max, entry.id).toBe(
          entry.category === 'epic-boon' ? 30 : 20,
        );
      }
    }
  });

  it('contains no magical terms in backgrounds or feats', () => {
    const text = JSON.stringify([...BACKGROUNDS, ...FEATS]).toLowerCase();
    for (const term of MAGICAL_TERMS) {
      expect(text, term).not.toContain(term);
    }
  });
});

describe('feat prerequisites', () => {
  const scholar = makeCharacter();

  it('applies category minimum levels', () => {
    expect(meetsFeatPrerequisite(feat('alert'), scholar)).toBe(true);
    expect(meetsFeatPrerequisite(feat('resilient-mind'), scholar)).toBe(true);
    expect(meetsFeatPrerequisite(feat('boon-of-fate'), scholar)).toBe(false);
    expect(
      meetsFeatPrerequisite(
        feat('resilient-mind'),
        makeCharacter({
          professions: [{ professionId: 'scholar', level: 3, specializationPath: [] }],
        }),
      ),
    ).toBe(false);
  });

  it('checks attribute scores', () => {
    expect(meetsFeatPrerequisite(feat('crack-shot'), scholar)).toBe(true);
    expect(meetsFeatPrerequisite(feat('grappler'), scholar)).toBe(true);
    const weak = makeCharacter({
      attributeScores: { ...scholar.attributeScores, might: 8, agility: 12 },
    });
    expect(meetsFeatPrerequisite(feat('grappler'), weak)).toBe(false);
  });

  it('checks weapon proficiency for fighting styles', () => {
    expect(meetsFeatPrerequisite(feat('marksmanship'), scholar)).toBe(false);
    const soldier = makeCharacter({
      proficiencies: {
        ...scholar.proficiencies,
        weapons: [{ category: 'simple' }, { category: 'martial' }],
      },
    });
    expect(meetsFeatPrerequisite(feat('marksmanship'), soldier)).toBe(true);
  });

  it('checks discipline proficiency', () => {
    expect(meetsFeatPrerequisite(feat('gadgeteer'), scholar)).toBe(true);
    const layman = makeCharacter({ proficiencies: { ...scholar.proficiencies, disciplines: [] } });
    expect(meetsFeatPrerequisite(feat('gadgeteer'), layman)).toBe(false);
  });
});

describe('skill coverage', () => {
  it('makes every skill available from some profession or background', () => {
    const available = new Set<Skill>([
      ...BACKGROUNDS.flatMap((entry) => entry.skillProficiencies),
      ...PROFESSIONS.flatMap((profession) => [
        ...profession.skillProficiencies.from,
        ...profession.specializations.flatMap((entry) => entry.skills),
      ]),
    ]);
    expect(SKILLS.filter((skill) => !available.has(skill))).toEqual([]);
  });
});

describe('feat progression', () => {
  it.each([
    [1, null],
    [4, 'general'],
    [5, null],
    [8, 'general'],
    [16, 'general'],
    [19, 'epic-boon'],
    [20, null],
  ])('profession level %i grants %s', (level, kind) => {
    expect(featGainedAtLevel(level)).toBe(kind);
  });
});
