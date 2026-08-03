import "server-only";
import type { Prisma } from "@/generated/prisma/client";

// Recomputes denormalized rollups after a new Response is written — see
// docs/04-progress-and-gating.mdx and the append-only-Response invariant in
// .cursor/rules/project-invariants.mdc: never mutate a Response to "fix"
// progress, always write a new attempt and recompute from scratch here, in
// the same transaction as the write.
//
// This is intentionally the *only* place that aggregates over Response rows —
// reports read ChapterProgress/Enrollment afterwards, never Response directly
// (docs/06-reports.mdx).
export async function recomputeChapterProgress(
  tx: Prisma.TransactionClient,
  enrollmentId: string,
  chapterId: string
) {
  const blocks = await tx.block.findMany({
    where: { chapterId, archivedAt: null },
    select: { id: true, points: true },
  });
  const blocksTotal = blocks.length;

  const enrollment = await tx.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    select: { userId: true },
  });

  let blocksCompleted = 0;
  let score = 0;
  let maxScore = 0;

  for (const block of blocks) {
    const latest = await tx.response.findFirst({
      where: { blockId: block.id, userId: enrollment.userId },
      orderBy: { attempt: "desc" },
    });
    if (!latest) continue;
    blocksCompleted += 1;
    if (latest.score !== null) score += latest.score;
    if (latest.maxScore !== null) maxScore += latest.maxScore;
  }

  const status =
    blocksTotal > 0 && blocksCompleted >= blocksTotal
      ? "COMPLETED"
      : blocksCompleted > 0
        ? "IN_PROGRESS"
        : "NOT_STARTED";

  await tx.chapterProgress.upsert({
    where: { enrollmentId_chapterId: { enrollmentId, chapterId } },
    create: {
      enrollmentId,
      chapterId,
      status,
      blocksCompleted,
      blocksTotal,
      score,
      maxScore,
      startedAt: new Date(),
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status,
      blocksCompleted,
      blocksTotal,
      score,
      maxScore,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  await recomputeEnrollmentRollup(tx, enrollmentId);
}

async function recomputeEnrollmentRollup(tx: Prisma.TransactionClient, enrollmentId: string) {
  const chapterProgress = await tx.chapterProgress.findMany({ where: { enrollmentId } });
  const chaptersCompleted = chapterProgress.filter((p) => p.status === "COMPLETED").length;
  const totalScore = chapterProgress.reduce((sum, p) => sum + p.score, 0);
  const maxScore = chapterProgress.reduce((sum, p) => sum + p.maxScore, 0);

  const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } });
  const totalChapters = await tx.chapter.count({ where: { courseId: enrollment.courseId } });
  const percentComplete =
    totalChapters > 0 ? Math.round((chaptersCompleted / totalChapters) * 100) : 0;

  await tx.enrollment.update({
    where: { id: enrollmentId },
    data: {
      chaptersCompleted,
      totalScore,
      maxScore,
      percentComplete,
      lastActiveAt: new Date(),
      startedAt: enrollment.startedAt ?? new Date(),
      status: percentComplete >= 100 ? "COMPLETED" : "IN_PROGRESS",
      completedAt: percentComplete >= 100 ? new Date() : enrollment.completedAt,
    },
  });
}
