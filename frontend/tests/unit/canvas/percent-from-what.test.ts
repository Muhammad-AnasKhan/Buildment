import { describe, expect, it } from "vitest";
import {
  computePercent,
  describePercentChange,
  isSmallBase,
  percentChange,
  percentFromWhat,
  reverseChange,
} from "@buildment/learning-ui/canvas/percent-from-what/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(percentFromWhat);

describe("percent-from-what model", () => {
  it("starts with Leen's packing day: 3 hours to 2 hours over 4 weeks is 33% less, not 50%", () => {
    expect(start).toEqual({ before: 3, after: 2, weeks: 4 });
    expect(percentChange(3, 2)).toBeCloseTo(-33.33, 1);
    const result = computePercent(start);
    expect(result.stats.map((s) => s.value)).toEqual(["-33%", "-1", "50%"]);
    expect(result.stats[2]!.detail).toBe("3 is 50% more than 2");
    expect(result.summary).toBe(
      "From 3 to 2 is 33% less, a difference of 1. Counted from the after number, 3 is 50% more than 2. Measured over 4 weeks on each side.",
    );
  });

  it("matches the try-this values: 2 to 8 is +300% but only 6", () => {
    const result = computePercent({ before: 2, after: 8, weeks: 4 });
    expect(result.stats.map((s) => s.value)).toEqual(["+300%", "+6", "75%"]);
    expect(result.stats[1]!.detail).toBe("a big percentage on a small base");
    expect(isSmallBase(2, 8)).toBe(true);
    expect(isSmallBase(3, 2)).toBe(false);
    expect(isSmallBase(50, 250)).toBe(false);
    expect(reverseChange(2, 8)).toBeCloseTo(-75);
  });

  it("calls one week too short without changing the percentage", () => {
    const result = computePercent({ before: 3, after: 2, weeks: 1 });
    expect(result.stats[0]!.value).toBe("-33%");
    expect(result.stats).toHaveLength(3);
    expect(result.stats[0]!.detail).toBe("from 3 to 2, 1 week each: too short: one week can be an unusual week");
  });

  it("handles the edges: no change, an after of 0, and the maximum", () => {
    expect(computePercent({ before: 5, after: 5, weeks: 4 }).stats.map((s) => s.value)).toEqual(["0%", "0", "0%"]);
    const zero = computePercent({ before: 4, after: 0, weeks: 4 });
    expect(zero.stats.map((s) => s.value)).toEqual(["-100%", "-4", "n/a"]);
    expect(reverseChange(4, 0)).toBeNull();
    const top = computePercent({ before: 1, after: 100, weeks: 12 });
    expect(top.stats[0]!.value).toBe("+9900%");
    expect(top.stats[0]!.detail).toBe("from 1 to 100, 12 weeks each: long enough to see normal ups and downs");
  });

  it("falls back to the defaults for bad input", () => {
    const result = computePercent({ before: Number.NaN, after: Number.POSITIVE_INFINITY, weeks: -3 });
    expect(result.stats[0]!.value).toBe("-33%");
    expect(result.stats[0]!.detail).toContain("1 week each");
  });

  it("describes a change in words", () => {
    expect(describePercentChange(start, { ...start, before: 2, after: 8 })).toBe(
      "Changing the before number from 3 to 2 and the after number from 2 to 8: the change from before goes from -33% to +300%. That is a big percentage, but only 6 more in the number itself.",
    );
    expect(describePercentChange(start, { ...start, weeks: 1 })).toBe(
      "The percentage did not change. Only the window did: 1 week on each side is too short: one week can be an unusual week.",
    );
    expect(describePercentChange(start, start)).toBe("Nothing changed.");
  });
});
