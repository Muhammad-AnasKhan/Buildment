import { describe, expect, it } from "vitest";
import { computeDecision, decide, decideAndMeasure, describeDecisionChange } from "@buildment/learning-ui/canvas/decide-and-measure/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(decideAndMeasure);

describe("decide-and-measure model", () => {
  it("starts with Mais's case: 30 percent before, a line of 35, a swing of 2, a result of 34", () => {
    expect(start).toEqual({ baseline: 30, result: 34, rise: 5, swing: 2 });
    expect(decide({ baseline: 30, result: 34, rise: 5, swing: 2 })).toEqual({ target: 35, change: 4, gap: -1, verdict: "watch" });
    expect(computeDecision(start).stats.map((s) => s.value)).toEqual(["Too close to call", "+4 points", "35%"]);
  });

  it("gives the three verdicts for the try-this results", () => {
    expect(decide({ ...start, result: 38 }).verdict).toBe("keep");
    expect(decide({ ...start, result: 31 }).verdict).toBe("change");
    expect(decide({ ...start, result: 33 }).verdict).toBe("watch");
    expect(decide({ ...start, result: 32 }).verdict).toBe("change");
  });

  it("lets the line decide when the normal swing is 0", () => {
    expect(decide({ ...start, swing: 0 }).verdict).toBe("change");
    expect(decide({ ...start, swing: 0, result: 35 }).verdict).toBe("keep");
    expect(decide({ ...start, swing: 0, result: 36 }).verdict).toBe("keep");
  });

  it("handles a result below the starting rate and the largest line", () => {
    const fell = decide({ baseline: 30, result: 28, rise: 5, swing: 2 });
    expect(fell.change).toBe(-2);
    expect(fell.verdict).toBe("change");
    expect(computeDecision({ baseline: 30, result: 28, rise: 5, swing: 2 }).stats[1]!.value).toBe("-2 points");
    expect(decide({ baseline: 60, result: 70, rise: 15, swing: 6 }).target).toBe(75);
  });

  it("describes a change in words", () => {
    expect(describeDecisionChange(start, { ...start, result: 38 })).toBe(
      "Changing the result: the result is now 3 points above the line (line 35%, normal swing 2 points). The verdict changes from too close to call to keep it.",
    );
    expect(describeDecisionChange(start, { ...start, swing: 0 })).toBe(
      "Changing the normal swing: the result is now 1 point below the line (line 35%, normal swing 0 points). The verdict changes from too close to call to change course.",
    );
    expect(describeDecisionChange(start, start)).toBe("Nothing changed.");
  });
});
