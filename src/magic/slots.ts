import { assertIntegerInRange, lookup } from '../core/validation';

/**
 * How a class's levels count toward spell slots. Third casters are subclasses such as the
 * Eldritch Knight and Arcane Trickster. Pact casters (Warlocks) use Pact Magic instead.
 */
export type CasterProgression = 'full' | 'half' | 'third' | 'pact';

/** Spell slots per spell level; index 0 holds the number of 1st-level slots. */
export type SpellSlots = readonly number[];

/** The Multiclass Spellcaster table, which is also the full caster table. Index = level - 1. */
export const SPELL_SLOTS_BY_CASTER_LEVEL: readonly SpellSlots[] = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

export const MAX_CASTER_LEVEL = 20;

export function spellSlotsForCasterLevel(casterLevel: number): SpellSlots {
  assertIntegerInRange(casterLevel, 0, MAX_CASTER_LEVEL, 'Caster level');
  return casterLevel === 0
    ? []
    : lookup(SPELL_SLOTS_BY_CASTER_LEVEL, casterLevel - 1, 'spell slot');
}

export interface SpellcastingClassLevel {
  progression: CasterProgression;
  level: number;
}

/**
 * The caster level used to look up spell slots. With one spellcasting class, half and third
 * casters round up, which reproduces that class's own table. With several, add full levels,
 * half of each half caster's levels rounded up and a third of each third caster's levels
 * rounded down. Pact Magic levels never count.
 */
export function casterLevel(classes: readonly SpellcastingClassLevel[]): number {
  const casters = classes.filter((entry) => entry.progression !== 'pact' && entry.level > 0);
  const single = casters.length === 1;
  return casters.reduce((total, { progression, level }) => {
    switch (progression) {
      case 'full':
        return total + level;
      case 'half':
        return total + Math.ceil(level / 2);
      case 'third':
        return total + (single ? Math.ceil(level / 3) : Math.floor(level / 3));
      case 'pact':
        return total;
    }
  }, 0);
}

export interface PactMagicSlots {
  slots: number;
  /** All Pact Magic slots are the same level. */
  slotLevel: number;
}

/** Warlock Pact Magic by Warlock level. Index = level - 1. */
export const PACT_MAGIC_BY_LEVEL: readonly PactMagicSlots[] = [
  { slots: 1, slotLevel: 1 },
  { slots: 2, slotLevel: 1 },
  { slots: 2, slotLevel: 2 },
  { slots: 2, slotLevel: 2 },
  { slots: 2, slotLevel: 3 },
  { slots: 2, slotLevel: 3 },
  { slots: 2, slotLevel: 4 },
  { slots: 2, slotLevel: 4 },
  { slots: 2, slotLevel: 5 },
  { slots: 2, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
];

export function pactMagicForLevel(warlockLevel: number): PactMagicSlots {
  assertIntegerInRange(warlockLevel, 1, 20, 'Warlock level');
  return lookup(PACT_MAGIC_BY_LEVEL, warlockLevel - 1, 'Pact Magic');
}
