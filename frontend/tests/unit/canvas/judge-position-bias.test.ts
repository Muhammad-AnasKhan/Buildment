import { describe, expect, it } from "vitest";
import { judgePositionBias } from "@/canvas/judge-position-bias/data";
import { describeJudgeChange, firstPositionRate, formatPercent, judgeRuns } from "@/canvas/judge-position-bias/model";
import { defaultValues } from "@/canvas/renderers/slider/model";

describe("judge position bias", () => {
  it("starts at Karim's runs: 72% with B first, 52% with B second, average 62%", () => {
    expect(judgeRuns(62, 10)).toEqual({ trueRate: 62, bias: 10, bFirst: 72, bSecond: 52, average: 62, gap: 0, clipped: null });
    const result = judgePositionBias.compute(defaultValues(judgePositionBias));
    expect(result.stats.map((s) => s.value)).toEqual(["72%", "52%", "62%"]);
    expect(result.bars?.map((b) => b.display)).toEqual(["72%", "52%", "62%", "62%"]);
    expect(result.bars?.[2]?.tone).toBe("good");
  });

  it("models the first-position rate as the true rate plus the bias, clamped to 0 to 100", () => {
    expect(firstPositionRate(62, 10)).toBe(72);
    expect(firstPositionRate(95, 10)).toBe(100);
    expect(firstPositionRate(-5, 0)).toBe(0);
    expect(firstPositionRate(Number.NaN, 10)).toBe(0);
  });

  it("shows the true rate in both orders at the minimums", () => {
    expect(judgeRuns(0, 0)).toMatchObject({ bFirst: 0, bSecond: 0, average: 0, gap: 0, clipped: null });
    expect(judgeRuns(62, 0)).toMatchObject({ bFirst: 62, bSecond: 62, average: 62 });
  });

  it("cancels any bonus by averaging while neither run hits a limit", () => {
    for (let bias = 0; bias <= 40; bias += 1) {
      for (let trueRate = bias; trueRate <= 100 - bias; trueRate += 1) {
        const r = judgeRuns(trueRate, bias);
        expect(r.average, `${trueRate} ${bias}`).toBe(trueRate);
        expect(r.bFirst - r.bSecond).toBe(2 * bias);
      }
    }
    expect(judgeRuns(62, 30)).toMatchObject({ bFirst: 92, bSecond: 32, average: 62 });
    expect(judgeRuns(50, 10)).toMatchObject({ bFirst: 60, bSecond: 40, average: 50 });
  });

  it("drifts from the true rate when a run hits a limit, at the maximums and near 0", () => {
    expect(judgeRuns(95, 10)).toMatchObject({ bFirst: 100, bSecond: 85, average: 92.5, gap: -2.5, clipped: "b-first" });
    expect(formatPercent(judgeRuns(95, 10).average)).toBe("92.5%");
    expect(judgeRuns(100, 40)).toMatchObject({ bFirst: 100, bSecond: 60, average: 80, gap: -20, clipped: "b-first" });
    expect(judgeRuns(5, 20)).toMatchObject({ bFirst: 25, bSecond: 0, average: 12.5, gap: 7.5, clipped: "a-first" });
    expect(judgePositionBias.compute({ trueRate: 95, bias: 10 }).bars?.[2]?.tone).toBe("warn");
  });

  it("says what changed and why", () => {
    expect(describeJudgeChange({ trueRate: 62, bias: 10 }, { trueRate: 62, bias: 30 })).toBe(
      "The bonus for going first went from 10 points to 30 points. B now wins 92% when shown first and 32% when shown second, a gap of 60 points. The average, 62%, equals the true rate, because the bonus goes to B in one order and to A in the other, so it cancels.",
    );
    expect(describeJudgeChange({ trueRate: 62, bias: 10 }, { trueRate: 95, bias: 10 })).toBe(
      "B's true win rate went from 62% to 95%. B now wins 100% when shown first and 85% when shown second, a gap of 15 points. The average, 92.5%, misses the true 95% by 2.5 points, because the run with B first hit 100% and part of the bonus was cut off.",
    );
    expect(describeJudgeChange({ trueRate: 62, bias: 10 }, { trueRate: 62, bias: 0 })).toMatch(/With no bonus, both orders show the true rate of 62%/);
  });

  it("gives finite stats, bars and sentences at every corner of the inputs", () => {
    const start = defaultValues(judgePositionBias);
    const corners = [start, ...judgePositionBias.inputs.flatMap((input) => [{ ...start, [input.id]: input.min }, { ...start, [input.id]: input.max }])];
    corners.push(Object.fromEntries(judgePositionBias.inputs.map((input) => [input.id, input.min])));
    corners.push(Object.fromEntries(judgePositionBias.inputs.map((input) => [input.id, input.max])));
    for (const values of corners) {
      const result = judgePositionBias.compute(values);
      expect(JSON.stringify(result.stats)).not.toMatch(/NaN|Infinity|undefined/);
      for (const bar of result.bars ?? []) {
        expect(Number.isFinite(bar.value) && bar.value >= 0, bar.label).toBe(true);
        expect(bar.display).not.toMatch(/NaN|Infinity|undefined/);
      }
      expect(judgePositionBias.describeChange(start, values)).not.toMatch(/NaN|Infinity|undefined/);
    }
  });
});
