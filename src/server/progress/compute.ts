import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import {
  chapterProgressStatus,
  isCompletableBlock,
  isCompleteResponseStatus,
} from "./rules";

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
    select: { id: true, type: true, required: true, points: true, archivedAt: true },
  });
  const completable = blocks.filter((block) => isCompletableBlock(block));
  const blocksTotal = completable.length;

  const enrollment = await tx.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    select: { userId: true },
  });

  const existing = await tx.chapterProgress.findUnique({
    where: { enrollmentId_chapterId: { enrollmentId, chapterId } },
    select: { status: true, startedAt: true, completedAt: true },
  });

  let blocksCompleted = 0;
  let score = 0;
  let maxScore = 0;

  for (const block of completable) {
    const latest = await tx.response.findFirst({
      where: { blockId: block.id, userId: enrollment.userId },
      orderBy: { attempt: "desc" },
    });
    if (!latest || !isCompleteResponseStatus(latest.status)) continue;
    blocksCompleted += 1;
    if (latest.score !== null) score += latest.score;
    if (latest.maxScore !== null) maxScore += latest.maxScore;
  }

  const markedComplete = blocksTotal === 0 && existing?.status === "COMPLETED";
  const visited = Boolean(existing?.startedAt) || blocksCompleted > 0;
  const status = chapterProgressStatus({
    completableTotal: blocksTotal,
    completableCompleted: blocksCompleted,
    markedComplete,
    visited,
  });

  const completedAt =
    status === "COMPLETED" ? (existing?.completedAt ?? new Date()) : null;

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
      completedAt,
    },
    update: {
      status,
      blocksCompleted,
      blocksTotal,
      score,
      maxScore,
      completedAt,
    },
  });

  await recomputeEnrollmentRollup(tx, enrollmentId);
}

/** Recompute every chapter for one enrollment (mentor repair / demo tooling). */
export async function repairEnrollmentProgress(
  tx: Prisma.TransactionClient,
  enrollmentId: string,
  courseId: string
) {
  const chapters = await tx.chapter.findMany({
    where: { courseId },
    select: { id: true },
    orderBy: { order: "asc" },
  });
  for (const chapter of chapters) {
    await recomputeChapterProgress(tx, enrollmentId, chapter.id);
  }
}

export async function recomputeEnrollmentRollup(
  tx: Prisma.TransactionClient,
  enrollmentId: string
) {
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
      completedAt: percentComplete >= 100 ? (enrollment.completedAt ?? new Date()) : enrollment.completedAt,
    },
  });
}

export async function ensureChapterStarted(
  tx: Prisma.TransactionClient,
  enrollmentId: string,
  chapterId: string
) {
  const existing = await tx.chapterProgress.findUnique({
    where: { enrollmentId_chapterId: { enrollmentId, chapterId } },
    select: { status: true },
  });
  if (existing?.status === "COMPLETED") return;

  const blocks = await tx.block.findMany({
    where: { chapterId, archivedAt: null },
    select: { type: true, required: true, archivedAt: true },
  });
  const blocksTotal = blocks.filter((block) => isCompletableBlock(block)).length;

  await tx.chapterProgress.upsert({
    where: { enrollmentId_chapterId: { enrollmentId, chapterId } },
    create: {
      enrollmentId,
      chapterId,
      status: "IN_PROGRESS",
      blocksTotal,
      startedAt: new Date(),
    },
    update: {
      ...(existing?.status === "NOT_STARTED" || !existing
        ? { status: "IN_PROGRESS", startedAt: new Date() }
        : {}),
      blocksTotal,
    },
  });
}

/**
 * Maintains the denormalized per-block rollup in the same transaction as a new
 * Response write, so chapter reports can read BlockStats instead of
 * aggregating Response on the read path (AGENTS.md invariant 7).
 */
export async function recordBlockStats(
  tx: Prisma.TransactionClient,
  response: { blockId: string; status: string; isCorrect: boolean | null }
) {
  const delta = {
    attempts: 1,
    correctCount: response.isCorrect === true ? 1 : 0,
    pendingReviews: response.status === "PENDING_REVIEW" ? 1 : 0,
  };
  await tx.blockStats.upsert({
    where: { blockId: response.blockId },
    create: {
      blockId: response.blockId,
      attempts: delta.attempts,
      correctCount: delta.correctCount,
      pendingReviews: delta.pendingReviews,
      lastSubmittedAt: new Date(),
    },
    update: {
      attempts: { increment: delta.attempts },
      correctCount: { increment: delta.correctCount },
      pendingReviews: { increment: delta.pendingReviews },
      lastSubmittedAt: new Date(),
    },
  });
}

/** Called when a PENDING_REVIEW response is reviewed (approved or sent back). */
export async function resolvePendingBlockReview(
  tx: Prisma.TransactionClient,
  blockId: string
) {
  await tx.blockStats.updateMany({
    where: { blockId, pendingReviews: { gt: 0 } },
    data: { pendingReviews: { decrement: 1 } },
  });
}

/**
 * Maintains Enrollment.pendingReviews (read by reports) — +1 when a submission
 * enters PENDING_REVIEW, -1 when a mentor resolves it. Clamped at zero so a
 * double-resolution can never push the rollup negative.
 */
export async function adjustEnrollmentPendingReviews(
  tx: Prisma.TransactionClient,
  enrollmentId: string,
  delta: 1 | -1
) {
  const enrollment = await tx.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    select: { pendingReviews: true },
  });
  await tx.enrollment.update({
    where: { id: enrollmentId },
    data: { pendingReviews: Math.max(0, enrollment.pendingReviews + delta) },
  });
}
