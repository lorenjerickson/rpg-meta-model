import { z } from 'zod';
import {
  ActionCostSchema,
  AreaOfEffectSchema,
  AttackKindSchema,
  AttributeSchema,
  DamageTypeSchema,
  DiceExpressionSchema,
  DurationSchema,
  EffectRangeSchema,
  IdSchema,
  NameSchema,
  RestTypeSchema,
  TextSchema,
} from '../core/schemas';
import { itemBaseShape } from '../equipment/schemas';
import {
  POWER_SOURCES,
  type ApparatusDefinition,
  type PreparationDefinition,
  type ScientificEffect,
} from './apparatus';
import { DISCIPLINES } from './disciplines';

export const DisciplineSchema = z.enum(DISCIPLINES);

const effectShape = {
  id: IdSchema,
  name: NameSchema,
  cost: ActionCostSchema,
  seconds: z.number().positive().exactOptional(),
  setupMinutes: z.number().positive().exactOptional(),
  trigger: TextSchema.exactOptional(),
  range: EffectRangeSchema,
  area: AreaOfEffectSchema.exactOptional(),
  duration: DurationSchema,
  attack: AttackKindSchema.exactOptional(),
  savingThrow: AttributeSchema.exactOptional(),
  damage: z
    .array(z.strictObject({ dice: DiceExpressionSchema, type: DamageTypeSchema }))
    .exactOptional(),
  description: TextSchema,
  overcharge: TextSchema.exactOptional(),
};

/** Reactions say what lets you use them. */
function checkTrigger(effect: { cost: string; trigger?: string }, context: z.RefinementCtx): void {
  if (effect.cost === 'reaction' && effect.trigger === undefined) {
    context.addIssue({ code: 'custom', path: ['trigger'], message: 'is required for a reaction' });
  }
}

export const ScientificEffectSchema = z
  .strictObject(effectShape)
  .superRefine(checkTrigger) satisfies z.ZodType<ScientificEffect>;

const ApparatusEffectSchema = z
  .strictObject({ ...effectShape, charges: z.int().nonnegative() })
  .superRefine(checkTrigger);

export const ApparatusSchema = z
  .strictObject({
    ...itemBaseShape,
    category: z.literal('apparatus'),
    discipline: DisciplineSchema,
    power: z.enum(POWER_SOURCES),
    charges: z
      .strictObject({
        max: z.int().positive(),
        recharge: z.strictObject({
          rest: RestTypeSchema,
          amount: z.union([z.literal('all'), DiceExpressionSchema]),
        }),
      })
      .nullable(),
    effects: z.array(ApparatusEffectSchema).min(1, 'needs at least one effect'),
  })
  .superRefine((device, context) => {
    const ids = device.effects.map((effect) => effect.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: 'custom', path: ['effects'], message: 'effect ids must be unique' });
    }
    const charged = device.effects.some((effect) => effect.charges > 0);
    if (device.charges === null) {
      if (charged) {
        context.addIssue({
          code: 'custom',
          path: ['charges'],
          message: 'is required when an effect spends charges',
        });
      }
      return;
    }
    if (!charged) {
      context.addIssue({
        code: 'custom',
        path: ['charges'],
        message: 'should be empty when every effect is at will',
      });
    }
    const { max } = device.charges;
    device.effects.forEach((effect, index) => {
      if (effect.charges > max) {
        context.addIssue({
          code: 'custom',
          path: ['effects', index, 'charges'],
          message: `can't be more than the device holds (${String(max)})`,
        });
      }
    });
  }) satisfies z.ZodType<ApparatusDefinition>;

export const PreparationSchema = z.strictObject({
  ...itemBaseShape,
  category: z.literal('preparation'),
  discipline: DisciplineSchema,
  effect: ScientificEffectSchema,
}) satisfies z.ZodType<PreparationDefinition>;
