import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { ensureChapterStarted } from "./compute";

/** Max seconds credited per heartbeat tick (client sends ~15s). */
export const HEARTBEAT_MAX_DELTA_SECONDS = 20;

/** UTC calendar date for daily rollups. */
export function utcDateOnly(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function clampHeartbeatDelta(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return 0;
  return Math.min(Math.floor(deltaSeconds), HEARTBEAT_MAX_DELTA_SECONDS);
}

export async function recordStudyHeartbeat(
  tx: Prisma.TransactionClient,
  input: {
    enrollmentId: string;
    userId: string;
    chapterId: string;
    courseId: string;
    deltaSeconds: number;
  }
): Promise<{
  creditedSeconds: number;
  sessionActiveSeconds: number | null;
  sessionStatus: "RUNNING" | "PAUSED" | "ENDED" | null;
}> {
  const credited = clampHeartbeatDelta(input.deltaSeconds);
  const session = await tx.studySession.findFirst({
    where: {
      enrollmentId: input.enrollmentId,
      chapterId: input.chapterId,
      status: "RUNNING",
    },
    orderBy: { startedAt: "desc" },
  });
  if (!session || credited === 0) {
    return {
      creditedSeconds: 0,
      sessionActiveSeconds: session?.activeSeconds ?? null,
      sessionStatus: session?.status ?? null,
    };
  }

  const chapter = await tx.chapter.findFirst({
    where: { id: input.chapterId, courseId: input.courseId },
    select: { id: true },
  });
  if (!chapter) {
    throw new Error("Chapter not found in course");
  }

  await ensureChapterStarted(tx, input.enrollmentId, input.chapterId);

  await tx.chapterProgress.update({
    where: {
      enrollmentId_chapterId: {
        enrollmentId: input.enrollmentId,
        chapterId: input.chapterId,
      },
    },
    data: { timeSpentSeconds: { increment: credited } },
  });

  const day = utcDateOnly();
  await tx.dailyActivity.upsert({
    where: {
      enrollmentId_date: { enrollmentId: input.enrollmentId, date: day },
    },
    create: {
      enrollmentId: input.enrollmentId,
      date: day,
      activeSeconds: credited,
    },
    update: { activeSeconds: { increment: credited } },
  });

  const enrollment = await tx.enrollment.findUnique({
    where: { id: input.enrollmentId },
    select: { startedAt: true, status: true },
  });
  const now = new Date();
  await tx.enrollment.update({
    where: { id: input.enrollmentId },
    data: {
      lastActiveAt: now,
      ...(enrollment?.status === "ASSIGNED" ? { status: "IN_PROGRESS" as const } : {}),
      ...(enrollment && !enrollment.startedAt ? { startedAt: now } : {}),
    },
  });

  await tx.studySession.update({
    where: { id: session.id },
    data: { activeSeconds: { increment: credited } },
  });

  void input.userId;
  return {
    creditedSeconds: credited,
    sessionActiveSeconds: session.activeSeconds + credited,
    sessionStatus: "RUNNING" as const,
  };
}
