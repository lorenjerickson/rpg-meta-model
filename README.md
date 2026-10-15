# dnd-domain

A Victorian, steampunk and gothic-horror tabletop system built on D&D 5e (SRD 5.2), with the tools
and web app around it. The repository is a [Turborepo](https://turborepo.com) monorepo managed
with [pnpm](https://pnpm.io).

## Layout

| Folder            | Package              | Contents                                                      |
| ----------------- | -------------------- | ------------------------------------------------------------- |
| `apps/web`        | `@dnd-domain/web`    | Next.js 16 app (React 19, React Compiler)                     |
| `apps/api`        | `@dnd-domain/api`    | NestJS 12 API serving the system's catalogs                   |
| `apps/db`         | `@dnd-domain/db`     | Local PostgreSQL 18 for development, run with Docker Compose  |
| `packages/system` | `@dnd-domain/system` | The game system: domain model, rules and catalogs             |
| `packages/ai`     | `@dnd-domain/ai`     | AI features (empty for now)                                   |
| `packages/ui`     | `@dnd-domain/ui`     | Shared React components                                       |
| `packages/utils`  | `@dnd-domain/utils`  | Small general-purpose helpers                                 |
| `packages/config` | `@dnd-domain/config` | Shared TypeScript, ESLint, Prettier, tsdown and Vitest config |

The libraries in `packages` are all set up the same way: built with tsdown to ESM and CommonJS
with type declarations, tested with Vitest, and type-checked and linted with the shared settings
in `@dnd-domain/config`. The web app depends on all of them through `workspace:*`. Tool versions
shared across packages live in the pnpm catalog in `pnpm-workspace.yaml`.

See [packages/system/README.md](packages/system/README.md) for the game system itself.

## Getting started

```bash
pnpm install
```

```bash
pnpm dev
```

`pnpm dev` builds the packages, then runs the web app (port 3000) and the API (port 3001), and
rebuilds packages as they change.

## Scripts

Run from the root, these use Turbo to run the script in every package that has it, building
dependencies first and caching results.

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `pnpm build`         | Build every package and app                          |
| `pnpm dev`           | Run the apps and rebuild packages on change          |
| `pnpm test`          | Run every package's tests                            |
| `pnpm test:coverage` | Run tests with V8 coverage                           |
| `pnpm typecheck`     | Type-check everything                                |
| `pnpm lint`          | Lint everything (`lint:fix` to auto-fix)             |
| `pnpm simulate`      | Play-test combat with the system's simulation        |
| `pnpm db:start`      | Start the local PostgreSQL database (needs Docker)   |
| `pnpm db:stop`       | Stop the database, keeping its data                  |
| `pnpm format`        | Format the repository with Prettier (`format:check`) |

To run a script in one package, filter by name, for example
`pnpm --filter @dnd-domain/system test`.
