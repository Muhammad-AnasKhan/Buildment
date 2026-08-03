import * as Sentry from "@sentry/nextjs";

// No-op without a DSN, so local dev never needs a Sentry account — see .env.example.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  });
}
