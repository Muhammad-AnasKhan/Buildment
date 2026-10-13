import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` never connects, but Prisma 7 loads this file for every command.
// Fall back to a placeholder so installs and image builds work without a database;
// migrate/studio still require the real DATABASE_URL and fail loudly without it.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
