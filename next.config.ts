import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Pin the workspace root — there's an unrelated lockfile in a parent directory that
  // would otherwise make Next.js guess wrong.
  turbopack: {
    root: __dirname,
  },
};

// Only wraps the build with Sentry's webpack plugin (sourcemap upload, etc.) when a DSN
// is actually configured, so `pnpm build` works with zero Sentry setup in local dev.
export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      disableLogger: true,
    })
  : nextConfig;
