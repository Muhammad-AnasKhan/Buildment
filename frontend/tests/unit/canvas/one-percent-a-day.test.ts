import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import {
  compoundLevels,
  describeOnePercentChange,
  formatLevel,
  onePercentADay,
} from "@buildment/learning-ui/canvas/one-percent-a-day/data";

const start = defaultValues(onePercentADay);

describe("one percent a day", () => {
  it("starts at the chapter's numbers: x37.8 steady and x0.03 backwards", () => {
    expect(start).toEqual({ pct: 1, days: 365, slips: 0 });
    const r = compoundLevels(start);
    expect(r.steady).toBeCloseTo(37.7834, 3);
    expect(r.withSlips).toBeCloseTo(r.steady, 10);
    expect(r.backwards).toBeCloseTo(0.0255, 4);
    const result = onePercentADay.compute(start);
    expect(result.stats.map((s) => s.value)).toEqual(["x37.8", "x37.8", "x0.03"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["x37.8", "x37.8", "x1.00", "x0.03"]);
  });

  it("one slip day a week still ends far ahead", () => {
    const r = compoundLevels({ ...start, slips: 1 });
    expect(r.slipDays).toBe(52);
    expect(r.goodDays).toBe(313);
    expect(formatLevel(r.withSlips)).toBe("x13.4");
  });

  it("three slip days a week end just above the start", () => {
    const r = compoundLevels({ ...start, slips: 3 });
    expect(r.slipDays).toBe(156);
    expect(formatLevel(r.withSlips)).toBe("x1.67");
  });

  it("a month of small steps looks like very little", () => {
    expect(formatLevel(compoundLevels({ ...start, days: 30 }).steady)).toBe("x1.35");
  });

  it("snaps values outside the range", () => {
    const r = compoundLevels({ pct: 9, days: 3, slips: -2 });
    expect(r.pct).toBe(2);
    expect(r.days).toBe(30);
    expect(r.slips).toBe(0);
  });

  it("explains a change to the slip days", () => {
    const text = describeOnePercentChange(start, { ...start, slips: 1 });
    expect(text).toContain("52 of the 365 days go backwards");
    expect(text).toContain("x13.4");
    expect(text).toContain("still ahead");
    expect(describeOnePercentChange(start, start)).toBe("Nothing changed.");
  });
});
