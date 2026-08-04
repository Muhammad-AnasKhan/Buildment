import { describe, expect, it } from "vitest";
import { getOpenQuestionGroupPosition } from "./group-position";

describe("getOpenQuestionGroupPosition", () => {
  it("returns single for one open question", () => {
    const blocks = [
      { id: "a", type: "QUIZ" },
      { id: "b", type: "OPEN_QUESTION" },
    ];
    expect(getOpenQuestionGroupPosition(blocks, "b")).toEqual({
      position: "single",
      index: 0,
      total: 1,
    });
  });

  it("groups consecutive open questions", () => {
    const blocks = [
      { id: "a", type: "OPEN_QUESTION" },
      { id: "b", type: "OPEN_QUESTION" },
      { id: "c", type: "QUIZ" },
    ];
    expect(getOpenQuestionGroupPosition(blocks, "a")).toEqual({
      position: "first",
      index: 0,
      total: 2,
    });
    expect(getOpenQuestionGroupPosition(blocks, "b")).toEqual({
      position: "last",
      index: 1,
      total: 2,
    });
  });

  it("does not group separated open questions", () => {
    const blocks = [
      { id: "a", type: "OPEN_QUESTION" },
      { id: "b", type: "QUIZ" },
      { id: "c", type: "OPEN_QUESTION" },
    ];
    expect(getOpenQuestionGroupPosition(blocks, "a").position).toBe("single");
    expect(getOpenQuestionGroupPosition(blocks, "c").position).toBe("single");
  });
});
