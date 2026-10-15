# Builds the API image. Run from the repository root:
#   docker build -f apps/api/Dockerfile .

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

# Reduce the monorepo to the API and the packages it depends on.
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.11.8 prune @dnd-domain/api --docker

# Install with only the manifests first, so dependencies are cached until they change.
FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@dnd-domain/api
# Copy the API, its production dependencies and its built workspace packages to /prod/api.
RUN pnpm --filter=@dnd-domain/api deploy --prod --legacy /prod/api

FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /prod/api .
USER node
EXPOSE 3001
HEALTHCHECK --interval=5s --timeout=3s --retries=10 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1
CMD ["node", "dist/main.js"]
