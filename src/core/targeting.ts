/** How far away an effect can originate. Distances are in feet. */
export type EffectRange =
  | { kind: 'self' }
  | { kind: 'touch' }
  | { kind: 'distance'; feet: number }
  | { kind: 'sight' }
  | { kind: 'unlimited' };

export const FEET_PER_MILE = 5280;

export const AREA_SHAPES = ['cone', 'cube', 'cylinder', 'emanation', 'line', 'sphere'] as const;

export type AreaShape = (typeof AREA_SHAPES)[number];

/** Area of effect dimensions in feet. */
export type AreaOfEffect =
  | { shape: 'cone'; length: number }
  | { shape: 'cube'; size: number }
  | { shape: 'cylinder'; radius: number; height: number }
  | { shape: 'emanation'; distance: number }
  | { shape: 'line'; length: number; width: number }
  | { shape: 'sphere'; radius: number };
