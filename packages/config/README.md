# @dnd-domain/config

Shared tooling configuration for every package and app in the monorepo.

| Export                                           | Use                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `@dnd-domain/config/tsconfig/base.json`          | Strict compiler options shared by everything                             |
| `@dnd-domain/config/tsconfig/library.json`       | Libraries built with tsdown (declarations and source maps)               |
| `@dnd-domain/config/tsconfig/react-library.json` | React component libraries (DOM types and the React JSX runtime)          |
| `@dnd-domain/config/tsconfig/nextjs.json`        | Next.js apps                                                             |
| `@dnd-domain/config/tsconfig/nest.json`          | NestJS apps (Node ESM, decorators with emitted metadata)                 |
| `@dnd-domain/config/eslint`                      | `baseConfig`: strict type-checked TypeScript linting                     |
| `@dnd-domain/config/eslint/react`                | `reactConfig`: the base config plus Hooks and React Compiler rules       |
| `@dnd-domain/config/eslint/next`                 | `nextConfig`: the base config plus Next.js and Core Web Vitals rules     |
| `@dnd-domain/config/eslint/nest`                 | `nestConfig`: the base config allowing decorated classes with no members |
| `@dnd-domain/config/prettier`                    | Prettier options, used from the root `package.json`                      |
| `@dnd-domain/config/tsdown`                      | `libraryConfig`: ESM and CommonJS builds with declarations               |
| `@dnd-domain/config/vitest`                      | `libraryTestConfig`: tests in `src`, with V8 coverage                    |
