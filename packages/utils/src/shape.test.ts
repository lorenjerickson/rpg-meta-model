import { describe, expect, it } from 'vitest';
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

  it('makes a valid default with only required fields', () => {
    const value = defaultValue(shape) as Record<string, unknown>;
    expect(value).toMatchObject({ id: '', cost: 0, attribute: 'might', properties: [] });
    expect(value).not.toHaveProperty('capacity');
    expect(validateShape(shape, value)).toEqual([]);
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
