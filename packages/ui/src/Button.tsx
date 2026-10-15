import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx, size, type Size } from './internal';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style. "primary": amber fill, dark text. "secondary": amber outline and label,
   * transparent fill. "default": grey fill, dark text.
   */
  variant?: 'primary' | 'secondary' | 'default';
  /** Height and type size: sm 28px, md 36px, lg 44px. */
  size?: Size;
  children?: ReactNode;
}

/** A clickable action. */
export function Button({
  variant = 'default',
  size: buttonSize,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx('ds-btn', `ds-btn--${variant}`, `ds-btn--${size(buttonSize)}`, className)}
    >
      {children}
    </button>
  );
}
