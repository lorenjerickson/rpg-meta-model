// @ts-check
import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';
import { baseConfig } from './base.js';

/**
 * The base config plus Next.js, Core Web Vitals, React and Hooks rules, for Next.js apps.
 *
 * @param {{ tsconfigRootDir: string }} options the app directory (`import.meta.dirname`)
 */
export function nextConfig(options) {
  return tseslint.config(...nextVitals, ...baseConfig(options));
}
