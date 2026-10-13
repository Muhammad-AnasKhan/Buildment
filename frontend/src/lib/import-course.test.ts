import { describe, expect, it } from "vitest";
import { parseLesson } from "../../scripts/import-course";

describe("course importer interaction intent", () => {
  it("does not invent an OpenQuestion for a lesson without an authored interaction", () => {
    const lesson = parseLesson(
      12,
      "12-vendor-dashboard",
      "12.06-product-list-page.md",
      6,
      "product-list-page"
    );

    expect(lesson.blocks).toHaveLength(0);
    expect(lesson.source).not.toContain("<OpenQuestion");
    expect(lesson.source).not.toContain(
      "Before moving on: in 2–3 sentences, what was the main takeaway"
    );
  });

  it("keeps a prose reflection as prose instead of turning it into mentor-reviewed work", () => {
    const lesson = parseLesson(
      5,
      "05-data-model-and-seed",
      "05.02-the-denormalisation-trap.md",
      2,
      "the-denormalisation-trap"
    );

    expect(lesson.source).toContain("## Reflect");
    expect(lesson.source).not.toContain("<OpenQuestion");
  });
});
