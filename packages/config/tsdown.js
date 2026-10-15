// @ts-check
import { defineConfig } from 'tsdown';

/**
 * Bundles a library's `src/index.ts` to ESM and CommonJS with type declarations.
 *
 * @param {import('tsdown').UserConfig} [overrides]
 */
export function libraryConfig(overrides = {}) {
  return defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    ...overrides,
  });
}
