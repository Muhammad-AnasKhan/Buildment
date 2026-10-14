# Buildment web app — self-contained; build from this directory:
#   docker build -t buildment-web frontend/
#   docker run -p 3000:3000 -e API_URL=http://api:4000 buildment-web
# `next build` emits a standalone server (next.config.ts `output: "standalone"`), so the
# runtime image carries only the traced files.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
ENV npm_config_fetch_retries=5 npm_config_fetch_timeout=60000

FROM base AS build
ARG API_URL=http://localhost:4000
ENV API_URL=${API_URL}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN node scripts/copy-mermaid.mjs && pnpm build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static .next/static
COPY --from=build /app/public public
EXPOSE 3000
USER node
CMD ["node", "server.js"]
