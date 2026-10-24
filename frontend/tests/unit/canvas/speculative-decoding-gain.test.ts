import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describeSpecChange, expectedTokens, speculativeDecodingGain, speculativeGain, walltimeFactor } from "@buildment/learning-ui/canvas/speculative-decoding-gain/data";

const start = defaultValues(speculativeDecodingGain);
const values = (v: Parameters<typeof speculativeDecodingGain.compute>[0]) => speculativeDecodingGain.compute(v).stats.map((s) => s.value);

describe("speculative decoding gain", () => {
  it("starts at a = 0.80, g = 4, c = 0.05: 3.36 tokens per step and a factor of 2.80", () => {
    expect(start).toEqual({ acceptance: 0.8, drafts: 4, cost: 0.05 });
    expect(expectedTokens(0.8, 4)).toBeCloseTo(3.3616, 10);
    expect(walltimeFactor(0.8, 4, 0.05)).toBeCloseTo(2.8013, 4);
    expect(values(start)).toEqual(["3.36", "2.80 times", "Faster"]);
    expect(speculativeDecodingGain.compute(start).bars!.map((b) => b.display)).toEqual(["1.00", "2.80"]);
  });

  it("at the minimums it is still faster: 1.50 tokens per step, factor 1.49", () => {
    expect(values({ acceptance: 0.5, drafts: 1, cost: 0.01 })).toEqual(["1.50", "1.49 times", "Faster"]);
  });

  it("at the maximums an expensive draft cuts the gain: 8.62 tokens, factor 1.44", () => {
    expect(values({ acceptance: 0.95, drafts: 10, cost: 0.5 })).toEqual(["8.62", "1.44 times", "Faster"]);
  });

  it("is slower when the draft is poor and costly, and about the same at the break-even point", () => {
    expect(values({ acceptance: 0.5, drafts: 10, cost: 0.5 })).toEqual(["2.00", "0.33 times", "Slower"]);
    expect(speculativeDecodingGain.compute({ acceptance: 0.5, drafts: 10, cost: 0.5 }).bars![1].tone).toBe("bad");
    expect(values({ acceptance: 0.5, drafts: 1, cost: 0.5 })).toEqual(["1.50", "1.00 times", "About the same"]);
  });

  it("stays finite at acceptance 1 and for bad input", () => {
    expect(expectedTokens(1, 4)).toBe(5);
    expect(speculativeGain({ acceptance: 1, drafts: 4, cost: 0.05 }).tokens).toBe(5);
    expect(JSON.stringify(speculativeDecodingGain.compute({ acceptance: Number.NaN, drafts: Number.POSITIVE_INFINITY, cost: -1 }))).not.toMatch(/NaN|Infinity|undefined/);
    expect(JSON.stringify(speculativeDecodingGain.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("keeps every label within 28 characters", () => {
    for (const input of speculativeDecodingGain.inputs) expect(input.label.length).toBeLessThanOrEqual(28);
  });

  it("explains a lower acceptance rate in words", () => {
    expect(describeSpecChange(start, { ...start, acceptance: 0.5 })).toBe(
      "Lowering the acceptance rate from 0.80 to 0.50 throws away more of each draft, so the draft costs the same but pays back less. Expected tokens per target step went from 3.36 to 1.94 and the walltime factor from 2.80 to 1.61, which is faster.",
    );
  });

  it("explains a costlier draft in words, and keeps the try-this numbers true", () => {
    expect(describeSpecChange(start, { ...start, cost: 0.5 })).toBe(
      "Raising the draft cost from 0.05 to 0.50 of a target step does not change the tokens kept per step, only the time spent drafting them. Expected tokens per target step went from 3.36 to 3.36 and the walltime factor from 2.80 to 1.12, which is faster.",
    );
    expect(describeSpecChange(start, start)).toMatch(/^Nothing changed/);
  });

  it("the second try-this reaches the Slower verdict: a = 0.50, g = 4, c = 0.40 gives 0.75", () => {
    const first = { ...start, acceptance: 0.5 };
    expect(values(first)).toEqual(["1.94", "1.61 times", "Faster"]);
    const slower = { ...first, cost: 0.4 };
    expect(expectedTokens(0.5, 4)).toBeCloseTo(1.9375, 10);
    expect(walltimeFactor(0.5, 4, 0.4)).toBeCloseTo(0.7452, 4);
    expect(values(slower)).toEqual(["1.94", "0.75 times", "Slower"]);
    expect(speculativeDecodingGain.compute(slower).bars![1].tone).toBe("bad");
    expect(speculativeDecodingGain.tryThis[1]).toBe(
      "Keep acceptance at 0.50 and 4 draft tokens, and raise the draft cost from 0.05 to 0.40. Tokens per step stay at 1.94 but the factor drops to 0.75 and the verdict turns to Slower, because each round now takes 2.60 target steps of time and yields only 1.94 tokens.",
    );
    expect(speculativeGain(slower).drafts * speculativeGain(slower).cost + 1).toBeCloseTo(2.6, 10);
    expect(describeSpecChange(first, slower)).toBe(
      "Raising the draft cost from 0.05 to 0.40 of a target step does not change the tokens kept per step, only the time spent drafting them. Expected tokens per target step went from 1.94 to 1.94 and the walltime factor from 1.61 to 0.75, which is slower.",
    );
  });

  it("the first try-this still holds, and the intro points at the prediction above", () => {
    expect(speculativeDecodingGain.tryThis[0]).toContain("from 3.36 to 1.94 and the factor from 2.80 to 1.61");
    expect(speculativeDecodingGain.intro).toContain("Make the prediction above first, then move one slider.");
    expect(speculativeDecodingGain.intro).not.toMatch(/predict the factor/i);
  });

  it("the chapter's transfer MCQ does not reuse the Try this numbers", () => {
    // Draft X: a = 0.70, c = 0.05. Draft Y: a = 0.90, c = 0.25. Both draft 4 tokens.
    expect(walltimeFactor(0.7, 4, 0.05)).toBeCloseTo(2.31, 2);
    expect(walltimeFactor(0.9, 4, 0.25)).toBeCloseTo(2.05, 2);
    expect(walltimeFactor(0.7, 4, 0.05)).toBeGreaterThan(walltimeFactor(0.9, 4, 0.25));
  });
});
