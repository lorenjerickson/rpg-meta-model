import { z } from 'zod';
import {
  ActionCostSchema,
  AttributeSchema,
  featureShape,
  IdSchema,
  LanguageSchema,
  NameSchema,
  SkillSchema,
  TextSchema,
  UsageSchema,
  uniqueList,
} from '../core/schemas';
import { EquipmentOptionSchema } from '../character/schemas';
import { ArmorCategorySchema, WeaponProficiencySchema } from '../equipment/schemas';
import { DisciplineSchema } from '../science/schemas';
import {
  PROFESSION_CATEGORIES,
  type ProfessionAction,
  type ProfessionDefinition,
  type SpecializationDefinition,
} from './profession';
import { RANKS, compareRanks } from './ranks';

const RankSchema = z.enum(RANKS);

export const ProfessionActionSchema = z
  .strictObject({
    ...featureShape,
    cost: ActionCostSchema,
    trigger: TextSchema.exactOptional(),
    usage: UsageSchema.exactOptional(),
  })
  .superRefine((action, context) => {
    if (action.cost === 'reaction' && action.trigger === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['trigger'],
        message: 'is required for a reaction',
      });
    }
  }) satisfies z.ZodType<ProfessionAction>;

const actions = z.array(ProfessionActionSchema).min(1, 'needs at least one action');

export const SpecializationSchema = z.strictObject({
  id: IdSchema,
  name: NameSchema,
  description: TextSchema,
  parentId: IdSchema.nullable(),
  rank: RankSchema,
  skills: uniqueList(SkillSchema).min(1, 'needs at least one skill'),
  tools: z.array(IdSchema).exactOptional(),
  weapons: z.array(WeaponProficiencySchema).exactOptional(),
  armor: z.array(ArmorCategorySchema).exactOptional(),
  disciplines: z.array(DisciplineSchema).exactOptional(),
  languages: z.array(LanguageSchema).exactOptional(),
  actions,
}) satisfies z.ZodType<SpecializationDefinition>;

/**
 * Problems with a profession's specialization tree: ids are unique, every step follows one
 * at a lower rank, the first tier comes after novice rank, there are at least two branches,
 * and every branch goes on to master rank.
 */
function checkSpecializations(
  specializations: readonly SpecializationDefinition[],
  context: z.RefinementCtx,
): void {
  const byId = new Map<string, SpecializationDefinition>();
  specializations.forEach((specialization, index) => {
    const path = ['specializations', index];
    if (byId.has(specialization.id)) {
      context.addIssue({
        code: 'custom',
        path: [...path, 'id'],
        message: 'is used by another specialization',
      });
    }
    byId.set(specialization.id, specialization);
  });
  specializations.forEach((specialization, index) => {
    const path = ['specializations', index];
    if (specialization.parentId === null) {
      if (specialization.rank === 'novice') {
        context.addIssue({ code: 'custom', path: [...path, 'rank'], message: "can't be novice" });
      }
    } else {
      const parent = byId.get(specialization.parentId);
      if (parent === undefined) {
        context.addIssue({
          code: 'custom',
          path: [...path, 'parentId'],
          message: `follows ${specialization.parentId}, which isn't one of this profession's specializations`,
        });
      } else if (compareRanks(specialization.rank, parent.rank) <= 0) {
        context.addIssue({
          code: 'custom',
          path: [...path, 'rank'],
          message: `must be higher than ${parent.name}'s rank`,
        });
      }
    }
    const isLeaf = !specializations.some((other) => other.parentId === specialization.id);
    if (isLeaf && compareRanks(specialization.rank, 'master') < 0) {
      context.addIssue({
        code: 'custom',
        path: [...path, 'rank'],
        message: 'ends its branch below master rank: add a specialization that follows it',
      });
    }
  });
  if (specializations.filter((specialization) => specialization.parentId === null).length < 2) {
    context.addIssue({
      code: 'custom',
      path: ['specializations'],
      message: 'needs at least two first-tier specializations',
    });
  }
}

export const ProfessionSchema = z
  .strictObject({
    id: IdSchema,
    name: NameSchema,
    description: TextSchema,
    category: z.enum(PROFESSION_CATEGORIES),
    hitDie: z.literal([6, 8, 10, 12]),
    primaryAttributes: uniqueList(AttributeSchema).min(1),
    primaryAttributeRequirement: z.enum(['all', 'any']),
    savingThrows: z.tuple([AttributeSchema, AttributeSchema]),
    skillProficiencies: z.strictObject({
      choose: z.int().positive(),
      from: uniqueList(SkillSchema).min(1),
    }),
    weaponProficiencies: z.array(WeaponProficiencySchema),
    armorTraining: uniqueList(ArmorCategorySchema),
    toolProficiencies: z.array(IdSchema),
    disciplineProficiencies: z.array(DisciplineSchema).exactOptional(),
    languages: z.array(LanguageSchema).exactOptional(),
    startingEquipment: z.array(EquipmentOptionSchema).exactOptional(),
    rankTitles: z.partialRecord(RankSchema, NameSchema).exactOptional(),
    actions,
    specializations: z.array(SpecializationSchema),
  })
  .superRefine((profession, context) => {
    const [first, second] = profession.savingThrows;
    if (first === second) {
      context.addIssue({
        code: 'custom',
        path: ['savingThrows'],
        message: 'must be two different attributes',
      });
    }
    const { choose, from } = profession.skillProficiencies;
    if (choose > from.length) {
      context.addIssue({
        code: 'custom',
        path: ['skillProficiencies', 'choose'],
        message: `can't be more than the ${String(from.length)} skills to choose from`,
      });
    }
    checkSpecializations(profession.specializations, context);
  }) satisfies z.ZodType<ProfessionDefinition>;
