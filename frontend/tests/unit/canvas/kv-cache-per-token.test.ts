import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describeKvChange, kvBytesPerChat, kvBytesPerToken, kvCachePerToken, kvResult } from "@buildment/learning-ui/canvas/kv-cache-per-token/data";

const start = defaultValues(kvCachePerToken);
const values = (r: ReturnType<typeof kvCachePerToken.compute>) => r.stats.map((s) => s.value);

describe("kv cache per token", () => {
  it("starts at the running example: 128 KiB per token and 4.29 GB for a 32,768-token chat", () => {
    expect(start).toEqual({ layers: 32, kvHeads: 8, bytesPerValue: 2, chatTokens: 32_768 });
    expect(kvCachePerToken.inputs.map((i) => i.id)).toEqual(["layers", "kvHeads", "bytesPerValue", "chatTokens"]);
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

  it("has a Tokens in the chat slider from 1,024 to 131,072 in steps of 1,024, and no head size slider", () => {
    const tokens = kvCachePerToken.inputs.find((i) => i.id === "chatTokens")!;
    expect(tokens).toMatchObject({ label: "Tokens in the chat", min: 1_024, max: 131_072, step: 1_024, default: 32_768 });
    expect(kvCachePerToken.inputs.some((i) => i.id === "headSize")).toBe(false);
    expect(kvCachePerToken.inputs.length).toBeLessThanOrEqual(4);
    expect(kvCachePerToken.intro).toContain("head size stays fixed at 128");
  });

  it("at the minimums the cache is 2 KiB per token and a 1,024-token chat is 0.002 GB", () => {
    const min = { layers: 8, kvHeads: 1, bytesPerValue: 1, chatTokens: 1_024 };
    const result = kvCachePerToken.compute(min);
    expect(values(result)).toEqual(["2 KiB", "0.002 GB", "32 times smaller"]);
    expect(result.stats[1].label).toBe("One 1,024-token chat");
    expect(result.bars!.map((b) => b.display)).toEqual(["0.002 GB", "0.067 GB", "0.002 GB"]);
  });

  it("at the maximums the cache is 2,560 KiB per token and a 131,072-token chat is 343.60 GB", () => {
    const max = { layers: 80, kvHeads: 64, bytesPerValue: 2, chatTokens: 131_072 };
    const result = kvCachePerToken.compute(max);
    expect(values(result)).toEqual(["2,560 KiB", "343.60 GB", "2 times larger"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["343.60 GB", "171.80 GB", "5.37 GB"]);
  });

  it("the chat stat follows the Tokens in the chat slider and the per-token size does not", () => {
    const long = kvCachePerToken.compute({ ...start, chatTokens: 131_072 });
    expect(long.stats.map((s) => s.value)).toEqual(["128 KiB", "17.18 GB", "4 times smaller"]);
    expect(long.stats[1].label).toBe("One 131,072-token chat");
    expect(long.bars!.map((b) => b.display)).toEqual(["17.18 GB", "68.72 GB", "2.15 GB"]);
    const short = kvCachePerToken.compute({ ...start, chatTokens: 8_192 });
    expect(short.stats.map((s) => s.value).slice(0, 2)).toEqual(["128 KiB", "1.07 GB"]);
    expect(kvResult({ ...start, chatTokens: 1_024 }).chatBytes).toBe(1_024 * 131_072);
  });

  it("says the same size at 32 KV heads and never shows NaN for bad input", () => {
    expect(values(kvCachePerToken.compute({ ...start, kvHeads: 32 }))).toEqual(["512 KiB", "17.18 GB", "About the same"]);
    const bad = kvCachePerToken.compute({ layers: Number.NaN, kvHeads: Number.POSITIVE_INFINITY, chatTokens: -1, bytesPerValue: 0 });
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

  it("explains a longer chat in words: the chat grows, the size per token does not", () => {
    expect(describeKvChange(start, { ...start, chatTokens: 131_072 })).toBe(
      "Going from 32,768 to 131,072 tokens in the chat: multiplying the tokens by 4 multiplies the chat by 4, from 4.29 GB to 17.18 GB. The cache per token stays 128 KiB, because the tokens only say how many of them are held.",
    );
    expect(describeKvChange({ ...start, chatTokens: 65_536 }, start)).toMatch(/^Going from 65,536 to 32,768 tokens in the chat: halving the tokens halves the chat, from 8.59 GB to 4.29 GB\./);
    expect(describeKvChange(start, { ...start, kvHeads: 16, chatTokens: 65_536 })).toBe(
      "Several settings moved, so the chat is 4 times larger: from 128 KiB to 256 KiB per token, so one 65,536-token chat goes from 4.29 GB to 17.18 GB.",
    );
  });

  it("keeps the try-this numbers true", () => {
    expect(values(kvCachePerToken.compute({ ...start, kvHeads: 16 })).slice(0, 2)).toEqual(["256 KiB", "8.59 GB"]);
    expect(values(kvCachePerToken.compute({ ...start, bytesPerValue: 1 })).slice(0, 2)).toEqual(["64 KiB", "2.15 GB"]);
    expect(values(kvCachePerToken.compute({ ...start, chatTokens: 131_072 })).slice(0, 2)).toEqual(["128 KiB", "17.18 GB"]);
    expect(kvCachePerToken.tryThis).toHaveLength(3);
    expect(kvCachePerToken.tryThis[2]).toContain("from 4.29 GB to 17.18 GB");
    // The prediction in the chapter: 16 KV heads and 1 byte cancel back to 4.29 GB.
    expect(values(kvCachePerToken.compute({ ...start, kvHeads: 16, bytesPerValue: 1 })).slice(0, 2)).toEqual(["128 KiB", "4.29 GB"]);
  });

  it("points at the prediction above instead of asking its own", () => {
    expect(kvCachePerToken.intro).toContain("Make the prediction above first, then move one slider.");
    expect(kvCachePerToken.intro).not.toMatch(/predict how/i);
  });
});
