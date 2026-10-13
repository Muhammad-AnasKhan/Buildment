# Buildment API. Build from the repository root:
#   docker build -f server/Dockerfile -t buildment-api .
# Run migrations as a release step, then start:
#   docker run --rm --env-file server/.env buildment-api pnpm --filter @buildment/server exec prisma migrate deploy
#   docker run -p 4000:4000 --env-file server/.env buildment-api

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
# A stalled registry download should fail fast and retry instead of hanging the build.
ENV npm_config_fetch_retries=5 npm_config_fetch_timeout=60000

# Install once for the whole workspace so shared/ resolves exactly as in development.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
COPY shared shared
COPY server server
COPY content content
# prisma.config.ts resolves DATABASE_URL at load time; `prisma generate` never connects.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm --filter @buildment/shared build \
 && pnpm --filter @buildment/server prisma:generate \
 && pnpm --filter @buildment/server build

# Runtime: compiled output plus production dependencies only.
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=deps /app/shared/package.json shared/
COPY --from=deps /app/server/package.json server/
COPY --from=deps /app/frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter @buildment/server... \
 # --ignore-scripts skipped Prisma's engine download; fetch it now, while still root, so
 # `prisma migrate deploy` works for the unprivileged runtime user.
 && cd server && pnpm rebuild prisma @prisma/engines
COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/server/prisma server/prisma
COPY --from=build /app/server/prisma.config.ts server/prisma.config.ts
COPY --from=build /app/server/scripts server/scripts
# The generated client is needed twice: compiled into dist/ for the API and under src/ for the
# tsx-run scripts and seed. prisma and tsx are runtime dependencies for exactly that reason.
COPY --from=build /app/server/src/generated server/src/generated
COPY --from=build /app/content content
WORKDIR /app/server
EXPOSE 4000
USER node
CMD ["node", "dist/index.js"]
