import { describe, expect, it } from "vitest";
import { visibleExplanation } from "../../../../src/shared/lib/quiz-feedback.js";

const options = [
  { id: "a", label: "Search improves a little, because the newer model understands more" },
  { id: "b", label: "Nothing changes, since cosine similarity ignores vector length" },
  { id: "c", label: "Scores stop meaning anything: the vectors come from two models" },
];

const perOption = [
  '"Search improves a little, because the newer model understands more" Each model arranges meaning in its own way.',
  '"Nothing changes, since cosine similarity ignores vector length" Cosine ignores length, but the problem is direction.',
  '"Scores stop meaning anything: the vectors come from two models" Right. Re-embed every chunk when you change the model.',
].join("\n");

describe("visibleExplanation", () => {
  it("shows everything once the answer is right", () => {
    expect(visibleExplanation({ explanation: perOption, options, selected: ["c"], isCorrect: true })).toBe(perOption);
  });

  it("shows only the picked option's line after a wrong answer", () => {
    const shown = visibleExplanation({ explanation: perOption, options, selected: ["b"], isCorrect: false });
    expect(shown).toBe('"Nothing changes, since cosine similarity ignores vector length" Cosine ignores length, but the problem is direction.');
    expect(shown).not.toContain("Right.");
  });

  it("shows nothing after a wrong answer when the explanation only describes the right one", () => {
    expect(visibleExplanation({ explanation: "The second answer shows a decision you measured.", options, selected: ["a"], isCorrect: false })).toBeUndefined();
  });

  it("shows everything when the block allows no retry", () => {
    expect(visibleExplanation({ explanation: perOption, options, selected: ["a"], isCorrect: false, allowRetry: false })).toBe(perOption);
  });

  it("matches curly quotes and ignores case and a trailing full stop", () => {
    const curly = "“nothing changes, since cosine similarity ignores vector length.” Not this one.";
    expect(visibleExplanation({ explanation: curly, options, selected: ["b"], isCorrect: false })).toBe(curly);
  });
});
