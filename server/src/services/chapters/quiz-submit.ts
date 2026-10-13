import { blockDefinitions } from "../../shared/blocks/definitions.js";
import { QuizPayloadSchema } from "../../shared/blocks/quiz/schema.js";
import { prisma } from "../../db/prisma.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import type { QuizSubmitBody } from "../../validations/chapters.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";
import { bypassProgressGatingForEmail } from "../auth/seed-access.js";
import { ChapterLockedError, assertChapterUnlocked } from "../progress/gate.js";
import { recomputeChapterProgress, recordBlockStats } from "../progress/compute.js";

type Grade = { blockId: string; score: number | null; maxScore: number | null; isCorrect: boolean | null };

export type QuizSubmitResult = {
  score: number;
  maxScore: number;
  questions: number;
  grades: Array<Grade & { selected: string[] }>;
};

/**
 * Grade every question of a quiz chapter in one go. Questions already answered
 * correctly (or locked by `allowRetry: false`) keep their previous grade.
 */
export async function submitChapterQuiz(input: {
  chapterId: string;
  user: SessionUser | undefined;
  answers: QuizSubmitBody["answers"];
}): Promise<QuizSubmitResult> {
  const { chapterId, user, answers } = input;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true, readerMode: true },
  });
  if (!chapter || chapter.readerMode !== "QUIZ") throw new NotFoundError("Quiz chapter not found");

  const enrollment = await requireBlockSubmissionAccess(chapter.courseId, user);
  const learner = user!;

  try {
    await assertChapterUnlocked({
      courseId: chapter.courseId,
      enrollmentId: enrollment.id,
      chapterId,
      bypassLocking: bypassProgressGatingForEmail(learner.email),
    });
  } catch (error) {
    if (error instanceof ChapterLockedError) {
      throw new ForbiddenError("This chapter is locked. Finish the previous chapter first.", "CHAPTER_LOCKED");
    }
    throw error;
  }

  const quizBlocks = await prisma.block.findMany({
    where: { chapterId, type: "QUIZ", archivedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, config: true },
  });
  if (quizBlocks.length === 0) throw new BadRequestError("This chapter has no quiz questions");

  const submittedIds = answers.map((answer) => answer.blockId);
  const expectedIds = new Set(quizBlocks.map((block) => block.id));
  const coversEveryQuestionOnce =
    new Set(submittedIds).size === submittedIds.length &&
    submittedIds.length === expectedIds.size &&
    submittedIds.every((id) => expectedIds.has(id));
  if (!coversEveryQuestionOnce) throw new BadRequestError("Submit every quiz question exactly once");

  const answersByBlock = new Map(answers.map((answer) => [answer.blockId, answer.selected]));
  const prepared = quizBlocks.map((block) => {
    const config = blockDefinitions.QUIZ.schema.parse(block.config);
    const normalized = [...new Set(answersByBlock.get(block.id) ?? [])];
    const validOptionIds = new Set(config.options.map((option) => option.id));
    if (normalized.some((optionId) => !validOptionIds.has(optionId))) {
      throw new BadRequestError("One or more selected options are invalid");
    }
    return { block, config, normalized };
  });

  const grades = await prisma.$transaction(async (tx) => {
    const results: Grade[] = [];

    for (const { block, config, normalized } of prepared) {
      const previous = await tx.response.findFirst({
        where: { blockId: block.id, userId: learner.id, status: { not: "DRAFT" } },
        orderBy: { attempt: "desc" },
      });
      if (previous && (previous.isCorrect === true || !config.allowRetry)) {
        results.push({ blockId: block.id, score: previous.score, maxScore: previous.maxScore, isCorrect: previous.isCorrect });
        continue;
      }

      const graded = blockDefinitions.QUIZ.grade(config, QuizPayloadSchema.parse({ selected: normalized }));
      const previousAttempts = await tx.response.count({ where: { blockId: block.id, userId: learner.id } });
      await tx.response.create({
        data: {
          blockId: block.id,
          userId: learner.id,
          enrollmentId: enrollment.id,
          attempt: previousAttempts + 1,
          status: graded.status,
          payload: { selected: normalized },
          score: graded.score,
          maxScore: graded.maxScore,
          isCorrect: graded.isCorrect,
        },
      });
      await recordBlockStats(tx, { blockId: block.id, status: graded.status, isCorrect: graded.isCorrect });
      results.push({ blockId: block.id, score: graded.score, maxScore: graded.maxScore, isCorrect: graded.isCorrect });
    }

    await recomputeChapterProgress(tx, enrollment.id, chapterId);
    return results;
  });

  return {
    score: grades.reduce((sum, item) => sum + (item.score ?? 0), 0),
    maxScore: grades.reduce((sum, item) => sum + (item.maxScore ?? 0), 0),
    questions: grades.length,
    grades: grades.map((item) => ({ ...item, selected: answersByBlock.get(item.blockId) ?? [] })),
  };
}
