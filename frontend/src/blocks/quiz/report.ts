import type { QuizConfig } from "./schema";

// Stub projector — see docs/06-reports.mdx. Real reports (M6) read only
// denormalized ChapterProgress/Enrollment rows, never Response directly; this
// function documents what a Quiz block *would* contribute once that's wired up.
export function reportQuiz(_config: QuizConfig) {
  return {
    metric: "correctRate" as const,
  };
}
