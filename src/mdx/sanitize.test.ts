import { describe, expect, it } from "vitest";
import { sanitizeBlockConfig } from "./sanitize";
import { QuizConfigSchema } from "@/blocks/quiz/schema";
import { OpenQuestionConfigSchema } from "@/blocks/open-question/schema";
import { PredictConfigSchema } from "@/blocks/predict/schema";
import { CodeConfigSchema } from "@/blocks/code/schema";

// Required by docs/09-security.mdx "The sanitizer contract" — must fail if a
// `correct`/`correctOptionIds`/`rubric`/`sampleAnswer`/`hiddenTests` key ever
// reaches a client-bound payload, for any registered block type.
const SECRET_KEYS = [
  "correct",
  "correctOptionId",
  "correctOptionIds",
  "rubric",
  "sampleAnswer",
  "hiddenTests",
  "tests",
  "solution",
];

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

  it("strips correctOptionId from a Predict config", () => {
    const config = PredictConfigSchema.parse({
      prompt: "What status code?",
      options: [
        { id: "a", label: "401" },
        { id: "b", label: "403" },
      ],
      correctOptionId: "b",
      explanation: "Wrong role returns 403.",
    });

    const sanitized = sanitizeBlockConfig(config) as Record<string, unknown>;

    for (const key of SECRET_KEYS) expect(sanitized).not.toHaveProperty(key);
    expect(sanitized.prompt).toBe(config.prompt);
    expect(sanitized.options).toEqual(config.options);
  });

  it("strips tests and solution from a Code exercise config", () => {
    const config = CodeConfigSchema.parse({
      mode: "implement",
      prompt: "Build health JSON.",
      starterCode: "module.exports = {}",
      tests: [{ name: "ok", code: "if (true) throw new Error('nope')" }],
      solution: "module.exports = { fn: () => ({ status: 'ok' }) }",
    });

    const sanitized = sanitizeBlockConfig(config) as Record<string, unknown>;

    for (const key of SECRET_KEYS) expect(sanitized).not.toHaveProperty(key);
    expect(sanitized.prompt).toBe(config.prompt);
    expect(sanitized.starterCode).toBe(config.starterCode);
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
