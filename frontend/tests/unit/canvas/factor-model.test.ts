import { describe, expect, it } from "vitest";
import {
  defaultWeights,
  describeChange,
  maxTotal,
  scoreOptions,
  snapWeight,
  standing,
} from "@/canvas/renderers/factor/model";
import { weightedMatrixTwoOffers as spec } from "@/canvas/weighted-matrix-two-offers/data";

const all = (w: number) => Object.fromEntries(spec.criteria.map((c) => [c.id, w]));

describe("weighted matrix model", () => {
  it("matches the chapter's worked example by default: 31 to 35", () => {
    const { totals, cells } = scoreOptions(spec, defaultWeights(spec));
    expect(totals).toEqual({ "offer-a": 31, "offer-b": 35 });
    expect(cells.pay!["offer-a"]).toEqual({ score: 5, weight: 3, points: 15 });
    expect(standing(spec, totals)).toEqual({ leaders: ["offer-b"], tie: false, margin: 4 });
  });

  it("gives the chapter's tie when power hours drops to 1", () => {
    const { totals } = scoreOptions(spec, { ...defaultWeights(spec), "power-hours": 1 });
    expect(totals).toEqual({ "offer-a": 27, "offer-b": 27 });
    expect(standing(spec, totals)).toEqual({ leaders: ["offer-a", "offer-b"], tie: true, margin: 0 });
  });

  it("handles the minimum and maximum weights", () => {
    expect(scoreOptions(spec, all(1)).totals).toEqual({ "offer-a": 12, "offer-b": 14 });
    expect(scoreOptions(spec, all(3)).totals).toEqual({ "offer-a": 36, "offer-b": 42 });
    expect(maxTotal(spec)).toBe(60);
  });

  it("backs every Try this claim", () => {
    const payOnly = { ...all(1), pay: 3 };
    expect(standing(spec, scoreOptions(spec, payOnly).totals)).toEqual({ leaders: ["offer-a"], tie: false, margin: 2 });
  });

  it("snaps a bad weight to an allowed level and never returns NaN", () => {
    expect(snapWeight(spec, 2.6)).toBe(3);
    expect(snapWeight(spec, -10)).toBe(1);
    expect(snapWeight(spec, Number.NaN)).toBe(1);
    const { totals } = scoreOptions(spec, { pay: Number.POSITIVE_INFINITY, "power-hours": 0 });
    for (const v of Object.values(totals)) expect(Number.isFinite(v)).toBe(true);
  });

  it("clamps missing or out-of-scale scores", () => {
    const broken = {
      ...spec,
      criteria: [{ id: "x", name: "X", weight: 2, scores: { "offer-a": 99 } }],
    };
    expect(scoreOptions(broken, defaultWeights(broken)).totals).toEqual({ "offer-a": 10, "offer-b": 2 });
  });
});

describe("describeChange", () => {
  const start = defaultWeights(spec);

  it("says nothing when nothing changed", () => {
    expect(describeChange(spec, start, start)).toBe("");
  });

  it("explains a change that makes a tie", () => {
    expect(describeChange(spec, start, { ...start, "power-hours": 1 })).toBe(
      "You lowered Power hours from 3 (very important) to 1 (nice to have). That moved Offer A -4 points, Offer B -8 points. Now it is a tie: Offer A and Offer B both have 27 points."
    );
  });

  it("says when the leader changes", () => {
    const before = { ...all(1), pay: 2 };
    const after = { ...all(1), pay: 3 };
    expect(describeChange(spec, before, after)).toBe(
      "You raised Pay from 2 (important) to 3 (very important). That moved Offer A +5 points, Offer B +3 points. Offer A leads by 2 points. The result changed."
    );
  });

  it("says when the leader holds", () => {
    expect(describeChange(spec, start, { ...start, learning: 3 })).toBe(
      "You raised Learning from 2 (important) to 3 (very important). That moved Offer A +2 points, Offer B +4 points. Offer B still leads, now by 6 points."
    );
  });

  it("summarises a reset of several weights", () => {
    expect(describeChange(spec, all(1), start)).toBe("You changed 4 weights. Offer B leads by 4 points.");
  });
});
