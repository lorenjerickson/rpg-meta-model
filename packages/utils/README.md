# @dnd-domain/utils

Small general-purpose helpers shared by the packages and apps.

- **Shapes** (`shape.ts`): `inferShape(samples, { valueSets, readOnly })` infers the shape of a
  kind of entity at runtime from sample values: strings (and the value set they come from, if
  any), numbers, booleans, nested objects, lists, optional and nullable fields, and `any` for
  mixed values. Shapes are plain JSON. `validateShape` checks a value against one, reporting
  problems by path; `defaultValue` makes a starting value; `findValueSets` collects a module's
  exported lists of strings as value sets. The API validates catalog edits with these, and
  `ShapeForm` in `@dnd-domain/ui` draws a form from them.
- **Catalog API types** (`catalogApi.ts`): the catalog API's request and response types,
  shared by the API and the apps.
- **Invariants** (`invariant.ts`): `invariant` and `assertNever`.

Built with tsdown to ESM and CommonJS with type declarations, tested with Vitest, and linted and
type-checked with the shared settings in `@dnd-domain/config`. Run `pnpm build`, `pnpm test`,
`pnpm lint` or `pnpm typecheck` here, or the same scripts from the repository root through Turbo.
