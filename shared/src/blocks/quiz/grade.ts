import type { GradeResult } from "../types.js";
import type { QuizConfig, QuizPayload } from "./schema.js";

export function gradeQuiz(config: QuizConfig, payload: QuizPayload): GradeResult {
  const selected = new Set(payload.selected);
  const correct = new Set(config.correctOptionIds);
  const isCorrect =
    selected.size === correct.size && [...selected].every((id) => correct.has(id));

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    isCorrect,
    status: "AUTO_GRADED",
  };
}
