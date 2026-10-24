import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { chance, describeSamplingChange, sampling, samplingTemperature } from "@buildment/learning-ui/canvas/sampling-temperature/data";

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

describe("sampling temperature", () => {
  it("starts at 0.9: bundle 68%, other 2%, two runs disagree 48%", () => {
    expect(defaultValues(samplingTemperature)).toEqual({ temperature: 0.9 });
    const result = samplingTemperature.compute({ temperature: 0.9 });
    expect(result.stats.map((s) => s.value)).toEqual(["68%", "2%", "48%"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["68%", "22%", "7%", "2%"]);
    expect(sum(sampling(0.9).probabilities)).toBeCloseTo(1, 12);
  });

  it("is plain softmax at temperature 1", () => {
    const p = sampling(1).probabilities;
    const z = Math.exp(3) + Math.exp(2) + Math.exp(1) + 1;
    expect(p[0]).toBeCloseTo(Math.exp(3) / z, 12);
    expect(p[3]).toBeCloseTo(1 / z, 12);
  });

  it("is greedy at the minimum and below 0.05, with no division by zero", () => {
    for (const t of [0, 0.01, 0.049]) {
      const s = sampling(t);
      expect(s.greedy).toBe(true);
      expect(s.probabilities).toEqual([1, 0, 0, 0]);
      expect(s.disagree).toBe(0);
    }
    expect(samplingTemperature.compute({ temperature: 0 }).stats.map((s) => s.value)).toEqual(["100%", "0%", "0%"]);
  });

  it("samples at 0.05 without overflow", () => {
    const s = sampling(0.05);
    expect(s.greedy).toBe(false);
    expect(s.probabilities.every(Number.isFinite)).toBe(true);
    expect(s.probabilities[0]).toBeGreaterThan(0.999);
    expect(chance(s.probabilities[3]!)).toBe("under 1%");
  });

  it("spreads choice at the maximum of 2", () => {
    expect(samplingTemperature.compute({ temperature: 2 }).stats.map((s) => s.value)).toEqual(["46%", "10%", "68%"]);
    expect(sum(sampling(2).probabilities)).toBeCloseTo(1, 12);
  });

  it("never lowers the top word's chance as the temperature falls", () => {
    for (let t = 2; t > 0.1; t -= 0.05) {
      expect(sampling(t - 0.05).probabilities[0]).toBeGreaterThanOrEqual(sampling(t).probabilities[0]!);
    }
  });

  it("falls back on non-numbers", () => {
    expect(sampling(Number.NaN).temperature).toBe(0.9);
    expect(sampling(-1).greedy).toBe(true);
  });

  it("explains a lower temperature in words", () => {
    expect(describeSamplingChange({ temperature: 0.9 }, { temperature: 0.2 })).toBe(
      "Lowering the temperature from 0.9 to 0.2 widened the gaps between the scores, so bundle rose from 68% to 99% and two runs now disagree 1% of the time.",
    );
  });

  it("explains a higher temperature and greedy in words", () => {
    expect(describeSamplingChange({ temperature: 0.9 }, { temperature: 2 })).toBe(
      "Raising the temperature from 0.9 to 2 shrank the gaps between the scores, so bundle fell from 68% to 46% and the unlikely other went from 2% to 10%.",
    );
    expect(describeSamplingChange({ temperature: 0.9 }, { temperature: 0 })).toMatch(/always takes the top word/);
  });
});
