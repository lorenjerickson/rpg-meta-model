/** The actions any creature can take on its turn. */
export const ACTIONS = [
  'attack',
  'dash',
  'disengage',
  'dodge',
  'help',
  'hide',
  'influence',
  'ready',
  'search',
  'study',
  'utilize',
] as const;

export type ActionId = (typeof ACTIONS)[number];

/** What part of a creature's turn an activity uses up. */
export type ActionCost = 'action' | 'bonus-action' | 'reaction' | 'free';

export const REST_TYPES = ['short', 'long'] as const;

export type RestType = (typeof REST_TYPES)[number];

export const REST_DURATION_HOURS: Readonly<Record<RestType, number>> = {
  short: 1,
  long: 8,
};
