import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
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

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonProps['variant'];
  size?: Size;
  /** The element or router link component to render, such as Next.js's Link. Default "a". */
  as?: ElementType;
  children?: ReactNode;
}

/** A link that looks like a button, for an action that opens another page. */
export function ButtonLink({
  variant = 'default',
  size: buttonSize,
  as: Tag = 'a',
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Tag
      {...rest}
      className={cx('ds-btn', `ds-btn--${variant}`, `ds-btn--${size(buttonSize)}`, className)}
    >
      {children}
    </Tag>
  );
}
