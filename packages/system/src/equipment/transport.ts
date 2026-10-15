import type { ItemBase } from './items';

export interface MountDefinition extends ItemBase {
  category: 'mount';
  speedFeet: number;
  carryingCapacityLb: number;
}

export const VEHICLE_TYPES = ['land', 'water', 'air'] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const PROPULSION = [
  'animal',
  'pedal',
  'oar',
  'sail',
  'steam',
  'petrol',
  'electric',
  'buoyancy',
] as const;

export type Propulsion = (typeof PROPULSION)[number];

/** Proficiencies for operating vehicles, used alongside tool proficiencies. */
export const VEHICLE_PROFICIENCIES = ['vehicles-land', 'vehicles-water', 'vehicles-air'] as const;

export type VehicleProficiency = (typeof VEHICLE_PROFICIENCIES)[number];

export interface VehicleDefinition extends ItemBase {
  category: 'vehicle';
  vehicleType: VehicleType;
  propulsion: Propulsion;
  /** Travel speed in miles per hour. */
  speedMph: number;
  crew: number;
  passengers: number;
  cargoTons: number;
  /** The vehicle's defense against attacks on it. */
  armorClass?: number;
  hitPoints?: number;
  /** Damage below this from a single hit is ignored. */
  damageThreshold?: number;
}

export function vehicleProficiencyFor(vehicle: VehicleDefinition): VehicleProficiency {
  return `vehicles-${vehicle.vehicleType}`;
}
