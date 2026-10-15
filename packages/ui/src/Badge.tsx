import { cx } from './internal';

export interface BadgeProps {
  /** Omit (or true) for a dot update indicator; a number for a count pill. 0 renders nothing. */
  count?: number | true;
  /** Counts above this show as "max+". Default 99. */
  max?: number;
  /** Text for screen readers, e.g. "3 unread". */
  'aria-label'?: string;
  className?: string;
}

/** An update indicator: a purple-400 dot, or a purple-600 count pill. */
export function Badge({ count, max = 99, className, ...props }: BadgeProps) {
  const label = props['aria-label'];
  if (count === undefined || count === true) {
    return (
      <span
        className={cx('ds-badge', 'ds-badge--dot', className)}
        role={label ? 'status' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : 'true'}
      />
    );
  }
  if (!count) return null;
  return (
    <span className={cx('ds-badge', 'ds-badge--count', className)} aria-label={label}>
      {count > max ? `${String(max)}+` : String(count)}
    </span>
  );
}
