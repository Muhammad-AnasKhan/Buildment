import type { GradeResult } from "@/blocks/types";
import {
  validateOpenQuestionPayload,
  type OpenQuestionConfig,
  type OpenQuestionPayload,
} from "./schema";

// OpenQuestion is never auto-graded — see docs/03-blocks-registry.mdx
// "<OpenQuestion>": completion is "submitted", scoring (if any) comes from a
// human reviewer via the review queue (docs/05-review-queue.mdx, not built
// yet). This function only enforces length / URL gates.
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

  return {
    score: null,
    maxScore: null,
    isCorrect: null,
    status: ok ? "PENDING_REVIEW" : "DRAFT",
  };
}
