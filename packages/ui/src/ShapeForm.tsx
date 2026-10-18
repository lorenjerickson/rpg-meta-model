import {
  defaultValue,
  formatDiceNotation,
  formatSignedDice,
  hasSignedDice,
  humanize,
  isDiceValue,
  parseDiceNotation,
  parseSignedDice,
  SIGNED_DICE_KEYS,
  type SignedDice,
  type FieldShape,
  type Shape,
  type ShapeError,
} from '@dnd-domain/utils';
import { useState } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Switch } from './Choice';
import { Combobox } from './Combobox';
import { FILTER_THRESHOLD, FilterInput, NoMatches, useFilter } from './Filter';
import { IconButton } from './IconButton';
import { Input, Textarea } from './Input';
import { TagInput } from './TagInput';
import { cx } from './internal';
import { Breadcrumb } from './Link';

export interface ShapeFormProps {
  /** The shape to edit, usually inferred from sample data with `inferShape`. */
  shape: Shape;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Problems to show beside the fields they belong to, from `validateShape`. */
  errors?: readonly ShapeError[];
  disabled?: boolean;
  /** Name of the whole value, for the first step of the trail when editing a nested item. */
  rootLabel?: string;
  className?: string;
}

type Path = readonly (string | number)[];
type ObjectShape = Extract<Shape, { kind: 'object' }>;

interface Context {
  errors: readonly ShapeError[];
  disabled: boolean;
  /** Drills into the nested item at a path. */
  open: (path: Path) => void;
}

/* ---------- Values and paths ---------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getIn(value: unknown, path: Path): unknown {
  return path.reduce<unknown>((current, key) => {
    if (Array.isArray(current) && typeof key === 'number') return current[key];
    if (isRecord(current) && typeof key === 'string') return current[key];
    return undefined;
  }, value);
}

function setIn(value: unknown, path: Path, next: unknown): unknown {
  const [key, ...rest] = path;
  if (key === undefined) return next;
  if (typeof key === 'number') {
    const list = Array.isArray(value) ? [...(value as unknown[])] : [];
    list[key] = setIn(list[key], rest, next);
    return list;
  }
  const record = isRecord(value) ? value : {};
  return { ...record, [key]: setIn(record[key], rest, next) };
}

function shapeAt(shape: Shape, key: string | number): Shape | undefined {
  if (shape.kind === 'array' && typeof key === 'number') return shape.items;
  if (shape.kind === 'object' && typeof key === 'string') {
    return shape.fields.find((field) => field.key === key)?.shape;
  }
  return undefined;
}

const startsWith = (path: Path, prefix: Path) => prefix.every((key, index) => path[index] === key);

function errorsUnder(errors: readonly ShapeError[], prefix: Path): number {
  return errors.filter((error) => startsWith(error.path, prefix)).length;
}

function errorAt(errors: readonly ShapeError[], path: Path): string | undefined {
  return errors.find((error) => error.path.length === path.length && startsWith(error.path, path))
    ?.message;
}

/* ---------- How each field is shown ---------- */

function isSignedDiceKey(key: string): boolean {
  return (SIGNED_DICE_KEYS as readonly string[]).includes(key);
}

/** Fits on one line in the grid: a short text, number, dice, choice or switch. */
function isCompact(shape: Shape): boolean {
  return (
    (shape.kind === 'string' && !shape.multiline) ||
    shape.kind === 'number' ||
    shape.kind === 'dice' ||
    shape.kind === 'boolean'
  );
}

/**
 * - compact: a field in the grid
 * - wide: a long text or raw JSON, full width
 * - inline: a small object of simple fields, shown in place under a light heading
 * - tags: a list of short texts, as removable chips in a tag field (from a set, if it has one)
 * - values: a list of simple values, one input each
 * - rows: a list of entities, one row each, edited by drilling in
 * - nested: a larger object, one row, edited by drilling in
 */
type Layout = 'compact' | 'wide' | 'inline' | 'tags' | 'values' | 'rows' | 'nested';

function layoutOf(shape: Shape): Layout {
  if (isCompact(shape)) return 'compact';
  if (shape.kind === 'object') {
    return shape.fields.every((field) => isCompact(field.shape)) ? 'inline' : 'nested';
  }
  if (shape.kind === 'array') {
    const items = shape.items;
    if (items.kind === 'string' && (items.valueSet || !items.multiline)) return 'tags';
    if (items.kind === 'object') return 'rows';
    if (items.kind === 'string' || isCompact(items)) return 'values';
  }
  return 'wide';
}

/* ---------- Summaries for rows and the trail ---------- */

const TITLE_KEYS = ['name', 'label', 'title', 'key', 'id'];

function display(value: unknown): string | undefined {
  if (typeof value === 'string') return value ? humanize(value) : undefined;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'yes' : undefined;
  if (isDiceValue(value)) return formatDiceNotation(value);
  return undefined;
}

/** The field that names an object: a name-like field, else its first simple text. */
function titleKeyOf(value: unknown, shape?: Shape): string | undefined {
  if (!isRecord(value)) return undefined;
  const named = TITLE_KEYS.find((key) => {
    const candidate = value[key];
    return typeof candidate === 'string' && candidate.trim() !== '';
  });
  if (named || shape?.kind !== 'object') return named;
  // An item that has a name field, still empty, is untitled rather than named by another field.
  if (shape.fields.some((field) => TITLE_KEYS.includes(field.key))) return undefined;
  return shape.fields.find(
    (field) =>
      field.shape.kind === 'string' &&
      !field.shape.multiline &&
      typeof value[field.key] === 'string' &&
      value[field.key] !== '',
  )?.key;
}

function titleOf(value: unknown, shape?: Shape): string | undefined {
  const key = titleKeyOf(value, shape);
  if (!key || !isRecord(value)) return undefined;
  const title = value[key] as string;
  return TITLE_KEYS.includes(key) ? title : humanize(title);
}

/** A line describing an object: its description, or a few of its simple values. */
function detailOf(value: unknown, shape: Shape): string | undefined {
  if (!isRecord(value) || shape.kind !== 'object') return undefined;
  const description = value.description;
  if (typeof description === 'string' && description.trim()) {
    return description.length > 110 ? `${description.slice(0, 107)}…` : description;
  }
  const titleKey = titleKeyOf(value, shape);
  const dice =
    shape.signedDice && hasSignedDice(value)
      ? [formatSignedDice(value as unknown as SignedDice)]
      : [];
  const parts = [
    ...dice,
    ...shape.fields
      .filter(
        (field) =>
          isCompact(field.shape) &&
          field.key !== titleKey &&
          field.key !== 'id' &&
          !(shape.signedDice && isSignedDiceKey(field.key)),
      )
      .map((field) => {
        const shown = display(value[field.key]);
        return shown === undefined ? undefined : `${field.label}: ${shown}`;
      }),
  ]
    .filter((part): part is string => part !== undefined)
    .slice(0, 3);
  return parts.length ? parts.join(' · ') : undefined;
}

function singular(label: string): string {
  return label.replace(/ies$/, 'y').replace(/s$/, '');
}

function optionsOf(values: readonly string[]) {
  return values.map((value) => ({ value, label: humanize(value) }));
}

/* ---------- Drilling in ---------- */

interface Step {
  label: string;
  path: Path;
}

/**
 * The object the focus opens, and the trail of steps to it. A focus that no longer exists (after
 * a discard or a removal) falls back to its nearest existing parent.
 */
function resolveFocus(shape: Shape, value: unknown, focus: Path, rootLabel: string) {
  const steps: Step[] = [{ label: rootLabel, path: [] }];
  let current: { shape: Shape; path: Path } = { shape, path: [] };
  let index = 0;
  while (index < focus.length) {
    const key = focus[index];
    if (key === undefined) break;
    const fieldShape = shapeAt(current.shape, key);
    if (!fieldShape) break;
    let nextPath: Path = [...current.path, key];
    let nextShape = fieldShape;
    let label =
      current.shape.kind === 'object'
        ? (current.shape.fields.find((field) => field.key === key)?.label ?? String(key))
        : String(key);
    // A list item: step over the list to the item itself.
    if (fieldShape.kind === 'array') {
      const itemIndex = focus[index + 1];
      if (typeof itemIndex !== 'number') break;
      nextPath = [...nextPath, itemIndex];
      nextShape = fieldShape.items;
      label =
        titleOf(getIn(value, nextPath), nextShape) ??
        `${humanize(singular(label))} ${String(itemIndex + 1)}`;
      index += 1;
    }
    if (nextShape.kind !== 'object' || !isRecord(getIn(value, nextPath))) break;
    current = { shape: nextShape, path: nextPath };
    steps.push({ label, path: nextPath });
    index += 1;
  }
  return { ...current, steps };
}

/**
 * A form generated from a shape. Simple fields sit in a grid; small groups of simple fields are
 * shown in place; lists of entities and larger nested objects are rows to add, edit and remove,
 * edited one at a time by drilling in, with a trail back to the whole.
 */
export function ShapeForm({
  shape,
  value,
  onChange,
  errors = [],
  disabled = false,
  rootLabel,
  className,
}: ShapeFormProps) {
  const [focus, setFocus] = useState<Path>([]);
  const focused = resolveFocus(shape, value, focus, rootLabel ?? titleOf(value) ?? 'Entry');
  const context: Context = { errors, disabled, open: setFocus };
  const focusedValue = getIn(value, focused.path);
  const change = (next: unknown) => {
    onChange(setIn(value, focused.path, next));
  };
  const parent = focused.steps.at(-2);

  return (
    <div className={cx('ds-form', className)}>
      {parent ? (
        <div className="ds-form__trail">
          <IconButton
            icon="arrow-left"
            label={`Back to ${parent.label}`}
            onClick={() => {
              setFocus(parent.path);
            }}
          />
          <Breadcrumb
            aria-label="Editing"
            items={focused.steps.map((step, index) => ({ key: String(index), label: step.label }))}
            onNavigate={(key) => {
              const step = focused.steps[Number(key)];
              if (step) setFocus(step.path);
            }}
          />
        </div>
      ) : null}
      {focused.shape.kind === 'object' ? (
        <ObjectFields
          shape={focused.shape}
          value={focusedValue}
          onChange={change}
          path={focused.path}
          context={context}
        />
      ) : (
        <FieldInput
          shape={focused.shape}
          value={focusedValue}
          onChange={change}
          path={focused.path}
          label="Value"
          context={context}
        />
      )}
    </div>
  );
}

/* ---------- An object's fields ---------- */

function ObjectFields({
  shape,
  value,
  onChange,
  path,
  context,
}: {
  shape: ObjectShape;
  value: unknown;
  onChange: (value: unknown) => void;
  path: Path;
  context: Context;
}) {
  const record = isRecord(value) ? value : {};
  // An optional field that is absent, or a nullable one that is null, can be added back.
  const isEmpty = (field: FieldShape) =>
    record[field.key] === undefined || (field.nullable === true && record[field.key] === null);
  const canEmpty = (field: FieldShape) =>
    (field.optional || field.nullable === true) && !field.readOnly;
  const set = (key: string, next: unknown) => {
    onChange({ ...record, [key]: next });
  };
  const unset = (field: FieldShape) => {
    if (field.optional) {
      onChange(Object.fromEntries(Object.entries(record).filter(([entry]) => entry !== field.key)));
    } else {
      set(field.key, null);
    }
  };
  const add = (field: FieldShape) => {
    set(field.key, defaultValue(field.shape));
    // A larger nested object opens straight away, ready to fill in.
    if (layoutOf(field.shape) === 'nested') context.open([...path, field.key]);
  };

  // A signed roll's count, die and sign are edited together, as one dice field.
  const fields = shape.signedDice
    ? shape.fields.filter((field) => !isSignedDiceKey(field.key))
    : shape.fields;
  const present = fields.filter((field) => !isEmpty(field));
  const missing = fields.filter((field) => canEmpty(field) && isEmpty(field));
  const withLayout = (...layouts: Layout[]) =>
    present.filter((field) => layouts.includes(layoutOf(field.shape)));

  const props = (field: FieldShape): FieldProps => ({
    shape: field.shape,
    value: record[field.key],
    onChange: (next: unknown) => {
      set(field.key, next);
    },
    path: [...path, field.key],
    label: field.label,
    context,
    readOnly: field.readOnly,
    onRemove: canEmpty(field)
      ? () => {
          unset(field);
        }
      : undefined,
  });

  const compact = withLayout('compact');
  return (
    <>
      {compact.length || shape.signedDice ? (
        <div className="ds-form__grid">
          {shape.signedDice ? (
            <div className="ds-form__field">
              <NotationInput
                label="Dice"
                value={hasSignedDice(record) ? (record as unknown as SignedDice) : undefined}
                format={formatSignedDice}
                parse={parseSignedDice}
                example="1d4 or -1d4"
                onChange={(dice) => {
                  onChange({ ...record, ...dice });
                }}
                disabled={context.disabled}
                error={SIGNED_DICE_KEYS.map((key) => errorAt(context.errors, [...path, key])).find(
                  Boolean,
                )}
              />
            </div>
          ) : null}
          {compact.map((field) => (
            <FieldInput key={field.key} {...props(field)} />
          ))}
        </div>
      ) : null}
      {withLayout('wide', 'tags').map((field) => (
        <FieldInput key={field.key} {...props(field)} />
      ))}
      {withLayout('inline').map((field) => (
        <InlineGroup key={field.key} {...props(field)} />
      ))}
      {withLayout('values', 'rows', 'nested').map((field) => {
        const layout = layoutOf(field.shape);
        if (layout === 'rows') return <EntityRows key={field.key} {...props(field)} />;
        if (layout === 'nested') return <NestedRow key={field.key} {...props(field)} />;
        return <ValueList key={field.key} {...props(field)} />;
      })}
      {missing.length ? (
        <div className="ds-form__add">
          {missing.map((field) => (
            <Button
              key={field.key}
              size="sm"
              disabled={context.disabled}
              onClick={() => {
                add(field);
              }}
            >
              {`+ ${field.label}`}
            </Button>
          ))}
        </div>
      ) : null}
    </>
  );
}

interface FieldProps {
  shape: Shape;
  value: unknown;
  onChange: (value: unknown) => void;
  path: Path;
  label: string;
  context: Context;
  readOnly?: boolean | undefined;
  /** Shows a remove control, for optional fields and list items. */
  onRemove?: (() => void) | undefined;
}

function RemoveButton({
  label,
  onRemove,
  disabled,
  className,
}: {
  label: string;
  onRemove: () => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <IconButton
      icon="x"
      label={`Remove ${label.toLowerCase()}`}
      className={className}
      onClick={onRemove}
      disabled={disabled}
    />
  );
}

/** The heading over a group or list, with its count and remove control. */
function SectionHead({
  label,
  count,
  onRemove,
  disabled,
}: {
  label: string;
  count?: number;
  onRemove?: (() => void) | undefined;
  disabled: boolean;
}) {
  return (
    <div className="ds-section__head">
      <span className="ds-section__label">{label}</span>
      {count === undefined ? null : <span className="ds-section__count">{count}</span>}
      {onRemove ? (
        <RemoveButton
          label={label}
          onRemove={onRemove}
          disabled={disabled}
          className="ds-section__remove"
        />
      ) : null}
    </div>
  );
}

/** A small object of simple fields, shown in place under a light heading. */
function InlineGroup({
  shape,
  value,
  onChange,
  path,
  label,
  context,
  readOnly,
  onRemove,
}: FieldProps) {
  if (shape.kind !== 'object') return null;
  return (
    <section className="ds-section" aria-label={label}>
      <SectionHead label={label} onRemove={onRemove} disabled={context.disabled} />
      <ObjectFields
        shape={shape}
        value={value}
        onChange={onChange}
        path={path}
        context={readOnly ? { ...context, disabled: true } : context}
      />
    </section>
  );
}

/** One row: a title that opens the item, a line of detail, problems, edit and remove. */
function Row({
  title,
  detail,
  problems,
  onOpen,
  onRemove,
  removeIcon,
  disabled,
}: {
  title: string;
  detail: string | undefined;
  problems: number;
  onOpen: () => void;
  onRemove?: (() => void) | undefined;
  removeIcon: 'trash-2' | 'x';
  disabled: boolean;
}) {
  return (
    <li className="ds-rows__row">
      <div className="ds-rows__text">
        <button type="button" className="ds-rows__title" onClick={onOpen}>
          {title}
        </button>
        {detail ? <div className="ds-rows__detail">{detail}</div> : null}
      </div>
      {problems ? (
        <Badge count={problems} aria-label={`${String(problems)} problems in ${title}`} />
      ) : null}
      <IconButton icon="pencil" label={`Edit ${title}`} onClick={onOpen} />
      {onRemove ? (
        <IconButton
          icon={removeIcon}
          label={`Remove ${title}`}
          onClick={onRemove}
          disabled={disabled}
        />
      ) : null}
    </li>
  );
}

/** A larger nested object: one row, edited by drilling in. */
function NestedRow({ shape, value, path, label, context, onRemove }: FieldProps) {
  return (
    <section className="ds-section" aria-label={label}>
      <ul className="ds-rows">
        <Row
          title={label}
          detail={detailOf(value, shape)}
          problems={errorsUnder(context.errors, path)}
          onOpen={() => {
            context.open(path);
          }}
          onRemove={onRemove}
          removeIcon="x"
          disabled={context.disabled}
        />
      </ul>
    </section>
  );
}

/** A list of entities: a row each, with add, edit and remove. */
function EntityRows({ shape, value, onChange, path, label, context, onRemove }: FieldProps) {
  const items = Array.isArray(value) ? (value as unknown[]) : [];
  const itemShape = shape.kind === 'array' ? shape.items : shape;
  const itemLabel = humanize(singular(label));
  const rows = items.map((item, index) => ({
    index,
    title: titleOf(item, itemShape) ?? `${itemLabel} ${String(index + 1)}`,
    detail: detailOf(item, itemShape),
  }));
  const { query, setQuery, matches } = useFilter(rows, (row) => `${row.title} ${row.detail ?? ''}`);
  const filtering = rows.length > FILTER_THRESHOLD;
  const shown = filtering ? matches.map(({ item }) => item) : rows;
  if (shape.kind !== 'array') return null;
  const error = errorAt(context.errors, path);
  return (
    <section className="ds-section" aria-label={label}>
      <SectionHead
        label={label}
        count={items.length}
        onRemove={onRemove}
        disabled={context.disabled}
      />
      {error ? <div className="ds-hint ds-hint--error">{error}</div> : null}
      {filtering ? (
        <FilterInput
          query={query}
          onQueryChange={setQuery}
          shown={matches.length}
          total={rows.length}
          noun={label.toLowerCase()}
        />
      ) : null}
      {filtering && !shown.length ? <NoMatches query={query} /> : null}
      {shown.length ? (
        <ul className="ds-rows">
          {shown.map(({ index, title, detail }) => {
            const itemPath = [...path, index];
            return (
              <Row
                key={index}
                title={title}
                detail={detail}
                problems={errorsUnder(context.errors, itemPath)}
                onOpen={() => {
                  context.open(itemPath);
                }}
                onRemove={() => {
                  onChange(items.filter((_, i) => i !== index));
                }}
                removeIcon="trash-2"
                disabled={context.disabled}
              />
            );
          })}
        </ul>
      ) : items.length ? null : (
        <p className="ds-section__empty">None yet.</p>
      )}
      <div className="ds-form__add">
        <Button
          size="sm"
          disabled={context.disabled}
          onClick={() => {
            onChange([...items, defaultValue(shape.items)]);
            context.open([...path, items.length]);
          }}
        >
          {`+ ${itemLabel}`}
        </Button>
      </div>
    </section>
  );
}

/* ---------- Single fields and simple lists ---------- */

function FieldInput(props: FieldProps) {
  const { shape, value, onChange, path, label, context, readOnly, onRemove } = props;
  const error = errorAt(context.errors, path);
  const disabled = context.disabled || readOnly === true;
  const remove = onRemove ? (
    <RemoveButton
      label={label}
      onRemove={onRemove}
      disabled={context.disabled}
      className="ds-form__remove"
    />
  ) : null;

  switch (shape.kind) {
    case 'string': {
      const text = typeof value === 'string' ? value : '';
      const control = shape.valueSet ? (
        <Combobox
          label={label}
          options={optionsOf(shape.valueSet.values)}
          value={text}
          placeholder={`Choose ${label.toLowerCase()}…`}
          onChange={onChange}
          disabled={disabled}
          error={error}
        />
      ) : shape.multiline ? (
        <Textarea
          label={label}
          value={text}
          rows={Math.min(8, Math.max(3, Math.ceil(text.length / 90)))}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          disabled={disabled}
          error={error}
        />
      ) : (
        <Input
          label={label}
          value={text}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          disabled={disabled}
          error={error}
        />
      );
      return (
        <div className={cx('ds-form__field', !isCompact(shape) && 'ds-form__field--wide')}>
          {control}
          {remove}
        </div>
      );
    }
    case 'number':
      return (
        <div className="ds-form__field">
          <Input
            label={label}
            type="number"
            step={shape.integer ? 1 : 'any'}
            value={typeof value === 'number' && Number.isFinite(value) ? String(value) : ''}
            onChange={(event) => {
              onChange(event.target.value === '' ? null : Number(event.target.value));
            }}
            disabled={disabled}
            error={error}
          />
          {remove}
        </div>
      );
    case 'dice':
      return (
        <div className="ds-form__field">
          <NotationInput
            label={label}
            value={isDiceValue(value) ? value : undefined}
            format={formatDiceNotation}
            parse={parseDiceNotation}
            example="1d8 + 2"
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
          {remove}
        </div>
      );
    case 'boolean':
      return (
        <div className="ds-form__field ds-form__field--switch">
          <Switch
            label={label}
            checked={value === true}
            onChange={(event) => {
              onChange(event.target.checked);
            }}
            disabled={disabled}
          />
          {remove}
        </div>
      );
    case 'array':
      return <ValueList {...props} />;
    case 'object':
      return <InlineGroup {...props} />;
    case 'any':
      return (
        <div className="ds-form__field ds-form__field--wide">
          <JsonInput
            key={JSON.stringify(value)}
            label={label}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
          {remove}
        </div>
      );
  }
}

/** A list of simple values: chips for choices from a set, otherwise one input per value. */
function ValueList({
  shape,
  value,
  onChange,
  path,
  label,
  context,
  readOnly,
  onRemove,
}: FieldProps) {
  const items = Array.isArray(value) ? (value as unknown[]) : [];
  const { query, setQuery, matches } = useFilter(items, (item) =>
    typeof item === 'string' || typeof item === 'number' ? String(item) : JSON.stringify(item),
  );
  if (shape.kind !== 'array') return null;
  const disabled = context.disabled || readOnly === true;
  const error = errorAt(context.errors, path);
  const itemShape = shape.items;
  const filtering = items.length > FILTER_THRESHOLD;
  const shown = filtering ? matches : items.map((item, index) => ({ item, index }));

  if (itemShape.kind === 'string' && (itemShape.valueSet || !itemShape.multiline)) {
    const tags = items.filter((item): item is string => typeof item === 'string');
    return (
      <div className="ds-form__field ds-form__field--wide">
        <TagInput
          label={label}
          value={tags}
          onChange={onChange}
          {...(itemShape.valueSet ? { options: optionsOf(itemShape.valueSet.values) } : {})}
          placeholder={`Add ${singular(label).toLowerCase()}…`}
          disabled={disabled}
          error={error}
        />
        {onRemove ? (
          <RemoveButton
            label={label}
            onRemove={onRemove}
            disabled={context.disabled}
            className="ds-form__remove"
          />
        ) : null}
      </div>
    );
  }

  const itemLabel = humanize(singular(label));
  return (
    <section className="ds-section" aria-label={label}>
      <SectionHead
        label={label}
        count={items.length}
        onRemove={onRemove}
        disabled={context.disabled}
      />
      {error ? <div className="ds-hint ds-hint--error">{error}</div> : null}
      {filtering ? (
        <FilterInput
          query={query}
          onQueryChange={setQuery}
          shown={matches.length}
          total={items.length}
          noun={label.toLowerCase()}
        />
      ) : null}
      {filtering && !shown.length ? <NoMatches query={query} /> : null}
      {shown.length ? (
        <div className={cx('ds-values', isCompact(itemShape) && 'ds-values--compact')}>
          {shown.map(({ item, index }) => (
            <FieldInput
              key={index}
              shape={itemShape}
              value={item}
              onChange={(next) => {
                onChange(items.map((current, i) => (i === index ? next : current)));
              }}
              path={[...path, index]}
              label={`${itemLabel} ${String(index + 1)}`}
              context={context}
              onRemove={() => {
                onChange(items.filter((_, i) => i !== index));
              }}
            />
          ))}
        </div>
      ) : items.length ? null : (
        <p className="ds-section__empty">None yet.</p>
      )}
      <div className="ds-form__add">
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => {
            onChange([...items, defaultValue(itemShape)]);
          }}
        >
          {`+ ${itemLabel}`}
        </Button>
      </div>
    </section>
  );
}

/** Dice typed as notation, such as "2d6 + 3"; applied as soon as it parses. */
function NotationInput<T>({
  label,
  value,
  format,
  parse,
  example,
  onChange,
  disabled,
  error,
}: {
  label: string;
  /** The current dice, or undefined when there are none yet. */
  value: T | undefined;
  format: (value: T) => string;
  parse: (text: string) => T | undefined;
  example: string;
  onChange: (value: T) => void;
  disabled: boolean;
  error: string | undefined;
}) {
  const external = value === undefined ? '' : format(value);
  const [text, setText] = useState(external);
  const [seen, setSeen] = useState(external);
  const parsed = parse(text);
  // A change from outside (a discard, say) replaces the text; the field's own edits don't.
  if (external !== seen) {
    setSeen(external);
    if (!parsed || format(parsed) !== external) setText(external);
  }
  return (
    <Input
      label={label}
      value={text}
      placeholder={example}
      spellCheck={false}
      onChange={(event) => {
        setText(event.target.value);
        const next = parse(event.target.value);
        if (next) onChange(next);
      }}
      disabled={disabled}
      error={parsed ? error : `Use dice notation, such as ${example}`}
    />
  );
}

/** Raw JSON for values of no single shape; applied when the field loses focus. */
function JsonInput({
  label,
  value,
  onChange,
  disabled,
  error,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  error: string | undefined;
}) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [invalid, setInvalid] = useState(false);
  return (
    <Textarea
      label={label}
      hint="JSON"
      value={text}
      rows={Math.min(10, text.split('\n').length + 1)}
      disabled={disabled}
      error={invalid ? 'Not valid JSON' : error}
      className="ds-form__json"
      onChange={(event) => {
        setText(event.target.value);
      }}
      onBlur={() => {
        try {
          onChange(JSON.parse(text) as unknown);
          setInvalid(false);
        } catch {
          setInvalid(true);
        }
      }}
    />
  );
}
