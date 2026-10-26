import { describe, expect, it } from "vitest";
import { CourseManifestSchema } from "../../scripts/course-source.js";

const manifest = {
  slug: "collaboration",
  title: "Collaboration",
  description: "Work well in a team.",
  projectGoal: "Lead a role-play.",
  difficulty: "Beginner",
  estimatedHours: 10,
  modules: [{ dir: "01-teams", title: "Teams", lessons: [{ file: "01.01-start.md", title: "Start", goal: "Begin" }] }],
};

describe("course.yaml narration", () => {
  it("is optional, so courses without audio are unchanged", () => {
    const parsed = CourseManifestSchema.parse(manifest);
    expect(parsed.narration).toBeUndefined();
  });

  it("fills in the voice and speed and keeps the declared chapters", () => {
    const parsed = CourseManifestSchema.parse({ ...manifest, narration: { chapters: ["01.02-roles-and-expectations"] } });
    expect(parsed.narration).toEqual({
      voice: "af_heart",
      speed: 0.95,
      chapters: ["01.02-roles-and-expectations"],
      pronunciations: {},
    });
  });

  it("accepts pronunciations for words the voice gets wrong", () => {
    const parsed = CourseManifestSchema.parse({
      ...manifest,
      narration: { chapters: ["01.02-roles"], pronunciations: { Kubernetes: "koo-ber-net-eez" } },
    });
    expect(parsed.narration?.pronunciations).toEqual({ Kubernetes: "koo-ber-net-eez" });
  });

  it("rejects an empty chapter list, a .md suffix and a speed that is too fast to follow", () => {
    expect(CourseManifestSchema.safeParse({ ...manifest, narration: { chapters: [] } }).success).toBe(false);
    expect(CourseManifestSchema.safeParse({ ...manifest, narration: { chapters: ["01.02-roles.md"] } }).success).toBe(false);
    expect(CourseManifestSchema.safeParse({ ...manifest, narration: { chapters: ["01.02-roles"], speed: 2 } }).success).toBe(false);
  });
});
