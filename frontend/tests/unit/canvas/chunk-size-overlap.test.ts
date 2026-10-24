import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { chunkLengths, chunkSizeOverlap, chunking, cutShare, describeChunkingChange } from "@buildment/learning-ui/canvas/chunk-size-overlap/data";

const start = defaultValues(chunkSizeOverlap);

describe("chunk size and overlap", () => {
  it("starts at the chapter's example: 4 chunks, 1,050 words, a 40-word fact never cut", () => {
    expect(start).toEqual({ size: 300, overlap: 50, fact: 40 });
    expect(chunkLengths(900, 300, 250)).toEqual([300, 300, 300, 150]);
    const result = chunkSizeOverlap.compute(start);
    expect(result.stats.map((s) => s.value)).toEqual(["4", "+17%", "0%"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["900 words", "1,050 words"]);
  });

  it("without overlap cuts 39 of every 300 placements of a 40-word fact", () => {
    const c = chunking({ ...start, overlap: 0 });
    expect(c.chunks).toBe(3);
    expect(c.storedWords).toBe(900);
    expect(c.cutShare).toBeCloseTo(39 / 300, 12);
    expect(chunkSizeOverlap.compute({ ...start, overlap: 0 }).stats[2]!.value).toBe("13%");
  });

  it("protects only facts no longer than the overlap", () => {
    expect(cutShare(50, 50, 250)).toBe(0);
    expect(cutShare(60, 50, 250)).toBeCloseTo(9 / 250, 12);
    expect(chunking({ ...start, fact: 80 }).cutShare).toBeCloseTo(29 / 250, 12);
    expect(chunkSizeOverlap.compute({ ...start, fact: 80 }).stats[2]!.value).toBe("12%");
  });

  it("at the minimums: 100-word chunks, no overlap, a 10-word fact", () => {
    const c = chunking({ size: 100, overlap: 0, fact: 10 });
    expect(c.chunks).toBe(9);
    expect(c.storedWords).toBe(900);
    expect(c.cutShare).toBeCloseTo(9 / 100, 12);
  });

  it("at the maximums: 600-word chunks, 200 overlap, a 150-word fact", () => {
    const c = chunking({ size: 600, overlap: 200, fact: 150 });
    expect(chunkLengths(900, 600, 400)).toEqual([600, 500]);
    expect(c.chunks).toBe(2);
    expect(c.storedWords).toBe(1_100);
    expect(c.cutShare).toBe(0);
  });

  it("caps the overlap 50 words below the chunk size, so chunks always move forward", () => {
    const c = chunking({ size: 100, overlap: 200, fact: 150 });
    expect(c).toMatchObject({ overlap: 50, capped: true, stride: 50, chunks: 17 });
    expect(c.cutShare).toBe(1);
    expect(chunkSizeOverlap.compute({ size: 100, overlap: 200, fact: 150 }).stats[2]!.detail).toMatch(/capped at 50/);
  });

  it("falls back on non-numbers", () => {
    expect(chunking({ size: Number.NaN, overlap: Number.POSITIVE_INFINITY })).toMatchObject({ size: 300, overlap: 50, factWords: 40 });
  });

  it("explains dropping the overlap in words", () => {
    expect(describeChunkingChange(start, { ...start, overlap: 0 })).toBe(
      "You changed the overlap from 50 to 0 words. Now 3 chunks store 900 words (+0%), and a 40-word fact is longer than the 0-word overlap, so 13% of the places it could start still cross a cut.",
    );
  });

  it("explains a longer fact in words", () => {
    expect(describeChunkingChange(start, { ...start, fact: 80 })).toBe(
      "You changed the fact length from 40 to 80 words. Now 4 chunks store 1,050 words (+17%), and an 80-word fact is longer than the 50-word overlap, so 12% of the places it could start still cross a cut.",
    );
    expect(describeChunkingChange(start, start)).toMatch(/^Nothing changed/);
  });
});
