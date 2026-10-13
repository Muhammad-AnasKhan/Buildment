import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { env } from "../config/env.js";

// One client per process. Prisma 7 needs a driver adapter at runtime; the pool
// lives inside the adapter. `tsx watch` restarts the whole process, so no
// hot-reload singleton dance is needed here.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

export type { Prisma, PrismaClient } from "../generated/prisma/index.js";
