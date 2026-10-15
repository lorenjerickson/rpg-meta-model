import type { Money } from '../core/currency';

/** One choice of starting equipment, e.g. a profession's option A, or option B of just money. */
export interface EquipmentOption {
  label: string;
  items: readonly { itemId: string; quantity: number }[];
  money: Money;
}
