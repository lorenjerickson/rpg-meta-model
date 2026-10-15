import { useState, type KeyboardEvent } from 'react';
import { Field, type FieldProps } from './Field';
import {
  cx,
  normalizeOption,
  size,
  useStableId,
  type NormalizedOption,
  type Option,
  type Size,
} from './internal';

export interface ComboboxProps extends FieldProps {
  /** The choices, as strings or {value, label}. */
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Shown when typing matches nothing. Default "No matches". */
  emptyText?: string;
  /** Height: sm 28px, md 36px, lg 44px, matching Input and Button; the dropdown rows scale too. */
  size?: Size;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** A text input that filters a dropdown list; arrow keys, Enter and Escape work. */
export function Combobox({
  options: rawOptions,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder,
  emptyText,
  size: comboSize,
  disabled,
  id,
  className,
  label,
  hint,
  error,
  required,
}: ComboboxProps) {
  const inputId = useStableId(id);
  const listId = `${inputId}-list`;
  const options = rawOptions.map(normalizeOption);
  const controlled = controlledValue !== undefined;
  const [inner, setInner] = useState(defaultValue ?? '');
  const value = controlled ? controlledValue : inner;
  const selected = options.find((option) => option.value === value);
  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // While the list is closed the field shows the chosen option; typing filters while it is open.
  const text = open ? query : (selected?.label ?? '');
  const typed = query === selected?.label ? '' : query.toLowerCase();
  const shown = options.filter((option) => !typed || option.label.toLowerCase().includes(typed));

  function openList() {
    if (!open) {
      setQuery(selected?.label ?? '');
    }
    setOpen(true);
  }

  function choose(option: NormalizedOption) {
    if (!controlled) {
      setInner(option.value);
    }
    onChange?.(option.value);
    setQuery(option.label);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openList();
      setActive(Math.min(active + 1, shown.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(Math.max(active - 1, 0));
    } else if (event.key === 'Enter' && open && shown[active]) {
      event.preventDefault();
      choose(shown[active]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  }

  const sized = size(comboSize);
  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {(hintId) => (
        <div className={cx('ds-combo', `ds-combo--${sized}`)}>
          <input
            id={inputId}
            type="text"
            role="combobox"
            autoComplete="off"
            className={cx('ds-input', `ds-input--${sized}`, 'ds-combo__input')}
            placeholder={placeholder}
            disabled={disabled}
            value={text}
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && shown[active] ? `${listId}-${String(active)}` : undefined
            }
            aria-invalid={error ? true : undefined}
            aria-describedby={hintId}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={openList}
            onClick={openList}
            onBlur={() => {
              setOpen(false);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
          />
          <span className="ds-combo__chevron" aria-hidden="true" />
          {open ? (
            <ul id={listId} role="listbox" className="ds-combo__list">
              {shown.length ? (
                shown.map((option, index) => (
                  <li
                    key={option.value}
                    id={`${listId}-${String(index)}`}
                    role="option"
                    aria-selected={option.value === value}
                    className={cx(
                      'ds-combo__opt',
                      index === active && 'is-active',
                      option.value === value && 'is-selected',
                    )}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      choose(option);
                    }}
                    onMouseEnter={() => {
                      setActive(index);
                    }}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="ds-combo__empty">{emptyText ?? 'No matches'}</li>
              )}
            </ul>
          ) : null}
        </div>
      )}
    </Field>
  );
}
