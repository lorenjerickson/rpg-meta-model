import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';
import { cx } from './internal';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** grey-300 instead of purple-400, for low-emphasis links. */
  muted?: boolean;
  /** The element or router link component to render, such as Next.js's Link. Default "a". */
  as?: ElementType;
  children?: ReactNode;
}

/** A text link: purple-400, underlined on hover and keyboard focus. */
export function Link({ muted, as: Tag = 'a', className, children, ...rest }: LinkProps) {
  return (
    <Tag {...rest} className={cx('ds-link', muted && 'ds-link--muted', className)}>
      {children}
    </Tag>
  );
}

export interface Crumb {
  key?: string;
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** Path from the top level to the current page; the last item is the current page and is not a link. */
  items: readonly Crumb[];
  /** If set, crumb clicks call this instead of following href. */
  onNavigate?: (key: string, item: Crumb) => void;
  'aria-label'?: string;
  className?: string;
}

/** The path to the current page, with "/" between levels. */
export function Breadcrumb({ items, onNavigate, className, ...props }: BreadcrumbProps) {
  return (
    <nav className={cx('ds-crumbs', className)} aria-label={props['aria-label'] ?? 'Breadcrumb'}>
      <ol className="ds-crumbs__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.key ?? item.label} className="ds-crumbs__item">
              {last ? (
                <span className="ds-crumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  className="ds-crumbs__link"
                  href={item.href ?? '#'}
                  onClick={
                    onNavigate
                      ? (event) => {
                          event.preventDefault();
                          onNavigate(item.key ?? item.label, item);
                        }
                      : undefined
                  }
                >
                  {item.label}
                </a>
              )}
              {last ? null : (
                <span className="ds-crumbs__sep" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
