import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx, useStableId } from './internal';

export interface ToolbarItem {
  key?: string;
  /** A 16px icon node drawn with currentColor. */
  icon?: ReactNode;
  /** Short visible text (one word). Omit for an icon-only button. */
  label?: string;
  /** Tooltip text; also the accessible name of an icon-only button. */
  tooltip?: string;
  /** Keyboard shortcut shown in the tooltip, e.g. "⌘B". */
  shortcut?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Make it a toggle (aria-pressed) and set its state with `active`. */
  toggle?: boolean;
  active?: boolean;
  disabled?: boolean;
  /** Accessible name when there is no tooltip or label. */
  ariaLabel?: string;
  /** Render a thin divider instead of a button. */
  separator?: boolean;
  /** Render flexible space that pushes later items to the far end. */
  spacer?: boolean;
}

type Edge = 'top' | 'bottom' | 'left' | 'right';

export interface ToolbarProps {
  items: readonly ToolbarItem[];
  /**
   * Panel edge it is docked to. Sets the orientation (left/right: vertical) and opens tooltips
   * toward the panel. Default "top".
   */
  dock?: Edge;
  /** Override the orientation implied by dock. */
  orientation?: 'horizontal' | 'vertical';
  /** Override where tooltips open. */
  tooltipPlacement?: Edge;
  /** "sm": 24px buttons, 14px icons. Default 28px buttons, 16px icons. */
  size?: 'sm' | 'md';
  /** Transparent background, for toolbars inside an already-colored area. */
  plain?: boolean;
  'aria-label': string;
  className?: string;
}

const DOCK_TIP: Record<Edge, Edge> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/** Closes the open tooltip, so only one shows at a time. */
let activeTip: (() => void) | null = null;

function ToolButton({
  item,
  place,
  tabIndex,
}: {
  item: ToolbarItem;
  place: Edge;
  tabIndex: number;
}) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tipId = `${useStableId()}-tip`;
  const tip = item.tooltip ?? (item.icon && !item.label ? item.ariaLabel : undefined);
  const iconOnly = Boolean(item.icon) && !item.label;

  function off() {
    clearTimeout(timer.current);
    setShow(false);
    if (activeTip === off) activeTip = null;
  }
  function on(delay: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (activeTip && activeTip !== off) activeTip();
      activeTip = off;
      setShow(true);
    }, delay);
  }

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  return (
    <span className="ds-tool">
      <button
        type="button"
        className={cx('ds-tool__btn', iconOnly && 'ds-tool__btn--icon', item.active && 'is-active')}
        disabled={item.disabled}
        tabIndex={tabIndex}
        data-tool=""
        aria-label={iconOnly ? (item.ariaLabel ?? item.tooltip) : undefined}
        aria-pressed={item.toggle ? Boolean(item.active) : undefined}
        aria-describedby={tip && show && !iconOnly ? tipId : undefined}
        onClick={item.onClick}
        onMouseEnter={() => {
          if (tip) on(400);
        }}
        onMouseLeave={off}
        onFocus={() => {
          if (tip) on(0);
        }}
        onBlur={off}
        onKeyDown={(event) => {
          if (event.key === 'Escape') off();
        }}
      >
        {item.icon ? (
          <span className="ds-tool__icon" aria-hidden="true">
            {item.icon}
          </span>
        ) : null}
        {item.label ? <span className="ds-tool__label">{item.label}</span> : null}
      </button>
      {tip && show ? (
        <span id={tipId} role="tooltip" className={`ds-tooltip ds-tooltip--${place}`}>
          {tip}
          {item.shortcut ? <kbd className="ds-tooltip__kbd">{item.shortcut}</kbd> : null}
        </span>
      ) : null}
    </span>
  );
}

/** A compact, dockable strip of icon or short-label buttons with tooltips. */
export function Toolbar({
  items,
  dock = 'top',
  orientation,
  tooltipPlacement,
  size,
  plain,
  className,
  ...props
}: ToolbarProps) {
  const vertical = orientation ? orientation === 'vertical' : dock === 'left' || dock === 'right';
  const place = tooltipPlacement ?? DOCK_TIP[dock];
  const ref = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    const previous = vertical ? 'ArrowUp' : 'ArrowLeft';
    if (![next, previous, 'Home', 'End'].includes(event.key) || !ref.current) return;
    const enabled = Array.from(
      ref.current.querySelectorAll<HTMLButtonElement>('[data-tool]:not(:disabled)'),
    );
    if (!enabled.length) return;
    const index = enabled.indexOf(document.activeElement as HTMLButtonElement);
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : (index + (event.key === next ? 1 : -1) + enabled.length) % enabled.length;
    event.preventDefault();
    const element = enabled[target];
    if (!element) return;
    element.focus();
    const all = Array.from(ref.current.querySelectorAll<HTMLButtonElement>('[data-tool]'));
    setFocusIndex(all.indexOf(element));
  }

  // Each button's position among the buttons, skipping separators and spacers.
  const isButton = (item: ToolbarItem) => !item.separator && !item.spacer;
  const buttonPositions = items.map(
    (_, index) => items.slice(0, index + 1).filter(isButton).length - 1,
  );
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={props['aria-label']}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cx(
        'ds-toolbar',
        `ds-toolbar--${vertical ? 'v' : 'h'}`,
        `ds-toolbar--dock-${dock}`,
        size === 'sm' && 'ds-toolbar--sm',
        plain && 'ds-toolbar--plain',
        className,
      )}
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <span
              key={`sep${String(index)}`}
              className="ds-toolbar__sep"
              role="separator"
              aria-orientation={vertical ? 'horizontal' : 'vertical'}
            />
          );
        }
        if (item.spacer) {
          return <span key={`sp${String(index)}`} className="ds-toolbar__spacer" />;
        }
        return (
          <ToolButton
            key={item.key ?? item.label ?? item.tooltip ?? index}
            item={item}
            place={place}
            tabIndex={buttonPositions[index] === focusIndex ? 0 : -1}
          />
        );
      })}
    </div>
  );
}
