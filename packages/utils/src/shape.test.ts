import { describe, expect, it } from 'vitest';
import { formatDiceNotation, formatSignedDice, parseDiceNotation, parseSignedDice } from './dice';
import {
  defaultValue,
  findValueSets,
  humanize,
  inferShape,
  validateShape,
  type Shape,
} from './shape';

const ATTRIBUTES = { name: 'attributes', values: ['might', 'agility', 'wisdom'] };
const WISE = { name: 'wise_attributes', values: ['wisdom'] };

const weapons = [
  {
    id: 'sabre',
    name: 'Sabre',
    description: 'A curved cavalry blade.',
    cost: 300,
    weight: 3,
    attribute: 'might',
    properties: ['finesse'],
    damage: { dice: '1d8', type: 'slashing' },
  },
  {
    id: 'rifle',
    name: 'Rifle',
    cost: 1200,
    weight: 8.5,
    attribute: 'agility',
    properties: [],
    damage: { dice: '1d10', type: 'piercing' },
    capacity: 5,
  },
];

describe('shape inference', () => {
  const shape = inferShape(weapons, { valueSets: [ATTRIBUTES, WISE], readOnly: ['id'] });

  it('infers fields, optionality and read-only keys', () => {
    expect(shape.kind).toBe('object');
    if (shape.kind !== 'object') return;
    const field = (key: string) => shape.fields.find((entry) => entry.key === key);
    expect(field('id')).toMatchObject({ readOnly: true, optional: false });
    expect(field('description')?.optional).toBe(true);
    expect(field('capacity')).toMatchObject({
      optional: true,
      shape: { kind: 'number', integer: true },
    });
    expect(field('weight')?.shape).toEqual({ kind: 'number', integer: false });
    expect(field('damage')?.shape.kind).toBe('object');
    expect(field('properties')?.shape).toEqual({
      kind: 'array',
      items: { kind: 'string', multiline: false },
    });
  });

  it('picks the largest value set holding every sample', () => {
    if (shape.kind !== 'object') throw new Error('not an object');
    const attribute = shape.fields.find((entry) => entry.key === 'attribute');
    expect(attribute?.shape).toEqual({ kind: 'string', multiline: false, valueSet: ATTRIBUTES });
  });

  it('falls back to any for mixed values', () => {
    expect(inferShape(['a', { value: 'b' }])).toEqual({ kind: 'any' });
    expect(inferShape([[], []])).toEqual({ kind: 'array', items: { kind: 'any' } });
  });

  it('labels camel-case keys', () => {
    expect(humanize('weightLb')).toBe('Weight lb');
    expect(humanize('primaryAttributes')).toBe('Primary attributes');
  });
});

describe('defaults and validation', () => {
  const shape = inferShape(weapons, { valueSets: [ATTRIBUTES] });

  it('makes a default with only required fields, and its choices still to make', () => {
    const value = defaultValue(shape) as Record<string, unknown>;
    expect(value).toMatchObject({ id: '', cost: 0, attribute: '', properties: [] });
    expect(value).not.toHaveProperty('capacity');
    expect(validateShape(shape, value)).toEqual([{ path: ['attribute'], message: 'choose one' }]);
    expect(validateShape(shape, { ...value, attribute: 'wisdom' })).toEqual([]);
  });

  it('reports problems by path', () => {
    const bad = { ...weapons[0], cost: 'free', attribute: 'luck', damage: { dice: 4 } };
    expect(validateShape(shape, bad)).toEqual([
      { path: ['cost'], message: 'must be a number' },
      { path: ['attribute'], message: 'must be one of the attributes' },
      { path: ['damage', 'dice'], message: 'must be text' },
      { path: ['damage', 'type'], message: 'is required' },
    ]);
    const whole: Shape = { kind: 'number', integer: true };
    expect(validateShape(whole, 1.5)).toEqual([{ path: [], message: 'must be a whole number' }]);
  });

  it('finds value sets among a module’s exports', () => {
    expect(
      findValueSets({ SIZES: ['small', 'large'], lower: ['a', 'b'], ONE: ['x'], NUMS: [1, 2] }),
    ).toEqual([{ name: 'sizes', values: ['small', 'large'] }]);
  });
});

describe('dice', () => {
  const d12 = { terms: [{ count: 1, die: 12 }], modifier: 0 };
  const shape = inferShape([{ damage: d12 }, { damage: { terms: [], modifier: 2 } }]);

  it('infers dice values as one field', () => {
    expect(shape).toMatchObject({ fields: [{ key: 'damage', shape: { kind: 'dice' } }] });
    expect(inferShape([{ terms: [{ count: 1, die: 7 }], modifier: 0 }]).kind).toBe('object');
  });

  it('validates dice and defaults to 1d6', () => {
    expect(validateShape(shape, { damage: d12 })).toEqual([]);
    expect(validateShape(shape, { damage: '1d12' })).toEqual([
      { path: ['damage'], message: 'must be dice, such as 1d8 + 2' },
    ]);
    expect(defaultValue({ kind: 'dice' })).toEqual({ terms: [{ count: 1, die: 6 }], modifier: 0 });
  });

  it('formats and parses notation', () => {
    expect(formatDiceNotation({ terms: [{ count: 2, die: 6 }], modifier: -1 })).toBe('2d6 - 1');
    expect(formatDiceNotation({ terms: [], modifier: 3 })).toBe('3');
    expect(parseDiceNotation(' d20 + 1d4 + 2 ')).toEqual({
      terms: [
        { count: 1, die: 20 },
        { count: 1, die: 4 },
      ],
      modifier: 2,
    });
    expect(parseDiceNotation('1d7')).toBeUndefined();
    expect(parseDiceNotation('1d6 -')).toBeUndefined();
    expect(parseDiceNotation('0d6')).toBeUndefined();
  });
});

describe('signed dice', () => {
  const modifiers = [
    { kind: 'soak', count: 1, die: 4, sign: 1, damageTypes: ['cold'] },
    { kind: 'attack', count: 1, die: 6, sign: -1 },
  ];
  const shape = inferShape(modifiers);

  it('marks objects whose count, die and sign are one signed roll', () => {
    expect(shape).toMatchObject({ kind: 'object', signedDice: true });
    expect(inferShape([{ count: 3, die: 5, sign: 1 }])).not.toHaveProperty('signedDice');
  });

  it('reports bad dice once, on the die', () => {
    expect(validateShape(shape, modifiers[0])).toEqual([]);
    expect(validateShape(shape, { ...modifiers[1], die: 7 })).toEqual([
      { path: ['die'], message: 'must be dice, such as 1d4 or -1d4' },
    ]);
  });

  it('formats and parses a signed roll', () => {
    expect(formatSignedDice({ count: 1, die: 4, sign: -1 })).toBe('-1d4');
    expect(parseSignedDice(' +2d6 ')).toEqual({ count: 2, die: 6, sign: 1 });
    expect(parseSignedDice('-d4')).toEqual({ count: 1, die: 4, sign: -1 });
    expect(parseSignedDice('1d4 + 1')).toBeUndefined();
    expect(parseSignedDice('1d5')).toBeUndefined();
  });
});

describe('nullable fields', () => {
  const steps = [
    { id: 'rifleman', parentId: null },
    { id: 'sniper', parentId: 'rifleman' },
  ];
  const shape = inferShape(steps);

  it('marks fields that are null in some samples', () => {
    if (shape.kind !== 'object') throw new Error('not an object');
    expect(shape.fields.find((field) => field.key === 'parentId')).toMatchObject({
      nullable: true,
      shape: { kind: 'string' },
    });
  });

  it('accepts null for them, and defaults them to null', () => {
    expect(validateShape(shape, steps[0])).toEqual([]);
    expect(defaultValue(shape)).toEqual({ id: '', parentId: null });
  });
});
