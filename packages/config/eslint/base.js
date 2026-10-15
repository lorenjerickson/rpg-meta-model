// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** Generated and installed files no package lints. */
export const IGNORES = [
  '**/dist',
  '**/coverage',
  '**/node_modules',
  '**/.next',
  '**/.turbo',
  '**/next-env.d.ts',
];

/**
 * Strict, type-checked TypeScript linting, with formatting left to Prettier.
 *
 * @param {{ tsconfigRootDir: string }} options the package directory (`import.meta.dirname`)
 */
export function baseConfig({ tsconfigRootDir }) {
  return tseslint.config(
    { ignores: IGNORES },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    {
      files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
      ...tseslint.configs.disableTypeChecked,
    },
    prettier,
  );
}
