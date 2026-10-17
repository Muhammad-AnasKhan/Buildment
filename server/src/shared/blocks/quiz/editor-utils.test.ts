import { describe, expect, it } from "vitest";
import { quizDraftFromJsxProperties, quizDraftToJsxProperties, defaultQuizDraft } from "./editor-utils.js";

describe("quiz authoring round trips", () => {
  it("preserves spaces while typing an option and an empty correct selection", () => {
    const draft = { ...defaultQuizDraft(), options: [{ id: "a", label: "Two words " }, { id: "b", label: "Other" }], correctOptionIds: [] };
    const restored = quizDraftFromJsxProperties(quizDraftToJsxProperties({ id: "q", draft }));
    expect(restored.options[0].label).toBe("Two words ");
    expect(restored.correctOptionIds).toEqual([]);
  });
});
