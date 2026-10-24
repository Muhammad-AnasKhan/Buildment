import { describe, expect, it } from "vitest";
import { defaultWeights, describeChange, maxTotal, scoreOptions, standing } from "@buildment/learning-ui/canvas/renderers/factor/model";
import { workflowOrAgent as spec } from "@buildment/learning-ui/canvas/workflow-or-agent/data";

const all = (w: number) => Object.fromEntries(spec.criteria.map((c) => [c.id, w]));
const lead = (weights: Record<string, number>) => standing(spec, scoreOptions(spec, weights).totals);

describe("workflow-or-agent factor canvas", () => {
  it("has two options, four criteria and scores on the 1 to 5 scale", () => {
    expect(spec.options).toHaveLength(2);
    expect(spec.criteria).toHaveLength(4);
    const levels = spec.weightLevels.map((l) => l.value);
    for (const c of spec.criteria) {
      expect(levels).toContain(c.weight);
      for (const o of spec.options) {
        expect(c.scores[o.id]).toBeGreaterThanOrEqual(spec.scoreScale.min);
        expect(c.scores[o.id]).toBeLessThanOrEqual(spec.scoreScale.max);
      }
    }
  });

  it("starts with the workflow ahead for 'Where is my order?': 36 to 21", () => {
    const { totals } = scoreOptions(spec, defaultWeights(spec));
    expect(totals).toEqual({ workflow: 36, agent: 21 });
    expect(lead(defaultWeights(spec))).toEqual({ leaders: ["workflow"], tie: false, margin: 15 });
  });

  it("handles the minimum and maximum weights", () => {
    expect(scoreOptions(spec, all(1)).totals).toEqual({ workflow: 14, agent: 11 });
    expect(scoreOptions(spec, all(3)).totals).toEqual({ workflow: 42, agent: 33 });
    expect(maxTotal(spec)).toBe(60);
  });

  it("backs every Try this claim", () => {
    const newCases = { ...defaultWeights(spec), "new-cases": 3 };
    expect(scoreOptions(spec, newCases).totals).toEqual({ workflow: 38, agent: 31 });

    const openEnded = { ...newCases, predictability: 1, "low-cost": 1 };
    expect(scoreOptions(spec, openEnded).totals).toEqual({ workflow: 24, agent: 25 });
    expect(lead(openEnded)).toEqual({ leaders: ["agent"], tie: false, margin: 1 });

    expect(lead(all(1))).toEqual({ leaders: ["workflow"], tie: false, margin: 3 });
  });

  it("lets the agent win by the most when only new cases matter", () => {
    const onlyNew = { ...all(1), "new-cases": 3 };
    expect(scoreOptions(spec, onlyNew).totals).toEqual({ workflow: 16, agent: 21 });
  });

  it("says in words what changed", () => {
    const start = defaultWeights(spec);
    expect(describeChange(spec, start, { ...start, "new-cases": 3 })).toBe(
      "You raised Handles new cases from 1 (nice to have) to 3 (very important). That moved Fixed workflow +2 points, Agent +10 points. Fixed workflow still leads, now by 7 points."
    );
    const before = { ...start, "new-cases": 3, predictability: 1 };
    expect(describeChange(spec, before, { ...before, "low-cost": 1 })).toMatch(/Agent leads by 1 point\. The result changed\.$/);
  });
});
