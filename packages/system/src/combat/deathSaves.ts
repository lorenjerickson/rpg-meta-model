export interface DeathSaves {
  successes: number;
  failures: number;
}

export const DEATH_SAVE_DC = 10;
export const DEATH_SAVES_TO_RESOLVE = 3;

/**
 * `revived` means a natural 20: the character regains 1 hit point. Both `revived` and `stable`
 * reset the tally.
 */
export type DeathSaveStatus = 'dying' | 'stable' | 'dead' | 'revived';

export interface DeathSaveResult {
  deathSaves: DeathSaves;
  status: DeathSaveStatus;
}

export const NO_DEATH_SAVES: DeathSaves = { successes: 0, failures: 0 };

function settle(deathSaves: DeathSaves): DeathSaveResult {
  if (deathSaves.failures >= DEATH_SAVES_TO_RESOLVE) {
    return {
      deathSaves: { ...deathSaves, failures: DEATH_SAVES_TO_RESOLVE },
      status: 'dead',
    };
  }
  if (deathSaves.successes >= DEATH_SAVES_TO_RESOLVE) {
    return { deathSaves: NO_DEATH_SAVES, status: 'stable' };
  }
  return { deathSaves, status: 'dying' };
}

/**
 * Records a death saving throw. A natural 1 counts as two failures and a natural 20 revives the
 * character; otherwise the total (natural + modifier) is compared to DC 10.
 */
export function rollDeathSave(
  deathSaves: DeathSaves,
  natural: number,
  modifier = 0,
): DeathSaveResult {
  if (natural === 20) {
    return { deathSaves: NO_DEATH_SAVES, status: 'revived' };
  }
  if (natural === 1) {
    return settle({ ...deathSaves, failures: deathSaves.failures + 2 });
  }
  return natural + modifier >= DEATH_SAVE_DC
    ? settle({ ...deathSaves, successes: deathSaves.successes + 1 })
    : settle({ ...deathSaves, failures: deathSaves.failures + 1 });
}

/** Taking damage at 0 hit points is one failure, or two if it was a critical hit. */
export function damageWhileDying(deathSaves: DeathSaves, critical: boolean): DeathSaveResult {
  return settle({ ...deathSaves, failures: deathSaves.failures + (critical ? 2 : 1) });
}
