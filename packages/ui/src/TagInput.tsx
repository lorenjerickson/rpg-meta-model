import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Chip } from './Chip';
import { Field, type FieldProps } from './Field';
import { matchesQuery } from './Filter';
import {
  cx,
  normalizeOption,
  size,
  useStableId,
  type NormalizedOption,
  type Option,
  type Size,
} from './internal';

export interface TagInputProps extends FieldProps {
  value: readonly string[];
  onChange: (value: string[]) => void;
  /**
   * The allowed values. When set, only these can be added, and matching ones are suggested as
   * you type; without it, any text becomes a tag.
   */
  options?: readonly Option[];
  placeholder?: string;
  /** Height of the field when empty: sm 28px, md 36px, lg 44px, matching Input. */
  size?: Size;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Tags as removable chips inside the field. Type a tag and press Tab, Enter or comma to add it,
 * then keep typing; Backspace in the empty field removes the last one.
 */
export function TagInput({
  value,
  onChange,
  options,
  placeholder,
  size: tagSize,
  disabled,
  id,
  className,
  label,
  hint,
  error,
  required,
}: TagInputProps) {
  const inputId = useStableId(id);
  const listId = `${inputId}-list`;
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Browsing the suggestions with the arrow keys, before anything is typed.
  const [browsing, setBrowsing] = useState(false);
  const [problem, setProblem] = useState<string | undefined>(undefined);

  const choices = options?.map(normalizeOption);
  const labelOf = (tag: string) => choices?.find((option) => option.value === tag)?.label ?? tag;
  const suggestions: NormalizedOption[] = choices
    ? choices.filter(
        (option) =>
          !value.includes(option.value) &&
          !option.disabled &&
          matchesQuery(`${option.label} ${option.value}`, text),
      )
    : [];
  const showList =
    Boolean(choices) && open && (text.trim() !== '' || browsing) && suggestions.length > 0;
  const highlighted = suggestions[Math.min(active, suggestions.length - 1)];

  function add(tags: readonly string[]) {
    const next = [...value];
    for (const tag of tags) {
      if (tag && !next.includes(tag)) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
  }

  function reset() {
    setText('');
    setActive(0);
    setBrowsing(false);
    setProblem(undefined);
  }

  /** Turns the typed text, or the highlighted suggestion, into a tag. Returns whether it did. */
  function commit(): boolean {
    const typed = text.trim();
    if (!typed) {
      if (!showList || !highlighted) return false;
      add([highlighted.value]);
      reset();
      return true;
    }
    if (choices) {
      const lower = typed.toLowerCase();
      const exact = choices.find(
        (option) => option.value.toLowerCase() === lower || option.label.toLowerCase() === lower,
      );
      const chosen = exact ?? highlighted;
      if (!chosen) {
        setProblem(`“${typed}” isn’t one of the choices`);
        return true;
      }
      add([chosen.value]);
    } else {
      add(typed.split(',').map((part) => part.trim()));
    }
    reset();
    return true;
  }

  function remove(tag: string) {
    onChange(value.filter((item) => item !== tag));
    input.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Tab' || event.key === 'Enter' || event.key === ',') {
      // With nothing typed, Tab moves on as usual.
      if (commit() || event.key !== 'Tab') event.preventDefault();
    } else if (event.key === 'Backspace' && !text && value.length) {
      const last = value[value.length - 1];
      if (last !== undefined) onChange(value.slice(0, -1));
    } else if (event.key === 'ArrowDown' && choices) {
      event.preventDefault();
      if (showList) {
        setActive((current) => Math.min(current + 1, suggestions.length - 1));
      } else {
        setOpen(true);
        setBrowsing(true);
        setActive(0);
      }
    } else if (event.key === 'ArrowUp' && choices) {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
      reset();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text');
    if (choices || !pasted.includes(',')) return;
    event.preventDefault();
    add(pasted.split(',').map((part) => part.trim()));
  }

  const message = problem ?? error;
  return (
    <Field
      id={inputId}
      label={label}
      hint={hint ?? (disabled ? undefined : 'Type and press Tab or Enter to add')}
      error={message}
      required={required}
      className={className}
    >
      {(hintId) => (
        <div
          className={cx(
            'ds-tags',
            `ds-tags--${size(tagSize)}`,
            disabled && 'is-disabled',
            Boolean(message) && 'is-invalid',
          )}
          onMouseDown={(event) => {
            // Clicking the field's empty space puts the cursor in the text box.
            if (event.target === event.currentTarget) {
              event.preventDefault();
              input.current?.focus();
            }
          }}
        >
          {value.map((tag) => (
            <Chip
              key={tag}
              variant="outlined"
              label={labelOf(tag)}
              disabled={disabled === true}
              onRemove={() => {
                remove(tag);
              }}
            />
          ))}
          <input
            ref={input}
            id={inputId}
            type="text"
            className="ds-tags__input"
            value={text}
            placeholder={value.length ? undefined : placeholder}
            disabled={disabled}
            autoComplete="off"
            role={choices ? 'combobox' : undefined}
            aria-expanded={choices ? showList : undefined}
            aria-controls={choices ? listId : undefined}
            aria-autocomplete={choices ? 'list' : undefined}
            aria-activedescendant={
              showList && highlighted ? `${listId}-${highlighted.value}` : undefined
            }
            aria-invalid={message ? true : undefined}
            aria-describedby={hintId}
            onChange={(event) => {
              setText(event.target.value);
              setOpen(true);
              setActive(0);
              setProblem(undefined);
            }}
            onFocus={() => {
              setOpen(true);
            }}
            onBlur={() => {
              setOpen(false);
              // Free text left in the field is kept as a tag.
              if (!choices) commit();
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
          {showList ? (
            <ul id={listId} role="listbox" className="ds-combo__list">
              {suggestions.map((option) => (
                <li
                  key={option.value}
                  id={`${listId}-${option.value}`}
                  role="option"
                  aria-selected={option === highlighted}
                  className={cx('ds-combo__opt', option === highlighted && 'is-active')}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    add([option.value]);
                    reset();
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </Field>
  );
}
