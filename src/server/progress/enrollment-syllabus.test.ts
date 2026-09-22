import { describe, expect, it } from "vitest";
import { pickContinueTarget, resolveContinueChapterPath } from "./enrollment-syllabus";
import type { SyllabusChapter } from "@/components/learn/course-syllabus";

function chapter(
  slug: string,
  status: SyllabusChapter["status"],
  locked = false
): Pick<SyllabusChapter, "slug" | "title" | "status" | "locked"> {
  return { slug, title: slug, status, locked };
}

describe("pickContinueTarget", () => {
  it("prefers in-progress unlocked chapter", () => {
    const flat = [
      chapter("a", "COMPLETED"),
      chapter("b", "IN_PROGRESS"),
      chapter("c", "NOT_STARTED"),
    ];
    expect(pickContinueTarget(flat)?.slug).toBe("b");
  });

  it("skips locked in-progress and picks first unlocked not-started", () => {
    const flat = [
      chapter("a", "COMPLETED"),
      chapter("b", "IN_PROGRESS", true),
      chapter("c", "NOT_STARTED"),
      chapter("d", "NOT_STARTED", true),
    ];
    expect(pickContinueTarget(flat)?.slug).toBe("c");
  });

  it("falls back to first unlocked when all complete", () => {
    const flat = [chapter("a", "COMPLETED"), chapter("b", "COMPLETED")];
    expect(pickContinueTarget(flat)?.slug).toBe("a");
  });
});

describe("resolveContinueChapterPath", () => {
  it("builds deep link to continue target", () => {
    const path = resolveContinueChapterPath("fresh-market", [
      chapter("intro", "COMPLETED"),
      chapter("next", "IN_PROGRESS"),
    ]);
    expect(path).toBe("/courses/fresh-market/next");
  });
});
