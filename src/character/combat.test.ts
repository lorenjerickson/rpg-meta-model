import { describe, expect, it } from 'vitest';
import { poolDie } from '../core/dicePool';
import { findItem } from '../equipment/catalog';
import type { WeaponDefinition } from '../equipment/weapons';
import { makeCharacter } from '../testing/characters';
import type { Character, InventoryEntry } from './character';
import {
  characterAttackPool,
  characterDamageRoll,
  characterDefensePool,
  characterInitiativePool,
  characterSavePool,
  characterSoakPool,
  equippedItems,
} from './combat';

function equip(...itemIds: string[]): InventoryEntry[] {
  return itemIds.map((itemId) => ({ itemId, quantity: 1, equipped: true }));
}

function weapon(id: string): WeaponDefinition {
  const item = findItem(id);
  if (item?.category !== 'weapon') {
    throw new Error(`${id} is not a weapon`);
  }
  return item;
}

/**
 * The test scholar (Might 8, Agility 14, Intellect 17, proficiency +3, simple weapons) in
 * everyday clothes with a pocket revolver, a telescopic sight and unfamiliar trench armour.
 */
function armed(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    inventory: [
      ...equip('bowler-hat', 'work-clothes', 'leather-gloves', 'work-boots'),
      ...equip('pocket-revolver', 'telescopic-sight', 'trench-armour'),
    ],
    ...overrides,
  });
}

const revolver = weapon('pocket-revolver');

describe('character combat pools', () => {
  it('leaves out armour the character has no training for', () => {
    expect(equippedItems(armed()).map((item) => item.id)).not.toContain('trench-armour');
    const trained = armed({
      proficiencies: { ...makeCharacter().proficiencies, armor: ['light', 'medium'] },
    });
    expect(equippedItems(trained).map((item) => item.id)).toContain('trench-armour');
  });

  it('builds attacks from attribute, proficiency, equipment and condition dice', () => {
    expect(characterAttackPool(armed(), revolver)).toEqual([
      poolDie(1, 4, 'Agility'),
      poolDie(1, 6, 'Proficiency'),
      poolDie(1, 6, 'Telescopic Sight'),
    ]);
    expect(
      characterAttackPool(armed({ conditions: ['poisoned'], exhaustion: 1 }), revolver),
    ).toEqual([
      poolDie(1, 4, 'Agility'),
      poolDie(1, 6, 'Proficiency'),
      poolDie(1, 6, 'Telescopic Sight'),
      poolDie(1, 6, 'Poisoned', -1),
      poolDie(1, 4, 'Exhaustion', -1),
    ]);
  });

  it('drops proficiency dice for unfamiliar weapons', () => {
    expect(characterAttackPool(armed(), weapon('cavalry-sabre'))).toEqual([
      poolDie(1, 4, 'Agility'),
    ]);
  });

  it('adds the attack attribute dice to damage', () => {
    expect(characterDamageRoll(armed(), revolver)).toEqual({
      dice: revolver.damage.dice,
      pool: [poolDie(1, 4, 'Agility')],
    });
    const fireAxe = weapon('fire-axe');
    expect(characterDamageRoll(armed(), fireAxe, true)).toEqual({
      dice: fireAxe.versatileDamage,
      pool: [poolDie(1, 2, 'Might', -1)],
    });
  });

  it('defends with every piece worn, plus conditions', () => {
    expect(characterDefensePool(armed(), 'melee')).toEqual([
      poolDie(1, 2, 'Bowler Hat'),
      poolDie(4, 2, 'Work Clothes'),
      poolDie(1, 2, 'Leather Gloves'),
      poolDie(1, 4, 'Work Boots'),
    ]);
    expect(characterDefensePool(armed({ conditions: ['prone'] }), 'ranged')).toContainEqual(
      poolDie(1, 6, 'Prone'),
    );
  });

  it('soaks with gear that covers the damage type', () => {
    expect(characterSoakPool(armed(), 'fire')).toEqual([poolDie(1, 2, 'Leather Gloves')]);
    expect(characterSoakPool(armed(), 'piercing')).toEqual([]);
  });

  it('saves with attribute, proficiency, exhaustion and madness dice', () => {
    expect(characterSavePool(armed(), 'intellect')).toEqual([
      poolDie(1, 6, 'Intellect'),
      poolDie(1, 6, 'Proficiency'),
    ]);
    expect(characterSavePool(armed(), 'might')).toEqual([poolDie(1, 2, 'Might', -1)]);
    expect(characterSavePool(armed({ madness: 2 }), 'sanity')).toEqual([
      poolDie(1, 6, 'Proficiency'),
      poolDie(2, 4, 'Madness', -1),
    ]);
  });

  it('rolls Initiative with Agility dice', () => {
    expect(characterInitiativePool(armed())).toEqual([poolDie(1, 4, 'Agility')]);
    expect(characterInitiativePool(armed({ conditions: ['unseen'] }))).toContainEqual(
      poolDie(1, 6, 'Unseen'),
    );
  });
});
