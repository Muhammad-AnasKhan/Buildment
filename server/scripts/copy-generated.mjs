import { cpSync } from "node:fs";

// Prisma includes runtime files that TypeScript does not emit.
cpSync(
  new URL("../src/generated/", import.meta.url),
  new URL("../dist/generated/", import.meta.url),
  { recursive: true },
);

// EJS templates must also be available when running the compiled API.
cpSync(
  new URL("../src/services/email/templates/", import.meta.url),
  new URL("../dist/services/email/templates/", import.meta.url),
  { recursive: true },
);
