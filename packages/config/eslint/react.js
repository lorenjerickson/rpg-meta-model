// @ts-check
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import { baseConfig } from './base.js';

/**
 * The base config plus the Rules of Hooks and React Compiler checks, for React libraries.
 *
 * @param {{ tsconfigRootDir: string }} options the package directory (`import.meta.dirname`)
 */
export function reactConfig(options) {
  return tseslint.config(...baseConfig(options), reactHooks.configs.flat.recommended);
}
