import { describe, expect, it } from "vitest";
import { isEnrollmentScopedToCourse, latestByBlock } from "./helpers";

describe("evaluation helpers", () => {
  it("keeps only the latest attempt without mutating history", () => {
    const history = [
      { id: "a1", blockId: "a", attempt: 1 },
      { id: "a2", blockId: "a", attempt: 2 },
      { id: "b1", blockId: "b", attempt: 1 },
    ];
    expect(latestByBlock(history).map((row) => row.id).sort()).toEqual(["a2", "b1"]);
    expect(history).toHaveLength(3);
  });

  it("rejects an enrollment from another course", () => {
    expect(isEnrollmentScopedToCourse({ courseId: "course-b" }, "course-a")).toBe(false);
    expect(isEnrollmentScopedToCourse({ courseId: "course-a" }, "course-a")).toBe(true);
  });
});
