import type { ReactNode } from 'react';
import { Label } from './Label';
import { cx } from './internal';

/** Props shared by every labelled form control. */
export interface FieldProps {
  /** Visible label above the control (rendered with Label, linked by id). */
  label?: ReactNode | undefined;
  /** Helper text under the control, in grey-400. */
  hint?: ReactNode | undefined;
  /** Error message; replaces the hint, turns the border danger and sets aria-invalid. */
  error?: ReactNode | undefined;
  required?: boolean | undefined;
}

interface FieldFrameProps extends FieldProps {
  id: string;
  className?: string | undefined;
  /** Renders the control, given the id of the hint it should be described by. */
  children: (hintId: string | undefined) => ReactNode;
}

/** The label, control and hint or error of a form field. */
export function Field({ id, label, hint, error, required, className, children }: FieldFrameProps) {
  const hintId = hint || error ? `${id}-hint` : undefined;
  return (
    <div className={cx('ds-field', className)}>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      {children(hintId)}
      {hintId ? (
        <div id={hintId} className={cx('ds-hint', Boolean(error) && 'ds-hint--error')}>
          {error ?? hint}
        </div>
      ) : null}
    </div>
  );
}
