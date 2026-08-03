import * as Sentry from "@sentry/nextjs";

// No-op without a DSN — this is intentionally the only Sentry code that runs in the
// browser bundle, so builds without a DSN don't ship dead Sentry config.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
