/** Throws if a condition that should always hold does not. */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/** Marks a branch the type system has proven unreachable, such as an exhausted switch. */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
