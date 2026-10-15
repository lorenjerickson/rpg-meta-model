import { useEffect, useState, type ReactNode } from 'react';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { cx } from './internal';

export interface SideNavItem {
  key?: string;
  label: string;
  href?: string;
  /** A 20px icon node (inline SVG using currentColor), such as `<Icon name="map" />`. */
  icon?: ReactNode;
  /** true for a dot update indicator, a number for a count. */
  badge?: boolean | number;
  badgeMax?: number;
  current?: boolean;
}

export interface SideNavGroup {
  label?: string;
  items: readonly SideNavItem[];
}

export interface SideNavProps {
  /** Heading, usually the current Header destination ("Projects"). */
  title?: ReactNode;
  groups: readonly SideNavGroup[];
  /** Key or label of the current item. */
  current?: string;
  onNavigate?: (key: string, item: SideNavItem) => void;
  /** Overlay drawer with a scrim and close button, for narrow screens. */
  modal?: boolean;
  /** Modal only: whether the drawer is shown. */
  open?: boolean;
  /** Modal only: called on scrim click, close button, Escape, and (by default) navigation. */
  onClose?: () => void;
  closeOnNavigate?: boolean;
  /** Inline only: show a button that collapses the drawer to a strip of icons. */
  collapsible?: boolean;
  /** Collapsed to icons (controlled). */
  collapsed?: boolean;
  /** Collapsed to icons at first (uncontrolled). */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  'aria-label'?: string;
  className?: string;
}

function ItemBadge({ item, collapsed }: { item: SideNavItem; collapsed: boolean }) {
  if (item.badge === undefined || item.badge === false) return null;
  const dot = item.badge === true;
  const count = Number(item.badge);
  const spoken = dot
    ? 'new activity'
    : `${String(count)} ${count === 1 ? 'new item' : 'new items'}`;
  return (
    <>
      <Badge
        // A collapsed strip has no room for a count, so it shows the dot.
        count={dot || collapsed ? true : count}
        {...(item.badgeMax === undefined ? {} : { max: item.badgeMax })}
      />
      <span className="ds-sr">{`, ${spoken}`}</span>
    </>
  );
}

/**
 * The secondary navigation drawer: grouped destinations under the current primary destination.
 * Inline, it can collapse to a strip of icons; on narrow screens use it as a modal drawer.
 */
export function SideNav({
  title,
  groups,
  current,
  onNavigate,
  modal = false,
  open: openProp,
  onClose,
  closeOnNavigate,
  collapsible = false,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  ...props
}: SideNavProps) {
  const open = openProp !== false;
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const collapsed = !modal && (controlledCollapsed ?? innerCollapsed);

  useEffect(() => {
    if (!modal || !open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [modal, open, onClose]);

  if (modal && !open) return null;

  function toggleCollapsed() {
    const next = !collapsed;
    if (controlledCollapsed === undefined) setInnerCollapsed(next);
    onCollapsedChange?.(next);
  }

  const showToggle = collapsible && !modal;
  const fallbackLabel = typeof title === 'string' ? `${title} navigation` : 'Secondary';
  const panel = (
    <nav
      className={cx(
        'ds-sidenav',
        modal && 'ds-sidenav--modal',
        collapsed && 'ds-sidenav--collapsed',
        className,
      )}
      aria-label={props['aria-label'] ?? fallbackLabel}
    >
      {title || modal || showToggle ? (
        <div className="ds-sidenav__head">
          {title ? <div className="ds-sidenav__title">{title}</div> : null}
          {modal ? (
            <button
              type="button"
              className="ds-sidenav__close"
              aria-label="Close navigation"
              onClick={onClose}
            />
          ) : null}
          {showToggle ? (
            <IconButton
              className="ds-sidenav__toggle"
              icon={collapsed ? 'panel-left-open' : 'panel-left-close'}
              label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-expanded={!collapsed}
              onClick={toggleCollapsed}
            />
          ) : null}
        </div>
      ) : null}
      {groups.map((group, groupIndex) => {
        const groupId = `ds-sng-${String(groupIndex)}-${(group.label ?? '').replace(/\W+/g, '')}`;
        return (
          <div key={group.label ?? groupIndex} className="ds-sidenav__group">
            {group.label ? (
              <div id={groupId} className="ds-sidenav__glabel">
                {group.label}
              </div>
            ) : null}
            <ul className="ds-sidenav__list" aria-labelledby={group.label ? groupId : undefined}>
              {group.items.map((item) => {
                const key = item.key ?? item.label;
                const isCurrent = item.current === true || current === key;
                return (
                  <li key={key}>
                    <a
                      href={item.href ?? '#'}
                      className={cx('ds-sidenav__link', isCurrent && 'is-current')}
                      aria-current={isCurrent ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={(event) => {
                        if (onNavigate) {
                          event.preventDefault();
                          onNavigate(key, item);
                        }
                        if (modal && onClose && closeOnNavigate !== false) onClose();
                      }}
                    >
                      {item.icon ? (
                        <span className="ds-sidenav__icon" aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : null}
                      <span className="ds-sidenav__label">{item.label}</span>
                      <ItemBadge item={item} collapsed={collapsed} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  if (!modal) return panel;
  return (
    <div className="ds-sidenav__layer">
      <div className="ds-sidenav__scrim" onClick={onClose} />
      {panel}
    </div>
  );
}
