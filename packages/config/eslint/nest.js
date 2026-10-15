// @ts-check
import tseslint from 'typescript-eslint';
import { baseConfig } from './base.js';

/**
 * The base config adjusted for NestJS, whose modules are decorated classes with no members.
 *
 * @param {{ tsconfigRootDir: string }} options the app directory (`import.meta.dirname`)
 */
export function nestConfig(options) {
  return tseslint.config(...baseConfig(options), {
    rules: {
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  });
}
