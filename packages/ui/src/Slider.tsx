import { useState } from 'react';
import { Field, type FieldProps } from './Field';
import { cx, useStableId } from './internal';

export interface SliderProps extends FieldProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Show the min and max values at each end of the track. */
  showMinMax?: boolean;
  /** Show the current value below the thumb. */
  showValue?: boolean;
  /** Format numbers for the end labels, value label and screen readers (e.g. n => n + "%"). */
  formatValue?: (n: number) => string;
  name?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** Picks a number in a range: grey track, downward-pointing purple triangle thumb. */
export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue,
  onChange,
  showMinMax,
  showValue,
  formatValue = String,
  name,
  disabled,
  id,
  className,
  label,
  hint,
  error,
  required,
}: SliderProps) {
  const inputId = useStableId(id);
  const controlled = controlledValue !== undefined;
  const [inner, setInner] = useState(defaultValue ?? min);
  const value = controlled ? controlledValue : inner;
  const fraction = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  const position = `calc(8px + ${String(fraction * 100)}% - ${String(fraction * 16)}px)`;
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
        <div
          className={cx('ds-slider', disabled && 'is-disabled', showValue && 'ds-slider--value')}
        >
          {showMinMax ? (
            <span className="ds-slider__end" aria-hidden="true">
              {formatValue(min)}
            </span>
          ) : null}
          <div className="ds-slider__rail">
            <input
              id={inputId}
              type="range"
              className="ds-slider__input"
              min={min}
              max={max}
              step={step}
              value={value}
              name={name}
              disabled={disabled}
              aria-describedby={hintId}
              aria-valuetext={formatValue(value)}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!controlled) {
                  setInner(next);
                }
                onChange?.(next);
              }}
            />
            <span className="ds-slider__track" aria-hidden="true" />
            <span className="ds-slider__thumb" style={{ left: position }} aria-hidden="true" />
            {showValue ? (
              <span className="ds-slider__value" style={{ left: position }} aria-hidden="true">
                {formatValue(value)}
              </span>
            ) : null}
          </div>
          {showMinMax ? (
            <span className="ds-slider__end" aria-hidden="true">
              {formatValue(max)}
            </span>
          ) : null}
        </div>
      )}
    </Field>
  );
}
