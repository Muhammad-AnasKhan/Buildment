import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describeBudgetChange, gpuMemoryBudget, memoryBudget } from "@buildment/learning-ui/canvas/gpu-memory-budget/data";

const start = defaultValues(gpuMemoryBudget);
const values = (v: Parameters<typeof gpuMemoryBudget.compute>[0]) => gpuMemoryBudget.compute(v).stats.map((s) => s.value);

describe("gpu memory budget", () => {
  it("starts at the running example: 85.90 GB needed, 55.94 GB left, out of memory by 29.96 GB, 426,784 tokens of cache space, 13 chats of this length", () => {
    expect(start).toEqual({ users: 20, tokens: 32_768, bytesPerValue: 2, gpuGB: 80 });
    const b = memoryBudget(start);
    expect(b.neededBytes).toBe(85_899_345_920);
    expect(b.weightsGB.toFixed(2)).toBe("16.06");
    expect(b.availableGB.toFixed(2)).toBe("55.94");
    expect(b.gapGB.toFixed(2)).toBe("29.96");
    expect(b.fits).toBe(false);
    expect(b.maxUsers).toBe(13);
    expect(b.poolTokens).toBe(426_784);
    expect(values(start)).toEqual(["85.90 GB vs 55.94 GB", "Out of memory by 29.96 GB", "426,784"]);
    const stats = gpuMemoryBudget.compute(start).stats;
    expect(stats.map((x) => x.label)).toEqual(["KV needed vs available", "Verdict", "Cache space in tokens"]);
    expect(stats[2].detail).toBe("13 chats of this length");
    const bars = gpuMemoryBudget.compute(start).bars!;
    expect(bars.map((x) => [x.label, x.display, x.tone])).toEqual([
      ["Weights (16-bit)", "16.06 GB", undefined],
      ["KV needed", "85.90 GB", "bad"],
      ["KV available", "55.94 GB", undefined],
    ]);
  });

  it("with FP8 KV the same chats fit, the cache space doubles and 26 chats fit", () => {
    const fp8 = { ...start, bytesPerValue: 1 };
    expect(values(fp8)).toEqual(["42.95 GB vs 55.94 GB", "Fits", "853,568"]);
    expect(gpuMemoryBudget.compute(fp8).stats[2].detail).toBe("26 chats of this length");
    expect(gpuMemoryBudget.compute(fp8).bars![1].tone).toBeUndefined();
  });

  it("at the minimums one short chat fits easily on a 24 GB GPU", () => {
    const min = { users: 1, tokens: 1_024, bytesPerValue: 1, gpuGB: 24 };
    expect(values(min)).toEqual(["0.07 GB vs 5.54 GB", "Fits", "84,525"]);
    expect(gpuMemoryBudget.compute(min).stats[2].detail).toBe("82 chats of this length");
  });

  it("at the maximums 64 users of 131,072 tokens are far out of memory on 192 GB", () => {
    const max = { users: 64, tokens: 131_072, bytesPerValue: 2, gpuGB: 192 };
    expect(values(max)).toEqual(["1099.51 GB vs 156.74 GB", "Out of memory by 942.77 GB", "1,195,827"]);
  });

  it("shows zero users fit when one user does not fit, and stays finite", () => {
    const tight = { users: 1, tokens: 131_072, bytesPerValue: 2, gpuGB: 24 };
    expect(values(tight)).toEqual(["17.18 GB vs 5.54 GB", "Out of memory by 11.64 GB", "42,262"]);
    expect(gpuMemoryBudget.compute(tight).stats[2].detail).toBe("0 chats of this length");
    expect(gpuMemoryBudget.compute({ ...tight, tokens: 32_768 }).stats[2].detail).toBe("1 chat of this length");
    expect(JSON.stringify(gpuMemoryBudget.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
    expect(memoryBudget({ ...start, gpuGB: Number.NaN }).availableGB).toBeCloseTo(55.94, 2);
  });

  it("keeps every label within 28 characters", () => {
    for (const input of gpuMemoryBudget.inputs) expect(input.label.length).toBeLessThanOrEqual(28);
  });

  it("explains fewer users in words", () => {
    expect(describeBudgetChange(start, { ...start, users: 10 })).toBe(
      "Going from 20 to 10 users changed the KV memory needed from 85.90 GB to 42.95 GB, because every user holds a full context. It fits, with 12.99 GB to spare. The cache space holds 426,784 tokens, which is 13 chats of this length.",
    );
  });

  it("explains FP8 and a bigger GPU in words", () => {
    expect(describeBudgetChange(start, { ...start, bytesPerValue: 1 })).toBe(
      "Going from 2 to 1 bytes per KV value changed the cache per token from 131,072 to 65,536 bytes, so the KV memory needed went from 85.90 GB to 42.95 GB. It fits, with 12.99 GB to spare. The cache space holds 853,568 tokens, which is 26 chats of this length.",
    );
    expect(describeBudgetChange(start, { ...start, gpuGB: 96 })).toMatch(
      /^Going from 80 GB to 96 GB of GPU memory changed the memory left for the KV cache from 55.94 GB to 70.34 GB.* It is out of memory by 15.56 GB\. The cache space holds 536,647 tokens, which is 16 chats of this length\.$/,
    );
    expect(describeBudgetChange(start, start)).toMatch(/^Nothing changed/);
  });

  it("keeps the try-this numbers true, tokens first", () => {
    const fp8 = gpuMemoryBudget.compute({ ...start, bytesPerValue: 1 });
    expect(fp8.stats.map((x) => x.value)).toEqual(["42.95 GB vs 55.94 GB", "Fits", "853,568"]);
    expect(fp8.stats[2].detail).toBe("26 chats of this length");
    expect(gpuMemoryBudget.tryThis[0]).toBe(
      "Set KV bytes per value to 1 (FP8). The cache needed halves to 42.95 GB, which fits in the 55.94 GB left. The cache space doubles to 853,568 tokens, which is 26 chats of this length.",
    );
    const bigger = gpuMemoryBudget.compute({ ...start, gpuGB: 96 });
    expect(bigger.stats.map((x) => x.value)).toEqual(["85.90 GB vs 70.34 GB", "Out of memory by 15.56 GB", "536,647"]);
    expect(bigger.stats[2].detail).toBe("16 chats of this length");
    expect(gpuMemoryBudget.tryThis[1]).toContain("536,647 tokens, which is 16 chats of this length");
    // The chapter's prediction: 160 GB without FP8 holds about 29 chats, not 26.
    const huge = gpuMemoryBudget.compute({ ...start, gpuGB: 160 });
    expect(huge.stats[2].detail).toBe("29 chats of this length");
    expect(huge.bars![2].display).toBe("127.94 GB");
  });

  it("shows tokens before chats and points at the prediction above", () => {
    const stat = gpuMemoryBudget.compute(start).stats[2];
    expect(stat.label).toBe("Cache space in tokens");
    expect(Number(stat.value.replace(/,/g, ""))).toBe(memoryBudget(start).poolTokens);
    expect(gpuMemoryBudget.compute(start).stats.some((x) => /most users/i.test(x.label))).toBe(false);
    expect(gpuMemoryBudget.intro).toContain("Make the prediction above first, then move one slider.");
    expect(gpuMemoryBudget.intro).not.toMatch(/predict whether/i);
  });
});
