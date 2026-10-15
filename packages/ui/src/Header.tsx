import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Button } from './Button';
import { cx, useStableId } from './internal';

export interface NavItem {
  key?: string;
  label: string;
  href?: string;
  current?: boolean;
}

export interface Account {
  name: string;
  email?: string;
  /** Image URL; initials on purple-600 when absent. */
  avatar?: string;
}

export interface MenuItem {
  key?: string;
  label?: string;
  href?: string;
  danger?: boolean;
  divider?: boolean;
  onSelect?: (item: MenuItem) => void;
}

export interface HeaderProps {
  /** Logo node; defaults to the product name as a Montserrat bold wordmark. */
  logo?: ReactNode;
  productName?: string;
  logoHref?: string;
  onLogoClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Top-level destinations, left to right. */
  nav?: readonly NavItem[];
  /** Key or label of the current destination (or set `current` on a NavItem). */
  current?: string;
  /** If set, links call this instead of following href. */
  onNavigate?: (key: string, item: NavItem) => void;
  /** Signed-in account; omit to show Log in / Sign up. */
  account?: Account;
  /** Account menu items; defaults to Profile, Account settings, Billing, Notifications, Help & support, Sign out. */
  menu?: readonly MenuItem[];
  onMenuSelect?: (key: string, item: MenuItem) => void;
  /** Show the account name beside the avatar. Default true. */
  showAccountName?: boolean;
  onLogin?: () => void;
  /** Pass null to hide the Sign up button. */
  onSignup?: (() => void) | null;
  loginLabel?: string;
  signupLabel?: string;
  /** Extra controls before the account area (e.g. a search button). */
  actions?: ReactNode;
  /** Stick to the top of the viewport on scroll. */
  sticky?: boolean;
  /** Open the account menu initially (for demos). */
  defaultMenuOpen?: boolean;
  className?: string;
}

const DEFAULT_MENU: readonly MenuItem[] = [
  { label: 'Profile', key: 'profile' },
  { label: 'Account settings', key: 'settings' },
  { label: 'Billing', key: 'billing' },
  { label: 'Notifications', key: 'notifications' },
  { divider: true },
  { label: 'Help & support', key: 'help' },
  { divider: true },
  { label: 'Sign out', key: 'signout', danger: true },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function Avatar({ account, size }: { account: Account; size: number }) {
  return account.avatar ? (
    <img className="ds-avatar" src={account.avatar} alt="" width={size} height={size} />
  ) : (
    <span className="ds-avatar ds-avatar--initials" aria-hidden="true">
      {initials(account.name || '?')}
    </span>
  );
}

interface AccountMenuProps {
  account: Account;
  menu?: readonly MenuItem[] | undefined;
  onMenuSelect?: ((key: string, item: MenuItem) => void) | undefined;
  defaultOpen?: boolean | undefined;
  showName?: boolean | undefined;
}

function AccountMenu({ account, menu, onMenuSelect, defaultOpen, showName }: AccountMenuProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const items = menu ?? DEFAULT_MENU;
  const menuId = `${useStableId()}-menu`;

  useEffect(() => {
    if (!open) return;
    const onDocument = (event: globalThis.MouseEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocument);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocument);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  function focusItem(step: number) {
    const elements = list.current
      ? Array.from(list.current.querySelectorAll<HTMLElement>('[role=menuitem]'))
      : [];
    if (!elements.length) return;
    const index = elements.indexOf(document.activeElement as HTMLElement);
    elements[(index + step + elements.length) % elements.length]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      button.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(-1);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  function select(item: MenuItem) {
    setOpen(false);
    item.onSelect?.(item);
    onMenuSelect?.(item.key ?? item.label ?? '', item);
  }

  return (
    <div className="ds-acct" ref={wrap} onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        className={cx('ds-acct__btn', open && 'is-open')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${account.name}`}
        onClick={() => {
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setTimeout(() => {
              focusItem(1);
            }, 0);
          }
        }}
      >
        <Avatar account={account} size={32} />
        {showName === false ? null : <span className="ds-acct__name">{account.name}</span>}
        <span className="ds-acct__chev" aria-hidden="true" />
      </button>
      {open ? (
        <div id={menuId} ref={list} role="menu" className="ds-menu" aria-label="Account">
          <div className="ds-menu__head">
            <Avatar account={account} size={40} />
            <div className="ds-menu__who">
              <div className="ds-menu__name">{account.name}</div>
              {account.email ? <div className="ds-menu__email">{account.email}</div> : null}
            </div>
          </div>
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={`d${String(index)}`} role="separator" className="ds-menu__sep" />;
            }
            const className = cx('ds-menu__item', item.danger && 'ds-menu__item--danger');
            const key = item.key ?? item.label ?? index;
            if (item.href) {
              return (
                <a
                  key={key}
                  role="menuitem"
                  tabIndex={-1}
                  className={className}
                  href={item.href}
                  onClick={() => {
                    select(item);
                  }}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={className}
                onClick={(event) => {
                  event.preventDefault();
                  select(item);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** The primary navigation bar: logo, top-level destinations, and login or an account menu. */
export function Header({
  logo,
  productName = 'Dusk',
  logoHref = '#',
  onLogoClick,
  nav = [],
  current,
  onNavigate,
  account,
  menu,
  onMenuSelect,
  showAccountName,
  onLogin,
  onSignup,
  loginLabel = 'Log in',
  signupLabel = 'Sign up',
  actions,
  sticky,
  defaultMenuOpen,
  className,
}: HeaderProps) {
  return (
    <header className={cx('ds-header', sticky && 'ds-header--sticky', className)}>
      <a
        className="ds-header__logo"
        href={logoHref}
        aria-label={`${productName} home`}
        onClick={onLogoClick}
      >
        {logo ?? <span className="ds-header__wordmark">{productName}</span>}
      </a>
      {nav.length ? (
        <nav className="ds-header__nav" aria-label="Primary">
          {nav.map((item) => {
            const isCurrent =
              item.current === true ||
              (current !== undefined && (current === item.key || current === item.label));
            return (
              <a
                key={item.key ?? item.label}
                href={item.href ?? '#'}
                className={cx('ds-header__link', isCurrent && 'is-current')}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={(event) => {
                  if (onNavigate) {
                    event.preventDefault();
                    onNavigate(item.key ?? item.label, item);
                  }
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      ) : null}
      <div className="ds-header__end">
        {actions ?? null}
        {account ? (
          <AccountMenu
            account={account}
            menu={menu}
            onMenuSelect={onMenuSelect}
            defaultOpen={defaultMenuOpen}
            showName={showAccountName}
          />
        ) : (
          <div className="ds-header__auth">
            <Button size="sm" onClick={onLogin}>
              {loginLabel}
            </Button>
            {onSignup !== null ? (
              <Button size="sm" variant="primary" onClick={onSignup}>
                {signupLabel}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
