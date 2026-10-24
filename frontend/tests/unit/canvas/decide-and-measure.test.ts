import { describe, expect, it } from "vitest";
import { computeDecision, decide, decideAndMeasure, describeDecisionChange } from "@buildment/learning-ui/canvas/decide-and-measure/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(decideAndMeasure);

describe("decide-and-measure model", () => {
  it("starts with Mais's case: 30 percent before, a target of 35, a swing of 2, a result of 34", () => {
    expect(start).toEqual({ baseline: 30, result: 34, rise: 5, swing: 2 });
    expect(decide({ baseline: 30, result: 34, rise: 5, swing: 2 })).toEqual({
      target: 35,
      change: 4,
      gap: -1,
      keepAt: 37,
      changeAt: 33,
      verdict: "watch",
    });
    expect(computeDecision(start).stats.map((s) => s.value)).toEqual(["Keep watching", "+4 points", "35%"]);
  });

  it("gives the three verdicts for the try-this results", () => {
    expect(decide({ ...start, result: 37 }).verdict).toBe("keep");
    expect(decide({ ...start, result: 33 }).verdict).toBe("change");
    expect(decide({ ...start, result: 36 }).verdict).toBe("watch");
    expect(decide({ ...start, result: 34 }).verdict).toBe("watch");
    expect(decide({ ...start, result: 32 }).verdict).toBe("change");
  });

  it("keeps watching when the result is exactly on the target and the swing is above 0", () => {
    const onTarget = decide({ ...start, result: 35 });
    expect(onTarget.gap).toBe(0);
    expect(onTarget.verdict).toBe("watch");
    expect(computeDecision({ ...start, result: 35 }).summary).toContain("exactly on the target");
  });

  it("changes course when the result is exactly at the target minus the swing, and keeps at target plus the swing", () => {
    expect(decide({ ...start, result: 33 }).verdict).toBe("change");
    expect(decide({ ...start, result: 37 }).verdict).toBe("keep");
  });

  it("lets the target decide when the normal swing is 0", () => {
    expect(decide({ ...start, swing: 0 }).verdict).toBe("change");
    expect(decide({ ...start, swing: 0, result: 35 }).verdict).toBe("keep");
    expect(decide({ ...start, swing: 0, result: 36 }).verdict).toBe("keep");
  });

  it("handles a result below the starting rate and the largest target", () => {
    const fell = decide({ baseline: 30, result: 28, rise: 5, swing: 2 });
    expect(fell.change).toBe(-2);
    expect(fell.verdict).toBe("change");
    expect(computeDecision({ baseline: 30, result: 28, rise: 5, swing: 2 }).stats[1]!.value).toBe("-2 points");
    expect(decide({ baseline: 60, result: 70, rise: 15, swing: 6 }).target).toBe(75);
  });

  it("describes a change in words", () => {
    expect(describeDecisionChange(start, { ...start, result: 37 })).toBe(
      "Changing the result: the result is now 2 points above the target (target 35%, normal swing 2 points, so keep at 37% or more and change at 33% or less). The verdict changes from keep watching to keep it.",
    );
    expect(describeDecisionChange(start, { ...start, swing: 0 })).toBe(
      "Changing the normal swing: the result is now 1 point below the target (target 35%, normal swing 0 points, so keep at 35% or more and change at 35% or less). The verdict changes from keep watching to change course.",
    );
    expect(describeDecisionChange(start, start)).toBe("Nothing changed.");
  });
});
