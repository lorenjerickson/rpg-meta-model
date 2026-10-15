import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cx } from './internal';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Adds a red (danger) asterisk. */
  required?: boolean | undefined;
  children?: ReactNode;
}

/** A form label in grey-300. */
export function Label({ required, className, children, ...rest }: LabelProps) {
  return (
    <label {...rest} className={cx('ds-label', className)}>
      {children}
      {required ? (
        <span className="ds-label__req" aria-hidden="true">
          {' *'}
        </span>
      ) : null}
    </label>
  );
}
