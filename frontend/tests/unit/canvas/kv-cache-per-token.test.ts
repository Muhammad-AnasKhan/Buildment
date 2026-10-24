import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describeKvChange, kvBytesPerChat, kvBytesPerToken, kvCachePerToken, kvResult } from "@buildment/learning-ui/canvas/kv-cache-per-token/data";

const start = defaultValues(kvCachePerToken);
const values = (r: ReturnType<typeof kvCachePerToken.compute>) => r.stats.map((s) => s.value);

describe("kv cache per token", () => {
  it("starts at the running example: 128 KiB per token and 4.29 GB for a 32,768-token chat", () => {
    expect(start).toEqual({ layers: 32, kvHeads: 8, headSize: 128, bytesPerValue: 2 });
    const r = kvResult(start);
    expect(r.perTokenBytes).toBe(131_072);
    expect(r.perTokenKiB).toBe(128);
    expect(r.chatBytes).toBe(4_294_967_296);
    expect(kvCachePerToken.compute(start).stats.map((s) => [s.value, s.detail])).toEqual([
      ["128 KiB", "131,072 bytes"],
      ["4.29 GB", "one sequence, KV cache only"],
      ["4 times smaller", "than 32 KV heads at these settings"],
    ]);
    expect(kvCachePerToken.compute(start).bars!.map((b) => b.display)).toEqual(["4.29 GB", "17.18 GB", "0.54 GB"]);
  });

  it("matches the pack's multi-head and one-head figures", () => {
    expect(kvBytesPerToken({ layers: 32, kvHeads: 32, headSize: 128, bytesPerValue: 2 }) / 1024).toBe(512);
    expect(kvBytesPerToken({ layers: 32, kvHeads: 1, headSize: 128, bytesPerValue: 2 }) / 1024).toBe(16);
    expect(kvBytesPerChat({ layers: 32, kvHeads: 8, headSize: 128, bytesPerValue: 2 })).toBe(4_294_967_296);
  });

  it("at the minimums the cache is 1 KiB per token and 32 times smaller than 32 KV heads", () => {
    const min = { layers: 8, kvHeads: 1, headSize: 64, bytesPerValue: 1 };
    const result = kvCachePerToken.compute(min);
    expect(values(result)).toEqual(["1 KiB", "0.034 GB", "32 times smaller"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["0.034 GB", "1.07 GB", "0.034 GB"]);
  });

  it("at the maximums the cache is 5,120 KiB per token and 171.80 GB per chat", () => {
    const max = { layers: 80, kvHeads: 64, headSize: 256, bytesPerValue: 2 };
    const result = kvCachePerToken.compute(max);
    expect(values(result)).toEqual(["5,120 KiB", "171.80 GB", "2 times larger"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["171.80 GB", "85.90 GB", "2.68 GB"]);
  });

  it("says the same size at 32 KV heads and never shows NaN for bad input", () => {
    expect(values(kvCachePerToken.compute({ ...start, kvHeads: 32 }))).toEqual(["512 KiB", "17.18 GB", "About the same"]);
    const bad = kvCachePerToken.compute({ layers: Number.NaN, kvHeads: Number.POSITIVE_INFINITY, headSize: -1, bytesPerValue: 0 });
    expect(JSON.stringify(bad)).not.toMatch(/NaN|Infinity|undefined/);
    expect(JSON.stringify(kvCachePerToken.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("keeps every label within 28 characters", () => {
    for (const input of kvCachePerToken.inputs) expect(input.label.length).toBeLessThanOrEqual(28);
  });

  it("explains doubling the KV heads in words", () => {
    expect(describeKvChange(start, { ...start, kvHeads: 16 })).toBe(
      "Going from 8 to 16: doubling the number of KV heads doubles the cache, from 128 KiB to 256 KiB per token, so one 32,768-token chat goes from 4.29 GB to 8.59 GB. The size is a plain product of its parts, so each part scales it directly.",
    );
  });

  it("explains FP8 and a no-change move in words", () => {
    expect(describeKvChange(start, { ...start, bytesPerValue: 1 })).toBe(
      "Going from 2 to 1: halving the bytes per value halves the cache, from 128 KiB to 64 KiB per token, so one 32,768-token chat goes from 4.29 GB to 2.15 GB. Every stored number takes that many bytes.",
    );
    expect(describeKvChange(start, start)).toMatch(/^Nothing changed/);
  });

  it("keeps the try-this numbers true", () => {
    expect(values(kvCachePerToken.compute({ ...start, kvHeads: 16 })).slice(0, 2)).toEqual(["256 KiB", "8.59 GB"]);
    expect(values(kvCachePerToken.compute({ ...start, bytesPerValue: 1 })).slice(0, 2)).toEqual(["64 KiB", "2.15 GB"]);
  });
});
