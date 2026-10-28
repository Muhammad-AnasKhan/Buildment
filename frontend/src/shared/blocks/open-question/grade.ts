// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { GradeResult } from "../types";
import {
  isLlmGradedOpenQuestion,
  validateOpenQuestionPayload,
  type OpenQuestionConfig,
  type OpenQuestionPayload,
} from "./schema";

/**
 * Pure length/URL gates for open questions.
 * Mentor-reviewed answers → PENDING_REVIEW.
 * LLM-graded shorts are only validated here; the respond service calls OpenRouter
 * and sets AUTO_GRADED + isCorrect (see services/ai/short-answer/grade.ts).
 */
export function gradeOpenQuestion(
  config: OpenQuestionConfig,
  payload: OpenQuestionPayload
): GradeResult {
  const invalid = validateOpenQuestionPayload(config, payload);
  const hasUrl = Boolean(payload.url?.trim());
  const wordCount = payload.text.trim().split(/\s+/).filter(Boolean).length;
  const meetsLength =
    wordCount >= config.minWords && (config.maxWords === undefined || wordCount <= config.maxWords);
  const linkOnlyOk =
    config.allowUrl && hasUrl && payload.text.trim().length === 0 && config.minWords === 0;
  const ok = !invalid && (linkOnlyOk || meetsLength);

  if (!ok) {
    return { score: null, maxScore: null, isCorrect: null, status: "DRAFT" };
  }

  // LLM path: structural pass only. respond.ts calls OpenRouter and writes AUTO_GRADED.
  if (isLlmGradedOpenQuestion(config)) {
    return { score: null, maxScore: 1, isCorrect: null, status: ok ? "SUBMITTED" : "DRAFT" };
  }

  return {
    score: null,
    maxScore: null,
    isCorrect: null,
    status: "PENDING_REVIEW",
  };
}
