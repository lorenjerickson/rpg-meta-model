/** Throws a RangeError unless `value` is an integer in [min, max]. */
export function assertIntegerInRange(value: number, min: number, max: number, label: string): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(
      `${label} must be an integer from ${String(min)} to ${String(max)}, got ${String(value)}`,
    );
  }
}

/** Reads `table[index]`, throwing instead of returning undefined for a missing row. */
export function lookup<T>(table: readonly T[], index: number, label: string): T {
  const value = table[index];
  if (value === undefined) {
    throw new RangeError(`No ${label} entry at index ${String(index)}`);
  }
  return value;
}
