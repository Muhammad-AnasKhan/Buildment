import { describe, expect, it } from "vitest";
import {
  compareTemptations,
  computeTemptations,
  describeTemptationChange,
  fewerTemptations,
  giveInsPerWeek,
  resistanceToMatchHalving,
} from "@buildment/learning-ui/canvas/fewer-temptations/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(fewerTemptations);

describe("fewer-temptations model", () => {
  it("starts with chapter 4.2's count: 8 a night, 50% resisted, 28 give-ins a week", () => {
    expect(start).toEqual({ perDay: 8, resistedPercent: 50 });
    expect(giveInsPerWeek({ perDay: 8, resistedPercent: 50 })).toBe(28);
    expect(computeTemptations(start).stats.map((s) => s.value)).toEqual(["28", "14", "75%"]);
  });

  it("matches the 'try this' values: halving gives 14, ten points more gives 22.4", () => {
    const c = compareTemptations({ perDay: 8, resistedPercent: 50 });
    expect(c.halfTemptations).toBe(14);
    expect(c.moreResistance).toBeCloseTo(22.4);
    expect(c.moreResistedPercent).toBe(60);
    expect(giveInsPerWeek({ perDay: 4, resistedPercent: 50 })).toBe(14);
  });

  it("shows the resistance that matches halving: 75% at 50%, and it gives the same give-ins", () => {
    expect(resistanceToMatchHalving(50)).toBe(75);
    expect(resistanceToMatchHalving(0)).toBe(50);
    expect(resistanceToMatchHalving(90)).toBe(95);
    expect(giveInsPerWeek({ perDay: 8, resistedPercent: 75 })).toBe(14);
    expect(computeTemptations({ perDay: 8, resistedPercent: 55 }).stats[2]!.value).toBe("77.5%");
  });

  it("halving and ten more points cut the same at 80% resisted", () => {
    const c = compareTemptations({ perDay: 8, resistedPercent: 80 });
    expect(c.halfTemptations).toBeCloseTo(5.6);
    expect(c.moreResistance).toBeCloseTo(5.6);
  });

  it("handles the edges: no temptations, no resistance, and the 90% maximum capped at 100", () => {
    expect(giveInsPerWeek({ perDay: 0, resistedPercent: 50 })).toBe(0);
    expect(giveInsPerWeek({ perDay: 20, resistedPercent: 0 })).toBe(140);
    const top = compareTemptations({ perDay: 20, resistedPercent: 90 });
    expect(top.moreResistedPercent).toBe(100);
    expect(top.moreResistance).toBe(0);
    expect(top.halfTemptations).toBeCloseTo(7);
    expect(computeTemptations({ perDay: 0, resistedPercent: 0 }).stats[0]!.value).toBe("0");
  });

  it("describes a change in words", () => {
    expect(describeTemptationChange(start, { ...start, perDay: 4 })).toBe(
      "Changing temptations from 8 to 4 a day: give-ins a week falls from about 28 to about 14. Halving the temptations still cuts more than resisting 10 points more. Matching halving by resisting alone would take 75%.",
    );
    expect(describeTemptationChange(start, { ...start, resistedPercent: 80 })).toBe(
      "Changing resistance from 50% to 80%: give-ins a week falls from about 28 to about 11. Here, halving the temptations and resisting 10 points more cut about the same. Matching halving by resisting alone would take 90%.",
    );
    expect(describeTemptationChange(start, { ...start, resistedPercent: 90 })).toBe(
      "Changing resistance from 50% to 90%: give-ins a week falls from about 28 to about 6. At this high resistance, 10 points more would cut more than halving the temptations, but resisting this often, night after night, is the hard part. Matching halving by resisting alone would take 95%.",
    );
    expect(describeTemptationChange(start, start)).toBe("Nothing changed.");
  });
});
