import { describe, expect, it } from "vitest";
import { validateCoursePublish } from "./publish-rules";

describe("validateCoursePublish", () => {
  it("requires chapters and a published chapter", () => {
    expect(
      validateCoursePublish({
        status: "DRAFT",
        pricingType: "FREE",
        priceCents: 0,
        chapterCount: 0,
        publishedChapterCount: 0,
      })
    ).toEqual([
      "Add at least one chapter before publishing.",
      "Publish at least one chapter before publishing the course.",
    ]);
  });

  it("requires price for paid courses", () => {
    expect(
      validateCoursePublish({
        status: "DRAFT",
        pricingType: "PAID",
        priceCents: 0,
        chapterCount: 2,
        publishedChapterCount: 1,
      })
    ).toContain("Set a price greater than zero for paid courses.");
  });

  it("passes a valid free course", () => {
    expect(
      validateCoursePublish({
        status: "DRAFT",
        pricingType: "FREE",
        priceCents: 0,
        chapterCount: 2,
        publishedChapterCount: 1,
      })
    ).toEqual([]);
  });
});
