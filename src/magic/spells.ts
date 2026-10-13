import type { AreaOfEffect, EffectRange } from '../core/targeting';
import type { Duration } from '../core/time';
import type { ClassId } from '../character/classes';

export const SPELL_SCHOOLS = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
] as const;

export type SpellSchool = (typeof SPELL_SCHOOLS)[number];

/** 0 is a cantrip. */
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const MAX_SPELL_LEVEL = 9;

export interface CastingTime {
  unit: 'action' | 'bonus-action' | 'reaction' | 'minute' | 'hour';
  amount: number;
  /** For reactions: what lets you cast the spell. */
  trigger?: string;
}

export interface MaterialComponent {
  description: string;
  /** A component with a cost must be provided; a focus can't replace it. */
  costGp?: number;
  consumed: boolean;
}

export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material?: MaterialComponent;
}

export interface SpellDefinition {
  id: string;
  name: string;
  level: SpellLevel;
  school: SpellSchool;
  classes: readonly ClassId[];
  castingTime: CastingTime;
  /** Can be cast as a ritual, taking 10 minutes longer and using no spell slot. */
  ritual: boolean;
  range: EffectRange;
  area?: AreaOfEffect;
  components: SpellComponents;
  duration: Duration;
  description: string;
  /** What changes when cast with a higher-level slot. */
  usingHigherLevelSlot?: string;
  /** How a cantrip's effect grows with character level. */
  cantripUpgrade?: string;
}

export function requiresConcentration(spell: SpellDefinition): boolean {
  return spell.duration.kind === 'timed' && spell.duration.concentration;
}

export function isCantrip(spell: SpellDefinition): boolean {
  return spell.level === 0;
}

/** "Cantrip", "1st", "2nd", "3rd", "4th"... */
export function formatSpellLevel(level: SpellLevel): string {
  switch (level) {
    case 0:
      return 'Cantrip';
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      return `${String(level)}th`;
  }
}
