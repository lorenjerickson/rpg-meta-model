/** One choice of starting equipment, e.g. a class's option A, or option B of just gold. */
export interface EquipmentOption {
  label: string;
  items: readonly { itemId: string; quantity: number }[];
  gold: number;
}
