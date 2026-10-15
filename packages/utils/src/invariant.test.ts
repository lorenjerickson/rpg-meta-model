import { describe, expect, it } from 'vitest';
import { assertNever, invariant } from './invariant';

describe('invariant', () => {
  it('throws only when the condition fails', () => {
    expect(() => {
      invariant(true, 'never thrown');
    }).not.toThrow();
    expect(() => {
      invariant(0, 'zero is falsy');
    }).toThrow('zero is falsy');
  });

  it('reports unreachable values', () => {
    expect(() => assertNever('surprise' as never)).toThrow('Unexpected value: surprise');
  });
});
