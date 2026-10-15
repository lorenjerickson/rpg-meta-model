import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx, normalizeOption, useStableId, type Option } from './internal';

export interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Text beside the control (or pass children). */
  label?: ReactNode;
  children?: ReactNode;
}

type ChoiceKind = 'checkbox' | 'radio' | 'switch';

function Choice(kind: ChoiceKind, { label, className, children, ...rest }: ChoiceProps) {
  const text = label ?? children;
  return (
    <label
      className={cx('ds-choice', `ds-${kind}`, Boolean(rest.disabled) && 'is-disabled', className)}
    >
      <input
        {...rest}
        type={kind === 'radio' ? 'radio' : 'checkbox'}
        role={kind === 'switch' ? 'switch' : undefined}
        className={`ds-${kind}__input`}
      />
      <span className={`ds-${kind}__box`} aria-hidden="true" />
      {text ? <span className="ds-choice__label">{text}</span> : null}
    </label>
  );
}

/** A checkbox; checked fills purple-400 with a dark check. */
export function Checkbox(props: ChoiceProps) {
  return Choice('checkbox', props);
}

/** A single radio button; usually used through RadioGroup. */
export function Radio(props: ChoiceProps) {
  return Choice('radio', props);
}

/** An on/off switch; on fills the track purple-400. */
export function Switch(props: ChoiceProps) {
  return Choice('switch', props);
}

export interface RadioGroupProps {
  options: Option[];
  label?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Lay options in a row instead of a column. */
  inline?: boolean;
  disabled?: boolean;
  className?: string;
}

/** A set of radio buttons where one option is chosen. */
export function RadioGroup({
  options,
  label,
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  inline,
  disabled,
  className,
}: RadioGroupProps) {
  const groupName = useStableId(name);
  const controlled = controlledValue !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ? controlledValue : inner;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('ds-radiogroup', inline && 'ds-radiogroup--inline', className)}
    >
      {label ? (
        <div className="ds-label" aria-hidden="true">
          {label}
        </div>
      ) : null}
      <div className="ds-radiogroup__items">
        {options.map(normalizeOption).map((option) => (
          <Radio
            key={option.value}
            name={groupName}
            value={option.value}
            label={option.label}
            disabled={disabled === true || option.disabled === true}
            checked={value === option.value}
            onChange={() => {
              if (!controlled) {
                setInner(option.value);
              }
              onChange?.(option.value);
            }}
          />
        ))}
      </div>
    </div>
  );
}
