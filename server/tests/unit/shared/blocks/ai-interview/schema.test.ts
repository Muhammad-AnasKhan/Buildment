import { describe, expect, it } from "vitest";
import { blockDefinitions } from "../../../../../src/shared/blocks/definitions.js";
import {
  AI_INTERVIEW_FLAG_LABELS,
  AI_INTERVIEW_FLAG_NAMES,
  AI_INTERVIEW_FOCUS_AREAS,
  AiInterviewConfigSchema,
  AiInterviewFeedbackSchema,
  AiInterviewFenceSchema,
  contextFields,
  interviewContext,
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

describe("context modes", () => {
  it("keeps resume, project and none working and adds resume-and-project", () => {
    for (const context of ["resume", "project", "resume-and-project", "none"]) {
      expect(AiInterviewConfigSchema.parse({ ...base, context }).context).toBe(context);
    }
    expect(AiInterviewConfigSchema.safeParse({ ...base, context: "both" }).success).toBe(false);
  });

  it("asks for the boxes each mode needs, each with its own cap", () => {
    expect(contextFields("none")).toEqual([]);
    expect(contextFields("resume").map((box) => [box.field, box.role, box.max])).toEqual([["context", "resume", 6000]]);
    expect(contextFields("project").map((box) => [box.field, box.role, box.max])).toEqual([["context", "work", 6000]]);
    const both = contextFields("resume-and-project");
    expect(both.map((box) => [box.field, box.role, box.label, box.max])).toEqual([
      ["context", "resume", "Your resume", 6000],
      ["contextWork", "work", "Your important work", 4000],
    ]);
    expect(both.every((box) => box.min === 40)).toBe(true);
  });

  it("maps stored text to roles for the prompt", () => {
    const stored = { context: "first", contextWork: "second" };
    expect(interviewContext("resume", stored)).toEqual({ resume: "first", work: null });
    expect(interviewContext("project", stored)).toEqual({ resume: null, work: "first" });
    expect(interviewContext("resume-and-project", stored)).toEqual({ resume: "first", work: "second" });
    expect(interviewContext("none", stored)).toEqual({ resume: null, work: null });
  });

  it("accepts the new mode in the fence", () => {
    expect(AiInterviewFenceSchema.safeParse({ ...base, context: "resume-and-project" }).success).toBe(true);
  });
});

describe("feedback flags", () => {
  const good = {
    strengths: ["Clear story."],
    weaknesses: [{ point: "Say the number's source.", fix: "Add where it came from." }],
    focusNotes: [],
    nextSteps: ["a", "b", "c"],
  };

  it("has exactly the five names and a human label for each", () => {
    expect([...AI_INTERVIEW_FLAG_NAMES]).toEqual(["vague-ownership", "unsupported-number", "pseudo-story", "invented-reason-risk", "jargon-without-explanation"]);
    expect(AI_INTERVIEW_FLAG_LABELS).toEqual({
      "vague-ownership": "Vague ownership",
      "unsupported-number": "Unsupported number",
      "pseudo-story": "Pseudo-story",
      "invented-reason-risk": "Invented reason risk",
      "jargon-without-explanation": "Jargon without explanation",
    });
  });

  it("parses feedback saved before flags existed, with no flags", () => {
    expect(AiInterviewFeedbackSchema.parse(good).flags).toEqual([]);
  });

  it("accepts a flag with the learner's quote and none or several flags", () => {
    const flags = [
      { name: "unsupported-number", quote: "We cut errors by 90 percent." },
      { name: "vague-ownership", quote: "We did a lot of it." },
    ];
    expect(AiInterviewFeedbackSchema.parse({ ...good, flags }).flags).toEqual(flags);
    expect(AiInterviewFeedbackSchema.parse({ ...good, flags: [] }).flags).toEqual([]);
  });

  it.each([
    ["an unknown name", [{ name: "lazy", quote: "x" }]],
    ["a flag without a quote", [{ name: "pseudo-story" }]],
    ["an empty quote", [{ name: "pseudo-story", quote: "  " }]],
    ["a quote over 300 characters", [{ name: "pseudo-story", quote: "x".repeat(301) }]],
  ])("rejects %s", (_name, flags) => {
    expect(AiInterviewFeedbackSchema.safeParse({ ...good, flags }).success).toBe(false);
  });
});
