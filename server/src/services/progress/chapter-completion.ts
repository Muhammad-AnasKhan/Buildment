import { CHAPTER_ERROR_CODES } from "../../shared/api/chapters.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { shouldBypassProgressGating } from "../auth/seed-access.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";
import { awardChapterCompletionXp } from "../gamification/xp.js";
import { lockEnrollmentVariant, recomputeEnrollmentRollup } from "./compute.js";
import { ChapterLockedError, assertChapterUnlocked } from "./gate.js";
import { milestoneReflectionBlocked } from "./reflection.js";
import { calculateQuizAssessment } from "./quiz-assessment.js";
import { checkpointSatisfied, isCompletableBlock } from "./rules.js";
import { assertEnrollmentChapter } from "../courses/releases.js";

/** The learner's active enrollment for a chapter, with the chapter unlocked. */
export async function unlockedChapterForLearner(chapterId: string, user: SessionUser) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, archivedAt: null },
    select: { id: true, courseId: true, slug: true, isMilestone: true, source: true, compiled: true, readerMode: true, quizPassingScore: true, course: { select: { slug: true } } },
  });
  if (!chapter) throw new NotFoundError("Chapter not found.");

  const enrollment = await requireBlockSubmissionAccess(chapter.courseId, user);
  try {
    await assertChapterUnlocked({
      courseId: chapter.courseId,
      enrollmentId: enrollment.id,
      chapterId: chapter.id,
      bypassLocking: shouldBypassProgressGating(user),
    });
  } catch (error) {
    if (error instanceof ChapterLockedError) {
      throw new ForbiddenError("Finish the previous chapter first.", CHAPTER_ERROR_CODES.CHAPTER_LOCKED);
    }
    throw error;
  }
  return { chapter, enrollment };
}

/**
 * Mark a chapter complete once every required checkpoint is satisfied and, on
 * milestone chapters, the checklist and learning log are filled in.
 */
export async function markChapterComplete(chapterId: string, user: SessionUser): Promise<void> {
  const { chapter, enrollment } = await unlockedChapterForLearner(chapterId, user);

  const blocks = await prisma.block.findMany({
    where: { chapterId: chapter.id, archivedAt: null },
    select: { id: true, type: true, required: true, archivedAt: true, config: true },
  });
  const completable = blocks.filter((block) => isCompletableBlock(block));

  const learnerUserId = enrollment.userId;
  if (!learnerUserId) throw new ForbiddenError("Link your account before completing chapters.", "pending_account");

  const latestByBlock = new Map<string, { status: string; isCorrect: boolean | null; score: number | null; maxScore: number | null } | null>();
  for (const block of completable) {
    const latest = await prisma.response.findFirst({
      where: { blockId: block.id, userId: learnerUserId },
      orderBy: { attempt: "desc" },
      select: { status: true, isCorrect: true, score: true, maxScore: true },
    });
    latestByBlock.set(block.id, latest);
  }

  if (chapter.readerMode === "QUIZ") {
    const assessment = calculateQuizAssessment({
      blocks: completable,
      responses: completable.flatMap((block) => {
        const response = latestByBlock.get(block.id);
        return response ? [{ blockId: block.id, status: response.status, score: response.score, maxScore: response.maxScore }] : [];
      }),
      passingScore: chapter.quizPassingScore,
    });
    const scoredIds = new Set(
      completable
        .filter(
          (block) =>
            ["QUIZ", "PREDICT", "CODE"].includes(block.type) ||
            (block.type === "OPEN_QUESTION" && (block.config as { autoGrade?: unknown } | null)?.autoGrade === "llm")
        )
        .map((block) => block.id)
    );
    if (assessment && !assessment.passed) {
      throw new ConflictError(
        "Finish the checkpoints in this chapter first. A scored check counts when the answer is correct, unless retry is turned off.",
        CHAPTER_ERROR_CODES.CHECKPOINTS_INCOMPLETE
      );
    }
    for (const block of completable) {
      if (scoredIds.has(block.id)) continue;
      const latest = latestByBlock.get(block.id);
      const satisfied = checkpointSatisfied({
        type: block.type,
        config: block.config,
        status: latest?.status ?? null,
        isCorrect: latest?.isCorrect ?? null,
      });
      if (!satisfied) {
        throw new ConflictError(
          "Finish the checkpoints in this chapter first. A scored check counts when the answer is correct, unless retry is turned off.",
          CHAPTER_ERROR_CODES.CHECKPOINTS_INCOMPLETE
        );
      }
    }
  } else {
    for (const block of completable) {
      const latest = latestByBlock.get(block.id);
      const satisfied = checkpointSatisfied({
        type: block.type,
        config: block.config,
        status: latest?.status ?? null,
        isCorrect: latest?.isCorrect ?? null,
      });
      if (!satisfied) {
        throw new ConflictError(
          "Finish the checkpoints in this chapter first. A scored check counts when the answer is correct, unless retry is turned off.",
          CHAPTER_ERROR_CODES.CHECKPOINTS_INCOMPLETE
        );
      }
    }
  }

  if (chapter.isMilestone) {
    const progress = await prisma.chapterProgress.findUnique({
      where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id } },
      select: { learningLog: true },
    });
    if (milestoneReflectionBlocked(chapter.compiled || chapter.source, progress?.learningLog)) {
      throw new ConflictError(
        "Check every checklist item and answer the learning log before this gate chapter can be completed.",
        CHAPTER_ERROR_CODES.REFLECTION_INCOMPLETE
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await lockEnrollmentVariant(tx, enrollment.id);
    await assertEnrollmentChapter(tx, enrollment.id, chapter.id);
    const key = { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id } };
    const existing = await tx.chapterProgress.findUnique({ where: key, select: { completedAt: true } });
    await tx.chapterProgress.upsert({
      where: key,
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
    await awardChapterCompletionXp(tx, {
      userId: learnerUserId,
      enrollmentId: enrollment.id,
      courseId: chapter.courseId,
      chapterId: chapter.id,
      readerMode: chapter.readerMode,
      completableBlocks: completable.length,
    });
    await recomputeEnrollmentRollup(tx, enrollment.id);
  });
}
