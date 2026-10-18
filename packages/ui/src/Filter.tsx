import { useState } from 'react';
import { Icon } from './Icon';
import { cx, useStableId } from './internal';

/** Lists longer than this get a filter by default. */
export const FILTER_THRESHOLD = 10;

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Whether a text contains every word of a query, ignoring case and accents. */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(text);
  return words.every((word) => haystack.includes(word));
}

/**
 * Filter state for a list: the query, and the items (with their original indexes) that match it.
 */
export function useFilter<T>(items: readonly T[], textOf: (item: T) => string) {
  const [query, setQuery] = useState('');
  const matches = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => matchesQuery(textOf(item), query));
  return { query, setQuery, matches };
}

export interface FilterInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  /** How many items match, and how many there are. */
  shown: number;
  total: number;
  /** What is being filtered, for the placeholder and label ("professions"). */
  noun?: string;
  className?: string;
}

/** A search field for filtering a list, with a count of what matches. */
export function FilterInput({
  query,
  onQueryChange,
  shown,
  total,
  noun = 'items',
  className,
}: FilterInputProps) {
  const id = useStableId();
  return (
    <div className={cx('ds-filter', className)} role="search">
      <span className="ds-filter__icon" aria-hidden="true">
        <Icon name="search" size={16} />
      </span>
      <input
        id={id}
        type="search"
        className="ds-input ds-input--sm ds-filter__input"
        placeholder={`Filter ${noun}…`}
        aria-label={`Filter ${noun}`}
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && query) {
            event.stopPropagation();
            onQueryChange('');
          }
        }}
      />
      <span className="ds-filter__count" aria-live="polite">
        {query ? `${String(shown)} of ${String(total)}` : String(total)}
      </span>
    </div>
  );
}

/** Shown in place of a filtered list when nothing matches. */
export function NoMatches({ query }: { query: string }) {
  return <p className="ds-filter__empty">{`Nothing matches “${query}”.`}</p>;
}
