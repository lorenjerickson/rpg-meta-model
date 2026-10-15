# @dnd-domain/db

A local PostgreSQL 18 database for development, run in Docker with Docker Compose. Docker must be
running.

| Command      | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `pnpm start` | Start the database in the background and wait until it's ready |
| `pnpm stop`  | Stop it, keeping its data                                      |
| `pnpm logs`  | Follow the database's logs                                     |
| `pnpm psql`  | Open a `psql` shell in the database                            |
| `pnpm down`  | Remove the container, keeping its data                         |
| `pnpm reset` | Remove the container and delete all its data                   |

From the repository root, `pnpm db:start` and `pnpm db:stop` do the same as `start` and `stop`.
The root `compose.yaml` includes this file, so `pnpm docker:up` runs the same database, with the
same data, alongside the API and web app.

By default the database is `dnd`, with user `dnd` and password `dnd`, on port 5432:

```
postgres://dnd:dnd@localhost:5432/dnd
```

These credentials are for local development only. To change them or the port, copy `.env.example`
to `.env` and edit it; Docker Compose reads `.env` from this folder. Data is kept in the
`dnd-domain_postgres-data` Docker volume until you run `pnpm reset`.
