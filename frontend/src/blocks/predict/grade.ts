import type { GradeResult } from "@/blocks/types";
import type { PredictConfig, PredictPayload } from "./schema";

export function gradePredict(config: PredictConfig, payload: PredictPayload): GradeResult {
  const isCorrect = payload.selected === config.correctOptionId;

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    isCorrect,
    status: "AUTO_GRADED",
  };
}
