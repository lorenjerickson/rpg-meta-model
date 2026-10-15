# @dnd-domain/api

A NestJS 12 HTTP API serving the game system's data from `@dnd-domain/system`.

| Route                  | Returns                |
| ---------------------- | ---------------------- |
| `GET /health`          | `{ "status": "ok" }`   |
| `GET /professions`     | Every profession       |
| `GET /professions/:id` | One profession, or 404 |
| `GET /monsters`        | The bestiary           |
| `GET /monsters/:id`    | One stat block, or 404 |

It listens on `PORT` (default 3001) and allows cross-origin requests from `WEB_ORIGIN` (default
`http://localhost:3000`, the web app).

Nest 12 is ESM-only and relies on decorator metadata for dependency injection, so the app uses
`@dnd-domain/config/tsconfig/nest.json` (Node ESM resolution, so relative imports end in `.js`)
and is compiled with the Nest CLI rather than tsdown.

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Compile and restart on change (`nest start`) |
| `pnpm build`     | Compile to `dist/` with the Nest CLI         |
| `pnpm start`     | Run the compiled app                         |
| `pnpm test`      | Run the HTTP tests with Vitest and Supertest |
| `pnpm typecheck` | Type-check with `tsc`                        |
| `pnpm lint`      | Lint with ESLint (`lint:fix` to auto-fix)    |
