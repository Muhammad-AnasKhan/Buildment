import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describeTokenCostChange, llmTokenCost, tokenCost } from "@buildment/learning-ui/canvas/llm-token-cost/data";

const start = defaultValues(llmTokenCost);

describe("llm token cost", () => {
  it("starts at Sara's after request: 7,650 input tokens, $0.00905 and $2,715 a month", () => {
    expect(start).toEqual({ chunks: 10, history: 3_000, output: 350 });
    const r = tokenCost(start);
    expect(r.inputTokens).toBe(7_650);
    expect(r.perRequest).toBeCloseTo(0.00905, 10);
    expect(r.monthly).toBeCloseTo(2_715, 6);
    expect(r.parts.fixed).toBeCloseTo(195, 6);
    expect(r.parts.history).toBeCloseTo(900, 6);
    expect(r.parts.chunks).toBeCloseTo(1_200, 6);
    expect(r.parts.output).toBeCloseTo(420, 6);
    expect(llmTokenCost.compute(start).stats.map((s) => s.value)).toEqual(["$0.00905", "$2,715", "85%"]);
  });

  it("matches the chapter's before request: 3 chunks, 400 history, 250 out", () => {
    const r = tokenCost({ chunks: 3, history: 400, output: 250 });
    expect(r.inputTokens).toBe(2_250);
    expect(r.monthly).toBeCloseTo(975, 6);
  });

  it("at the minimums only the system prompt and question are left", () => {
    const result = llmTokenCost.compute({ chunks: 0, history: 0, output: 50 });
    expect(result.stats.map((s) => s.value)).toEqual(["$0.00085", "$255", "76%"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["$195", "$0", "$0", "$60"]);
  });

  it("at the maximums input still dominates", () => {
    const r = tokenCost({ chunks: 20, history: 8_000, output: 1_000 });
    expect(r.inputTokens).toBe(16_650);
    expect(r.monthly).toBeCloseTo(6_195, 6);
    expect(Math.round(r.inputShare * 100)).toBe(81);
  });

  it("with no context, output becomes the main cost", () => {
    const result = llmTokenCost.compute({ chunks: 0, history: 0, output: 350 });
    expect(result.stats[2]).toMatchObject({ value: "32%", detail: "output is the main cost" });
  });

  it("falls back on non-numbers and never shows NaN", () => {
    const r = tokenCost({ chunks: Number.NaN, history: Number.POSITIVE_INFINITY, output: -5 });
    expect(r.inputTokens).toBe(7_650);
    expect(r.outputTokens).toBe(0);
    expect(JSON.stringify(llmTokenCost.compute({}))).not.toMatch(/NaN|Infinity/);
  });

  it("explains a longer answer in words", () => {
    expect(describeTokenCostChange(start, { ...start, output: 700 })).toBe(
      "Changing the answer length from 350 to 700 tokens added $420 a month. Each output token costs 4 times an input token here, yet input is still 73% of the cost, because there is far more of it.",
    );
  });

  it("explains fewer chunks in words", () => {
    expect(describeTokenCostChange(start, { ...start, chunks: 5 })).toBe(
      "Going from 10 to 5 chunks removed 2,000 input tokens on every request and saved $600 a month. Input is now 80% of the cost.",
    );
    expect(describeTokenCostChange(start, start)).toMatch(/^Nothing changed/);
  });

  it("keeps the try-this numbers true", () => {
    expect(llmTokenCost.compute({ ...start, output: 700 }).stats.map((s) => s.value)).toEqual(["$0.01045", "$3,135", "73%"]);
    expect(Math.round((1 - tokenCost({ chunks: 0, history: 0, output: 350 }).inputShare) * 100)).toBe(68);
  });
});
