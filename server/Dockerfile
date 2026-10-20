# Buildment API — self-contained; build from this directory:
#   docker build -t buildment-api server/
# Release step, then run:
#   docker run --rm --env-file server/.env buildment-api pnpm exec prisma migrate deploy
#   docker run -p 4000:4000 --env-file server/.env buildment-api
# Heroku's container stack and Render/Fly build this file as-is (release command in Procfile/heroku.yml).

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
# A stalled registry download should fail fast and retry instead of hanging the build.
ENV npm_config_fetch_retries=5 npm_config_fetch_timeout=60000

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# prisma.config.ts falls back to a placeholder URL, so `prisma generate` needs no database.
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod \
 && pnpm rebuild prisma @prisma/engines
COPY --from=build /app/dist dist
# The generated client under src/ serves the tsx-run seed and scripts; dist/ has its own copy.
COPY --from=build /app/src/generated src/generated
# Content scripts and the ZIP worker share the source MDX validators and block schemas.
COPY --from=build /app/src/shared src/shared
COPY prisma prisma
COPY prisma.config.ts ./
COPY scripts scripts
EXPOSE 4000
USER node
CMD ["node", "dist/index.js"]
