import { cpSync } from "node:fs";

// Prisma includes runtime files that TypeScript does not emit.
cpSync(
  new URL("../src/generated/", import.meta.url),
  new URL("../dist/generated/", import.meta.url),
  { recursive: true },
);
