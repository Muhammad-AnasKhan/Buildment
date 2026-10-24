import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describeProjectHoursChange, projectHours, sixMonthHoursSplit } from "@buildment/learning-ui/canvas/six-month-hours-split/data";

const start = defaultValues(sixMonthHoursSplit);

describe("six month hours split", () => {
  it("starts at Yara's plan: 192 hours and all 12 areas ready", () => {
    expect(start).toEqual({ hours: 8, months: 6, share: 60 });
    const r = projectHours(start);
    expect(r.totalHours).toBe(192);
    expect(r.learningHours).toBeCloseTo(115.2, 9);
    expect(r.buildingHours).toBeCloseTo(76.8, 9);
    expect([r.areasLearned, r.areasBuilt, r.areasReady, r.limit]).toEqual([14, 19, 12, "none"]);
    expect(sixMonthHoursSplit.compute(start).stats.map((s) => s.value)).toEqual(["192 hours", "12 of 12", "Nothing"]);
  });

  it("one month leaves only 2 areas, limited by learning", () => {
    const r = projectHours({ ...start, months: 1 });
    expect([r.totalHours, r.areasLearned, r.areasBuilt, r.areasReady, r.limit]).toEqual([32, 2, 3, 2, "learning"]);
    const bars = sixMonthHoursSplit.compute({ ...start, months: 1 }).bars!;
    expect(bars.map((b) => b.display)).toEqual(["19 hours", "96 hours", "13 hours", "48 hours"]);
    expect(bars.map((b) => b.tone)).toEqual(["warn", undefined, "warn", undefined]);
  });

  it("a 20% learning share leaves 4 areas although building has 154 hours", () => {
    const r = projectHours({ ...start, share: 20 });
    expect(Math.round(r.buildingHours)).toBe(154);
    expect([r.areasLearned, r.areasReady, r.limit]).toEqual([4, 4, "learning"]);
  });

  it("an 80% learning share leaves 9 areas, limited by building", () => {
    const r = projectHours({ ...start, share: 80 });
    expect(Math.round(r.buildingHours)).toBe(38);
    expect([r.areasLearned, r.areasBuilt, r.areasReady, r.limit]).toEqual([19, 9, 9, "building"]);
  });

  it("three months at 60% gives 7 areas", () => {
    const r = projectHours({ ...start, months: 3 });
    expect([r.totalHours, r.areasReady, r.limit]).toEqual([96, 7, "learning"]);
  });

  it("handles the corners of the ranges", () => {
    const low = projectHours({ hours: 2, months: 1, share: 20 });
    expect([low.totalHours, low.areasReady, low.limit]).toEqual([8, 0, "learning"]);
    const high = projectHours({ hours: 20, months: 12, share: 80 });
    expect([high.totalHours, high.areasReady, high.limit]).toEqual([960, 12, "none"]);
  });

  it("falls back on non-numbers and never shows NaN", () => {
    const r = projectHours({ hours: Number.NaN, months: Number.POSITIVE_INFINITY, share: -5 });
    expect([r.hoursPerWeek, r.months, r.learningShare]).toEqual([8, 6, 0]);
    expect(JSON.stringify(sixMonthHoursSplit.compute({}))).not.toMatch(/NaN|Infinity/);
  });

  it("explains a shorter plan in words", () => {
    expect(describeProjectHoursChange(start, { ...start, months: 1 })).toBe(
      "Going from 6 months to 1 month changed the total from 192 hours to 32 hours. Now 2 of the 12 areas are ready, and learning time runs out first.",
    );
  });

  it("explains a lower learning share in words", () => {
    expect(describeProjectHoursChange(start, { ...start, share: 20 })).toBe(
      "Moving the learning share from 60% to 20% moved 77 hours from learning to building. Now 4 of the 12 areas are ready, and learning time runs out first.",
    );
  });

  it("says when nothing changed", () => {
    expect(describeProjectHoursChange(start, start)).toBe("Nothing changed: the plan has the same hours, so the same areas are ready.");
  });
});
