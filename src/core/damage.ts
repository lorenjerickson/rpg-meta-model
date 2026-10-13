export const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'concussive',
  'decay',
  'fire',
  'lightning',
  'piercing',
  'poison',
  'psychic',
  'radiation',
  'slashing',
  'thunder',
] as const;

export type DamageType = (typeof DAMAGE_TYPES)[number];

export interface DamageResponses {
  resistances?: readonly DamageType[];
  vulnerabilities?: readonly DamageType[];
  immunities?: readonly DamageType[];
}

/**
 * Applies immunity, resistance (halve, round down) and vulnerability (double), in that order.
 * Multiple instances of resistance or vulnerability to one type count only once.
 * Flat bonuses and penalties should already be included in `amount`.
 */
export function adjustDamage(amount: number, type: DamageType, responses: DamageResponses): number {
  if (responses.immunities?.includes(type)) {
    return 0;
  }
  let result = Math.max(0, amount);
  if (responses.resistances?.includes(type)) {
    result = Math.floor(result / 2);
  }
  if (responses.vulnerabilities?.includes(type)) {
    result *= 2;
  }
  return result;
}
