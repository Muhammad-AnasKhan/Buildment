import { prisma } from "../../db/prisma.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import type { SessionBody } from "../../validations/progress.js";
import { recordStudyHeartbeat } from "./heartbeat.js";
import { clientSessionStatus, controlStudySession } from "./study-session.js";

export type StudyClockState = {
  status: ReturnType<typeof clientSessionStatus> | "idle";
  activeSeconds: number;
  chapterTimeSpentSeconds: number;
};

export type HeartbeatResult = {
  creditedSeconds: number;
  chapterTimeSpentSeconds: number;
  sessionActiveSeconds: number | null;
  sessionStatus: Awaited<ReturnType<typeof recordStudyHeartbeat>>["sessionStatus"];
};

/** The chapter plus the caller's enrollment in its course; 404/403 otherwise. */
async function enrolledChapter(chapterId: string, user: SessionUser) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, archivedAt: null },
    select: { id: true, courseId: true },
  });
  if (!chapter) throw new NotFoundError("Chapter not found");

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: chapter.courseId, userId: user.id } },
  });
  if (!enrollment) throw new ForbiddenError("Not enrolled in this course", "not_enrolled");

  return { chapter, enrollment };
}

async function chapterTimeSpent(enrollmentId: string, chapterId: string): Promise<number> {
  const progress = await prisma.chapterProgress.findUnique({
    where: { enrollmentId_chapterId: { enrollmentId, chapterId } },
    select: { timeSpentSeconds: true },
  });
  return progress?.timeSpentSeconds ?? 0;
}

export async function recordHeartbeat(input: {
  user: SessionUser;
  chapterId: string;
  deltaSeconds?: number;
}): Promise<HeartbeatResult> {
  const { chapter, enrollment } = await enrolledChapter(input.chapterId, input.user);

  const result = await prisma.$transaction((tx) =>
    recordStudyHeartbeat(tx, {
      enrollmentId: enrollment.id,
      userId: input.user.id,
      chapterId: chapter.id,
      courseId: chapter.courseId,
      deltaSeconds: input.deltaSeconds ?? 15,
    })
  );

  return {
    creditedSeconds: result.creditedSeconds,
    chapterTimeSpentSeconds: await chapterTimeSpent(enrollment.id, chapter.id),
    sessionActiveSeconds: result.sessionActiveSeconds,
    sessionStatus: result.sessionStatus,
  };
}

export async function getStudyClock(input: { user: SessionUser; chapterId: string }): Promise<StudyClockState> {
  const { chapter, enrollment } = await enrolledChapter(input.chapterId, input.user);

  const open = await prisma.studySession.findFirst({
    where: { enrollmentId: enrollment.id, chapterId: chapter.id, status: { in: ["RUNNING", "PAUSED"] } },
    orderBy: { startedAt: "desc" },
  });

  return {
    status: clientSessionStatus(open?.status),
    activeSeconds: open?.activeSeconds ?? 0,
    chapterTimeSpentSeconds: await chapterTimeSpent(enrollment.id, chapter.id),
  };
}

export async function controlStudyClock(input: { user: SessionUser } & SessionBody): Promise<StudyClockState> {
  const { chapter, enrollment } = await enrolledChapter(input.chapterId, input.user);

  const session = await prisma.$transaction((tx) =>
    controlStudySession(tx, {
      enrollmentId: enrollment.id,
      userId: input.user.id,
      chapterId: chapter.id,
      courseId: chapter.courseId,
      action: input.action,
      deltaSeconds: input.deltaSeconds,
    })
  );

  const ended = input.action === "end";
  return {
    status: ended ? "idle" : clientSessionStatus(session?.status),
    activeSeconds: ended ? 0 : (session?.activeSeconds ?? 0),
    chapterTimeSpentSeconds: await chapterTimeSpent(enrollment.id, chapter.id),
  };
}
