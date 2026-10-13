// Vitest sets NODE_ENV=test before this file runs; src/config/env.ts picks up
// .env from the server directory. Point TEST_DATABASE_URL at a scratch database to
// keep integration tests away from your development data.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
