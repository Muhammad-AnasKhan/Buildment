import { describe, expect, it } from "vitest";
import { describeChange, formatMetric, metricsAtK } from "@/canvas/retrieval-metrics-at-k/model";

describe("retrieval metrics at k", () => {
  it("starts at k = 3 with two of four relevant chunks found", () => {
    expect(metricsAtK(3)).toMatchObject({ k: 3, hits: 2, totalRelevant: 4, recall: 0.5, reciprocalRank: 0.5, firstRelevantRank: 2 });
    expect(formatMetric(metricsAtK(3).precision)).toBe("0.67");
  });

  it("has no relevant chunk at k = 1", () => {
    expect(metricsAtK(1)).toMatchObject({ hits: 0, recall: 0, precision: 0, reciprocalRank: 0, firstRelevantRank: null });
  });

  it("reaches full recall at k = 9 and keeps it at the maximum", () => {
    expect(metricsAtK(8).recall).toBe(0.75);
    expect(metricsAtK(9)).toMatchObject({ hits: 4, recall: 1 });
    expect(formatMetric(metricsAtK(9).precision)).toBe("0.44");
    expect(metricsAtK(10)).toMatchObject({ recall: 1, precision: 0.4, reciprocalRank: 0.5 });
  });

  it("never lowers recall as k grows", () => {
    for (let k = 1; k < 10; k += 1) {
      expect(metricsAtK(k + 1).recall).toBeGreaterThanOrEqual(metricsAtK(k).recall);
    }
  });

  it("clamps out-of-range input and falls back on non-numbers", () => {
    expect(metricsAtK(0).k).toBe(1);
    expect(metricsAtK(42).k).toBe(10);
    expect(metricsAtK(Number.NaN).k).toBe(3);
  });

  it("explains the change in words", () => {
    expect(describeChange(metricsAtK(3), metricsAtK(5))).toMatch(/not relevant, so recall stayed at 0.50 and precision fell to 0.40/);
    expect(describeChange(metricsAtK(1), metricsAtK(2))).toMatch(/found 1 more relevant chunk, so recall rose to 0.25/);
    expect(describeChange(metricsAtK(9), metricsAtK(8))).toMatch(/dropped 1 relevant chunk, so recall fell to 0.75/);
  });
});
