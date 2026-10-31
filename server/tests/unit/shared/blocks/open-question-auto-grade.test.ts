import { describe, expect, it } from "vitest";
import { shouldLlmGradeOpenQuestion } from "../../../../src/shared/blocks/open-question/schema.js";

describe("shouldLlmGradeOpenQuestion", () => {
  it("honors block-level llm autoGrade", () => {
    expect(shouldLlmGradeOpenQuestion({ autoGrade: "llm", submissionMode: "text" })).toBe(true);
  });

  it("uses course auto-grade for text answers only", () => {
    expect(shouldLlmGradeOpenQuestion({ autoGrade: "mentor", submissionMode: "text" }, true)).toBe(true);
    expect(shouldLlmGradeOpenQuestion({ autoGrade: "mentor", submissionMode: "url" }, true)).toBe(false);
    expect(shouldLlmGradeOpenQuestion({ autoGrade: "mentor", submissionMode: "text" }, false)).toBe(false);
  });
});
