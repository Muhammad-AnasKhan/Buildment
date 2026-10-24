# Buildment web app — build from the repository root:
#   docker build -f frontend/Dockerfile -t buildment-web .
#   docker run -p 3000:3000 -e API_URL=http://api:4000 buildment-web
# `next build` emits a standalone server (next.config.ts `output: "standalone"`), so the
# runtime image carries only the traced files.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo/frontend
ENV npm_config_fetch_retries=5 npm_config_fetch_timeout=60000

FROM base AS build
ARG API_URL=http://localhost:4000
ENV API_URL=${API_URL}
COPY packages/learning-ui /repo/packages/learning-ui
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml frontend/.npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN node scripts/copy-mermaid.mjs && pnpm build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /repo/frontend/.next/standalone ./
COPY --from=build /repo/frontend/.next/static .next/static
COPY --from=build /repo/frontend/public public
EXPOSE 3000
USER node
CMD ["node", "server.js"]
