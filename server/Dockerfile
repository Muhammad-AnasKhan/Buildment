# Build from the repository root so the backend release can read courses/.
#   docker build -f server/Dockerfile -t buildment-api .

FROM node:20-alpine AS base
ENV COREPACK_HOME=/usr/local/share/corepack
RUN corepack enable \
 && corepack prepare pnpm@12.11.2 --activate \
 && pnpm --version \
 && chmod -R a+rX "$COREPACK_HOME"
WORKDIR /app/server
ENV npm_config_fetch_retries=5 npm_config_fetch_timeout=60000

FROM base AS build
COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY server/ ./
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod \
 && pnpm rebuild prisma @prisma/engines
COPY --from=build /app/server/dist dist
# The release publisher runs through tsx and reuses the source services.
COPY --from=build /app/server/src src
COPY server/prisma prisma
COPY server/prisma.config.ts ./
COPY server/scripts scripts
COPY courses /app/courses
COPY agent-ip/scripts/audit-course.mjs /app/agent-ip/scripts/audit-course.mjs
EXPOSE 4000
USER node
CMD ["node", "dist/index.js"]
