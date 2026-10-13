import type { GradeResult } from "@/blocks/types";
import { runCodeTests } from "./run-tests";
import type { CodeConfig, CodePayload } from "./schema";

export function gradeCode(config: CodeConfig, payload: CodePayload): GradeResult {
  const source = payload.source.trim();
  if (!source) {
    return {
      score: 0,
      maxScore: 1,
      isCorrect: false,
      status: "AUTO_GRADED",
    };
  }

  const result = runCodeTests(source, config.tests);

  return {
    score: result.passed ? 1 : 0,
    maxScore: 1,
    isCorrect: result.passed,
    status: "AUTO_GRADED",
  };
}

export function gradeCodeDetails(config: CodeConfig, payload: CodePayload) {
  const source = payload.source.trim();
  if (!source) {
    return {
      passed: false,
      failedTestName: "Your code",
      errorMessage: "Write some code before checking.",
    };
  }
  return runCodeTests(source, config.tests);
}
