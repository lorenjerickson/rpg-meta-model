import type { Size } from '../core/creatures';

/** Pounds a creature can carry per point of Strength, by size. */
export const CARRYING_CAPACITY_PER_STRENGTH: Readonly<Record<Size, number>> = {
  tiny: 7.5,
  small: 15,
  medium: 15,
  large: 30,
  huge: 60,
  gargantuan: 120,
};

export function carryingCapacity(strengthScore: number, size: Size = 'medium'): number {
  return strengthScore * CARRYING_CAPACITY_PER_STRENGTH[size];
}

/**
 * A creature can drag, lift or push up to twice its carrying capacity, but its speed is at most
 * 5 feet while doing so if the weight exceeds its carrying capacity.
 */
export function dragLiftPushCapacity(strengthScore: number, size: Size = 'medium'): number {
  return carryingCapacity(strengthScore, size) * 2;
}
