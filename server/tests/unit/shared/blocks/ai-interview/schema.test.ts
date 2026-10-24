import { describe, expect, it } from "vitest";
import { blockDefinitions } from "../../../../../src/shared/blocks/definitions.js";
import {
  AI_INTERVIEW_FOCUS_AREAS,
  AiInterviewConfigSchema,
  AiInterviewFeedbackSchema,
  AiInterviewFenceSchema,
} from "../../../../../src/shared/blocks/ai-interview/schema.js";
import { MDX_COMPONENT_NAMES } from "../../../../../src/shared/mdx/component-allowlist.js";
import { BLOCK_TAG_NAMES } from "../../../../../src/shared/mdx/extract.js";
import { BLOCK_TYPES } from "../../../../../src/shared/domain/enums.js";
import { sanitizeBlockConfig } from "../../../../../src/utils/sanitize-block-config.js";
import { COMPLETABLE_BLOCK_TYPES, checkpointSatisfied } from "../../../../../src/services/progress/rules.js";

const base = { title: "T", opening: "Q?" };

describe("AI_INTERVIEW config", () => {
  it("applies the documented defaults", () => {
    expect(AiInterviewConfigSchema.parse(base)).toEqual({
      ...base,
      focus: ["ownership", "impact", "five-whys"],
      context: "none",
      maxTurns: 10,
      whyDepth: 5,
    });
  });

  it("accepts every focus area and removes duplicates", () => {
    expect(AiInterviewConfigSchema.parse({ ...base, focus: [...AI_INTERVIEW_FOCUS_AREAS, "impact"] }).focus).toEqual([...AI_INTERVIEW_FOCUS_AREAS]);
    expect(AI_INTERVIEW_FOCUS_AREAS).toEqual(["ownership", "impact", "five-whys", "resume", "best-technical", "storytelling", "case-study", "strengths-weaknesses"]);
  });

  it.each([
    [{ maxTurns: 21 }],
    [{ maxTurns: 0 }],
    [{ whyDepth: 0 }],
    [{ context: "diary" }],
    [{ focus: [] }],
    [{ focus: ["trivia"] }],
    [{ opening: "  " }],
  ])("rejects %j", (patch) => {
    expect(AiInterviewConfigSchema.safeParse({ ...base, ...patch }).success).toBe(false);
  });

  it("never lets the rubric reach the client", () => {
    const config = AiInterviewConfigSchema.parse({ ...base, rubric: "Hidden marking notes." });
    const safe = sanitizeBlockConfig(config);
    expect(safe).not.toHaveProperty("rubric");
    expect(JSON.stringify(safe)).not.toContain("Hidden marking notes");
  });

  it("makes the fence strict and lets it carry required", () => {
    expect(AiInterviewFenceSchema.safeParse({ ...base, required: true }).success).toBe(true);
    expect(AiInterviewFenceSchema.safeParse({ ...base, typo: 1 }).success).toBe(false);
  });
});

describe("AI_INTERVIEW registration", () => {
  it("is declared once with no automatic score", () => {
    const definition = blockDefinitions.AI_INTERVIEW;
    expect(definition.progress).toBe("completion");
    const config = AiInterviewConfigSchema.parse({ ...base, rubric: "Hidden." });
    const graded = definition.grade(config, {} as never);
    expect(graded).toEqual({ score: null, maxScore: null, isCorrect: null, status: "SUBMITTED" });
    expect(JSON.stringify(definition.report(config))).not.toContain("Hidden");
  });

  it("is wired into the enum, the MDX allowlist and block extraction", () => {
    expect(BLOCK_TYPES).toContain("AI_INTERVIEW");
    expect(MDX_COMPONENT_NAMES).toContain("AiInterview");
    expect(BLOCK_TAG_NAMES.AiInterview).toBe("AI_INTERVIEW");
  });

  it("counts toward a chapter once a response exists, whatever the response says", () => {
    expect(COMPLETABLE_BLOCK_TYPES.has("AI_INTERVIEW")).toBe(true);
    expect(checkpointSatisfied({ type: "AI_INTERVIEW", config: {}, status: "SUBMITTED", isCorrect: null })).toBe(true);
    expect(checkpointSatisfied({ type: "AI_INTERVIEW", config: {}, status: null, isCorrect: null })).toBe(false);
  });
});

describe("interview feedback", () => {
  const good = {
    strengths: ["Clear story."],
    weaknesses: [{ point: "No numbers.", fix: "Add one number." }],
    focusNotes: [{ focus: "impact", note: "Good." }],
    nextSteps: ["a", "b", "c"],
  };

  it("accepts the full shape and keeps exactly three next steps", () => {
    expect(AiInterviewFeedbackSchema.parse({ ...good, nextSteps: ["a", "b", "c", "d"] }).nextSteps).toEqual(["a", "b", "c"]);
  });

  it.each([
    ["fewer than three next steps", { nextSteps: ["a", "b"] }],
    ["a weakness without a fix", { weaknesses: [{ point: "No numbers." }] }],
    ["no strengths", { strengths: [] }],
    ["an unknown focus area", { focusNotes: [{ focus: "trivia", note: "x" }] }],
  ])("rejects %s", (_name, patch) => {
    expect(AiInterviewFeedbackSchema.safeParse({ ...good, ...patch }).success).toBe(false);
  });
});
