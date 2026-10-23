import { describe, expect, it } from "vitest";
import { computeCurve, curvePoint, describeCurveChange, habitStrength, habitStrengthCurve } from "@/canvas/habit-strength-curve/data";
import { defaultValues } from "@/canvas/renderers/slider/model";

const start = defaultValues(habitStrengthCurve);

describe("habit-strength-curve model", () => {
  it("starts at chapter 1.4's day 21, typical speed, no misses: 61%, 45 more days to 95%", () => {
    expect(start).toEqual({ days: 21, speed: 2, missed: 0 });
    expect(curvePoint({ days: 21, speed: 2, missed: 0 })).toEqual({ done: 21, strength: habitStrength(21, 2), stillNeeded: 45 });
    expect(computeCurve(start).stats.map((s) => s.value)).toEqual(["61%", "21", "45 more"]);
    expect(computeCurve(start).bars!.map((b) => b.display)).toEqual(["97%", "61%", "22%"]);
  });

  it("reaches exactly 95% at 18, 66 and 254 days done", () => {
    expect(habitStrength(18, 1)).toBeCloseTo(95, 10);
    expect(habitStrength(66, 2)).toBeCloseTo(95, 10);
    expect(habitStrength(254, 3)).toBeCloseTo(95, 10);
    expect(computeCurve({ days: 66, speed: 2, missed: 0 }).stats[2]!.value).toBe("reached");
  });

  it("matches the try-this values: one miss at day 21, the speeds at day 66, weeks 1 to 3", () => {
    expect(computeCurve({ days: 21, speed: 2, missed: 1 }).stats[0]!.value).toBe("60%");
    expect(computeCurve({ days: 66, speed: 2, missed: 0 }).bars!.map((b) => b.display)).toEqual(["100%", "95%", "54%"]);
    expect([7, 14, 21].map((d) => computeCurve({ days: d, speed: 2, missed: 0 }).stats[0]!.value)).toEqual(["27%", "47%", "61%"]);
    expect(computeCurve({ days: 42, speed: 2, missed: 0 }).stats[0]!.value).toBe("85%");
  });

  it("grows fast at first and then levels off: each week adds less than the one before", () => {
    const week = (n: number) => habitStrength(7 * n, 2) - habitStrength(7 * (n - 1), 2);
    for (let n = 2; n <= 10; n++) expect(week(n)).toBeLessThan(week(n - 1));
  });

  it("never lets a missed day take strength away, and handles more misses than days", () => {
    expect(curvePoint({ days: 30, speed: 2, missed: 5 }).strength).toBeCloseTo(habitStrength(25, 2));
    expect(curvePoint({ days: 1, speed: 3, missed: 60 })).toEqual({ done: 0, strength: 0, stillNeeded: 254 });
    expect(computeCurve({ days: 1, speed: 3, missed: 60 }).stats[1]!.detail).toBe("1 day, 1 missed");
    expect(computeCurve({ days: 300, speed: 3, missed: 0 }).stats[2]!.value).toBe("reached");
  });

  it("describes a change in words", () => {
    expect(describeCurveChange(start, { ...start, missed: 1 })).toBe(
      "You added 1 missed day. A missed day adds no growth but takes nothing away, so strength went from 61% to 60%, not back to zero.",
    );
    expect(describeCurveChange(start, { ...start, speed: 3 })).toBe(
      "Same 21 days done, but a slow habit: strength is 22% instead of 61%. People and habits differ a lot in how fast this happens.",
    );
    expect(describeCurveChange(start, start)).toBe("Nothing changed.");
    expect(describeCurveChange(start, { ...start, days: 28 })).toMatch(/^Going from day 21 to day 28 raised strength from 61% to 72%\./);
  });
});
