import { describe, expect, it } from "vitest";
import { ragTwoPaths } from "@buildment/learning-ui/canvas/rag-two-paths/data";
import { sequenceGeometry } from "@buildment/learning-ui/canvas/renderers/sequence/geometry";

describe("rag two paths", () => {
  it("has short lane names and labels that fit a phone", () => {
    expect(ragTwoPaths.actors.length).toBe(4);
    for (const actor of ragTwoPaths.actors) {
      expect(actor.name.length, actor.name).toBeLessThanOrEqual(8);
      expect((actor.sub ?? "").length, actor.sub).toBeLessThanOrEqual(10);
    }
    for (const layout of ["narrow", "wide"] as const) {
      const g = sequenceGeometry(ragTwoPaths, layout);
      ragTwoPaths.steps.forEach((step, i) => {
        expect(step.label.length, step.label).toBeLessThanOrEqual(18);
        expect(step.to).toBeLessThan(ragTwoPaths.actors.length);
        const { label } = g.arrow(step, i);
        const w = step.label.length * g.charW;
        const left = label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - w : label.x - w / 2;
        expect(left, `${layout} ${step.label}`).toBeGreaterThanOrEqual(0);
        expect(left + w, `${layout} ${step.label}`).toBeLessThanOrEqual(g.width);
      });
    }
  });

  it("runs the indexing path first and ends with the fix back on the indexing path", () => {
    expect(ragTwoPaths.steps.slice(0, 3).every((s) => s.from === 0)).toBe(true);
    expect(ragTwoPaths.steps[2]).toMatchObject({ tone: "warn", from: 0, to: 1 });
    expect(ragTwoPaths.steps[7]).toMatchObject({ tone: "bad", from: 3, to: 2 });
    expect(ragTwoPaths.steps.at(-1)).toMatchObject({ tone: "good", from: 0, to: 1 });
  });
});
