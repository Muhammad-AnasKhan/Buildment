import type { LearningLogSaveResult } from "../../shared/api/chapters.js";
import { LearningLogDataSchema, parseLearningLog, type LearningLogData } from "../../shared/lib/learning-log.js";
import { prisma, type Prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";
import { ensureChapterStarted, recomputeChapterProgress } from "./compute.js";
import { unlockedChapterForLearner } from "./chapter-completion.js";

// Reflections live in ChapterProgress.learningLog: { version, answers, checklist }.
// Both writers merge into the existing document so answers and ticks never clobber each other.

async function saveLearningLog(enrollmentId: string, chapterId: string, build: (current: LearningLogData) => LearningLogData) {
  const key = { enrollmentId_chapterId: { enrollmentId, chapterId } };
  const existing = await prisma.chapterProgress.findUnique({ where: key, select: { learningLog: true, status: true } });
  const learningLog = LearningLogDataSchema.parse(build(parseLearningLog(existing?.learningLog))) as Prisma.InputJsonValue;

  await prisma.$transaction(async (tx) => {
    await tx.chapterProgress.upsert({
      where: key,
      create: { enrollmentId, chapterId, status: "IN_PROGRESS", startedAt: new Date(), learningLog },
      update: {
        learningLog,
        ...(existing?.status === "NOT_STARTED" ? { status: "IN_PROGRESS" as const, startedAt: new Date() } : {}),
      },
    });
    await ensureChapterStarted(tx, enrollmentId, chapterId);
    await recomputeChapterProgress(tx, enrollmentId, chapterId);
  });
}

export async function saveChecklistItem(
  user: SessionUser,
  input: { chapterId: string; itemId: string; checked: boolean }
): Promise<void> {
  const { chapter, enrollment } = await unlockedChapterForLearner(input.chapterId, user);
  const savedAt = new Date().toISOString();
  await saveLearningLog(enrollment.id, chapter.id, (current) => ({
    version: 1,
    answers: current.answers,
    checklist: { ...current.checklist, [input.itemId]: { checked: input.checked, updatedAt: savedAt } },
  }));
}

export async function saveLearningLogAnswers(
  user: SessionUser,
  input: { chapterId: string; answers: Record<string, string> }
): Promise<LearningLogSaveResult> {
  const chapter = await prisma.chapter.findUnique({ where: { id: input.chapterId, archivedAt: null }, select: { id: true, courseId: true } });
  if (!chapter) throw new NotFoundError("Chapter not found.");
  const enrollment = await requireBlockSubmissionAccess(chapter.courseId, user);

  const savedAt = new Date().toISOString();
  await saveLearningLog(enrollment.id, chapter.id, (current) => {
    const answers: LearningLogData["answers"] = { ...current.answers };
    for (const [questionId, text] of Object.entries(input.answers)) {
      answers[questionId] = { text, updatedAt: savedAt };
    }
    return { version: 1, answers, checklist: current.checklist };
  });
  return { savedAt };
}
