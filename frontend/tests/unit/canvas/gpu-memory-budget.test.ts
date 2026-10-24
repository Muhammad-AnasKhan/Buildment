import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describeBudgetChange, gpuMemoryBudget, memoryBudget } from "@buildment/learning-ui/canvas/gpu-memory-budget/data";

const start = defaultValues(gpuMemoryBudget);
const values = (v: Parameters<typeof gpuMemoryBudget.compute>[0]) => gpuMemoryBudget.compute(v).stats.map((s) => s.value);

describe("gpu memory budget", () => {
  it("starts at the running example: 85.90 GB needed, 55.94 GB left, out of memory by 29.96 GB, 13 users fit", () => {
    expect(start).toEqual({ users: 20, tokens: 32_768, bytesPerValue: 2, gpuGB: 80 });
    const b = memoryBudget(start);
    expect(b.neededBytes).toBe(85_899_345_920);
    expect(b.weightsGB.toFixed(2)).toBe("16.06");
    expect(b.availableGB.toFixed(2)).toBe("55.94");
    expect(b.gapGB.toFixed(2)).toBe("29.96");
    expect(b.fits).toBe(false);
    expect(b.maxUsers).toBe(13);
    expect(values(start)).toEqual(["85.90 GB vs 55.94 GB", "Out of memory by 29.96 GB", "13"]);
    const bars = gpuMemoryBudget.compute(start).bars!;
    expect(bars.map((x) => [x.label, x.display, x.tone])).toEqual([
      ["Weights (16-bit)", "16.06 GB", undefined],
      ["KV needed", "85.90 GB", "bad"],
      ["KV available", "55.94 GB", undefined],
    ]);
  });

  it("with FP8 KV the same chats fit and 26 users fit", () => {
    const fp8 = { ...start, bytesPerValue: 1 };
    expect(values(fp8)).toEqual(["42.95 GB vs 55.94 GB", "Fits", "26"]);
    expect(gpuMemoryBudget.compute(fp8).bars![1].tone).toBeUndefined();
  });

  it("at the minimums one short chat fits easily on a 24 GB GPU", () => {
    const min = { users: 1, tokens: 1_024, bytesPerValue: 1, gpuGB: 24 };
    expect(values(min)).toEqual(["0.07 GB vs 5.54 GB", "Fits", "82"]);
  });

  it("at the maximums 64 users of 131,072 tokens are far out of memory on 192 GB", () => {
    const max = { users: 64, tokens: 131_072, bytesPerValue: 2, gpuGB: 192 };
    expect(values(max)).toEqual(["1099.51 GB vs 156.74 GB", "Out of memory by 942.77 GB", "9"]);
  });

  it("shows zero users fit when one user does not fit, and stays finite", () => {
    const tight = { users: 1, tokens: 131_072, bytesPerValue: 2, gpuGB: 24 };
    expect(values(tight)).toEqual(["17.18 GB vs 5.54 GB", "Out of memory by 11.64 GB", "0"]);
    expect(JSON.stringify(gpuMemoryBudget.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
    expect(memoryBudget({ ...start, gpuGB: Number.NaN }).availableGB).toBeCloseTo(55.94, 2);
  });

  it("keeps every label within 28 characters", () => {
    for (const input of gpuMemoryBudget.inputs) expect(input.label.length).toBeLessThanOrEqual(28);
  });

  it("explains fewer users in words", () => {
    expect(describeBudgetChange(start, { ...start, users: 10 })).toBe(
      "Going from 20 to 10 users changed the KV memory needed from 85.90 GB to 42.95 GB, because every user holds a full context. It fits, with 12.99 GB to spare, and at most 13 users fit at this context.",
    );
  });

  it("explains FP8 and a bigger GPU in words", () => {
    expect(describeBudgetChange(start, { ...start, bytesPerValue: 1 })).toBe(
      "Going from 2 to 1 bytes per KV value changed the cache per token from 131,072 to 65,536 bytes, so the KV memory needed went from 85.90 GB to 42.95 GB. It fits, with 12.99 GB to spare, and at most 26 users fit at this context.",
    );
    expect(describeBudgetChange(start, { ...start, gpuGB: 96 })).toMatch(
      /^Going from 80 GB to 96 GB of GPU memory changed the memory left for the KV cache from 55.94 GB to 70.34 GB.* It is out of memory by 15.56 GB, and at most 16 users fit at this context\.$/,
    );
    expect(describeBudgetChange(start, start)).toMatch(/^Nothing changed/);
  });
});
