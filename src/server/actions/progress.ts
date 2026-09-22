"use server";

import { z } from "zod";
import { prisma } from "@/server/db";
import { requireEnrolledMentee, requireMentorOfCourse } from "@/server/auth/guards";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { ChapterLockedError, assertChapterUnlocked } from "@/server/progress/gate";
import {
  ensureChapterStarted,
  repairEnrollmentProgress,
  recomputeEnrollmentRollup,
} from "@/server/progress/compute";
import {
  isCompletableBlock,
  isCompleteResponseStatus,
} from "@/server/progress/rules";
import { LearningLogDataSchema, parseLearningLog } from "@/lib/learning-log";

export type ProgressActionResult = { ok: true } | { ok: false; error: string };

const chapterInput = z.object({ chapterId: z.string().min(1) });

export async function markChapterComplete(input: {
  chapterId: string;
}): Promise<ProgressActionResult> {
  const parsed = chapterInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid chapter." };

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) return { ok: false, error: "Chapter not found." };

  const { enrollment, user } = await requireEnrolledMentee(chapter.courseId);
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

  try {
    await assertChapterUnlocked({
      courseId: chapter.courseId,
      enrollmentId: enrollment.id,
      chapterId: chapter.id,
      bypassLocking,
    });
  } catch (error) {
    if (error instanceof ChapterLockedError) {
      return { ok: false, error: "Finish the previous chapter first." };
    }
    throw error;
  }

  const blocks = await prisma.block.findMany({
    where: { chapterId: chapter.id, archivedAt: null },
    select: { id: true, type: true, required: true, archivedAt: true },
  });
  const completable = blocks.filter((block) => isCompletableBlock(block));

  for (const block of completable) {
    const latest = await prisma.response.findFirst({
      where: { blockId: block.id, userId: enrollment.userId },
      orderBy: { attempt: "desc" },
      select: { status: true },
    });
    if (!latest || !isCompleteResponseStatus(latest.status)) {
      return { ok: false, error: "Finish the checkpoints in this chapter first." };
    }
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.chapterProgress.findUnique({
      where: {
        enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id },
      },
      select: { completedAt: true },
    });
    await tx.chapterProgress.upsert({
      where: {
        enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id },
      },
      create: {
        enrollmentId: enrollment.id,
        chapterId: chapter.id,
        status: "COMPLETED",
        blocksTotal: completable.length,
        blocksCompleted: completable.length,
        startedAt: new Date(),
        completedAt: new Date(),
      },
      update: {
        status: "COMPLETED",
        blocksTotal: completable.length,
        blocksCompleted: completable.length,
        completedAt: existing?.completedAt ?? new Date(),
      },
    });
    await recomputeEnrollmentRollup(tx, enrollment.id);
  });

  return { ok: true };
}

const checklistInput = z.object({
  chapterId: z.string().min(1),
  itemId: z.string().min(1).max(200),
  checked: z.boolean(),
});

export async function saveChecklistItem(input: {
  chapterId: string;
  itemId: string;
  checked: boolean;
}): Promise<ProgressActionResult> {
  const parsed = checklistInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid checklist item." };

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) return { ok: false, error: "Chapter not found." };

  const { enrollment, user } = await requireEnrolledMentee(chapter.courseId);
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

  try {
    await assertChapterUnlocked({
      courseId: chapter.courseId,
      enrollmentId: enrollment.id,
      chapterId: chapter.id,
      bypassLocking,
    });
  } catch (error) {
    if (error instanceof ChapterLockedError) {
      return { ok: false, error: "This chapter is locked." };
    }
    throw error;
  }

  const existing = await prisma.chapterProgress.findUnique({
    where: {
      enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id },
    },
    select: { learningLog: true, status: true },
  });
  const current = parseLearningLog(existing?.learningLog);
  const savedAt = new Date().toISOString();
  const learningLog = LearningLogDataSchema.parse({
    version: 1,
    answers: current.answers,
    checklist: {
      ...current.checklist,
      [parsed.data.itemId]: { checked: parsed.data.checked, updatedAt: savedAt },
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.chapterProgress.upsert({
      where: {
        enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id },
      },
      create: {
        enrollmentId: enrollment.id,
        chapterId: chapter.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        learningLog,
      },
      update: {
        learningLog,
        ...(existing?.status === "NOT_STARTED"
          ? { status: "IN_PROGRESS" as const, startedAt: new Date() }
          : {}),
      },
    });
    await ensureChapterStarted(tx, enrollment.id, chapter.id);
  });

  return { ok: true };
}

const enrollmentInput = z.object({ enrollmentId: z.string().min(1) });

/** Mentor-only: rebuild chapter + enrollment rollups from Response rows. */
export async function repairEnrollmentProgressAction(input: {
  enrollmentId: string;
}): Promise<ProgressActionResult> {
  const parsed = enrollmentInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid enrollment." };

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: parsed.data.enrollmentId },
    select: { id: true, courseId: true },
  });
  if (!enrollment) return { ok: false, error: "Enrollment not found." };

  await requireMentorOfCourse(enrollment.courseId);

  await prisma.$transaction(async (tx) => {
    await repairEnrollmentProgress(tx, enrollment.id, enrollment.courseId);
  });

  return { ok: true };
}
