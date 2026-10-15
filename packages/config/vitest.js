// @ts-check
import { defineConfig } from 'vitest/config';

/** Runs the test files in a library's `src` folder, with V8 coverage of its sources. */
export function libraryTestConfig() {
  return defineConfig({
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}'],
      },
    },
  });
}
