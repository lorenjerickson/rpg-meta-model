import type { TimeUnit, Duration } from '../../core/time';
import type { EffectRange } from '../../core/targeting';

export const SELF: EffectRange = { kind: 'self' };
export const TOUCH: EffectRange = { kind: 'touch' };

export function feet(distance: number): EffectRange {
  return { kind: 'distance', feet: distance };
}

export const INSTANTANEOUS: Duration = { kind: 'instantaneous' };

export function lasting(amount: number, unit: TimeUnit): Duration {
  return { kind: 'timed', amount, unit, concentration: false };
}

/** A duration that needs the operator to keep the device running steadily. */
export function sustained(amount: number, unit: TimeUnit): Duration {
  return { kind: 'timed', amount, unit, concentration: true };
}

export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
