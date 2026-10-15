/**
 * Shapes inferred at runtime from sample values, so a form or validator can be generated for any
 * entity without writing one by hand. Shapes are plain JSON and can be sent between processes.
 */

/** A named set of allowed string values, such as attributes or damage types. */
export interface ValueSet {
  name: string;
  values: readonly string[];
}

export type Shape =
  | { kind: 'string'; multiline: boolean; valueSet?: ValueSet }
  | { kind: 'number'; integer: boolean }
  | { kind: 'boolean' }
  | { kind: 'object'; fields: readonly FieldShape[] }
  | { kind: 'array'; items: Shape }
  /** Mixed or unknown values, edited as raw JSON. */
  | { kind: 'any' };

export interface FieldShape {
  key: string;
  label: string;
  /** Missing from some samples, so it may be left out. */
  optional: boolean;
  /** Null in some samples, so it may be empty. */
  nullable?: boolean;
  readOnly?: boolean;
  shape: Shape;
}

export interface InferOptions {
  /** Sets a string field's values may belong to; the largest set holding every sample wins. */
  valueSets?: readonly ValueSet[];
  /** Fields that can't be edited, such as an id. */
  readOnly?: readonly string[];
}

/** "weightLb" → "Weight lb", "primaryAttributes" → "Primary attributes". */
export function humanize(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const KEYWORD = /^[a-z0-9][a-z0-9-]*$/;

/** Lower-case word stems of a key or name: "armorTraining" → armor, training; "roll_kinds" → roll, kind. */
function stems(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.replace(/ies$/, 'y').replace(/s$/, ''));
}

/**
 * The value set a field's values come from. Of the sets holding every value, the one whose name
 * shares the most words with the field's name (and its parent's) wins; then the largest.
 */
function valueSetFor(
  values: readonly string[],
  sets: readonly ValueSet[],
  context: readonly string[],
): ValueSet | undefined {
  if (!values.length || !values.every((value) => KEYWORD.test(value))) return undefined;
  const words = new Set(context.flatMap(stems));
  const score = (set: ValueSet) => stems(set.name).filter((word) => words.has(word)).length;
  return sets
    .filter((set) => values.every((value) => set.values.includes(value)))
    .sort((a, b) => score(b) - score(a) || b.values.length - a.values.length)[0];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function kindOf(value: unknown): string {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

/** The shape that fits every sample. Samples of different kinds give `any`. */
export function inferShape(samples: readonly unknown[], options: InferOptions = {}): Shape {
  return infer(samples, options, []);
}

/** `context` holds the names of the field being inferred and the field around it. */
function infer(
  samples: readonly unknown[],
  options: InferOptions,
  context: readonly string[],
): Shape {
  const present = samples.filter((sample) => sample !== undefined && sample !== null);
  const kinds = new Set(present.map(kindOf));
  if (kinds.size !== 1) return { kind: 'any' };
  const [kind] = kinds;

  if (kind === 'string') {
    const values = present as string[];
    const valueSet = valueSetFor([...new Set(values)], options.valueSets ?? [], context);
    return {
      kind: 'string',
      multiline: values.some((value) => value.length > 80 || value.includes('\n')),
      ...(valueSet ? { valueSet } : {}),
    };
  }
  if (kind === 'number') {
    return { kind: 'number', integer: (present as number[]).every(Number.isInteger) };
  }
  if (kind === 'boolean') return { kind: 'boolean' };
  if (kind === 'array') {
    const elements = (present as unknown[][]).flat();
    return {
      kind: 'array',
      items: elements.length
        ? infer(elements, { ...options, readOnly: [] }, context)
        : { kind: 'any' },
    };
  }
  if (kind === 'object') {
    const objects = present as Record<string, unknown>[];
    const keys = [...new Set(objects.flatMap((object) => Object.keys(object)))];
    const readOnly = new Set(options.readOnly ?? []);
    const nested = { ...options, readOnly: [] };
    return {
      kind: 'object',
      fields: keys.map((key) => {
        const values = objects.map((object) => object[key]);
        return {
          key,
          label: humanize(key),
          optional: values.some((value) => value === undefined),
          ...(values.some((value) => value === null) ? { nullable: true } : {}),
          ...(readOnly.has(key) ? { readOnly: true } : {}),
          shape: readOnly.has(key)
            ? infer(values, { ...nested, valueSets: [] }, [key])
            : infer(values, nested, [key, ...context.slice(0, 1)]),
        };
      }),
    };
  }
  return { kind: 'any' };
}

/** A starting value for a new field or array element of this shape. */
export function defaultValue(shape: Shape): unknown {
  switch (shape.kind) {
    case 'string':
      return shape.valueSet?.values[0] ?? '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return Object.fromEntries(
        shape.fields
          .filter((field) => !field.optional)
          .map((field) => [field.key, field.nullable ? null : defaultValue(field.shape)]),
      );
    case 'any':
      return null;
  }
}

export interface ShapeError {
  /** Where the problem is, as keys and indexes from the root. */
  path: readonly (string | number)[];
  message: string;
}

/** Problems with a value against a shape; empty when it fits. */
export function validateShape(
  shape: Shape,
  value: unknown,
  path: readonly (string | number)[] = [],
): ShapeError[] {
  const fail = (message: string): ShapeError[] => [{ path, message }];
  switch (shape.kind) {
    case 'string':
      if (typeof value !== 'string') return fail('must be text');
      if (shape.valueSet && !shape.valueSet.values.includes(value)) {
        return fail(`must be one of the ${humanize(shape.valueSet.name).toLowerCase()}`);
      }
      return [];
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return fail('must be a number');
      if (shape.integer && !Number.isInteger(value)) return fail('must be a whole number');
      return [];
    case 'boolean':
      return typeof value === 'boolean' ? [] : fail('must be true or false');
    case 'array':
      if (!Array.isArray(value)) return fail('must be a list');
      return value.flatMap((item, index) => validateShape(shape.items, item, [...path, index]));
    case 'object':
      if (!isPlainObject(value)) return fail('must be an object');
      return shape.fields.flatMap((field) => {
        const fieldValue = value[field.key];
        if (fieldValue === undefined) {
          return field.optional ? [] : [{ path: [...path, field.key], message: 'is required' }];
        }
        if (fieldValue === null && field.nullable) return [];
        return validateShape(field.shape, fieldValue, [...path, field.key]);
      });
    case 'any':
      return [];
  }
}

/** Every exported list of strings in a module, named by its export, as value sets. */
export function findValueSets(module: Readonly<Record<string, unknown>>): ValueSet[] {
  return Object.entries(module)
    .filter(
      ([name, value]) =>
        /^[A-Z][A-Z0-9_]+$/.test(name) &&
        Array.isArray(value) &&
        value.length > 1 &&
        value.every((item) => typeof item === 'string'),
    )
    .map(([name, value]) => ({ name: name.toLowerCase(), values: value as string[] }));
}
