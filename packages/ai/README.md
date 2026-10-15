# @dnd-domain/ai

AI features for the game system.

## Image generation

`ImageGenerator` is the interface: `generate({ prompt })` returns the image's bytes and type.
`OpenAIImageGenerator` implements it with OpenAI's image API (`gpt-image-2` by default), over
plain `fetch`. `imageGeneratorFromEnv(process.env)` returns one when `OPENAI_API_KEY` is set
(`OPENAI_IMAGE_MODEL` and `OPENAI_BASE_URL` are optional), and undefined otherwise. To use another
provider, implement `ImageGenerator`.

`withHouseStyle(subject)` appends `HOUSE_STYLE`, the look every generated image shares: painterly
Victorian gothic horror illustration, no magic, no text.

Built with tsdown to ESM and CommonJS with type declarations, tested with Vitest, and linted and
type-checked with the shared settings in `@dnd-domain/config`. Run `pnpm build`, `pnpm test`,
`pnpm lint` or `pnpm typecheck` here, or the same scripts from the repository root through Turbo.
