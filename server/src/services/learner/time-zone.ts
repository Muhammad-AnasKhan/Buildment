import type { Prisma, PrismaClient } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import { safeTimeZone } from "../../shared/lib/local-date.js";

/** The learner's profile timezone, or UTC when it is unset or unknown to the runtime. */
export async function learnerTimeZone(userId: string, db: PrismaClient | Prisma.TransactionClient = prisma): Promise<string> {
  const profile = await db.userProfile.findUnique({ where: { userId }, select: { timezone: true } });
  return safeTimeZone(profile?.timezone);
}
