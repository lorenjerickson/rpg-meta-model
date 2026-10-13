import { describe, expect, it } from 'vitest';
import { formatMoney } from '../core/currency';
import { PROFESSIONS } from '../professions/catalog';
import {
  AMMUNITION,
  ARMOR,
  ITEMS,
  TOOLS,
  VEHICLES,
  WEAPONS,
  findItem,
  isKnownToolProficiency,
} from './catalog';
import { vehicleProficiencyFor } from './transport';
import {
  BURST_FIRE_ROUNDS,
  clearJamDc,
  fire,
  fullyLoaded,
  hasProperty,
  reload,
  type WeaponDefinition,
} from './weapons';

function weapon(id: string): WeaponDefinition {
  const found = WEAPONS.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new Error(`Missing ${id}`);
  }
  return found;
}

describe('firearms', () => {
  const revolver = weapon('service-revolver');
  const pistol = weapon('automatic-pistol');
  const machineGun = weapon('machine-gun');

  it('loads to capacity and spends rounds when firing', () => {
    const loaded = fullyLoaded(revolver);
    expect(loaded).toEqual({ loaded: 6, jammed: false });
    expect(fire(revolver, loaded, 12)).toEqual({
      firearm: { loaded: 5, jammed: false },
      misfired: false,
    });
  });

  it('only misfires weapons with the Misfire property', () => {
    expect(fire(revolver, fullyLoaded(revolver), 1).misfired).toBe(false);
    const jammed = fire(pistol, fullyLoaded(pistol), 1);
    expect(jammed).toEqual({ firearm: { loaded: 9, jammed: true }, misfired: true });
    expect(() => fire(pistol, jammed.firearm, 15)).toThrow(/jammed/);
    expect(clearJamDc(pistol)).toBe(9);
  });

  it('needs enough rounds, and reloads to capacity', () => {
    const empty = { loaded: 0, jammed: false };
    expect(() => fire(revolver, empty, 10)).toThrow(/0 rounds loaded/);
    expect(reload(revolver, empty)).toEqual({ loaded: 6, jammed: false });
  });

  it('spends a full burst of rounds for burst fire', () => {
    const result = fire(machineGun, fullyLoaded(machineGun), 10, BURST_FIRE_ROUNDS);
    expect(result.firearm.loaded).toBe(240);
  });
});

describe('item catalog', () => {
  it('has unique ids across every category', () => {
    const ids = ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ITEMS.length).toBeGreaterThanOrEqual(100);
  });

  it('prices everything in sensible period money', () => {
    for (const item of ITEMS) {
      expect(item.cost, item.id).toBeGreaterThan(0);
      expect(() => formatMoney(item.cost ?? 0), item.id).not.toThrow();
    }
    expect(formatMoney(findItem('service-revolver')?.cost ?? 0)).toBe('£3 10s');
  });

  it('links every weapon to ammunition that exists', () => {
    const ammunitionIds = new Set(AMMUNITION.map((entry) => entry.id));
    for (const entry of WEAPONS.filter((item) => hasProperty(item, 'ammunition'))) {
      expect(ammunitionIds.has(entry.ammunition ?? ''), entry.id).toBe(true);
      expect(entry.range, entry.id).toBeDefined();
    }
  });

  it('gives firearms consistent loading rules', () => {
    for (const entry of WEAPONS.filter((item) => hasProperty(item, 'firearm'))) {
      const reloads = hasProperty(entry, 'reload');
      expect(reloads !== hasProperty(entry, 'loading'), entry.id).toBe(true);
      expect(reloads === (entry.capacity !== undefined), entry.id).toBe(true);
      expect(hasProperty(entry, 'misfire') === (entry.misfireOn !== undefined), entry.id).toBe(
        true,
      );
      if (hasProperty(entry, 'burst-fire')) {
        expect(entry.capacity ?? 0, entry.id).toBeGreaterThanOrEqual(BURST_FIRE_ROUNDS);
      }
    }
  });

  it('gives versatile weapons two-handed damage and heavy armour a Might requirement', () => {
    for (const entry of WEAPONS) {
      expect(
        hasProperty(entry, 'versatile') === (entry.versatileDamage !== undefined),
        entry.id,
      ).toBe(true);
    }
    for (const entry of ARMOR.filter((item) => item.armorCategory === 'heavy')) {
      expect(entry.mightRequirement, entry.id).toBeDefined();
    }
  });

  it('only crafts items that exist', () => {
    for (const tool of TOOLS) {
      for (const id of tool.craft) {
        expect(findItem(id), `${tool.id} crafts ${id}`).toBeDefined();
      }
    }
  });

  it('maps vehicles to vehicle proficiencies', () => {
    for (const vehicle of VEHICLES) {
      expect(isKnownToolProficiency(vehicleProficiencyFor(vehicle)), vehicle.id).toBe(true);
    }
  });

  it('contains no magical terms', () => {
    const text = JSON.stringify(ITEMS).toLowerCase();
    for (const term of ['magic', 'spell', 'arcane', 'mystic', 'wizard', 'enchant', 'elven']) {
      expect(text, term).not.toContain(term);
    }
  });
});

describe('profession equipment references', () => {
  it('only grants tools, tool kinds and vehicles that exist', () => {
    for (const profession of PROFESSIONS) {
      const tools = [
        ...profession.toolProficiencies,
        ...profession.specializations.flatMap((entry) => entry.tools ?? []),
      ];
      for (const tool of tools) {
        expect(isKnownToolProficiency(tool), `${profession.id}: ${tool}`).toBe(true);
      }
    }
  });

  it('only names weapons that exist', () => {
    for (const profession of PROFESSIONS) {
      for (const proficiency of profession.weaponProficiencies) {
        if ('weaponId' in proficiency) {
          expect(findItem(proficiency.weaponId)?.category, profession.id).toBe('weapon');
        }
      }
    }
  });
});
