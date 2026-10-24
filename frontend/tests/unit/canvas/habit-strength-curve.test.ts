import { describe, expect, it } from "vitest";
import {
  computeCurve,
  describeCurveChange,
  habitStrength,
  habitStrengthCurve,
  lastSevenDays,
  weekGain,
} from "@buildment/learning-ui/canvas/habit-strength-curve/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(habitStrengthCurve);

describe("habit-strength-curve model", () => {
  it("starts at chapter 1.4's day 21, typical speed: 61%, the last week added 14, 45 more days to 95%", () => {
    expect(start).toEqual({ days: 21, speed: 2 });
    expect(computeCurve(start).stats.map((s) => s.value)).toEqual(["61%", "+14 points", "45 more days"]);
    expect(computeCurve(start).stats[1]!.detail).toBe("week 1 added +27");
  });

  it("reaches exactly 95% at 18, 66 and 254 days", () => {
    expect(habitStrength(18, 1)).toBeCloseTo(95, 10);
    expect(habitStrength(66, 2)).toBeCloseTo(95, 10);
    expect(habitStrength(254, 3)).toBeCloseTo(95, 10);
    expect(computeCurve({ days: 66, speed: 2 }).stats[2]!.value).toBe("reached");
  });

  it("matches the try-this values: weekly gains, weeks 1 to 3, the slow habit", () => {
    expect(computeCurve(start).bars!.map((b) => b.display)).toEqual(["+27 points", "+10 points", "+3 points", "+1 point"]);
    expect([7, 14, 21].map((d) => computeCurve({ days: d, speed: 2 }).stats[0]!.value)).toEqual(["27%", "47%", "61%"]);
    expect(computeCurve({ days: 42, speed: 2 }).stats[0]!.value).toBe("85%");
    expect(Math.round(weekGain(1, 3))).toBe(8);
    expect(computeCurve({ days: 66, speed: 3 }).stats[0]!.value).toBe("54%");
    expect(computeCurve({ days: 21, speed: 1 }).stats[0]!.value).toBe("97%");
    expect(computeCurve({ days: 21, speed: 3 }).stats[0]!.value).toBe("22%");
  });

  it("has the same shape at every speed: each week adds less than the one before", () => {
    for (const speed of [1, 2, 3] as const) {
      for (let n = 2; n <= 20; n++) expect(weekGain(n, speed)).toBeLessThan(weekGain(n - 1, speed));
    }
  });

  it("handles the edges: day 1 and day 300", () => {
    expect(lastSevenDays(1, 2)).toBeCloseTo(habitStrength(1, 2));
    expect(computeCurve({ days: 1, speed: 3 }).stats[2]!.value).toBe("253 more days");
    expect(computeCurve({ days: 300, speed: 3 }).stats[2]!.value).toBe("reached");
  });

  it("describes a change in words", () => {
    expect(describeCurveChange(start, { ...start, speed: 3 })).toBe(
      "A slow habit at day 21: strength is 22% instead of 61%, and week 1 adds +8 points. The speed changed; the shape did not.",
    );
    expect(describeCurveChange(start, { ...start, days: 28 })).toBe(
      "Going from day 21 to day 28 raised strength from 61% to 72%. The 7 days up to day 28 added +10 points, against +27 in week 1.",
    );
    expect(describeCurveChange(start, start)).toBe("Nothing changed.");
  });
});
