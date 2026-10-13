import { describe, expect, it } from 'vitest';
import { ATTRIBUTES } from '../core/attributes';
import { HOSPITALITY, PROFESSIONS, SOLDIER, STREET_RAT, findProfession } from './catalog';
import { meetsProfessionPrerequisite, professionDc } from './profession';
import { RANKS, compareRanks, hasReachedRank, rankForLevel } from './ranks';
import {
  childSpecializations,
  nextSpecializationOptions,
  specializationGrants,
  validateProfession,
  validateSpecializationPath,
} from './specializations';

const scores = {
  might: 13,
  agility: 12,
  hardiness: 10,
  intellect: 10,
  wisdom: 13,
  charisma: 12,
  fortune: 10,
  sanity: 10,
};

describe('ranks', () => {
  it.each([
    [1, 'novice'],
    [4, 'novice'],
    [5, 'apprentice'],
    [9, 'journeyman'],
    [13, 'master'],
    [17, 'grand-master'],
    [20, 'grand-master'],
  ])('profession level %i is %s', (level, rank) => {
    expect(rankForLevel(level)).toBe(rank);
  });

  it('compares ranks', () => {
    expect(compareRanks('master', 'apprentice')).toBeGreaterThan(0);
    expect(hasReachedRank(9, 'journeyman')).toBe(true);
    expect(hasReachedRank(8, 'journeyman')).toBe(false);
    expect(() => rankForLevel(0)).toThrow(RangeError);
  });
});

describe('specialization paths', () => {
  it('offers first-tier specializations from apprentice rank', () => {
    expect(nextSpecializationOptions(SOLDIER, 4, [])).toEqual([]);
    expect(nextSpecializationOptions(SOLDIER, 5, []).map((entry) => entry.id)).toEqual([
      'rifleman',
      'grenadier',
    ]);
  });

  it('offers the next step only when its rank is reached', () => {
    expect(nextSpecializationOptions(SOLDIER, 8, ['rifleman'])).toEqual([]);
    expect(nextSpecializationOptions(SOLDIER, 9, ['rifleman']).map((entry) => entry.id)).toEqual([
      'sniper',
    ]);
  });

  it('follows the example chains', () => {
    expect(validateSpecializationPath(SOLDIER, 13, ['rifleman', 'sniper', 'assassin'])).toEqual([]);
    expect(
      validateSpecializationPath(SOLDIER, 13, ['grenadier', 'demolitions', 'artillery']),
    ).toEqual([]);
    expect(
      validateSpecializationPath(HOSPITALITY, 13, ['barkeep', 'innkeeper', 'landlord']),
    ).toEqual([]);
    expect(
      validateSpecializationPath(STREET_RAT, 13, ['gang-leader', 'city-boss', 'crime-lord']),
    ).toEqual([]);
  });

  it('reports broken paths', () => {
    expect(validateSpecializationPath(SOLDIER, 13, ['rifleman', 'demolitions'])).toEqual([
      'Demolitions Expert does not follow rifleman',
    ]);
    expect(validateSpecializationPath(SOLDIER, 9, ['rifleman', 'sniper', 'assassin'])).toEqual([
      'Assassin needs Master rank (Soldier level 9 is too low)',
    ]);
    expect(validateSpecializationPath(SOLDIER, 20, ['barkeep'])).toEqual([
      'barkeep is not a Soldier specialization',
    ]);
  });

  it('collects what a path grants', () => {
    const grants = specializationGrants(SOLDIER, ['rifleman', 'sniper']);
    expect(grants.skills).toEqual(['perception', 'stealth']);
    expect(grants.actions.map((entry) => entry.id)).toEqual([
      'field-grit',
      'steady-aim',
      'hidden-shot',
    ]);
  });
});

describe('profession rules', () => {
  it('computes the profession DC', () => {
    expect(professionDc(3, 2)).toBe(13);
  });

  it('checks prerequisites for a second profession', () => {
    expect(meetsProfessionPrerequisite(SOLDIER, scores)).toBe(true);
    expect(meetsProfessionPrerequisite(STREET_RAT, scores)).toBe(false);
    expect(meetsProfessionPrerequisite(findProfession('frontier-hand') ?? SOLDIER, scores)).toBe(
      false,
    );
  });
});

describe('profession catalog', () => {
  it('has unique profession ids and globally unique specialization ids', () => {
    const professionIds = PROFESSIONS.map((profession) => profession.id);
    const specializationIds = PROFESSIONS.flatMap((profession) =>
      profession.specializations.map((entry) => entry.id),
    );
    expect(new Set(professionIds).size).toBe(professionIds.length);
    expect(new Set(specializationIds).size).toBe(specializationIds.length);
  });

  it.each(PROFESSIONS.map((profession) => [profession.id, profession] as const))(
    '%s is structurally valid',
    (_id, profession) => {
      expect(validateProfession(profession)).toEqual([]);
    },
  );

  it.each(PROFESSIONS.map((profession) => [profession.id, profession] as const))(
    '%s meets the profession requirements',
    (_id, profession) => {
      const [first, second] = profession.savingThrows;
      expect(first).not.toBe(second);
      expect(ATTRIBUTES).toContain(first);
      expect(profession.actions.length).toBeGreaterThan(0);
      expect(childSpecializations(profession, null).length).toBeGreaterThanOrEqual(2);
      for (const specialization of profession.specializations) {
        expect(specialization.skills.length, specialization.id).toBeGreaterThan(0);
        expect(specialization.actions.length, specialization.id).toBeGreaterThan(0);
      }
    },
  );

  it('specializes every branch through to master rank', () => {
    for (const profession of PROFESSIONS) {
      for (const root of childSpecializations(profession, null)) {
        let node = root;
        const path = [node.id];
        for (let next = childSpecializations(profession, node.id)[0]; next;) {
          node = next;
          path.push(node.id);
          next = childSpecializations(profession, node.id)[0];
        }
        expect(node.rank, path.join(' -> ')).toBe('master');
      }
    }
  });

  it('gives Fortune and Sanity saves to some professions', () => {
    const savingWith = (attribute: 'fortune' | 'sanity') =>
      PROFESSIONS.filter((profession) => profession.savingThrows.includes(attribute)).map(
        (profession) => profession.id,
      );
    expect(savingWith('fortune')).toEqual(['street-rat', 'merchant', 'journalist']);
    expect(savingWith('sanity')).toEqual(['physician', 'clergy', 'scholar']);
  });

  it('includes every rank in order', () => {
    expect(RANKS).toEqual(['novice', 'apprentice', 'journeyman', 'master', 'grand-master']);
  });
});
