import { describe, expect, it } from "vitest";
import {
  computeStreak,
  countMonth,
  describeStreakChange,
  missedDaysFor,
  streakOrDoneCount,
} from "@/canvas/streak-or-done-count/data";
import { defaultValues } from "@/canvas/renderers/slider/model";

const start = defaultValues(streakOrDoneCount);

describe("streak-or-done-count model", () => {
  it("starts with Yousef's month from chapter 5.3: days 24 to 28 missed", () => {
    expect(start).toEqual({ missed: 5, firstMiss: 24, spread: 0 });
    expect(countMonth({ missed: 5, firstMiss: 24, spread: 0 })).toEqual({
      missedDays: [24, 25, 26, 27, 28],
      firstMissUsed: 24,
      daysDone: 25,
      streakOnLastDay: 2,
      longestRun: 23,
      longestGap: 5,
    });
    expect(computeStreak(start).stats.map((s) => s.value)).toEqual(["25 of 30", "2 days", "5 days"]);
  });

  it("a perfect month has a streak of 30 and no gap", () => {
    const c = countMonth({ missed: 0, firstMiss: 24, spread: 0 });
    expect(c.daysDone).toBe(30);
    expect(c.streakOnLastDay).toBe(30);
    expect(c.longestRun).toBe(30);
    expect(c.longestGap).toBe(0);
  });

  it("try this 1: one miss on day 24 cuts the streak to 6 but days done only to 29", () => {
    const c = countMonth({ missed: 1, firstMiss: 24, spread: 0 });
    expect(c.missedDays).toEqual([24]);
    expect(c.daysDone).toBe(29);
    expect(c.streakOnLastDay).toBe(6);
    expect(c.longestRun).toBe(23);
    expect(c.longestGap).toBe(1);
  });

  it("try this 2: five spread-out misses keep 25 days done with a gap of 1, moved to start on day 22", () => {
    const c = countMonth({ missed: 5, firstMiss: 24, spread: 1 });
    expect(c.missedDays).toEqual([22, 24, 26, 28, 30]);
    expect(c.firstMissUsed).toBe(22);
    expect(c.daysDone).toBe(25);
    expect(c.streakOnLastDay).toBe(0);
    expect(c.longestRun).toBe(21);
    expect(c.longestGap).toBe(1);
  });

  it("shows a moved first miss in the longest-gap stat, and not when nothing moved", () => {
    expect(computeStreak({ missed: 5, firstMiss: 24, spread: 1 }).stats[2]!.detail).toBe("first miss moved to day 22");
    expect(computeStreak({ missed: 5, firstMiss: 24, spread: 0 }).stats[2]!.detail).toBe("missed in a row");
  });

  it("try this 3: waiting until the first of next month makes a gap of 7", () => {
    const c = countMonth({ missed: 7, firstMiss: 24, spread: 0 });
    expect(c.missedDays).toEqual([24, 25, 26, 27, 28, 29, 30]);
    expect(c.daysDone).toBe(23);
    expect(c.streakOnLastDay).toBe(0);
    expect(c.longestGap).toBe(7);
  });

  it("handles the edges: a miss on day 1, a miss on day 30, and 10 spread-out misses from day 30", () => {
    expect(countMonth({ missed: 1, firstMiss: 1, spread: 0 }).streakOnLastDay).toBe(29);
    expect(countMonth({ missed: 1, firstMiss: 30, spread: 0 }).streakOnLastDay).toBe(0);
    expect(missedDaysFor({ missed: 10, firstMiss: 30, spread: 1 })).toEqual([12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);
    expect(missedDaysFor({ missed: 10, firstMiss: 1, spread: 0 })).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("writes a summary that names the missed days", () => {
    expect(computeStreak(start).summary).toBe(
      "Missed on days 24, 25, 26, 27 and 28. 25 of 30 days done, a streak of 2 days on day 30, a longest run of 23 days and a longest gap of 5 days.",
    );
  });

  it("describes a change in words", () => {
    expect(describeStreakChange(start, { ...start, missed: 1 })).toBe(
      "Changing the number of missed days: days done went from 25 to 29, the streak on day 30 went from 2 days to 6 days, and the longest gap went from 5 days to 1 day.",
    );
    expect(describeStreakChange(start, { ...start, spread: 1 })).toBe(
      "Spreading the misses out: days done stayed at 25, the streak on day 30 went from 2 days to 0 days, and the longest gap went from 5 days to 1 day. The first miss moved to day 22 so every miss fits in 30 days.",
    );
    expect(describeStreakChange(start, start)).toBe("Nothing changed.");
  });
});
