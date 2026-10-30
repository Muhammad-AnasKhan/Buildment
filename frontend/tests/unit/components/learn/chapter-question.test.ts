import { describe, expect, it } from "vitest";
import {
  COUNTER_FROM,
  HISTORY_MAX,
  QUESTION_MAX,
  STREAM_ERROR_MARK,
  friendlyFailure,
  isAskable,
  pushHistory,
  remainingLabel,
  showCounter,
  splitStreamed,
  starterQuestions,
} from "@/lib/chapter-question";

describe("isAskable", () => {
  it("needs 3 to 500 characters once trimmed", () => {
    expect(isAskable("hi")).toBe(false);
    expect(isAskable("  a  ")).toBe(false);
    expect(isAskable("why?")).toBe(true);
    expect(isAskable("a".repeat(QUESTION_MAX))).toBe(true);
    expect(isAskable("a".repeat(QUESTION_MAX + 1))).toBe(false);
  });
});

describe("remainingLabel", () => {
  it("shows what is left and says so when nothing is", () => {
    expect(remainingLabel(12, 20)).toBe("12 of 20 questions left today");
    expect(remainingLabel(0, 20)).toBe("No questions left today (20 a day)");
  });
});

describe("showCounter", () => {
  it("appears only near the limit", () => {
    expect(showCounter(COUNTER_FROM - 1)).toBe(false);
    expect(showCounter(COUNTER_FROM)).toBe(true);
  });
});

describe("starterQuestions", () => {
  it("uses the course's own starters, at most four", () => {
    const own = ["What is the main idea?", "Where would I use this?", "What goes wrong most often?", "Can you test me?", "A fifth one?"];
    expect(starterQuestions(own, [{ text: "Ignored heading" }])).toEqual(own.slice(0, 4));
  });

  it("builds chips from headings when the course sets none", () => {
    const chips = starterQuestions([], [{ text: "Confounders" }, { text: "Why correlation misleads?" }, { text: "Summary" }]);
    expect(chips).toContain("What does Confounders mean?");
    expect(chips).toContain("Why correlation misleads?");
    expect(chips.some((chip) => /summary/i.test(chip))).toBe(false);
    expect(chips.length).toBeGreaterThanOrEqual(2);
    expect(chips.length).toBeLessThanOrEqual(4);
  });

  it("still offers two chips for a chapter with no usable headings", () => {
    const chips = starterQuestions([], []);
    expect(chips).toHaveLength(2);
    expect(chips.every(isAskable)).toBe(true);
  });

  it("skips headings that are too long or empty, and drops a trailing colon", () => {
    const chips = starterQuestions([], [{ text: "x".repeat(80) }, { text: "  " }, { text: "Roles:" }]);
    expect(chips).toContain("What does Roles mean?");
    expect(chips.some((chip) => chip.includes("xxxx"))).toBe(false);
  });
});

describe("pushHistory", () => {
  it("keeps the newest first and only the last three", () => {
    let history = pushHistory([], { question: "q1", answer: "a1" });
    for (const n of [2, 3, 4]) history = pushHistory(history, { question: `q${n}`, answer: `a${n}` });
    expect(history).toHaveLength(HISTORY_MAX);
    expect(history.map((turn) => turn.question)).toEqual(["q4", "q3", "q2"]);
  });
});

describe("splitStreamed", () => {
  it("returns the text as it is when nothing failed", () => {
    expect(splitStreamed("All good.")).toEqual({ answer: "All good.", failure: null });
  });

  it("splits off the message the server appends after a late failure", () => {
    expect(splitStreamed(`Half an answ${STREAM_ERROR_MARK}We could not answer that just now.`)).toEqual({
      answer: "Half an answ",
      failure: "We could not answer that just now.",
    });
  });
});

describe("friendlyFailure", () => {
  it("passes on the API's own wording for limits and locks", () => {
    expect(friendlyFailure({ status: 429, code: "TOO_MANY_REQUESTS", message: "You are asking quickly. Wait a minute and try again." })).toBe(
      "You are asking quickly. Wait a minute and try again.",
    );
    expect(friendlyFailure({ status: 403, code: "CHAPTER_LOCKED", message: "This chapter is locked. Finish the previous chapter first." })).toBe(
      "This chapter is locked. Finish the previous chapter first.",
    );
  });

  it("explains a pause and an unavailable feature in its own words", () => {
    expect(friendlyFailure({ status: 503, code: "QA_PAUSED", message: "Questions are paused for today." })).toMatch(/paused for today/);
    expect(friendlyFailure({ status: 503, code: "QA_UNAVAILABLE", message: "x" })).toMatch(/not available/);
  });

  it("never shows a raw or unexpected error", () => {
    for (const raw of [new TypeError("Failed to fetch"), new Error("ECONNRESET at 10.0.0.4"), { status: 500, code: "X", message: "stack trace here" }, null, "boom"]) {
      const text = friendlyFailure(raw);
      expect(text).toBe("We could not answer that just now. Please try again in a moment.");
    }
  });
});
