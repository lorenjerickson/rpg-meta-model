import type { CSSProperties, ReactNode } from 'react';
import { cx, size, type Size } from './internal';

export interface ListItem {
  id?: string;
  /** Main line, semibold grey-200. */
  title: ReactNode;
  /** Secondary text under the title, grey-400; wraps to as many lines as it needs. */
  description?: ReactNode;
  /** Clamp the description to this many lines. */
  lines?: number;
  /** Image URL (or a node such as an icon) shown at the left. */
  image?: string | ReactNode;
  imageAlt?: string;
  /** "circle" (default; people, avatars) or "square" (things, thumbnails). */
  imageShape?: 'circle' | 'square';
  /** Trailing text at the right, grey-400 (a time, a count, a status). */
  meta?: ReactNode;
}

export interface ListColumn<Row> {
  /** Field of the row to show. */
  key: string;
  /** Column header, rendered bold. */
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Right-aligns and uses tabular figures. */
  numeric?: boolean;
  width?: string | number;
  /** Custom cell content. */
  render?: (row: Row) => ReactNode;
}

interface ListBaseProps {
  /** Row density: sm, md (default), lg; also sets image size 32/40/56px. */
  size?: Size;
  /** Set false to remove the grey-600 dividers. */
  dividers?: boolean;
  'aria-label'?: string;
  className?: string;
}

export interface SimpleListProps extends ListBaseProps {
  /** Strings for a simple list; ListItem objects for a rich list. */
  items: readonly (string | number | ListItem)[];
  columns?: undefined;
  /** Makes rows clickable with a charcoal-900 hover. */
  onItemClick?: (item: string | number | ListItem, index: number) => void;
}

export interface TableListProps<Row> extends ListBaseProps {
  /** Row objects, one per row. */
  items: readonly Row[];
  /** Turns the list into columns with bold headers and horizontal dividers only. */
  columns: readonly ListColumn<Row>[];
  /** Makes rows clickable with a charcoal-900 hover. */
  onItemClick?: (row: Row, index: number) => void;
}

export type ListProps<Row> = SimpleListProps | TableListProps<Row>;

function itemKey(item: unknown, index: number): string | number {
  if (item !== null && typeof item === 'object') {
    const record = item as { id?: unknown; key?: unknown };
    if (typeof record.id === 'string' || typeof record.id === 'number') return record.id;
    if (typeof record.key === 'string' || typeof record.key === 'number') return record.key;
  }
  return index;
}

function Media({ item }: { item: ListItem }) {
  if (!item.image) return null;
  const shape = item.imageShape === 'square' ? 'square' : 'circle';
  if (typeof item.image !== 'string') {
    return <span className={`ds-list__media ds-list__media--${shape}`}>{item.image}</span>;
  }
  return (
    <img
      className={`ds-list__media ds-list__media--${shape}`}
      src={item.image}
      alt={item.imageAlt ?? ''}
    />
  );
}

/** A vertical list of items separated by grey dividers: simple, rich, or columnar. */
export function List<Row extends object>(props: ListProps<Row>) {
  const className = cx(
    'ds-list',
    `ds-list--${size(props.size)}`,
    props.dividers === false && 'ds-list--plain',
    props.onItemClick && 'ds-list--interactive',
    props.className,
  );

  if (props.columns?.length) {
    const { columns, items, onItemClick } = props;
    const cell = (column: ListColumn<Row>, row: Row | null, index: number) => {
      const align = column.align ?? (column.numeric ? 'right' : 'left');
      const cellClass = cx(
        'ds-list__cell',
        `ds-list__cell--${align}`,
        column.numeric && 'ds-list__cell--num',
      );
      const style: CSSProperties | undefined =
        column.width === undefined ? undefined : { width: column.width };
      if (row === null) {
        return (
          <th key={column.key || index} className={cellClass} style={style} scope="col">
            {column.header}
          </th>
        );
      }
      const content = column.render
        ? column.render(row)
        : ((row as Record<string, unknown>)[column.key] as ReactNode);
      return (
        <td key={column.key || index} className={cellClass} style={style}>
          {content}
        </td>
      );
    };
    return (
      <table className={cx(className, 'ds-list--table')} aria-label={props['aria-label']}>
        <thead>
          <tr>{columns.map((column, index) => cell(column, null, index))}</tr>
        </thead>
        <tbody>
          {items.map((row, rowIndex) => (
            <tr
              key={itemKey(row, rowIndex)}
              onClick={
                onItemClick
                  ? () => {
                      onItemClick(row, rowIndex);
                    }
                  : undefined
              }
            >
              {columns.map((column, index) => cell(column, row, index))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const { items, onItemClick } = props as SimpleListProps;
  return (
    <ul className={className} aria-label={props['aria-label']}>
      {items.map((item, index) => {
        const onClick = onItemClick
          ? () => {
              onItemClick(item, index);
            }
          : undefined;
        if (typeof item === 'string' || typeof item === 'number') {
          return (
            <li key={index} className="ds-list__item ds-list__item--simple" onClick={onClick}>
              {item}
            </li>
          );
        }
        return (
          <li key={itemKey(item, index)} className="ds-list__item" onClick={onClick}>
            <Media item={item} />
            <div className="ds-list__body">
              <div className="ds-list__title">{item.title}</div>
              {item.description ? (
                <div
                  className="ds-list__desc"
                  style={item.lines ? { WebkitLineClamp: item.lines } : undefined}
                  data-clamp={item.lines ? '' : undefined}
                >
                  {item.description}
                </div>
              ) : null}
            </div>
            {item.meta ? <div className="ds-list__meta">{item.meta}</div> : null}
          </li>
        );
      })}
    </ul>
  );
}
