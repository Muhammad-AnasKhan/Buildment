import type { GradeResult } from "@/blocks/types";
import type { OpenQuestionConfig, OpenQuestionPayload } from "./schema";

// OpenQuestion is never auto-graded — see docs/03-blocks-registry.mdx
// "<OpenQuestion>": completion is "submitted", scoring (if any) comes from a
// human reviewer via the review queue (docs/05-review-queue.mdx, not built
// yet). This function only enforces the minWords/maxWords gate.
export function gradeOpenQuestion(
  config: OpenQuestionConfig,
  payload: OpenQuestionPayload
): GradeResult {
  const wordCount = payload.text.trim().split(/\s+/).filter(Boolean).length;
  const meetsLength =
    wordCount >= config.minWords && (config.maxWords === undefined || wordCount <= config.maxWords);

  return {
    score: null,
    maxScore: null,
    isCorrect: null,
    status: meetsLength ? "PENDING_REVIEW" : "DRAFT",
  };
}
