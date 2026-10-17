import { z } from 'zod';
import {
  AttributeSchema,
  DamageTypeSchema,
  DefenseBonusSchema,
  DiceExpressionSchema,
  IdSchema,
  MoneySchema,
  NameSchema,
  RollModifierSchema,
  TextSchema,
  uniqueList,
} from '../core/schemas';
import { ARMOR_CATEGORIES, type ArmorDefinition } from './armor';
import {
  RARITIES,
  TOOL_CATEGORIES,
  type AmmunitionDefinition,
  type GearDefinition,
  type ToolDefinition,
} from './items';
import { EQUIPMENT_SLOTS } from './protection';
import {
  PROPULSION,
  VEHICLE_TYPES,
  type MountDefinition,
  type VehicleDefinition,
} from './transport';
import {
  BURST_FIRE_ROUNDS,
  WEAPON_CATEGORIES,
  WEAPON_MASTERIES,
  WEAPON_PROPERTIES,
  WEAPON_TYPES,
  type WeaponDefinition,
  type WeaponProficiency,
  type WeaponProperty,
} from './weapons';

/** The fields every item has; each kind of item adds its own. */
export const itemBaseShape = {
  id: IdSchema,
  name: NameSchema,
  weightLb: z.number().nonnegative(),
  cost: MoneySchema.positive().exactOptional(),
  description: TextSchema.exactOptional(),
  rarity: z.enum(RARITIES).exactOptional(),
  slots: uniqueList(z.enum(EQUIPMENT_SLOTS)).exactOptional(),
  defense: DefenseBonusSchema.exactOptional(),
  modifiers: z.array(RollModifierSchema).exactOptional(),
};

export const WeaponCategorySchema = z.enum(WEAPON_CATEGORIES);
export const WeaponPropertySchema = z.enum(WEAPON_PROPERTIES);
export const ArmorCategorySchema = z.enum(ARMOR_CATEGORIES);

export const WeaponSchema = z
  .strictObject({
    ...itemBaseShape,
    category: z.literal('weapon'),
    weaponCategory: WeaponCategorySchema,
    weaponType: z.enum(WEAPON_TYPES),
    damage: z.strictObject({ dice: DiceExpressionSchema, type: DamageTypeSchema }),
    properties: uniqueList(WeaponPropertySchema),
    mastery: z.enum(WEAPON_MASTERIES),
    versatileDamage: DiceExpressionSchema.exactOptional(),
    range: z
      .strictObject({ normal: z.number().positive(), long: z.number().positive() })
      .refine((range) => range.long >= range.normal, {
        message: 'long range must be at least the normal range',
        path: ['long'],
      })
      .exactOptional(),
    ammunition: IdSchema.exactOptional(),
    capacity: z.int().positive().exactOptional(),
    misfireOn: z.int().min(1).max(20).exactOptional(),
    reloadSeconds: z.number().positive().exactOptional(),
  })
  .superRefine((weapon, context) => {
    const has = (property: WeaponProperty) => weapon.properties.includes(property);
    const requires = (field: keyof WeaponDefinition, present: boolean, message: string) => {
      if (present !== (weapon[field] !== undefined)) {
        context.addIssue({ code: 'custom', path: [field], message });
      }
    };
    requires(
      'versatileDamage',
      has('versatile'),
      'goes with the Versatile property, and only with it',
    );
    requires(
      'ammunition',
      has('ammunition'),
      'goes with the Ammunition property, and only with it',
    );
    requires('capacity', has('reload'), 'goes with the Reload property, and only with it');
    requires('misfireOn', has('misfire'), 'goes with the Misfire property, and only with it');
    if ((weapon.weaponType === 'ranged' || has('thrown')) && weapon.range === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['range'],
        message: 'is required for ranged and thrown weapons',
      });
    }
    if (has('firearm') && has('reload') === has('loading')) {
      context.addIssue({
        code: 'custom',
        path: ['properties'],
        message: 'a firearm has either Reload or Loading',
      });
    }
    if (has('burst-fire') && (weapon.capacity ?? 0) < BURST_FIRE_ROUNDS) {
      context.addIssue({
        code: 'custom',
        path: ['capacity'],
        message: `must be at least ${String(BURST_FIRE_ROUNDS)} for Burst Fire`,
      });
    }
  }) satisfies z.ZodType<WeaponDefinition>;

export const ArmorSchema = z
  .strictObject({
    ...itemBaseShape,
    category: z.literal('armor'),
    armorCategory: ArmorCategorySchema,
    mightRequirement: z.int().min(1).max(30).exactOptional(),
    stealthDisadvantage: z.boolean(),
  })
  .superRefine((armor, context) => {
    if (armor.armorCategory === 'heavy' && armor.mightRequirement === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['mightRequirement'],
        message: 'is required for heavy armour',
      });
    }
  }) satisfies z.ZodType<ArmorDefinition>;

export const ToolSchema = z.strictObject({
  ...itemBaseShape,
  category: z.literal('tool'),
  toolCategory: z.enum(TOOL_CATEGORIES),
  attribute: AttributeSchema,
  utilize: z.array(z.strictObject({ description: TextSchema, dc: z.int().min(1).max(30) })),
  craft: uniqueList(IdSchema),
}) satisfies z.ZodType<ToolDefinition>;

export const AmmunitionSchema = z.strictObject({
  ...itemBaseShape,
  category: z.literal('ammunition'),
  bundle: z.int().positive(),
}) satisfies z.ZodType<AmmunitionDefinition>;

export const GearSchema = z.strictObject({
  ...itemBaseShape,
  category: z.literal('adventuring-gear'),
}) satisfies z.ZodType<GearDefinition>;

export const MountSchema = z.strictObject({
  ...itemBaseShape,
  category: z.literal('mount'),
  speedFeet: z.number().nonnegative(),
  carryingCapacityLb: z.number().nonnegative(),
}) satisfies z.ZodType<MountDefinition>;

export const VehicleSchema = z.strictObject({
  ...itemBaseShape,
  category: z.literal('vehicle'),
  vehicleType: z.enum(VEHICLE_TYPES),
  propulsion: z.enum(PROPULSION),
  speedMph: z.number().nonnegative(),
  crew: z.int().nonnegative(),
  passengers: z.int().nonnegative(),
  cargoTons: z.number().nonnegative(),
  armorClass: z.int().positive().exactOptional(),
  hitPoints: z.int().positive().exactOptional(),
  damageThreshold: z.int().positive().exactOptional(),
}) satisfies z.ZodType<VehicleDefinition>;

export const WeaponProficiencySchema = z.union([
  z.strictObject({
    category: WeaponCategorySchema,
    withAnyProperty: z.array(WeaponPropertySchema).exactOptional(),
  }),
  z.strictObject({ weaponId: IdSchema }),
]) satisfies z.ZodType<WeaponProficiency>;
