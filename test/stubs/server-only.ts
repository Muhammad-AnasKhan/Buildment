// Vitest doesn't run through Next.js's bundler, which is what makes the real
// `server-only` package a no-op on the server and a build error on the client.
// Alias it to this empty stub for tests — see vitest.config.ts.
export {};
