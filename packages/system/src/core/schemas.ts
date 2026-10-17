import { z } from 'zod';
import { ACTIONS, REST_TYPES, type ActionDefinition } from './actions';
import {
  ATTRIBUTES,
  MAX_ATTRIBUTE_SCORE,
  MIN_ATTRIBUTE_SCORE,
  type AttributeScores,
} from './attributes';
import { CONDITIONS, type ConditionDefinition } from './conditions';
import { ALIGNMENTS, CREATURE_TYPES, SENSES, SIZES, type Senses, type Speed } from './creatures';
import { DAMAGE_TYPES } from './damage';
import { DIE_SIZES, type DiceExpression } from './dice';
import type { PoolDie } from './dicePool';
import type { Feature, Usage } from './features';
import { LANGUAGES } from './languages';
import { ROLL_KINDS, type DefenseBonus, type RollModifier } from './rollModifiers';
import { SKILLS, type SkillDefinition } from './skills';
import type { AreaOfEffect, EffectRange } from './targeting';
import type { Duration } from './time';

/*
 * Runtime schemas for the definitions in core, used to check catalog entries that come from
 * outside the code (edits and additions). Each is tied to its type with `satisfies`, so the
 * two can't drift apart.
 */

/** Lower-case words joined by hyphens, as every catalog id is. */
export const IdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lower-case words joined by hyphens');

export const NameSchema = z.string().trim().min(1, 'is required');

export const TextSchema = z.string().trim().min(1, 'is required');

/** An amount of money in pence. */
export const MoneySchema = z.int().nonnegative();

export const AttributeSchema = z.enum(ATTRIBUTES);
export const DamageTypeSchema = z.enum(DAMAGE_TYPES);
export const DieSizeSchema = z.literal(DIE_SIZES);
export const SignSchema = z.literal([1, -1]);
export const SkillSchema = z.enum(SKILLS);
export const ConditionSchema = z.enum(CONDITIONS);
export const LanguageSchema = z.enum(LANGUAGES);
export const RestTypeSchema = z.enum(REST_TYPES);
export const SizeSchema = z.enum(SIZES);
export const CreatureTypeSchema = z.enum(CREATURE_TYPES);
export const AlignmentSchema = z.enum(ALIGNMENTS);
export const AttackKindSchema = z.enum(['melee', 'ranged']);
export const ActionCostSchema = z.enum(['action', 'bonus-action', 'reaction']);
export const RollModeSchema = z.enum(['normal', 'advantage', 'disadvantage']);

/** A list with no repeated values. */
export function uniqueList<T extends z.ZodType>(item: T) {
  return z.array(item).refine((values) => new Set(values).size === values.length, 'has repeats');
}

export const DiceExpressionSchema = z.strictObject({
  terms: z.array(z.strictObject({ count: z.int().positive(), die: DieSizeSchema })),
  modifier: z.int(),
}) satisfies z.ZodType<DiceExpression>;

export const RollModifierSchema = z.strictObject({
  kind: z.enum(ROLL_KINDS),
  count: z.int().positive(),
  die: DieSizeSchema,
  sign: SignSchema,
  attributes: z.array(AttributeSchema).exactOptional(),
  attack: AttackKindSchema.exactOptional(),
  damageTypes: z.array(DamageTypeSchema).exactOptional(),
}) satisfies z.ZodType<RollModifier>;

export const DefenseBonusSchema = z.strictObject({
  value: z.int(),
  attack: AttackKindSchema.exactOptional(),
}) satisfies z.ZodType<DefenseBonus>;

export const PoolDieSchema = z.strictObject({
  count: z.int().positive(),
  die: DieSizeSchema,
  sign: SignSchema,
  source: TextSchema,
}) satisfies z.ZodType<PoolDie>;

export const DicePoolSchema = z.array(PoolDieSchema);

export const featureShape = {
  id: IdSchema,
  name: NameSchema,
  description: TextSchema,
};

export const FeatureSchema = z.strictObject(featureShape) satisfies z.ZodType<Feature>;

export const UsageSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('at-will') }),
  z.strictObject({
    kind: z.literal('per-rest'),
    uses: z.union([z.int().positive(), z.literal('proficiency-bonus')]),
    recovery: RestTypeSchema,
  }),
  z.strictObject({ kind: z.literal('per-day'), uses: z.int().positive() }),
  z.strictObject({ kind: z.literal('recharge'), minimum: z.int().min(2).max(6) }),
  z.strictObject({ kind: z.literal('charges'), max: z.int().positive() }),
]) satisfies z.ZodType<Usage>;

const feet = z.number().positive();

export const EffectRangeSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('self') }),
  z.strictObject({ kind: z.literal('touch') }),
  z.strictObject({ kind: z.literal('distance'), feet }),
  z.strictObject({ kind: z.literal('sight') }),
  z.strictObject({ kind: z.literal('unlimited') }),
]) satisfies z.ZodType<EffectRange>;

export const AreaOfEffectSchema = z.discriminatedUnion('shape', [
  z.strictObject({ shape: z.literal('cone'), length: feet }),
  z.strictObject({ shape: z.literal('cube'), size: feet }),
  z.strictObject({ shape: z.literal('cylinder'), radius: feet, height: feet }),
  z.strictObject({ shape: z.literal('emanation'), distance: feet }),
  z.strictObject({ shape: z.literal('line'), length: feet, width: feet }),
  z.strictObject({ shape: z.literal('sphere'), radius: feet }),
]) satisfies z.ZodType<AreaOfEffect>;

export const DurationSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('instantaneous') }),
  z.strictObject({
    kind: z.literal('timed'),
    amount: z.number().positive(),
    unit: z.enum(['round', 'minute', 'hour', 'day']),
    concentration: z.boolean(),
  }),
  z.strictObject({ kind: z.literal('until-ended'), orTriggered: z.boolean() }),
  z.strictObject({ kind: z.literal('special') }),
]) satisfies z.ZodType<Duration>;

const speed = z.number().nonnegative();

export const SpeedSchema = z.strictObject({
  walk: speed,
  burrow: speed.exactOptional(),
  climb: speed.exactOptional(),
  fly: speed.exactOptional(),
  swim: speed.exactOptional(),
  hover: z.boolean().exactOptional(),
}) satisfies z.ZodType<Speed>;

export const SensesSchema = z.partialRecord(z.enum(SENSES), feet) satisfies z.ZodType<Senses>;

export const AttributeScoreSchema = z.int().min(MIN_ATTRIBUTE_SCORE).max(MAX_ATTRIBUTE_SCORE);

export const AttributeScoresSchema = z.record(
  AttributeSchema,
  AttributeScoreSchema,
) satisfies z.ZodType<AttributeScores>;

/** A skill as the Skills catalog lists it. */
export const SkillEntrySchema = z.strictObject({
  id: SkillSchema,
  name: NameSchema,
  attribute: AttributeSchema,
  description: TextSchema,
}) satisfies z.ZodType<SkillDefinition & { id: string }>;

const rulesText = z.array(TextSchema).min(1, 'needs at least one effect');

/** An action as the Actions catalog lists it. */
export const ActionEntrySchema = z.strictObject({
  id: z.enum(ACTIONS),
  name: NameSchema,
  effects: rulesText,
  seconds: z.number().positive().exactOptional(),
  dice: z.array(RollModifierSchema).exactOptional(),
  defense: z.array(DefenseBonusSchema).exactOptional(),
}) satisfies z.ZodType<ActionDefinition & { id: string }>;

/** A condition as the Conditions catalog lists it. */
export const ConditionEntrySchema = z.strictObject({
  id: ConditionSchema,
  name: NameSchema,
  effects: rulesText,
  dice: z.array(RollModifierSchema),
  defense: z.array(DefenseBonusSchema).exactOptional(),
}) satisfies z.ZodType<ConditionDefinition & { id: string }>;
