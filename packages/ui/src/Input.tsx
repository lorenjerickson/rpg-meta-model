import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Field, type FieldProps } from './Field';
import { cx, size, useStableId, type Size } from './internal';

export interface InputProps
  extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Height: sm 28px, md 36px, lg 44px, matching Button. */
  size?: Size;
}

/** A single-line text field. */
export function Input({
  label,
  hint,
  error,
  required,
  size: inputSize,
  className,
  id,
  type = 'text',
  ...rest
}: InputProps) {
  const inputId = useStableId(id);
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
        <input
          {...rest}
          id={inputId}
          type={type}
          required={required}
          className={cx('ds-input', `ds-input--${size(inputSize)}`)}
          aria-invalid={error ? true : undefined}
          aria-describedby={hintId}
        />
      )}
    </Field>
  );
}

export interface TextareaProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** A multi-line text field (4 rows by default, resizes vertically). */
export function Textarea({
  label,
  hint,
  error,
  required,
  className,
  id,
  rows = 4,
  ...rest
}: TextareaProps) {
  const inputId = useStableId(id);
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
        <textarea
          {...rest}
          id={inputId}
          rows={rows}
          required={required}
          className="ds-input ds-textarea"
          aria-invalid={error ? true : undefined}
          aria-describedby={hintId}
        />
      )}
    </Field>
  );
}
