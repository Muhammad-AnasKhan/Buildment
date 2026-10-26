import { describe, expect, it } from "vitest";
import {
  breakdown,
  claimSentence,
  computeShare,
  describeShareChange,
  formatHours,
  howMuchWasYours,
} from "@buildment/learning-ui/canvas/how-much-was-yours/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(howMuchWasYours);

describe("how-much-was-yours model", () => {
  it("starts with Leen's case: 1 hour saved, 0.5 hour seen without her, 0.5 hour claimable", () => {
    expect(start).toEqual({ before: 3, after: 2, comparisonChange: -0.5 });
    expect(breakdown({ before: 3, after: 2, comparisonChange: -0.5 })).toEqual({ saved: 1, savedWithout: 0.5, claim: 0.5, share: 0.5 });
    const result = computeShare(start);
    expect(result.stats.map((s) => s.value)).toEqual(["1 hour less", "0.5 hours less", "0.5 hours"]);
    expect(result.stats[0]!.detail).toBe("-33% from 3 hours");
    expect(result.stats[2]!.detail).toBe("50% of the change");
    expect(result.bars!.map((b) => b.value)).toEqual([1, 0.5, 0.5]);
    expect(result.summary).toBe(
      "The packing day fell from 3 hours to 2 hours, which is 1 hour less. The comparison days got 0.5 hours faster without your work. So about 0.5 hours of the 1 hour, about 50%, is the part you can claim.",
    );
  });

  it("matches the try-this values: a comparison change of 0 leaves all of it, -1 leaves none", () => {
    expect(breakdown({ before: 3, after: 2, comparisonChange: 0 }).claim).toBe(1);
    expect(claimSentence({ before: 3, after: 2, comparisonChange: 0 })).toContain("the whole change is a hint that it was yours");
    const none = computeShare({ ...start, comparisonChange: -1 });
    expect(none.stats[2]!.value).toBe("0 hours");
    expect(none.stats[2]!.detail).toBe("0% of the change");
    expect(none.bars![2]!.tone).toBeUndefined();
    expect(claimSentence({ before: 3, after: 2, comparisonChange: -1 })).toContain("none of the change can be claimed as yours");
  });

  it("never lets the claim go below 0 when the comparison improved more", () => {
    const b = breakdown({ before: 3, after: 2, comparisonChange: -2 });
    expect(b.savedWithout).toBe(2);
    expect(b.claim).toBe(0);
    expect(b.share).toBe(0);
  });

  it("handles a packing day that did not get shorter", () => {
    const worse = computeShare({ before: 2, after: 3, comparisonChange: 0 });
    expect(worse.stats[0]!.value).toBe("1 hour more");
    expect(worse.stats[2]!.value).toBe("0 hours");
    expect(worse.stats[2]!.detail).toBe("nothing to claim");
    expect(worse.summary).toContain("no change to claim");
  });

  it("handles the extremes: the smallest before and the largest rise in the comparison", () => {
    const edge = computeShare({ before: 1, after: 0.5, comparisonChange: 1 });
    expect(breakdown({ before: 1, after: 0.5, comparisonChange: 1 })).toEqual({ saved: 0.5, savedWithout: -1, claim: 0.5, share: 1 });
    expect(edge.stats[1]!.value).toBe("1 hour more");
    expect(formatHours(0.25)).toBe("0.25 hours");
    expect(formatHours(1)).toBe("1 hour");
  });

  it("describes a change in words", () => {
    expect(describeShareChange(start, { ...start, comparisonChange: -1 })).toBe(
      "Changing the comparison change from -0.5 to -1 hours: you went from 0.5 hours to nothing you can claim. The comparison days improved as much or more, so the evidence does not show a part that was yours.",
    );
    expect(describeShareChange(start, { ...start, comparisonChange: 0 })).toBe(
      "Changing the comparison change from -0.5 to 0 hours: you went from 0.5 hours to 1 hour you can claim. The total change is 1 hour and 0 hours of it happened without your work.",
    );
    expect(describeShareChange(start, start)).toBe("Nothing changed.");
  });
});
