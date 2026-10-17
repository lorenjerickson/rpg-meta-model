import { z } from 'zod';
import { D20_TESTS } from '../core/d20';
import { languageCategory } from '../core/languages';
import {
  AttributeSchema,
  featureShape,
  FeatureSchema,
  IdSchema,
  LanguageSchema,
  MoneySchema,
  NameSchema,
  RestTypeSchema,
  RollModeSchema,
  SkillSchema,
  TextSchema,
  uniqueList,
} from '../core/schemas';
import { ArmorCategorySchema, WeaponCategorySchema } from '../equipment/schemas';
import { DisciplineSchema } from '../science/schemas';
import type { BackgroundDefinition } from './backgrounds';
import { WORLD_REGIONS, type EthnicityDefinition } from './ethnicity';
import { FEAT_CATEGORIES, type FeatDefinition } from './feats';
import type { LodgingDefinition } from './rests';
import type { EquipmentOption } from './startingEquipment';
import type { Trait } from './traits';

export const EquipmentOptionSchema = z.strictObject({
  label: z.string(),
  items: z.array(z.strictObject({ itemId: IdSchema, quantity: z.int().positive() })),
  money: MoneySchema,
}) satisfies z.ZodType<EquipmentOption>;

const choose = z.int().positive();

export const FeatCategorySchema = z.enum(FEAT_CATEGORIES);

const TraitEffectSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('skill-proficiency'),
    choose,
    from: z.union([z.array(SkillSchema), z.literal('any')]),
  }),
  z.strictObject({
    kind: z.literal('tool-proficiency'),
    choose,
    from: z.union([z.array(IdSchema), z.literal('any')]),
  }),
  z.strictObject({
    kind: z.literal('language'),
    choose,
    from: z.union([z.array(LanguageSchema), z.literal('any')]),
  }),
  z.strictObject({
    kind: z.literal('roll-modifier'),
    test: z.enum(D20_TESTS),
    attributes: z.array(AttributeSchema).exactOptional(),
    skills: z.array(SkillSchema).exactOptional(),
    mode: z.enum(['advantage', 'disadvantage']).exactOptional(),
    bonus: z.int().exactOptional(),
    when: TextSchema,
  }),
  z.strictObject({ kind: z.literal('feat'), category: FeatCategorySchema }),
  z.strictObject({ kind: z.literal('heroic-inspiration'), recovery: RestTypeSchema }),
]);

export const TraitSchema = z.strictObject({
  ...featureShape,
  effects: z.array(TraitEffectSchema),
}) satisfies z.ZodType<Trait>;

/** Ethnicities pass on spoken languages, not classical ones, cants or signs. */
const SpokenLanguageSchema = LanguageSchema.refine(
  (language) => languageCategory(language) === 'spoken',
  'must be a spoken language',
);

export const EthnicitySchema = z
  .strictObject({
    id: IdSchema,
    name: NameSchema,
    region: z.enum(WORLD_REGIONS),
    homeland: TextSchema,
    languages: uniqueList(SpokenLanguageSchema),
    languageChoice: z
      .strictObject({
        choose,
        from: uniqueList(SpokenLanguageSchema).min(
          2,
          'needs more than one language to choose from',
        ),
      })
      .exactOptional(),
    traits: z.array(TraitSchema),
  })
  .superRefine((entry, context) => {
    if (entry.languages.length === 0 && entry.languageChoice === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['languages'],
        message: 'needs at least one language',
      });
    }
  }) satisfies z.ZodType<EthnicityDefinition>;

export const FeatSchema = z
  .strictObject({
    ...featureShape,
    category: FeatCategorySchema,
    prerequisite: z
      .strictObject({
        minLevel: z.int().min(1).max(20).exactOptional(),
        attributeScore: z
          .strictObject({
            attributes: z.array(AttributeSchema).min(1),
            minimum: z.int().min(1).max(30),
          })
          .exactOptional(),
        weaponCategory: WeaponCategorySchema.exactOptional(),
        armorTraining: ArmorCategorySchema.exactOptional(),
        discipline: z.union([DisciplineSchema, z.literal('any')]).exactOptional(),
      })
      .exactOptional(),
    repeatable: z.boolean(),
    attributeScoreIncrease: z
      .strictObject({
        attributes: z.array(AttributeSchema).min(1),
        amount: z.int().positive(),
        max: z.int().min(1).max(30),
      })
      .exactOptional(),
    benefits: z.array(FeatureSchema),
  })
  .superRefine((feat, context) => {
    const increase = feat.attributeScoreIncrease;
    const cap = feat.category === 'epic-boon' ? 30 : 20;
    if (increase !== undefined && increase.max !== cap) {
      context.addIssue({
        code: 'custom',
        path: ['attributeScoreIncrease', 'max'],
        message: `must be ${String(cap)} for ${feat.category === 'epic-boon' ? 'an epic boon' : 'this kind of feat'}`,
      });
    }
  }) satisfies z.ZodType<FeatDefinition>;

export const BackgroundSchema = z
  .strictObject({
    id: IdSchema,
    name: NameSchema,
    description: TextSchema,
    attributes: z.tuple([AttributeSchema, AttributeSchema, AttributeSchema]),
    feat: IdSchema,
    skillProficiencies: z.tuple([SkillSchema, SkillSchema]),
    toolProficiency: IdSchema,
    equipment: z.array(EquipmentOptionSchema).min(1),
  })
  .superRefine((background, context) => {
    if (new Set(background.attributes).size !== 3) {
      context.addIssue({
        code: 'custom',
        path: ['attributes'],
        message: 'must be three different attributes',
      });
    }
    if (new Set(background.skillProficiencies).size !== 2) {
      context.addIssue({
        code: 'custom',
        path: ['skillProficiencies'],
        message: 'must be two different skills',
      });
    }
  }) satisfies z.ZodType<BackgroundDefinition>;

export const LodgingSchema = z.strictObject({
  id: IdSchema,
  name: NameSchema,
  description: TextSchema,
  costPerNight: MoneySchema,
  safe: z.boolean(),
  exhaustionRemoved: z.int().nonnegative(),
  madnessSave: RollModeSchema,
  hitDiceRecovered: z.enum(['all', 'half']),
}) satisfies z.ZodType<LodgingDefinition>;
