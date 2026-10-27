import { blockDefinitions } from "../../shared/blocks/definitions.js";
import type { GradeResult } from "../../shared/blocks/types.js";
import { QuizPayloadSchema } from "../../shared/blocks/quiz/schema.js";
import { PredictPayloadSchema } from "../../shared/blocks/predict/schema.js";
import { OpenQuestionPayloadSchema } from "../../shared/blocks/open-question/schema.js";
import { CodePayloadSchema } from "../../shared/blocks/code/schema.js";
import { MustReadPayloadSchema } from "../../shared/blocks/must-read/schema.js";
import { gradeCodeDetails } from "../../shared/blocks/code/grade.js";
import { prisma } from "../../db/prisma.js";
import { BadRequestError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { applyTokens, contentTokenValues } from "../../shared/lib/content-tokens.js";
import { resolveCourseFamily } from "../../shared/lib/course-tracks.js";
import { loadBlockForSubmission } from "./access.js";
import { adjustEnrollmentPendingReviews, lockEnrollmentVariant, recomputeChapterProgress, recordBlockStats } from "../progress/compute.js";
import { notifyMentorPendingReview } from "../notifications/events.js";
import { dispatchNotification } from "../notifications/service.js";
import { assertEnrollmentChapter } from "../courses/releases.js";

export type BlockResponseResult = {
  score: number | null;
  maxScore: number | null;
  isCorrect: boolean | null;
  status: GradeResult["status"];
  explanation?: string;
  solution?: string;
  failedTestName?: string;
  errorMessage?: string;
};

type Graded = GradeResult & Omit<BlockResponseResult, keyof GradeResult>;

/** Parse the payload with the block's own schema and grade it — pure, no I/O. */
function gradeBlock(type: string, config: unknown, payload: unknown): Graded {
  switch (type) {
    case "QUIZ": {
      const cfg = blockDefinitions.QUIZ.schema.parse(config);
      return { ...blockDefinitions.QUIZ.grade(cfg, QuizPayloadSchema.parse(payload)), explanation: cfg.explanation };
    }
    case "PREDICT": {
      const cfg = blockDefinitions.PREDICT.schema.parse(config);
      return { ...blockDefinitions.PREDICT.grade(cfg, PredictPayloadSchema.parse(payload)), explanation: cfg.explanation };
    }
    case "CODE": {
      const cfg = blockDefinitions.CODE.schema.parse(config);
      const parsed = CodePayloadSchema.parse(payload);
      const graded = blockDefinitions.CODE.grade(cfg, parsed);
      const details = gradeCodeDetails(cfg, parsed);
      return {
        ...graded,
        explanation: cfg.explanation,
        failedTestName: details.failedTestName,
        errorMessage: details.errorMessage,
        solution: graded.isCorrect && cfg.solution ? cfg.solution : undefined,
      };
    }
    case "MUST_READ": {
      const cfg = blockDefinitions.MUST_READ.schema.parse(config);
      return blockDefinitions.MUST_READ.grade(cfg, MustReadPayloadSchema.parse(payload));
    }
    default: {
      const cfg = blockDefinitions.OPEN_QUESTION.schema.parse(config);
      return blockDefinitions.OPEN_QUESTION.grade(cfg, OpenQuestionPayloadSchema.parse(payload));
    }
  }
}

/**
 * Grade a learner's answer to one block, persist the attempt, update progress
 * and stats, and notify the mentor when a human review is needed.
 */
export async function submitBlockResponse(input: {
  blockId: string;
  user: SessionUser | undefined;
  payload: Record<string, unknown>;
}): Promise<BlockResponseResult> {
  const { blockId, user, payload } = input;

  const { block, enrollment, learner } = await loadBlockForSubmission(blockId, user, (found) => {
    if (found.type === "QUIZ" && found.chapter.readerMode === "QUIZ") {
      throw new BadRequestError("Submit this quiz from the final quiz step.", "QUIZ_CHAPTER");
    }
    if (found.type === "AI_INTERVIEW") {
      throw new BadRequestError("Finish the interview to complete this block.", "USE_AI_INTERVIEW");
    }
  });

  const graded = gradeBlock(block.type, block.config, payload);

  const previousAttempts = await prisma.response.count({ where: { blockId, userId: learner.id } });

  const response = await prisma.$transaction(async (tx) => {
    await lockEnrollmentVariant(tx, enrollment.id);
    await assertEnrollmentChapter(tx, enrollment.id, block.chapter.id);
    const created = await tx.response.create({
      data: {
        blockId,
        userId: learner.id,
        enrollmentId: enrollment.id,
        attempt: previousAttempts + 1,
        status: graded.status,
        payload: payload as object,
        score: graded.score,
        maxScore: graded.maxScore,
        isCorrect: graded.isCorrect,
      },
    });
    await recordBlockStats(tx, { blockId, status: graded.status, isCorrect: graded.isCorrect });
    if (graded.status === "PENDING_REVIEW") {
      await adjustEnrollmentPendingReviews(tx, enrollment.id, 1);
    }
    await recomputeChapterProgress(tx, enrollment.id, block.chapter.id);
    return created;
  });

  if (response.status === "PENDING_REVIEW") {
    await dispatchNotification(() => notifyMentorPendingReview(response.id));
  }

  return {
    score: response.score,
    maxScore: response.maxScore,
    isCorrect: response.isCorrect,
    status: response.status,
    explanation: graded.explanation && applyTokens(graded.explanation, contentTokenValues(resolveCourseFamily(block.chapter.course.familySlug, block.chapter.course.variantFamily), enrollment.variantSlug)),
    solution: graded.solution,
    failedTestName: graded.failedTestName,
    errorMessage: graded.errorMessage,
  };
}
