import { describe, expect, it } from "vitest";
import { CourseManifestSchema } from "../../scripts/course-source.js";

const manifest = {
  slug: "freshmarket-multi-vendor-marketplace-v2",
  title: "FreshMarket",
  description: "A grocery marketplace.",
  projectGoal: "Ship it.",
  difficulty: "Medium",
  estimatedHours: 240,
  modules: [{ dir: "01-introduction", title: "Introduction", lessons: [{ file: "01.01-start.md", title: "Start", goal: "Begin" }] }],
};

describe("course.yaml family", () => {
  it("is optional", () => {
    expect(CourseManifestSchema.safeParse(manifest).success).toBe(true);
  });

  it("accepts a known course family", () => {
    const parsed = CourseManifestSchema.parse({ ...manifest, family: "multi-vendor-marketplace" });
    expect(parsed.family).toBe("multi-vendor-marketplace");
  });

  it("rejects an unknown family so a typo cannot silently drop the variants", () => {
    const result = CourseManifestSchema.safeParse({ ...manifest, family: "multi-vendor-marketplce" });
    expect(result.success).toBe(false);
  });
});
