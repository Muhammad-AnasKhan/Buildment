import { describe, expect, it } from "vitest";
import { defaultValues } from "@/canvas/renderers/slider/model";
import {
  describeLittleAndOftenChange,
  formatSessions,
  formatTime,
  littleAndOften,
  practiceTotals,
} from "@/canvas/little-and-often/data";

const start = defaultValues(littleAndOften);

describe("little and often", () => {
  it("starts at the chapter's numbers: 18 h small against about 17 h 9 min long", () => {
    expect(start).toEqual({ minutes: 45, days: 6, hours: 5, bad: 1 });
    const r = practiceTotals(start);
    expect(r.smallSessions).toBe(24);
    expect(r.smallMinutes).toBe(1_080);
    expect(r.longSessions).toBeCloseTo(24 / 7, 10);
    expect(r.longMinutes).toBeCloseTo(7_200 / 7, 6);
    expect(r.difference).toBeCloseTo(360 / 7, 6);
    const result = littleAndOften.compute(start);
    expect(result.stats.map((s) => s.value)).toEqual(["18 h", "17 h 9 min", "Small plan"]);
    expect(result.stats.map((s) => s.detail)).toEqual([
      "24 sessions of 45 min",
      "on average 3.4 sessions of 5 h",
      "by 51 min",
    ]);
    expect(result.bars!.map((b) => b.display)).toEqual(["18 h", "17 h 9 min"]);
  });

  it("bad days take sessions from both plans", () => {
    const r = practiceTotals({ ...start, bad: 3 });
    expect(r.smallSessions).toBe(16);
    expect(r.smallMinutes).toBe(720);
    expect(formatTime(r.longMinutes)).toBe("11 h 26 min");
    expect(littleAndOften.compute({ ...start, bad: 3 }).stats[2]!.value).toBe("Small plan");
  });

  it("with no bad days the long plan wins", () => {
    const result = littleAndOften.compute({ ...start, bad: 0 });
    expect(result.stats.map((s) => s.value)).toEqual(["18 h", "20 h", "Long plan"]);
    expect(result.stats[1]!.detail).toBe("4 sessions of 5 h");
    expect(result.stats[2]!.detail).toBe("by 2 h");
  });

  it("at the minimums the long plan is ahead", () => {
    const result = littleAndOften.compute({ minutes: 10, days: 1, hours: 1, bad: 0 });
    expect(result.stats.map((s) => s.value)).toEqual(["40 min", "4 h", "Long plan"]);
    expect(result.stats[2]!.detail).toBe("by 3 h 20 min");
  });

  it("at the maximums only 3 good days are left for the small plan", () => {
    const r = practiceTotals({ minutes: 120, days: 7, hours: 8, bad: 4 });
    expect(r.smallSessions).toBe(12);
    expect(r.smallMinutes).toBe(1_440);
    expect(formatTime(r.longMinutes)).toBe("13 h 43 min");
    const result = littleAndOften.compute({ minutes: 120, days: 7, hours: 8, bad: 4 });
    expect(result.stats.map((s) => s.value)).toEqual(["24 h", "13 h 43 min", "Small plan"]);
    expect(result.stats[1]!.detail).toBe("on average 1.7 sessions of 8 h");
  });

  it("keeps the try-this numbers true", () => {
    const fewer = littleAndOften.compute({ ...start, minutes: 20 });
    expect(fewer.stats.map((s) => s.value)).toEqual(["8 h", "17 h 9 min", "Long plan"]);
  });

  it("falls back on non-numbers and never shows NaN", () => {
    const r = practiceTotals({ minutes: Number.NaN, days: Number.POSITIVE_INFINITY, hours: -3, bad: 99 });
    expect(r.minutes).toBe(45);
    expect(r.days).toBe(6);
    expect(r.hours).toBe(0);
    expect(r.bad).toBe(7);
    expect(r.longMinutes).toBe(0);
    expect(littleAndOften.compute({ ...start, bad: 7 }).stats[1]!.detail).toBe("no Friday is free");
    expect(JSON.stringify(littleAndOften.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("formats time and sessions", () => {
    expect(formatTime(0)).toBe("0 h");
    expect(formatTime(40)).toBe("40 min");
    expect(formatTime(200)).toBe("3 h 20 min");
    expect(formatTime(1_080)).toBe("18 h");
    expect(formatSessions(1)).toBe("1 session");
    expect(formatSessions(24)).toBe("24 sessions");
    expect(formatSessions(24 / 7)).toBe("3.4 sessions");
  });

  it("explains each change in words", () => {
    expect(describeLittleAndOftenChange(start, start)).toMatch(/^Nothing changed/);
    expect(describeLittleAndOftenChange(start, { ...start, minutes: 20 })).toBe(
      "Changing the small plan from 45 to 20 minutes a session removed 10 h over 4 weeks. The long plan is ahead by 9 h 9 min.",
    );
    expect(describeLittleAndOftenChange(start, { ...start, bad: 2 })).toBe(
      "With 2 bad days a week instead of 1, the small plan lost 3 h, because there are 5 good days for its sessions, and the long plan lost about 2 h 51 min, because a bad Friday cancels a whole session. The small plan is ahead by 43 min.",
    );
    expect(describeLittleAndOftenChange(start, { ...start, bad: 0 })).toBe(
      "With 0 bad days a week instead of 1, the small plan did not change, and the long plan gained about 2 h 51 min, because Friday is free more often. The long plan is ahead by 2 h.",
    );
    expect(describeLittleAndOftenChange({ ...start, days: 5 }, { ...start, days: 5, bad: 2 })).toBe(
      "With 2 bad days a week instead of 1, the small plan lost nothing, because its short sessions moved to good days, and the long plan lost about 2 h 51 min, because a bad Friday cancels a whole session. The small plan is ahead by 43 min.",
    );
    expect(describeLittleAndOftenChange({ ...start, bad: 3 }, { ...start, bad: 3, days: 7 })).toBe(
      "Changing the small plan from 6 to 7 days a week changed nothing. Only 4 days a week are good, so it keeps 16 sessions. The small plan is ahead by 34 min.",
    );
  });
});
