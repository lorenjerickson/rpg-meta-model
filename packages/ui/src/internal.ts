import { useId } from 'react';

/** Joins the truthy class names. */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

export type Size = 'sm' | 'md' | 'lg';

/** A valid size, falling back to md. */
export function size(value: string | undefined): Size {
  return value === 'sm' || value === 'lg' ? value : 'md';
}

/** The given id, or a stable generated one. */
export function useStableId(given?: string): string {
  const generated = useId();
  return given ?? `ds-${generated.replace(/:/g, '')}`;
}

/** A choice given as a plain string or as a value with a label. */
export type Option = string | { value: string; label: string; disabled?: boolean };

export interface NormalizedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function normalizeOption(option: Option): NormalizedOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}
