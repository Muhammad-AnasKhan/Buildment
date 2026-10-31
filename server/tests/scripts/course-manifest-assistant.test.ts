import { describe, expect, it } from "vitest";
import { CourseManifestSchema } from "../../scripts/course-source.js";
import { readCourseAssistant } from "../../src/services/ai/chapter-qa/assistant.js";

const manifest = {
  slug: "collaboration",
  title: "Collaboration",
  description: "Work well in a team.",
  projectGoal: "Lead a role-play.",
  difficulty: "Beginner",
  estimatedHours: 10,
  modules: [{ dir: "01-teams", title: "Teams", lessons: [{ file: "01.01-start.md", title: "Start", goal: "Begin" }] }],
};

describe("course.yaml assistant", () => {
  it("is optional, so courses without tutor settings are unchanged", () => {
    expect(CourseManifestSchema.parse(manifest).assistant).toBeUndefined();
  });

  it("defaults effort to low and keeps guidance and starters", () => {
    const parsed = CourseManifestSchema.parse({
      ...manifest,
      assistant: { guidance: "  Stay close to the chapter.  ", starters: ["What is the main idea?"] },
    });
    expect(parsed.assistant).toEqual({ effort: "low", guidance: "Stay close to the chapter.", starters: ["What is the main idea?"] });
  });

  it("rejects an unknown effort, too many starters, long guidance and unknown keys", () => {
    const bad = (assistant: unknown) => CourseManifestSchema.safeParse({ ...manifest, assistant }).success;
    expect(bad({ effort: "max" })).toBe(false);
    expect(bad({ starters: ["One?", "Two?", "Three?", "Four?", "Five?"] })).toBe(false);
    expect(bad({ guidance: "a".repeat(1501) })).toBe(false);
    expect(bad({ guidance: "a".repeat(1500) })).toBe(true);
    expect(bad({ starters: ["x"] })).toBe(false);
    expect(bad({ model: "claude-opus-5-5" })).toBe(false);
  });
});

describe("readCourseAssistant", () => {
  it("falls back to low effort for a missing or damaged column", () => {
    expect(readCourseAssistant(null)).toEqual({ effort: "low" });
    expect(readCourseAssistant("high")).toEqual({ effort: "low" });
    expect(readCourseAssistant({ effort: "turbo", guidance: 5 })).toEqual({ effort: "low" });
  });

  it("returns a valid stored block as it is", () => {
    expect(readCourseAssistant({ effort: "high", guidance: "Be exact.", starters: ["Why?!"] })).toEqual({
      effort: "high",
      guidance: "Be exact.",
      starters: ["Why?!"],
    });
  });
});
