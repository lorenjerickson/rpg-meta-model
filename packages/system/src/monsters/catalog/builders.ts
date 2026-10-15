import { BASE_DEFENSE } from '../../combat/attacks';
import {
  ATTRIBUTE_NAMES,
  ATTRIBUTES,
  attributeModifier,
  type Attribute,
  type AttributeScores,
} from '../../core/attributes';
import type { Condition } from '../../core/conditions';
import type { Alignment, CreatureType, Senses, Size, Speed } from '../../core/creatures';
import type { DamageType } from '../../core/damage';
import { averageRoll, formatDice, parseDice, type DiceExpression } from '../../core/dice';
import {
  attributeDice,
  formatPool,
  proficiencyDice,
  type DicePool,
  type PoolDie,
} from '../../core/dicePool';
import type { Usage } from '../../core/features';
import { proficiencyContribution } from '../../core/proficiency';
import type { RollModifier } from '../../core/rollModifiers';
import { SKILL_DEFINITIONS, type Skill } from '../../core/skills';
import { findItem } from '../../equipment/catalog';
import type { ItemDefinition } from '../../equipment/items';
import { equipmentDefense } from '../../equipment/protection';
import { challengeRatingInfo } from '../challenge';
import type { MonsterAbility, MonsterDamage, MonsterOrigin, MonsterStatBlock } from '../statBlock';

/** Attribute scores in the standard order: Mig, Agi, Har, Int, Wis, Cha, For, San. */
export type Scores = readonly [number, number, number, number, number, number, number, number];

export type DamageSpec = readonly [dice: string, type: DamageType];

interface AbilityBase {
  name: string;
  usage?: Usage;
}

export interface AttackSpec extends AbilityBase {
  kind: 'attack';
  attack: 'melee' | 'ranged' | 'melee-or-ranged';
  /** Defaults to Might for melee attacks and Agility for ranged ones. */
  attribute?: Attribute;
  reach?: number;
  range?: { normal: number; long?: number };
  /** The first entry adds the attribute's dice. */
  damage: readonly DamageSpec[];
  extra?: string;
}

export interface SaveSpec extends AbilityBase {
  kind: 'save';
  save: Attribute;
  /** The attribute whose dice the effect rolls, with a d20 and proficiency dice. */
  dcAttribute: Attribute;
  target: string;
  damage?: readonly DamageSpec[];
  failure?: string;
  /** Defaults to "Half damage." when there is damage. */
  success?: string;
}

export interface FeatureSpec extends AbilityBase {
  kind: 'feature';
  description: string;
}

export type AbilitySpec = AttackSpec | SaveSpec | FeatureSpec;

export interface MonsterInput {
  name: string;
  description: string;
  origin: MonsterOrigin;
  size: Size;
  creatureType: CreatureType;
  tags?: readonly string[];
  alignment: Alignment;
  /** Natural armour: the defense an attack must meet. */
  armorClass?: number;
  /** Item ids of clothing and armour it wears, which set its defense (base plus items) and soak. */
  worn?: readonly string[];
  /** Soak from hide, shell or plating. */
  soak?: readonly RollModifier[];
  hitDice: string;
  speed: Speed;
  scores: Scores;
  saves?: readonly Attribute[];
  skills?: Partial<Record<Skill, 'proficient' | 'expertise'>>;
  vulnerabilities?: readonly DamageType[];
  resistances?: readonly DamageType[];
  damageImmunities?: readonly DamageType[];
  conditionImmunities?: readonly Condition[];
  senses?: Senses;
  languages?: readonly string[];
  challengeRating: number;
  traits?: readonly AbilitySpec[];
  actions: readonly AbilitySpec[];
  bonusActions?: readonly AbilitySpec[];
  reactions?: readonly AbilitySpec[];
  legendary?: { uses: number; usesInLair?: number; actions: readonly AbilitySpec[] };
}

export function attack(
  name: string,
  input: Omit<AttackSpec, 'kind' | 'name' | 'attack'> & { attack?: AttackSpec['attack'] },
): AttackSpec {
  return { kind: 'attack', name, attack: 'melee', ...input };
}

export function save(name: string, input: Omit<SaveSpec, 'kind' | 'name'>): SaveSpec {
  return { kind: 'save', name, ...input };
}

export function feature(name: string, description: string, usage?: Usage): FeatureSpec {
  return usage === undefined
    ? { kind: 'feature', name, description }
    : { kind: 'feature', name, description, usage };
}

export function multiattack(description: string): FeatureSpec {
  return feature('Multiattack', description);
}

/** A trait that forces Sanity saves on creatures that see the thing. */
export function horrifyingPresence(dcAttribute: Attribute = 'charisma'): SaveSpec {
  return save('Horrifying Presence', {
    save: 'sanity',
    dcAttribute,
    target: 'each creature that starts a round within 30 feet of it and can see it',
    failure:
      'The creature is Frightened until the end of the round. If it fails by 5 or more, ' +
      'it also gains 1 level of Madness. A creature that succeeds is immune to this trait for ' +
      '24 hours.',
    success: 'The creature is immune to this trait for 24 hours.',
  });
}

export const RECHARGE_5: Usage = { kind: 'recharge', minimum: 5 };
export const RECHARGE_6: Usage = { kind: 'recharge', minimum: 6 };

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toScores(scores: Scores): AttributeScores {
  const [might, agility, hardiness, intellect, wisdom, charisma, fortune, sanity] = scores;
  return { might, agility, hardiness, intellect, wisdom, charisma, fortune, sanity };
}

function toDamage(spec: DamageSpec, pool: DicePool = []): MonsterDamage {
  return { dice: parseDice(spec[0]), ...(pool.length > 0 && { pool }), type: spec[1] };
}

function describeDamage(damage: readonly MonsterDamage[]): string {
  return damage
    .map((entry) => {
      const text = formatDice(entry.dice);
      let amount: string;
      if (entry.pool) {
        amount = formatPool(entry.pool, text);
      } else {
        const average = String(averageRoll(entry.dice));
        amount = entry.dice.terms.length === 0 ? average : `${average} (${text})`;
      }
      return `${amount} ${capitalize(entry.type)} damage`;
    })
    .join(' plus ');
}

function describeReach(spec: AttackSpec): string {
  const parts: string[] = [];
  if (spec.reach !== undefined) {
    parts.push(`reach ${String(spec.reach)} ft.`);
  }
  if (spec.range !== undefined) {
    const long = spec.range.long === undefined ? '' : `/${String(spec.range.long)}`;
    parts.push(`range ${String(spec.range.normal)}${long} ft.`);
  }
  return parts.join(' or ');
}

const ATTACK_LABELS: Readonly<Record<AttackSpec['attack'], string>> = {
  melee: 'Melee',
  ranged: 'Ranged',
  'melee-or-ranged': 'Melee or Ranged',
};

interface Stats {
  scores: AttributeScores;
  proficiencyBonus: number;
}

const EFFECT_ROLL = /\{effect:(\w+)\}/g;

/**
 * Expands `{effect:attribute}` in rules text into the creature's effect roll for that
 * attribute (a d20 plus its attribute and proficiency dice), for saves against secondary
 * effects such as a poisoned bite.
 */
function expandEffectRolls(text: string, stats: Stats): string {
  return text.replace(EFFECT_ROLL, (_match, name: string) => {
    if (!(ATTRIBUTES as readonly string[]).includes(name)) {
      throw new Error(`Unknown attribute "${name}" in: ${text}`);
    }
    const attribute = name as Attribute;
    return formatPool(
      [
        ...attributeDice(stats.scores[attribute], attribute),
        ...proficiencyDice(stats.proficiencyBonus),
      ],
      'd20',
    );
  });
}

function resolveAbility(spec: AbilitySpec, stats: Stats): MonsterAbility {
  const ability = resolveAbilityNumbers(spec, stats);
  return { ...ability, description: expandEffectRolls(ability.description, stats) };
}

function resolveAbilityNumbers(spec: AbilitySpec, stats: Stats): MonsterAbility {
  const base = { id: slug(spec.name), name: spec.name, ...(spec.usage && { usage: spec.usage }) };
  const effectPool = (attribute: Attribute): PoolDie[] => [
    ...attributeDice(stats.scores[attribute], attribute),
    ...proficiencyDice(stats.proficiencyBonus),
  ];

  if (spec.kind === 'feature') {
    return { ...base, description: spec.description };
  }

  if (spec.kind === 'attack') {
    const attribute = spec.attribute ?? (spec.attack === 'ranged' ? 'agility' : 'might');
    const pool = effectPool(attribute);
    const attributePool = attributeDice(stats.scores[attribute], attribute);
    const damage = spec.damage.map((entry, index) =>
      toDamage(entry, index === 0 ? attributePool : []),
    );
    const extra = spec.extra === undefined ? '' : ` ${spec.extra}`;
    return {
      ...base,
      description:
        `${ATTACK_LABELS[spec.attack]} Attack: ${formatPool(pool, 'd20')}, ` +
        `${describeReach(spec)} Hit: ${describeDamage(damage)}.${extra}`,
      attack: {
        kind: spec.attack,
        pool,
        ...(spec.reach !== undefined && { reach: spec.reach }),
        ...(spec.range && { range: spec.range }),
        damage,
      },
    };
  }

  const pool = effectPool(spec.dcAttribute);
  const damage = spec.damage?.map((entry) => toDamage(entry));
  const failureParts = [damage ? `${describeDamage(damage)}.` : '', spec.failure ?? ''];
  const success = spec.success ?? (damage ? 'Half damage.' : '');
  return {
    ...base,
    description:
      `${ATTRIBUTE_NAMES[spec.save]} Saving Throw against ${formatPool(pool, 'd20')}, ` +
      `${spec.target}. ` +
      `Failure: ${failureParts.filter((part) => part !== '').join(' ')}` +
      (success === '' ? '' : ` Success: ${success}`),
    savingThrow: { attribute: spec.save, pool, ...(damage && { damage }) },
  };
}

function soakModifiers(item: ItemDefinition): RollModifier[] {
  return (item.modifiers ?? []).filter((modifier) => modifier.kind === 'soak');
}

function hitPoints(hitDice: string): { average: number; formula: DiceExpression } {
  const formula = parseDice(hitDice);
  return { average: averageRoll(formula), formula };
}

export function monster(id: string, input: MonsterInput): MonsterStatBlock {
  const scores = toScores(input.scores);
  const { proficiencyBonus } = challengeRatingInfo(input.challengeRating);
  const stats = { scores, proficiencyBonus };
  const modifierOf = (attribute: Attribute) => attributeModifier(scores[attribute]);
  const resolve = (specs: readonly AbilitySpec[] | undefined) =>
    (specs ?? []).map((spec) => resolveAbility(spec, stats));

  const savingThrows = input.saves
    ? Object.fromEntries(
        ATTRIBUTES.filter((attribute) => input.saves?.includes(attribute)).map((attribute) => [
          attribute,
          [...attributeDice(scores[attribute], attribute), ...proficiencyDice(proficiencyBonus)],
        ]),
      )
    : undefined;
  const skills = input.skills
    ? Object.fromEntries(
        Object.entries(input.skills).map(([skill, level]) => [
          skill,
          modifierOf(SKILL_DEFINITIONS[skill as Skill].attribute) +
            proficiencyContribution(level, proficiencyBonus),
        ]),
      )
    : undefined;
  const perception = skills?.perception ?? modifierOf('wisdom');
  const worn = (input.worn ?? []).map((itemId) => {
    const item = findItem(itemId);
    if (item === undefined) {
      throw new Error(`${input.name} wears unknown item ${itemId}`);
    }
    return item;
  });
  const defense =
    worn.length > 0 ? BASE_DEFENSE + equipmentDefense(worn) : (input.armorClass ?? 10);
  const soak = [...(input.soak ?? []), ...worn.flatMap(soakModifiers)];

  return {
    id,
    name: input.name,
    description: input.description,
    origin: input.origin,
    size: input.size,
    creatureType: input.creatureType,
    ...(input.tags && { tags: input.tags }),
    alignment: input.alignment,
    defense,
    soak,
    initiative: attributeDice(scores.agility, 'agility'),
    hitPoints: hitPoints(input.hitDice),
    speed: input.speed,
    attributeScores: scores,
    ...(savingThrows && { savingThrows }),
    ...(skills && { skills }),
    ...(input.vulnerabilities && { vulnerabilities: input.vulnerabilities }),
    ...(input.resistances && { resistances: input.resistances }),
    ...(input.damageImmunities && { damageImmunities: input.damageImmunities }),
    ...(input.conditionImmunities && { conditionImmunities: input.conditionImmunities }),
    ...(input.worn && { gear: input.worn }),
    senses: input.senses ?? {},
    passivePerception: 10 + perception,
    languages: input.languages ?? [],
    challengeRating: input.challengeRating,
    traits: resolve(input.traits),
    actions: resolve(input.actions),
    bonusActions: resolve(input.bonusActions),
    reactions: resolve(input.reactions),
    ...(input.legendary && {
      legendaryActions: {
        uses: input.legendary.uses,
        ...(input.legendary.usesInLair !== undefined && {
          usesInLair: input.legendary.usesInLair,
        }),
        actions: resolve(input.legendary.actions),
      },
    }),
  };
}
