import { describe, expect, it } from 'vitest';
import { dice } from '../core/dice';
import { poolDie } from '../core/dicePool';
import {
  coverBonus,
  damageAfterSoak,
  doubledPool,
  effectiveSoak,
  resolveContest,
  rollContest,
  rollDamage,
} from './attacks';
import { NO_DEATH_SAVES, damageWhileDying, rollDeathSave } from './deathSaves';
import { grantTemporaryHitPoints, heal, isBloodied, takeDamage } from './hitPoints';

describe('hit points', () => {
  const full = { current: 20, max: 20, temporary: 5 };

  it('spends temporary hit points first', () => {
    const result = takeDamage(full, 8);
    expect(result.hitPoints).toEqual({ current: 17, max: 20, temporary: 0 });
    expect(result.absorbedByTemporary).toBe(5);
    expect(result.droppedToZero).toBe(false);
  });

  it('stops at 0 and detects massive damage', () => {
    const knockedOut = takeDamage(full, 30);
    expect(knockedOut.hitPoints.current).toBe(0);
    expect(knockedOut.droppedToZero).toBe(true);
    expect(knockedOut.instantDeath).toBe(false);

    expect(takeDamage(full, 45).instantDeath).toBe(true);
    expect(takeDamage({ current: 0, max: 20, temporary: 0 }, 20).instantDeath).toBe(true);
  });

  it('heals up to the maximum', () => {
    expect(heal({ current: 5, max: 20, temporary: 0 }, 100).current).toBe(20);
  });

  it('keeps the higher temporary hit points', () => {
    expect(grantTemporaryHitPoints(full, 3).temporary).toBe(5);
    expect(grantTemporaryHitPoints(full, 9).temporary).toBe(9);
  });

  it('is bloodied at half hit points or fewer', () => {
    expect(isBloodied({ current: 10, max: 20, temporary: 0 })).toBe(true);
    expect(isBloodied({ current: 11, max: 20, temporary: 0 })).toBe(false);
  });
});

describe('death saves', () => {
  it('stabilizes after three successes', () => {
    let state = NO_DEATH_SAVES;
    state = rollDeathSave(state, 12).deathSaves;
    state = rollDeathSave(state, 10).deathSaves;
    expect(rollDeathSave(state, 15).status).toBe('stable');
  });

  it('counts a natural 1 as two failures', () => {
    const result = rollDeathSave({ successes: 0, failures: 1 }, 1);
    expect(result.status).toBe('dead');
  });

  it('revives on a natural 20', () => {
    expect(rollDeathSave({ successes: 0, failures: 2 }, 20)).toEqual({
      deathSaves: NO_DEATH_SAVES,
      status: 'revived',
    });
  });

  it('adds failures for damage while dying', () => {
    expect(damageWhileDying(NO_DEATH_SAVES, false).deathSaves.failures).toBe(1);
    expect(damageWhileDying({ successes: 0, failures: 1 }, true).status).toBe('dead');
  });
});

describe('contests', () => {
  it('gives ties to the attacker, solid hits for 3 and criticals for 10', () => {
    expect(resolveContest(12, 17)).toEqual({
      attack: 12,
      defense: 17,
      margin: -5,
      success: false,
      solid: false,
      critical: false,
    });
    expect(resolveContest(15, 15).success).toBe(true);
    expect(resolveContest(17, 15).solid).toBe(false);
    expect(resolveContest(18, 15).solid).toBe(true);
    expect(resolveContest(25, 15).critical).toBe(true);
    expect(resolveContest(24, 15).critical).toBe(false);
  });

  it('rolls a d20 plus a pool, or a pool alone for soak', () => {
    const pool = [poolDie(1, 4, 'Rifle'), poolDie(1, 6, 'Diseased', -1)];
    const attack = rollContest(pool, { rng: () => 0.5 });
    expect(attack.natural).toBe(11);
    expect(attack.total).toBe(11 + 3 - 4);
    const armour = [poolDie(1, 10, 'Chest'), poolDie(1, 4, 'Helmet')];
    const soak = rollContest(armour, { d20: false, rng: () => 0.999 });
    expect(soak).toMatchObject({ natural: null, total: 14 });
  });

  it('reduces damage by the soak roll, never below 0, before immunity and vulnerability', () => {
    expect(damageAfterSoak(10, 6, 'fire')).toBe(4);
    expect(damageAfterSoak(5, 9, 'fire')).toBe(0);
    expect(damageAfterSoak(10, 4, 'fire', { vulnerabilities: ['fire'] })).toBe(12);
    expect(damageAfterSoak(10, 0, 'poison', { immunities: ['poison'] })).toBe(0);
  });

  it('doubles every damage die on a critical', () => {
    const pool = [poolDie(1, 4, 'Might')];
    expect(rollDamage(dice(1, 8), pool, false, () => 0.999)).toBe(8 + 4);
    expect(rollDamage(dice(1, 8), pool, true, () => 0.999)).toBe(16 + 8);
    expect(doubledPool(pool)).toEqual([poolDie(2, 4, 'Might')]);
  });

  it('ignores soak on a solid hit', () => {
    expect(effectiveSoak(6, resolveContest(14, 12))).toBe(6);
    expect(effectiveSoak(6, resolveContest(15, 12))).toBe(0);
    expect(effectiveSoak(-2, resolveContest(12, 12))).toBe(0);
  });

  it('adds flat cover bonuses to defense', () => {
    expect(coverBonus('none')).toBe(0);
    expect(coverBonus('half')).toBe(2);
    expect(coverBonus('three-quarters')).toBe(5);
    expect(coverBonus('total')).toBeNull();
  });
});
