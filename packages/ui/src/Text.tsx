import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from './internal';

/** The text styles in the Dusk type tokens. */
export type TextVariant =
  'display' | 'heading-1' | 'heading-2' | 'body' | 'label' | 'caption' | 'code';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Text style. Default "body". */
  variant?: TextVariant;
  /** ink-muted instead of ink, for secondary text. */
  muted?: boolean;
  /** Status color, for errors and confirmations. Pair it with words that say the same. */
  tone?: 'danger' | 'success';
  /** Element to render. Default "p" (h1/h2 for headings, code for code). */
  as?: ElementType;
  children?: ReactNode;
}

const DEFAULT_ELEMENT: Record<TextVariant, ElementType> = {
  display: 'h1',
  'heading-1': 'h1',
  'heading-2': 'h2',
  body: 'p',
  label: 'span',
  caption: 'p',
  code: 'code',
};

/** Text in one of the system's type styles. */
export function Text({
  variant = 'body',
  muted,
  tone,
  as,
  className,
  children,
  ...rest
}: TextProps) {
  const Tag = as ?? DEFAULT_ELEMENT[variant];
  return (
    <Tag
      {...rest}
      className={cx(
        'ds-text',
        `ds-text--${variant}`,
        muted && 'ds-text--muted',
        tone && `ds-text--${tone}`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
