export type TimeUnit = 'round' | 'minute' | 'hour' | 'day';

export const SECONDS_PER_UNIT: Readonly<Record<TimeUnit, number>> = {
  round: 6,
  minute: 60,
  hour: 3600,
  day: 86400,
};

export type Duration =
  | { kind: 'instantaneous' }
  | { kind: 'timed'; amount: number; unit: TimeUnit; concentration: boolean }
  | { kind: 'until-dispelled'; orTriggered: boolean }
  | { kind: 'special' };

/** Length of a duration in seconds, or null if it has no fixed length. */
export function durationInSeconds(duration: Duration): number | null {
  switch (duration.kind) {
    case 'instantaneous':
      return 0;
    case 'timed':
      return duration.amount * SECONDS_PER_UNIT[duration.unit];
    case 'until-dispelled':
    case 'special':
      return null;
  }
}
