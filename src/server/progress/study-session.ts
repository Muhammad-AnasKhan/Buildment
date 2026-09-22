import "server-only";
import type { Prisma, StudySessionStatus } from "@/generated/prisma/client";
import { ensureChapterStarted } from "./compute";
import { recordStudyHeartbeat } from "./heartbeat";

export type StudySessionAction = "start" | "pause" | "resume" | "end";

async function touchEnrollment(tx: Prisma.TransactionClient, enrollmentId: string) {
  const enrollment = await tx.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { startedAt: true, status: true },
  });
  const now = new Date();
  await tx.enrollment.update({
    where: { id: enrollmentId },
    data: {
      lastActiveAt: now,
      ...(enrollment?.status === "ASSIGNED" ? { status: "IN_PROGRESS" as const } : {}),
      ...(enrollment && !enrollment.startedAt ? { startedAt: now } : {}),
    },
  });
}

function findOpenSession(
  tx: Prisma.TransactionClient,
  enrollmentId: string,
  chapterId: string
) {
  return tx.studySession.findFirst({
    where: {
      enrollmentId,
      chapterId,
      status: { in: ["RUNNING", "PAUSED"] },
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function controlStudySession(
  tx: Prisma.TransactionClient,
  input: {
    enrollmentId: string;
    userId: string;
    chapterId: string;
    courseId: string;
    action: StudySessionAction;
    deltaSeconds?: number;
  }
) {
  if (input.action === "start") {
    const now = new Date();
    await tx.studySession.updateMany({
      where: {
        enrollmentId: input.enrollmentId,
        status: { in: ["RUNNING", "PAUSED"] },
        chapterId: { not: input.chapterId },
      },
      data: { status: "ENDED", endedAt: now },
    });

    await ensureChapterStarted(tx, input.enrollmentId, input.chapterId);
    await touchEnrollment(tx, input.enrollmentId);

    const open = await findOpenSession(tx, input.enrollmentId, input.chapterId);
    if (open) {
      if (open.status === "RUNNING") return open;
      return tx.studySession.update({
        where: { id: open.id },
        data: { status: "RUNNING" },
      });
    }

    return tx.studySession.create({
      data: {
        enrollmentId: input.enrollmentId,
        chapterId: input.chapterId,
        status: "RUNNING",
      },
    });
  }

  const open = await findOpenSession(tx, input.enrollmentId, input.chapterId);
  if (!open) return null;

  if (
    (input.action === "pause" || input.action === "end") &&
    open.status === "RUNNING" &&
    input.deltaSeconds
  ) {
    await recordStudyHeartbeat(tx, {
      enrollmentId: input.enrollmentId,
      userId: input.userId,
      chapterId: input.chapterId,
      courseId: input.courseId,
      deltaSeconds: input.deltaSeconds,
    });
  }

  if (input.action === "resume") {
    await touchEnrollment(tx, input.enrollmentId);
    return tx.studySession.update({
      where: { id: open.id },
      data: { status: "RUNNING" },
    });
  }

  if (input.action === "pause") {
    return tx.studySession.update({
      where: { id: open.id },
      data: { status: "PAUSED" },
    });
  }

  return tx.studySession.update({
    where: { id: open.id },
    data: { status: "ENDED", endedAt: new Date() },
  });
}

export function clientSessionStatus(
  status: StudySessionStatus | null | undefined
): "idle" | "running" | "paused" {
  if (status === "RUNNING") return "running";
  if (status === "PAUSED") return "paused";
  return "idle";
}
