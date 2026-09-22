"use server";

import { z } from "zod";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import {
  LearningLogDataSchema,
  parseLearningLog,
  type LearningLogData,
} from "@/lib/learning-log";

export type LearningLogSaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

const saveInput = z.object({
  chapterId: z.string().min(1),
  answers: z.record(z.string(), z.string()),
});

export async function saveLearningLogAnswers(input: {
  chapterId: string;
  answers: Record<string, string>;
}): Promise<LearningLogSaveResult> {
  const parsed = saveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid learning log payload." };

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) return { ok: false, error: "Chapter not found." };

  const { enrollment } = await requireEnrolledMentee(chapter.courseId);

  const existing = await prisma.chapterProgress.findUnique({
    where: {
      enrollmentId_chapterId: {
        enrollmentId: enrollment.id,
        chapterId: chapter.id,
      },
    },
    select: { learningLog: true, status: true },
  });

  const current = parseLearningLog(existing?.learningLog);
  const savedAt = new Date().toISOString();
  const mergedAnswers: LearningLogData["answers"] = { ...current.answers };

  for (const [questionId, text] of Object.entries(parsed.data.answers)) {
    mergedAnswers[questionId] = { text, updatedAt: savedAt };
  }

  const learningLog = LearningLogDataSchema.parse({
    version: 1,
    answers: mergedAnswers,
    checklist: current.checklist,
  });

  await prisma.chapterProgress.upsert({
    where: {
      enrollmentId_chapterId: {
        enrollmentId: enrollment.id,
        chapterId: chapter.id,
      },
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
      ...(existing?.status === "NOT_STARTED" ? { status: "IN_PROGRESS", startedAt: new Date() } : {}),
    },
  });

  return { ok: true, savedAt };
}
