import { describe, expect, it } from "vitest";
import { QUESTION_MAX, isAskable, remainingLabel } from "@/lib/chapter-question";

describe("isAskable", () => {
  it("needs 3 to 500 characters once trimmed", () => {
    expect(isAskable("hi")).toBe(false);
    expect(isAskable("  a  ")).toBe(false);
    expect(isAskable("why?")).toBe(true);
    expect(isAskable("a".repeat(QUESTION_MAX))).toBe(true);
    expect(isAskable("a".repeat(QUESTION_MAX + 1))).toBe(false);
  });
});

describe("remainingLabel", () => {
  it("shows what is left and says so when nothing is", () => {
    expect(remainingLabel(12, 20)).toBe("12 of 20 questions left today");
    expect(remainingLabel(0, 20)).toBe("No questions left today (20 a day)");
  });
});
