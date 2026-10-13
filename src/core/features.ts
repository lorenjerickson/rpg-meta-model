/** A named rules element such as a profession action, ethnicity trait or feat benefit. */
export interface Feature {
  id: string;
  name: string;
  description: string;
}

/** How often a limited-use feature can be used before it must be recovered. */
export type Usage =
  | { kind: 'at-will' }
  | { kind: 'per-rest'; uses: number | 'proficiency-bonus'; recovery: 'short' | 'long' }
  | { kind: 'per-day'; uses: number }
  | { kind: 'recharge'; minimum: number }
  | { kind: 'charges'; max: number };
