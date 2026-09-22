import { describe, expect, it } from "vitest";
import {
  chapterProgressStatus,
  flattenChapterIds,
  isCompletableBlock,
  isCompleteResponseStatus,
  lockedChapterIds,
  previousChapterId,
} from "./rules";
import type { BlockType } from "@/generated/prisma/client";

function block(type: BlockType, required = true, archivedAt: Date | null = null) {
  return { type, required, archivedAt };
}

describe("isCompletableBlock", () => {
  it("counts required quiz / predict / code / open question", () => {
    expect(isCompletableBlock(block("QUIZ"))).toBe(true);
    expect(isCompletableBlock(block("PREDICT"))).toBe(true);
    expect(isCompletableBlock(block("CODE"))).toBe(true);
    expect(isCompletableBlock(block("OPEN_QUESTION"))).toBe(true);
  });

  it("ignores presentational blocks that never get a Response", () => {
    expect(isCompletableBlock(block("STEPS"))).toBe(false);
    expect(isCompletableBlock(block("PROJECT_PREVIEW"))).toBe(false);
    expect(isCompletableBlock(block("LEARNING_OBJECTIVES"))).toBe(false);
    expect(isCompletableBlock(block("CHAPTER_RECAP"))).toBe(false);
  });

  it("ignores optional and archived blocks", () => {
    expect(isCompletableBlock(block("QUIZ", false))).toBe(false);
    expect(isCompletableBlock(block("QUIZ", true, new Date()))).toBe(false);
  });
});

describe("isCompleteResponseStatus", () => {
  it("treats any non-draft submission as complete for progress", () => {
    expect(isCompleteResponseStatus("AUTO_GRADED")).toBe(true);
    expect(isCompleteResponseStatus("PENDING_REVIEW")).toBe(true);
    expect(isCompleteResponseStatus("NEEDS_REVISION")).toBe(true);
    expect(isCompleteResponseStatus("DRAFT")).toBe(false);
  });
});

describe("chapterProgressStatus", () => {
  it("auto-completes when every completable block has a response", () => {
    expect(
      chapterProgressStatus({
        completableTotal: 2,
        completableCompleted: 2,
        markedComplete: false,
        visited: true,
      })
    ).toBe("COMPLETED");
  });

  it("stays in progress while some checkpoints are unanswered", () => {
    expect(
      chapterProgressStatus({
        completableTotal: 3,
        completableCompleted: 1,
        markedComplete: false,
        visited: true,
      })
    ).toBe("IN_PROGRESS");
  });

  it("does not let presentational-only chapters complete without mark-complete", () => {
    expect(
      chapterProgressStatus({
        completableTotal: 0,
        completableCompleted: 0,
        markedComplete: false,
        visited: true,
      })
    ).toBe("IN_PROGRESS");
    expect(
      chapterProgressStatus({
        completableTotal: 0,
        completableCompleted: 0,
        markedComplete: true,
        visited: true,
      })
    ).toBe("COMPLETED");
  });

  it("does not treat a 0-block chapter as complete just because it was opened", () => {
    expect(
      chapterProgressStatus({
        completableTotal: 0,
        completableCompleted: 0,
        markedComplete: false,
        visited: false,
      })
    ).toBe("NOT_STARTED");
  });
});

describe("lockedChapterIds", () => {
  const ids = ["c1", "c2", "c3", "c4"];

  it("locks nothing when sequential is off", () => {
    const progress = new Map<string, "COMPLETED">([["c1", "COMPLETED"]]);
    expect(lockedChapterIds(ids, progress, false).size).toBe(0);
  });

  it("always leaves the first chapter open", () => {
    expect(lockedChapterIds(ids, new Map(), true).has("c1")).toBe(false);
    expect([...lockedChapterIds(ids, new Map(), true)]).toEqual(["c2", "c3", "c4"]);
  });

  it("unlocks chapter 2 only after chapter 1 is complete", () => {
    const progress = new Map([["c1", "COMPLETED" as const]]);
    const locked = lockedChapterIds(ids, progress, true);
    expect(locked.has("c2")).toBe(false);
    expect(locked.has("c3")).toBe(true);
  });

  it("locks the rest of the course at the first incomplete gap", () => {
    const progress = new Map([
      ["c1", "COMPLETED" as const],
      ["c2", "IN_PROGRESS" as const],
    ]);
    expect([...lockedChapterIds(ids, progress, true)]).toEqual(["c3", "c4"]);
  });
});

describe("flattenChapterIds", () => {
  it("orders by module then chapter", () => {
    const ids = flattenChapterIds([
      {
        order: 2,
        chapters: [
          { id: "b2", order: 2 },
          { id: "b1", order: 1 },
        ],
      },
      { order: 1, chapters: [{ id: "a1", order: 1 }] },
    ]);
    expect(ids).toEqual(["a1", "b1", "b2"]);
  });
});

describe("previousChapterId", () => {
  it("returns null for the first chapter", () => {
    expect(previousChapterId(["a", "b"], "a")).toBeNull();
  });

  it("returns the previous id", () => {
    expect(previousChapterId(["a", "b", "c"], "c")).toBe("b");
  });
});
