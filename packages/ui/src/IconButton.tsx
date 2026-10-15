import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from './internal';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> {
  icon: IconName;
  /** Accessible name, also shown as the tooltip. */
  label: string;
}

/** A 32px ghost button holding one icon: grey-300, charcoal-800 on hover. */
export function IconButton({ icon, label, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx('ds-iconbtn', className)}
      aria-label={label}
      title={label}
    >
      <Icon name={icon} />
    </button>
  );
}
