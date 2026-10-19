import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// The API runs as a separate service (see docs/phases/backend-split.mdx). Browser
// code keeps calling same-origin paths; Next.js proxies them to API_URL and forwards
// cookies, so the session works without CORS or token handling in the browser.
const apiUrl = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (frontend/Dockerfile); no effect on `next dev`.
  output: "standalone",
  // This folder is the whole app (the API's contract code is copied into src/shared), so
  // Turbopack's root is this directory even inside the larger repository.
  turbopack: {
    root: __dirname,
  },
  // Mermaid is loaded as a static script from /vendor/mermaid.min.js — never bundle it.
  serverExternalPackages: ["mermaid"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // `fallback` runs after app routes, so Auth.js's /api/auth/[...nextauth] still wins.
      fallback: [
        { source: "/api/v1/:path*", destination: `${apiUrl}/api/v1/:path*` },
        { source: "/integrations/v1/:path*", destination: `${apiUrl}/integrations/v1/:path*` },
        { source: "/integrations/v1", destination: `${apiUrl}/integrations/v1` },
      ],
    };
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
