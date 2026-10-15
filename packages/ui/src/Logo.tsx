import { cx } from './internal';

export interface LogoProps {
  /** The product name beside the mark. Default "Wanderlust". */
  title?: string;
  /** Show the compass mark alone. */
  markOnly?: boolean;
  /** Hide the wordmark on narrow screens (under 480px), leaving the mark. */
  collapse?: boolean;
  className?: string;
}

/** The Wanderlust compass-rose mark, with the product name as a wordmark. */
export function Logo({ title = 'Wanderlust', markOnly, collapse, className }: LogoProps) {
  return (
    <span className={cx('ds-logo', collapse && 'ds-logo--collapse', className)}>
      <svg
        className="ds-logo__mark"
        viewBox="0 0 28 28"
        role={markOnly ? 'img' : undefined}
        aria-label={markOnly ? title : undefined}
        aria-hidden={markOnly ? undefined : true}
      >
        <circle className="ds-logo__ring" cx="14" cy="14" r="12.5" />
        <path
          className="ds-logo__star"
          d="M14 3.5 L16.2 11.8 L24.5 14 L16.2 16.2 L14 24.5 L11.8 16.2 L3.5 14 L11.8 11.8 Z"
        />
        <circle className="ds-logo__pin" cx="14" cy="14" r="1.6" />
      </svg>
      {markOnly ? null : <span className="ds-header__wordmark">{title}</span>}
    </span>
  );
}
