import { describe, expect, it } from "vitest";
import { currentStreak, uncelebratedStreakMilestone } from "./streak";

describe("currentStreak", () => {
  const today = "2026-10-05";

  it("counts consecutive active days through today", () => {
    expect(currentStreak(["2026-10-03", "2026-10-04", "2026-10-05"], today)).toEqual({
      count: 3,
      graceUsed: false,
    });
  });

  it("keeps yesterday's run when today has no study yet", () => {
    expect(currentStreak(["2026-10-03", "2026-10-04"], today)).toEqual({
      count: 2,
      graceUsed: false,
    });
  });

  it("absorbs one missed day and keeps counting", () => {
    expect(currentStreak(["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05"], today)).toEqual({
      count: 4,
      graceUsed: true,
    });
  });

  it("does not treat an empty today as the missed day", () => {
    expect(currentStreak(["2026-10-03"], today)).toEqual({
      count: 1,
      graceUsed: true,
    });
  });

  it("resets after a second missed day", () => {
    expect(currentStreak(["2026-10-01", "2026-10-05"], today)).toEqual({
      count: 1,
      graceUsed: false,
    });
    expect(currentStreak(["2026-10-01"], today)).toEqual({
      count: 0,
      graceUsed: false,
    });
  });
});

describe("uncelebratedStreakMilestone", () => {
  it("returns the highest new milestone", () => {
    expect(uncelebratedStreakMilestone(14, [])).toBe(14);
    expect(uncelebratedStreakMilestone(7, [3])).toBe(7);
    expect(uncelebratedStreakMilestone(7, [3, 7])).toBeNull();
    expect(uncelebratedStreakMilestone(2, [])).toBeNull();
  });
});
