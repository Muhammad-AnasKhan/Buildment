import { describe, expect, it } from "vitest";
import { findChapterIndex } from "../../../../src/services/chapters/chapter-slug.js";

const chapters = [
  { id: "01M5Q3X9XNWA6YJPWASXBYQE5H", slug: "1-1-set-the-scene-launch-day" },
  { id: "01M5Q3XB0ZHAW4EVRBD60YER9E", slug: "20-4-deep-dive-the-read-path-at-scale" },
];

describe("findChapterIndex", () => {
  it("matches the release slug", () => {
    expect(findChapterIndex(chapters, "20-4-deep-dive-the-read-path-at-scale")).toBe(1);
  });

  it("matches a chapter row's slug that carries the release id", () => {
    expect(findChapterIndex(chapters, "20-4-deep-dive-the-read-path-at-scale--01m5q3xb0zhaw4evrbd60yer9e")).toBe(1);
  });

  it("finds nothing for an unknown slug or id", () => {
    expect(findChapterIndex(chapters, "no-such-chapter")).toBe(-1);
    expect(findChapterIndex(chapters, "20-4-deep-dive-the-read-path-at-scale--01m5zzzzzzzzzzzzzzzzzzzzzz")).toBe(-1);
  });
});
