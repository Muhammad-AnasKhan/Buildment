import { describe, expect, it } from "vitest";
import { defaultValues } from "@/canvas/renderers/slider/model";
import {
  describeLittleAndOftenChange,
  formatTime,
  littleAndOften,
  practiceTotals,
} from "@/canvas/little-and-often/data";

const start = defaultValues(littleAndOften);

describe("little and often", () => {
  it("starts at the chapter's numbers: 18 h small against 15 h long", () => {
    expect(start).toEqual({ minutes: 45, days: 6, hours: 5, missed: 1 });
    const r = practiceTotals(start);
    expect(r.smallSessions).toBe(24);
    expect(r.smallMinutes).toBe(1_080);
    expect(r.longSessions).toBe(3);
    expect(r.longMinutes).toBe(900);
    expect(r.difference).toBe(180);
    const result = littleAndOften.compute(start);
    expect(result.stats.map((s) => s.value)).toEqual(["18 h", "15 h", "Small plan"]);
    expect(result.stats.map((s) => s.detail)).toEqual(["24 sessions of 45 min", "3 sessions of 5 h", "by 3 h"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["18 h", "15 h"]);
  });

  it("at the minimums the long plan is ahead", () => {
    const result = littleAndOften.compute({ minutes: 10, days: 1, hours: 1, missed: 0 });
    expect(result.stats.map((s) => s.value)).toEqual(["40 min", "4 h", "Long plan"]);
    expect(result.stats[2]!.detail).toBe("by 3 h 20 min");
  });

  it("at the maximums every Friday is lost and only the small plan counts", () => {
    const r = practiceTotals({ minutes: 120, days: 7, hours: 8, missed: 4 });
    expect(r.smallMinutes).toBe(3_360);
    expect(r.longMinutes).toBe(0);
    const result = littleAndOften.compute({ minutes: 120, days: 7, hours: 8, missed: 4 });
    expect(result.stats.map((s) => s.value)).toEqual(["56 h", "0 h", "Small plan"]);
    expect(result.stats[1]!.detail).toBe("no session happened");
  });

  it("can tie: 45 minutes on 5 days equals three 5-hour Fridays", () => {
    const result = littleAndOften.compute({ ...start, days: 5 });
    expect(result.stats.map((s) => s.value)).toEqual(["15 h", "15 h", "Level"]);
    expect(result.stats[2]!.detail).toBe("same hours");
    expect(result.summary).toMatch(/Both plans give the same hours\.$/);
  });

  it("keeps the try-this numbers true", () => {
    expect(practiceTotals({ ...start, minutes: 20 }).smallMinutes).toBe(480);
    expect(littleAndOften.compute({ ...start, minutes: 20 }).stats[2]!.value).toBe("Long plan");
    const noMissed = practiceTotals({ ...start, missed: 0 });
    expect(noMissed.longMinutes).toBe(1_200);
    expect(noMissed.difference).toBe(-120);
  });

  it("falls back on non-numbers and never shows NaN", () => {
    const r = practiceTotals({ minutes: Number.NaN, days: Number.POSITIVE_INFINITY, hours: -3, missed: 9 });
    expect(r.minutes).toBe(45);
    expect(r.days).toBe(6);
    expect(r.hours).toBe(0);
    expect(r.missed).toBe(4);
    expect(JSON.stringify(littleAndOften.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("formats time in hours and minutes", () => {
    expect(formatTime(0)).toBe("0 h");
    expect(formatTime(40)).toBe("40 min");
    expect(formatTime(200)).toBe("3 h 20 min");
    expect(formatTime(1_080)).toBe("18 h");
  });

  it("explains each change in words", () => {
    expect(describeLittleAndOftenChange(start, start)).toMatch(/^Nothing changed/);
    expect(describeLittleAndOftenChange(start, { ...start, minutes: 20 })).toBe(
      "Changing the small plan from 45 to 20 minutes a day removed 10 h over 4 weeks. The long plan is ahead by 7 h.",
    );
    expect(describeLittleAndOftenChange(start, { ...start, missed: 2 })).toBe(
      "With 2 of 4 Fridays lost instead of 1, the long plan loses 5 h, because one bad Friday cancels a whole session. The small plan is ahead by 8 h.",
    );
    expect(describeLittleAndOftenChange(start, { ...start, missed: 4 })).toBe(
      "With all 4 Fridays lost to bad days, no long session happens at all. The small plan is ahead by 18 h.",
    );
    expect(describeLittleAndOftenChange(start, { ...start, days: 5 })).toBe(
      "Changing the small plan from 6 to 5 days a week removed 3 h over 4 weeks, and it now has 20 sessions. Both plans give the same hours.",
    );
  });
});
