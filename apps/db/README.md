# @dnd-domain/db

Local data services for development, run in Docker with Docker Compose (Docker must be running):

- **PostgreSQL 18**, for catalog edits and image records.
- **RustFS**, S3-compatible object storage for the content repository (images). It stands in for
  MinIO, which no longer publishes images to Docker Hub; the API talks plain S3, so MinIO, AWS S3,
  R2 or similar work the same elsewhere.

| Command      | Description                                               |
| ------------ | --------------------------------------------------------- |
| `pnpm start` | Start both in the background and wait until they're ready |
| `pnpm stop`  | Stop them, keeping their data                             |
| `pnpm logs`  | Follow the database's logs                                |
| `pnpm psql`  | Open a `psql` shell in the database                       |
| `pnpm down`  | Remove the containers, keeping their data                 |
| `pnpm reset` | Remove the containers and delete all their data           |

From the repository root, `pnpm db:start` and `pnpm db:stop` do the same as `start` and `stop`.
The root `compose.yaml` includes this file, so `pnpm docker:up` runs the same services, with the
same data, alongside the API and web app.

| Service  | Address                                     | Credentials (local only)             |
| -------- | ------------------------------------------- | ------------------------------------ |
| Postgres | `postgres://dnd:dnd@localhost:5432/dnd`     | user `dnd`, password `dnd`           |
| Storage  | S3 at `http://localhost:9000`, console 9001 | `dnd-content` / `dnd-content-secret` |

To change them or the ports (`POSTGRES_PORT`, `S3_PORT`, `S3_CONSOLE_PORT`), copy `.env.example`
to `.env` and edit it; Docker Compose reads `.env` from this folder. Data is kept in the
`dnd-domain_postgres-data` and `dnd-domain_storage-data` Docker volumes until you run
`pnpm reset`.
