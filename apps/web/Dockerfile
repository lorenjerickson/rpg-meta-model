# Builds the web app image. Run from the repository root:
#   docker build -f apps/web/Dockerfile .

FROM node:24-alpine AS base
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /repo

# Reduce the monorepo to the web app and the packages it depends on.
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.11.8 prune @dnd-domain/web --docker

# Install with only the manifests first, so dependencies are cached until they change.
FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@dnd-domain/web

# Next.js's standalone output holds the server and only the files it needs.
FROM node:24-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=builder --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --retries=10 \
  CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1
CMD ["node", "apps/web/server.js"]
