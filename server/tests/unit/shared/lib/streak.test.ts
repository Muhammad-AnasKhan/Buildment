import { describe, expect, it } from "vitest";
import { computeStreak, currentStreak, uncelebratedStreakMilestone } from "../../../../src/shared/lib/streak.js";

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

describe("computeStreak with freezes", () => {
  const today = "2026-10-05";

  it("keeps counting past the old 400-day limit", () => {
    const days = Array.from({ length: 500 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 9, 5) - index * 86_400_000);
      return date.toISOString().slice(0, 10);
    });
    expect(computeStreak(days, today).count).toBe(500);
  });

  it("spends freezes on a gap the grace day cannot bridge alone", () => {
    // Missed 10-02 and 10-03: the grace day takes the later one, a freeze the earlier one.
    expect(computeStreak(["2026-10-01", "2026-10-04", "2026-10-05"], today, { freezesAvailable: 2 })).toEqual({
      count: 3,
      graceUsed: true,
      newlyFrozenDays: ["2026-10-02"],
    });
  });

  it("does not spend a freeze when the grace day is enough", () => {
    expect(computeStreak(["2026-10-03", "2026-10-05"], today, { freezesAvailable: 2 }).newlyFrozenDays).toEqual([]);
  });

  it("breaks the run without spending anything when the gap is longer than the freezes", () => {
    expect(computeStreak(["2026-09-28", "2026-10-05"], today, { freezesAvailable: 2 })).toEqual({
      count: 1,
      graceUsed: false,
      newlyFrozenDays: [],
    });
  });

  it("never spends freezes when nobody studied on the other side of the gap", () => {
    expect(computeStreak([], today, { freezesAvailable: 2 })).toEqual({ count: 0, graceUsed: false, newlyFrozenDays: [] });
  });

  it("treats recorded freeze days as covered, without adding to the count", () => {
    const frozenDays = ["2026-10-02"];
    expect(computeStreak(["2026-10-01", "2026-10-04", "2026-10-05"], today, { frozenDays, freezesAvailable: 0 })).toEqual({
      count: 3,
      graceUsed: true,
      newlyFrozenDays: [],
    });
  });

  it("protects a learner who is still away, while today is open", () => {
    // Last studied 10-02; 10-03 and 10-04 missed. Grace takes 10-04, the freeze 10-03.
    expect(computeStreak(["2026-10-01", "2026-10-02"], today, { freezesAvailable: 1 })).toEqual({
      count: 2,
      graceUsed: true,
      newlyFrozenDays: ["2026-10-03"],
    });
  });

  it("bridges two separate gaps when it has the freezes", () => {
    const result = computeStreak(["2026-09-28", "2026-09-30", "2026-10-02", "2026-10-05"], today, { freezesAvailable: 3 });
    expect(result.count).toBe(4);
    expect(result.newlyFrozenDays).toEqual(["2026-10-03", "2026-10-01", "2026-09-29"]);
  });
});
