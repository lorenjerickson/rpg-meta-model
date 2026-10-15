export interface HitPoints {
  current: number;
  max: number;
  temporary: number;
}

export interface DamageResult {
  hitPoints: HitPoints;
  absorbedByTemporary: number;
  /** The damage took the creature from above 0 hit points to 0. */
  droppedToZero: boolean;
  /**
   * Massive damage: after reaching 0 hit points, the remaining damage equals or exceeds the
   * hit point maximum. Monsters usually just die at 0, so this matters mostly for characters.
   */
  instantDeath: boolean;
}

/** Temporary hit points absorb damage first; current hit points never drop below 0. */
export function takeDamage(hitPoints: HitPoints, amount: number): DamageResult {
  const absorbedByTemporary = Math.min(hitPoints.temporary, amount);
  const remaining = amount - absorbedByTemporary;
  const current = Math.max(0, hitPoints.current - remaining);
  const leftover = remaining - hitPoints.current;
  return {
    hitPoints: {
      ...hitPoints,
      current,
      temporary: hitPoints.temporary - absorbedByTemporary,
    },
    absorbedByTemporary,
    droppedToZero: hitPoints.current > 0 && current === 0,
    instantDeath: remaining > 0 && leftover >= hitPoints.max,
  };
}

/** Healing can't raise hit points above the maximum and doesn't restore temporary hit points. */
export function heal(hitPoints: HitPoints, amount: number): HitPoints {
  return { ...hitPoints, current: Math.min(hitPoints.max, hitPoints.current + amount) };
}

/** Temporary hit points don't stack: keep whichever amount is higher. */
export function grantTemporaryHitPoints(hitPoints: HitPoints, amount: number): HitPoints {
  return { ...hitPoints, temporary: Math.max(hitPoints.temporary, amount) };
}

/** Half of the maximum, rounded down: the threshold for being Bloodied. */
export function isBloodied(hitPoints: HitPoints): boolean {
  return hitPoints.current > 0 && hitPoints.current <= Math.floor(hitPoints.max / 2);
}
