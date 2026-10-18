# @dnd-domain/api

A NestJS 12 HTTP API for the game system's catalogs: it serves the seeded entries from
`@dnd-domain/system`, saves edits to them, adds new entries alongside them, and keeps each
entry's image or icon in the content repository.

## Catalogs

Every catalog in `CATALOGS` (professions, skills, weapons, the bestiary and the rest) is served
and edited the same way. Each entry's **shape** is inferred at runtime from the seeded entries of
its kind (`inferShape` in `@dnd-domain/utils`): field types, optional and nullable fields, and
value sets such as attributes or damage types, found among the system's exported lists. Edits are
validated against that shape, so no catalog needs its own code. A catalog made from several seed
lists (gear, tools and ammunition) has one shape per list.

Seeds are never changed: an edit is stored as a whole entry that overlays its seed, and reverting
deletes it.

| Route                                        | Does                                                    |
| -------------------------------------------- | ------------------------------------------------------- |
| `GET /catalogs`                              | The catalogs, with entry counts                         |
| `GET /catalogs/:catalog`                     | Its entries: name, summary, edited flag, image or icon  |
| `GET /catalogs/:catalog/new?part=`           | A blank entry of one kind, from what its seeds share    |
| `POST /catalogs/:catalog`                    | Adds `{ part, entry }`; its id must be new              |
| `GET /catalogs/:catalog/:id`                 | One entry, with its shape, media and a starting prompt  |
| `PUT /catalogs/:catalog/:id`                 | Saves `{ entry }`; 400 with `errors` by path if invalid |
| `DELETE /catalogs/:catalog/:id`              | Deletes an added entry and its image (not seeds)        |
| `DELETE /catalogs/:catalog/:id/edits`        | Reverts to the seeded entry                             |
| `POST /catalogs/:catalog/:id/image`          | Uploads an image (`file` form field, up to 10 MB)       |
| `POST /catalogs/:catalog/:id/image/generate` | Generates an image from `{ prompt }`                    |
| `DELETE /catalogs/:catalog/:id/image`        | Removes the image                                       |
| `PUT /catalogs/:catalog/:id/icon`            | Chooses `{ icon }`, or `null` for the default           |
| `GET /content/*key`                          | A file from the content repository                      |
| `GET /health`                                | `{ "status": "ok" }`                                    |

The request and response types are shared with the apps as `CatalogInfo`, `EntrySummary`,
`EntryDetail` and `MediaView` in `@dnd-domain/utils`.

## Images and the content repository

Uploaded and generated images are normalised with sharp (upright, at most 1024px, WebP) and get a
256px square thumbnail for lists. Both are stored in S3-compatible object storage under
structured keys, `catalogs/<catalog>/<id>/<uuid>.webp` and `…-thumb.webp`, and replacing an image
deletes the old files. Postgres records which image (and icon) each entry has, with the prompt
and model for generated images.

Generated images use OpenAI (`gpt-image-2` by default) through `@dnd-domain/ai`, which adds a
house style to every prompt so the catalogs read as one illustrated book.

## Configuration

| Variable                                   | Default                 | Use                                          |
| ------------------------------------------ | ----------------------- | -------------------------------------------- |
| `PORT`                                     | 3001                    | Port to listen on                            |
| `WEB_ORIGIN`                               | `http://localhost:3000` | Origin allowed to call the API from browsers |
| `DATABASE_URL`                             | (memory)                | Postgres for edits and media records         |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`    | `dnd-content` bucket    | Object storage for images                    |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | (memory)                | Object storage credentials                   |
| `S3_FORCE_PATH_STYLE`                      | `true`                  | Path-style URLs, for RustFS and MinIO        |
| `OPENAI_API_KEY`                           | (off)                   | Turns on image generation                    |
| `OPENAI_IMAGE_MODEL`, `OPENAI_BASE_URL`    | `gpt-image-2`           | Image model and endpoint                     |

Without a database or storage settings the API keeps edits or images in memory and logs a
warning; they are lost on restart. For local development, copy `.env.example` to `.env` (the API
reads it at start-up) and run `pnpm db:start` from the root for Postgres and storage. The tables
and the bucket are created on start-up if they don't exist.

Nest 12 is ESM-only and relies on decorator metadata for dependency injection, so the app uses
`@dnd-domain/config/tsconfig/nest.json` (Node ESM resolution, so relative imports end in `.js`)
and is compiled with the Nest CLI rather than tsdown. The `Dockerfile` builds a production image
from the repository root (`pnpm docker:up` does this).

| Command          | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `pnpm dev`       | Compile and restart on change (`nest start`)                  |
| `pnpm build`     | Compile to `dist/` with the Nest CLI                          |
| `pnpm start`     | Run the compiled app                                          |
| `pnpm test`      | Run the HTTP tests (in-memory stores, a fake image generator) |
| `pnpm typecheck` | Type-check with `tsc`                                         |
| `pnpm lint`      | Lint with ESLint (`lint:fix` to auto-fix)                     |
