import { describe, expect, it } from 'vitest';
import { CREATURE_TYPES } from '../core/creatures';
import { MONSTERS, findMonster } from './catalog';
import { rateEncounter } from './encounters';
import { poolDie } from '../core/dicePool';
import {
  MONSTER_ORIGINS,
  monsterDefense,
  monsterSavePool,
  monsterSoakPool,
  monsterXp,
} from './statBlock';

function monster(id: string) {
  const found = findMonster(id);
  if (found === undefined) {
    throw new Error(`Missing ${id}`);
  }
  return found;
}

describe('bestiary', () => {
  it('has a large selection', () => {
    expect(MONSTERS.length).toBeGreaterThanOrEqual(50);
  });

  it.each(MONSTERS.map((entry) => [entry.id, entry] as const))(
    '%s has an origin and is described',
    (_id, entry) => {
      expect(MONSTER_ORIGINS).toContain(entry.origin);
      expect(entry.description).toBeTruthy();
      const abilities = [
        ...entry.traits,
        ...entry.actions,
        ...entry.bonusActions,
        ...entry.reactions,
      ];
      for (const ability of abilities) {
        expect(ability.description.length, ability.id).toBeGreaterThan(10);
      }
    },
  );

  it('keeps anomalies and the reanimated consistent with their origin', () => {
    for (const entry of MONSTERS) {
      if (entry.creatureType === 'anomaly') {
        expect(entry.origin, entry.id).toBe('anomaly');
      }
      if (entry.creatureType === 'undead') {
        expect(entry.origin, entry.id).toBe('reanimation');
      }
    }
  });

  it('covers every creature type', () => {
    const used = new Set(MONSTERS.map((entry) => entry.creatureType));
    expect([...used].sort()).toEqual([...CREATURE_TYPES].sort());
  });

  it('uses Sanity saves for the horrors', () => {
    const sanity = MONSTERS.filter((entry) =>
      [...entry.traits, ...entry.actions].some(
        (ability) => ability.savingThrow?.attribute === 'sanity',
      ),
    );
    expect(sanity.length).toBeGreaterThanOrEqual(8);
  });

  it('contains no magical creatures or terms', () => {
    const text = JSON.stringify(MONSTERS).toLowerCase();
    const terms = [
      'magic',
      'spell',
      'arcane',
      'mystic',
      'wizard',
      'enchant',
      'divine',
      'celestial',
      'fey',
      'fiend',
      'demon',
      'devil',
      'elemental',
      'necrotic',
      'radiant',
      'curse',
    ];
    // "Electromagnetic forces" is fine; Force as a damage type is not.
    expect(text).not.toContain('"type":"force"');
    for (const term of terms) {
      expect(text, term).not.toMatch(new RegExp(`\\b${term}`));
    }
  });
});

describe('generated stat-block dice', () => {
  it('builds attacks from attribute and proficiency dice', () => {
    const bite = monster('wolf').actions.find((entry) => entry.id === 'bite');
    expect(bite?.attack?.pool).toEqual([poolDie(1, 4, 'Might'), poolDie(1, 4, 'Proficiency')]);
    expect(bite?.description).toBe(
      'Melee Attack: d20 + d4 (Might) + d4 (Proficiency), reach 5 ft. Hit: 1d6 + d4 (Might) ' +
        'Piercing damage. If the target is Medium or smaller, it has the Prone condition.',
    );
  });

  it('contests saving throws with an effect roll', () => {
    const breath = monster('incendiary-hound').actions.find(
      (entry) => entry.id === 'naphtha-breath',
    );
    expect(breath?.savingThrow).toMatchObject({
      attribute: 'agility',
      pool: [poolDie(1, 4, 'Hardiness'), poolDie(1, 4, 'Proficiency')],
    });
    expect(breath?.description).toBe(
      'Agility Saving Throw against d20 + d4 (Hardiness) + d4 (Proficiency), each creature in ' +
        'a 15-foot Cone. Failure: 17 (5d6) Fire damage. Success: Half damage.',
    );
    expect(breath?.usage).toEqual({ kind: 'recharge', minimum: 5 });
  });

  it('has natural armour defense, initiative and saving throw dice', () => {
    const progenitor = monster('abyssal-progenitor');
    expect(progenitor.defense).toBe(17);
    expect(progenitor.initiative).toEqual([poolDie(1, 2, 'Agility', -1)]);
    expect(progenitor.passivePerception).toBe(10 + 2 + 2 * 4);
    expect(progenitor.savingThrows?.sanity).toEqual([
      poolDie(1, 10, 'Sanity'),
      poolDie(1, 8, 'Proficiency'),
    ]);
    expect(monsterSavePool(progenitor, 'might')).toEqual([poolDie(1, 10, 'Might')]);
    expect(progenitor.legendaryActions?.usesInLair).toBe(4);
  });

  it('dresses people in catalog clothing and armour', () => {
    const cultist = monster('cultist');
    expect(cultist.defense).toBe(6 + 4 + 1 + 1);
    expect(cultist.gear).toEqual(['work-clothes', 'flat-cap', 'work-boots']);
    const veteran = monster('veteran-soldier');
    expect(monsterSoakPool(veteran, 'piercing')).toEqual([poolDie(1, 4, 'Soak')]);
    expect(monsterSoakPool(veteran, 'cold')).toEqual([poolDie(1, 4, 'Soak')]);
  });

  it('soaks with shells and plating, and applies conditions', () => {
    const juggernaut = monster('steam-juggernaut');
    expect(monsterSoakPool(juggernaut, 'bludgeoning')).toEqual([poolDie(2, 6, 'Soak')]);
    expect(monsterDefense(juggernaut, 'melee')).toBe(18);
    expect(monsterDefense(juggernaut, 'melee', ['restrained'])).toBe(18 - 3);
  });

  it('contests every save against a creature with an effect roll, not a fixed DC', () => {
    const text = JSON.stringify(MONSTERS);
    expect(text).not.toMatch(/DC \d+ [A-Z][a-z]+ saving throw/);
    expect(text).not.toContain('{effect:');
    expect(text).toContain('Hardiness saving throw against d20 +');
  });

  it('feeds encounter building', () => {
    const party = [3, 3, 3, 3];
    const ghouls = (count: number) =>
      Array.from({ length: count }, () => monsterXp(monster('ghoul')));
    expect(rateEncounter(party, ghouls(3))).toBe('low');
    expect(rateEncounter(party, ghouls(4))).toBe('moderate');
  });
});
