import { describe, expect, it } from "vitest";
import { PredictConfigSchema } from "../../../src/shared/blocks/predict/schema.js";
import { QuizConfigSchema } from "../../../src/shared/blocks/quiz/schema.js";
import { sanitizeBlockConfig, secretFieldsWithTokens } from "../../../src/utils/sanitize-block-config.js";

describe("sanitizeBlockConfig", () => {
  it("never sends the explanation with a quiz, since it names the right option", () => {
    const config = QuizConfigSchema.parse({
      prompt: "Which status code means the role is wrong?",
      options: [
        { id: "a", label: "401" },
        { id: "b", label: "403" },
      ],
      correctOptionIds: ["b"],
      explanation: "403 is right: the user is signed in but lacks the role.",
    });

    const sanitized = sanitizeBlockConfig(config) as Record<string, unknown>;

    expect(sanitized).not.toHaveProperty("explanation");
    expect(sanitized).not.toHaveProperty("correctOptionIds");
    expect(sanitized.options).toEqual(config.options);
  });

  it("never sends the explanation with a predict", () => {
    const config = PredictConfigSchema.parse({
      prompt: "What happens when the price changes?",
      options: [
        { id: "a", label: "Old carts keep the old price" },
        { id: "b", label: "Every cart updates" },
      ],
      correctOptionId: "a",
      explanation: "The first option is right because carts snapshot the price.",
    });

    const sanitized = sanitizeBlockConfig(config) as Record<string, unknown>;

    expect(sanitized).not.toHaveProperty("explanation");
    expect(sanitized).not.toHaveProperty("correctOptionId");
  });

  it("still allows placeholders in explanations, which are filled in per variant", () => {
    expect(secretFieldsWithTokens({ explanation: "%%PRODUCT_NAME%% keeps the old price." })).toEqual([]);
  });

  it("never sends sample answers or authored short-answer hints to the client", () => {
    const sanitized = sanitizeBlockConfig({
      prompt: "Why one repo?",
      autoGrade: "llm",
      sampleAnswer: "Keep API and UI together.",
      hints: ["Mention one repository."],
      hintAfterAttempts: 3,
    }) as Record<string, unknown>;

    expect(sanitized.autoGrade).toBe("llm");
    expect(sanitized).not.toHaveProperty("sampleAnswer");
    expect(sanitized).not.toHaveProperty("hints");
  });
});
