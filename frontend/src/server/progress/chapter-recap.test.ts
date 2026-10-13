import { describe, expect, it } from "vitest";
import { chapterOpenLine, latestChapterResponses } from "./chapter-recap";

describe("chapterOpenLine", () => {
  it("keeps the latest response for each check", () => {
    const latest = latestChapterResponses([
      { blockId: "quiz", status: "AUTO_GRADED", isCorrect: true },
      { blockId: "quiz", status: "AUTO_GRADED", isCorrect: false },
      { blockId: "open", status: "PENDING_REVIEW", isCorrect: null },
    ]);
    expect(chapterOpenLine(latest)).toBe("One response is with your mentor.");
  });

  it("mentions a saved wrong answer when nothing is still with the mentor", () => {
    expect(chapterOpenLine([{ status: "AUTO_GRADED", isCorrect: false }])).toBe(
      "One answer is saved and cannot be retried.",
    );
  });

  it("says every check is finished when the latest answers are settled", () => {
    expect(chapterOpenLine([{ status: "AUTO_GRADED", isCorrect: true }])).toBe("Every check is finished.");
  });
});
