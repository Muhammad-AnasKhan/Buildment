# Buildment web app. Build from the repository root:
#   docker build -f frontend/Dockerfile -t buildment-web .
#   docker run -p 3000:3000 -e API_URL=http://api:4000 buildment-web
# `next build` emits a standalone server (next.config.ts `output: "standalone"`), so the
# runtime image carries only the traced files, not the workspace's node_modules.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
# A stalled registry download should fail fast and retry instead of hanging the build.
ENV npm_config_fetch_retries=5 npm_config_fetch_timeout=60000

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
COPY shared shared
COPY frontend frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @buildment/shared build \
 && cd frontend && node scripts/copy-mermaid.mjs && pnpm build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static frontend/.next/static
COPY --from=build /app/frontend/public frontend/public
EXPOSE 3000
USER node
CMD ["node", "frontend/server.js"]
