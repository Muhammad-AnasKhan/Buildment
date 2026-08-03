import { describe, expect, it } from "vitest";
import { sanitizeBlockConfig } from "./sanitize";
import { QuizConfigSchema } from "@/blocks/quiz/schema";
import { OpenQuestionConfigSchema } from "@/blocks/open-question/schema";

// Required by docs/09-security.mdx "The sanitizer contract" — must fail if a
// `correct`/`correctOptionIds`/`rubric`/`sampleAnswer`/`hiddenTests` key ever
// reaches a client-bound payload, for any registered block type.
const SECRET_KEYS = ["correct", "correctOptionIds", "rubric", "sampleAnswer", "hiddenTests"];

describe("sanitizeBlockConfig", () => {
  it("strips correctOptionIds from a Quiz config", () => {
    const config = QuizConfigSchema.parse({
      prompt: "Which of these is a vendor concern?",
      options: [
        { id: "a", label: "Inventory" },
        { id: "b", label: "Platform-wide search" },
      ],
      correctOptionIds: ["a"],
      explanation: "Vendors own their catalog.",
    });

    const sanitized = sanitizeBlockConfig(config) as Record<string, unknown>;

    for (const key of SECRET_KEYS) expect(sanitized).not.toHaveProperty(key);
    expect(sanitized.prompt).toBe(config.prompt);
    expect(sanitized.options).toEqual(config.options);
  });

  it("strips sampleAnswer and rubric from an OpenQuestion config", () => {
    const config = OpenQuestionConfigSchema.parse({
      prompt: "Explain the ownership chain.",
      sampleAnswer: "User -> Store -> Product.",
      rubric: "Mentions store and product.",
    });

    const sanitized = sanitizeBlockConfig(config) as Record<string, unknown>;

    for (const key of SECRET_KEYS) expect(sanitized).not.toHaveProperty(key);
    expect(sanitized.prompt).toBe(config.prompt);
  });

  it("strips secrets from nested arrays and objects generically", () => {
    const sanitized = sanitizeBlockConfig({
      nested: { correct: true, deeper: [{ rubric: "x", keep: 1 }] },
      keep: "yes",
    }) as Record<string, unknown>;

    expect(JSON.stringify(sanitized)).not.toMatch(/correct|rubric/);
    expect(sanitized.keep).toBe("yes");
  });
});
