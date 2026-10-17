import { z } from 'zod';
import { averageRoll } from '../core/dice';
import {
  AlignmentSchema,
  AttributeSchema,
  AttributeScoresSchema,
  ConditionSchema,
  CreatureTypeSchema,
  DamageTypeSchema,
  DiceExpressionSchema,
  DicePoolSchema,
  featureShape,
  IdSchema,
  NameSchema,
  RollModifierSchema,
  SensesSchema,
  SizeSchema,
  SkillSchema,
  SpeedSchema,
  TextSchema,
  UsageSchema,
  uniqueList,
} from '../core/schemas';
import { CHALLENGE_RATINGS } from './challenge';
import { MONSTER_ORIGINS, type MonsterAbility, type MonsterStatBlock } from './statBlock';

const MonsterDamageSchema = z.strictObject({
  dice: DiceExpressionSchema,
  pool: DicePoolSchema.exactOptional(),
  type: DamageTypeSchema,
});

const feet = z.number().positive();

export const MonsterAbilitySchema = z.strictObject({
  ...featureShape,
  usage: UsageSchema.exactOptional(),
  attack: z
    .strictObject({
      kind: z.enum(['melee', 'ranged', 'melee-or-ranged']),
      pool: DicePoolSchema,
      reach: feet.exactOptional(),
      range: z.strictObject({ normal: feet, long: feet.exactOptional() }).exactOptional(),
      damage: z.array(MonsterDamageSchema),
    })
    .exactOptional(),
  savingThrow: z
    .strictObject({
      attribute: AttributeSchema,
      pool: DicePoolSchema,
      damage: z.array(MonsterDamageSchema).exactOptional(),
    })
    .exactOptional(),
}) satisfies z.ZodType<MonsterAbility>;

const abilities = z.array(MonsterAbilitySchema);

const damageTypes = uniqueList(DamageTypeSchema).exactOptional();

export const MonsterSchema = z
  .strictObject({
    id: IdSchema,
    name: NameSchema,
    description: TextSchema.exactOptional(),
    origin: z.enum(MONSTER_ORIGINS).exactOptional(),
    size: SizeSchema,
    creatureType: CreatureTypeSchema,
    tags: z.array(TextSchema).exactOptional(),
    alignment: AlignmentSchema,
    defense: z.int().min(0),
    soak: z.array(RollModifierSchema),
    initiative: DicePoolSchema,
    hitPoints: z.strictObject({ average: z.int().positive(), formula: DiceExpressionSchema }),
    speed: SpeedSchema,
    attributeScores: AttributeScoresSchema,
    savingThrows: z.partialRecord(AttributeSchema, DicePoolSchema).exactOptional(),
    skills: z.partialRecord(SkillSchema, z.int()).exactOptional(),
    vulnerabilities: damageTypes,
    resistances: damageTypes,
    damageImmunities: damageTypes,
    conditionImmunities: uniqueList(ConditionSchema).exactOptional(),
    gear: z.array(IdSchema).exactOptional(),
    senses: SensesSchema,
    passivePerception: z.int(),
    languages: z.array(TextSchema),
    telepathy: feet.exactOptional(),
    challengeRating: z
      .number()
      .refine(
        (rating) => CHALLENGE_RATINGS.some((entry) => entry.challengeRating === rating),
        'is not a challenge rating',
      ),
    xpInLair: z.int().positive().exactOptional(),
    traits: abilities,
    actions: abilities.min(1, 'needs at least one action'),
    bonusActions: abilities,
    reactions: abilities,
    legendaryActions: z
      .strictObject({
        uses: z.int().positive(),
        usesInLair: z.int().positive().exactOptional(),
        actions: abilities.min(1),
      })
      .exactOptional(),
  })
  .superRefine((monster, context) => {
    const { average, formula } = monster.hitPoints;
    if (average !== averageRoll(formula)) {
      context.addIssue({
        code: 'custom',
        path: ['hitPoints', 'average'],
        message: `must be the formula's average, ${String(averageRoll(formula))}`,
      });
    }
    const seen = new Set<string>();
    for (const list of ['traits', 'actions', 'bonusActions', 'reactions'] as const) {
      monster[list].forEach((ability, index) => {
        if (seen.has(ability.id)) {
          context.addIssue({
            code: 'custom',
            path: [list, index, 'id'],
            message: 'is used by another of its abilities',
          });
        }
        seen.add(ability.id);
      });
    }
  }) satisfies z.ZodType<MonsterStatBlock>;
