import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { env, isProduction } from "../config/env.js";

// One client per process. Prisma 7 needs a driver adapter at runtime; the pool
// lives inside the adapter. `tsx watch` restarts the whole process, so no
// hot-reload singleton dance is needed here.
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
  // Heroku Postgres requires TLS; its certificates use Heroku's documented
  // node-postgres configuration (encrypted, without certificate verification).
  // Outside production, keep the driver's URL/environment SSL configuration.
  ...(isProduction ? { ssl: { rejectUnauthorized: false } } : {}),
});

export const prisma = new PrismaClient({ adapter });

export type { Prisma, PrismaClient } from "../generated/prisma/index.js";
