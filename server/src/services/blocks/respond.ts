import { blockDefinitions } from "../../shared/blocks/definitions.js";
import type { GradeResult } from "../../shared/blocks/types.js";
import { QuizPayloadSchema } from "../../shared/blocks/quiz/schema.js";
import { PredictPayloadSchema } from "../../shared/blocks/predict/schema.js";
import {
  isLlmGradedOpenQuestion,
  OpenQuestionConfigSchema,
  OpenQuestionPayloadSchema,
  type OpenQuestionConfig,
  type OpenQuestionPayload,
  type OpenQuestionStoredPayload,
} from "../../shared/blocks/open-question/schema.js";
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
import { gradeShortAnswerWithLlm } from "../ai/short-answer/grade.js";
import { AiError } from "../ai/openrouter.js";
import { visibleExplanation } from "../../shared/lib/quiz-feedback.js";

export type BlockResponseResult = {
  score: number | null;
  maxScore: number | null;
  isCorrect: boolean | null;
  status: GradeResult["status"];
  explanation?: string;
  hint?: string;
  guidance?: string;
  attempt?: number;
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
      const answer = QuizPayloadSchema.parse(payload);
      const graded = blockDefinitions.QUIZ.grade(cfg, answer);
      return { ...graded, explanation: visibleExplanation({ explanation: cfg.explanation, options: cfg.options, selected: answer.selected, isCorrect: graded.isCorrect, allowRetry: cfg.allowRetry }) };
    }
    case "PREDICT": {
      const cfg = blockDefinitions.PREDICT.schema.parse(config);
      const answer = PredictPayloadSchema.parse(payload);
      const graded = blockDefinitions.PREDICT.grade(cfg, answer);
      return { ...graded, explanation: visibleExplanation({ explanation: cfg.explanation, options: cfg.options, selected: [answer.selected], isCorrect: graded.isCorrect, allowRetry: cfg.allowRetry }) };
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

async function gradeLlmOpenQuestion(input: {
  config: OpenQuestionConfig;
  payload: OpenQuestionPayload;
  userId: string;
  attempt: number;
}): Promise<Graded & { storedPayload: OpenQuestionStoredPayload }> {
  const structural = blockDefinitions.OPEN_QUESTION.grade(input.config, input.payload);
  if (structural.status === "DRAFT") {
    return { ...structural, storedPayload: input.payload };
  }

  try {
    const llm = await gradeShortAnswerWithLlm({
      userId: input.userId,
      config: input.config,
      answer: input.payload.text,
      attempt: input.attempt,
    });
    const storedPayload: OpenQuestionStoredPayload = {
      ...input.payload,
      llmFeedback: { why: llm.why, hint: llm.hint, guidance: llm.guidance, attempt: input.attempt },
    };
    return {
      score: llm.isCorrect ? 1 : 0,
      maxScore: 1,
      isCorrect: llm.isCorrect,
      status: "AUTO_GRADED",
      explanation: llm.why,
      hint: llm.hint ?? undefined,
      guidance: llm.guidance ?? undefined,
      attempt: input.attempt,
      storedPayload,
    };
  } catch (error) {
    if (error instanceof AiError && error.code === "AI_KEY_REQUIRED") {
      throw new AiError(
        "AI_KEY_REQUIRED",
        "Add your OpenRouter key in settings to get instant feedback on this short answer."
      );
    }
    throw error;
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

  const previousAttempts = await prisma.response.count({ where: { blockId, userId: learner.id } });
  const attempt = previousAttempts + 1;

  let graded: Graded;
  let storedPayload: object = payload;

  if (block.type === "OPEN_QUESTION" && isLlmGradedOpenQuestion(block.config)) {
    const config = OpenQuestionConfigSchema.parse(block.config);
    const latest = await prisma.response.findFirst({
      where: { blockId, userId: learner.id, status: { not: "DRAFT" } },
      orderBy: { attempt: "desc" },
      select: { isCorrect: true },
    });
    if (latest?.isCorrect) throw new BadRequestError("This answer has already passed.", "ANSWER_ALREADY_PASSED");
    const gradedAttempts = await prisma.response.count({
      where: { blockId, userId: learner.id, status: { not: "DRAFT" } },
    });
    if (gradedAttempts >= config.maxAttempts) {
      throw new BadRequestError("You have used all three graded attempts. Review the guidance and ask your mentor if you need another attempt.", "ATTEMPT_LIMIT_REACHED");
    }
    const parsedPayload = OpenQuestionPayloadSchema.parse(payload);
    const llmGraded = await gradeLlmOpenQuestion({
      config,
      payload: parsedPayload,
      userId: learner.id,
      attempt: gradedAttempts + 1,
    });
    storedPayload = llmGraded.storedPayload;
    graded = llmGraded;
  } else {
    graded = gradeBlock(block.type, block.config, payload);
  }

  const response = await prisma.$transaction(async (tx) => {
    await lockEnrollmentVariant(tx, enrollment.id);
    await assertEnrollmentChapter(tx, enrollment.id, block.chapter.id);
    const created = await tx.response.create({
      data: {
        blockId,
        userId: learner.id,
        enrollmentId: enrollment.id,
        attempt,
        status: graded.status,
        payload: storedPayload,
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
    attempt: graded.attempt ?? response.attempt,
    explanation:
      graded.explanation &&
      applyTokens(
        graded.explanation,
        contentTokenValues(
          resolveCourseFamily(block.chapter.course.familySlug, block.chapter.course.variantFamily),
          enrollment.variantSlug
        )
      ),
    hint: graded.hint,
    guidance: graded.guidance,
    solution: graded.solution,
    failedTestName: graded.failedTestName,
    errorMessage: graded.errorMessage,
  };
}
