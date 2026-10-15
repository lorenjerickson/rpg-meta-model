import type { MouseEvent, ReactNode } from 'react';
import { cx } from './internal';

export interface ChipProps {
  /** Tag text (or pass children). */
  label?: ReactNode;
  children?: ReactNode;
  /** "solid" (default): purple-600 fill, white text. "outlined": purple-400 outline and text. */
  variant?: 'solid' | 'outlined';
  /** Shows a × remove control on the right when set. */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name for the remove control. Default "Remove {label}". */
  removeLabel?: string;
  disabled?: boolean;
  /** Tooltip, useful when long labels are truncated. */
  title?: string;
  className?: string;
}

/** A compact purple tag, solid or outlined, with an optional remove control. */
export function Chip({
  label,
  children,
  variant = 'solid',
  onRemove,
  removeLabel,
  disabled,
  title,
  className,
}: ChipProps) {
  const text = label ?? children;
  const removable = typeof onRemove === 'function';
  return (
    <span
      className={cx(
        'ds-chip',
        `ds-chip--${variant === 'outlined' ? 'outlined' : 'solid'}`,
        removable && 'ds-chip--removable',
        disabled && 'is-disabled',
        className,
      )}
      title={title}
    >
      <span className="ds-chip__label">{text}</span>
      {removable ? (
        <button
          type="button"
          className="ds-chip__remove"
          disabled={disabled}
          aria-label={removeLabel ?? `Remove ${typeof text === 'string' ? text : 'tag'}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(event);
          }}
        />
      ) : null}
    </span>
  );
}
