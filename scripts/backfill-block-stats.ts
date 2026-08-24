import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// One-off backfill for the denormalized report rollups added with the M6/M7
// work (BlockStats + Enrollment.pendingReviews). New writes maintain both via
// src/server/progress/compute.ts — this only repairs rows written before the
// columns existed. Idempotent: wipes and rebuilds from the append-only
// Response history, so it is safe to run repeatedly.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const responses = await prisma.response.findMany({
    orderBy: { submittedAt: "asc" },
    select: {
      blockId: true,
      enrollmentId: true,
      status: true,
      isCorrect: true,
      submittedAt: true,
    },
  });

  const blockStats = new Map<
    string,
    { attempts: number; correctCount: number; pendingReviews: number; lastSubmittedAt: Date }
  >();
  const enrollmentPending = new Map<string, number>();

  for (const response of responses) {
    const stats = blockStats.get(response.blockId) ?? {
      attempts: 0,
      correctCount: 0,
      pendingReviews: 0,
      lastSubmittedAt: response.submittedAt,
    };
    stats.attempts += 1;
    if (response.isCorrect === true) stats.correctCount += 1;
    if (response.status === "PENDING_REVIEW") stats.pendingReviews += 1;
    stats.lastSubmittedAt = response.submittedAt;
    blockStats.set(response.blockId, stats);

    if (response.status === "PENDING_REVIEW") {
      enrollmentPending.set(
        response.enrollmentId,
        (enrollmentPending.get(response.enrollmentId) ?? 0) + 1
      );
    }
  }

  // Response.status is updated in place when a mentor reviews (PENDING_REVIEW
  // -> REVIEWED/NEEDS_REVISION), so the current statuses already reflect which
  // items are still pending — no review-based adjustment needed.

  await prisma.$transaction([
    prisma.blockStats.deleteMany(),
    ...Array.from(blockStats.entries()).map(([blockId, stats]) =>
      prisma.blockStats.create({ data: { blockId, ...stats } })
    ),
    prisma.enrollment.updateMany({ data: { pendingReviews: 0 } }),
    ...Array.from(enrollmentPending.entries()).map(([enrollmentId, pendingReviews]) =>
      prisma.enrollment.update({ where: { id: enrollmentId }, data: { pendingReviews } })
    ),
  ]);

  console.log(
    `Backfilled ${blockStats.size} block stat rows and ${enrollmentPending.size} enrollment pending-review counters from ${responses.length} responses.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
