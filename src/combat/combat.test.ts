import { describe, expect, it } from 'vitest';
import { coverBonus, resolveAttack } from './attacks';
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

describe('attacks', () => {
  it('resolves hits, misses and critical hits', () => {
    expect(resolveAttack(1, 20, 5)).toBe('miss');
    expect(resolveAttack(20, -5, 30)).toBe('critical-hit');
    expect(resolveAttack(19, 0, 15, 19)).toBe('critical-hit');
    expect(resolveAttack(10, 5, 15)).toBe('hit');
    expect(resolveAttack(9, 5, 15)).toBe('miss');
  });

  it('grants cover bonuses', () => {
    expect(coverBonus('half')).toBe(2);
    expect(coverBonus('three-quarters')).toBe(5);
    expect(coverBonus('total')).toBeNull();
  });
});
