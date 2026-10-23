import { describe, expect, it } from "vitest";
import { asyncConcurrencyLimit, computeBatch, describeBatchChange, runBatch } from "@/canvas/async-concurrency-limit/data";
import { defaultValues } from "@/canvas/renderers/slider/model";

const start = defaultValues(asyncConcurrencyLimit);

describe("async-concurrency-limit model", () => {
  it("matches the chapter 9.2 predict at the defaults: 10 calls, limit 3, 1 s each, about 4 s", () => {
    expect(start).toEqual({ calls: 10, limit: 3, seconds: 1, providerLimit: 5 });
    expect(runBatch({ calls: 10, limit: 3, seconds: 1, providerLimit: 5 })).toEqual({ totalSeconds: 4, waves: 4, peakSent: 3, rejected: 0 });
    const result = computeBatch(start);
    expect(result.stats.map((s) => s.value)).toEqual(["4.0 s", "3", "0"]);
    expect(result.bars?.map((b) => b.display)).toEqual(["10.0 s", "4.0 s", "1.0 s, 5 rejected"]);
  });

  it("handles the minimum: one call with a limit of 1", () => {
    expect(runBatch({ calls: 1, limit: 1, seconds: 0.5, providerLimit: 1 })).toEqual({ totalSeconds: 0.5, waves: 1, peakSent: 1, rejected: 0 });
  });

  it("handles the maximum: 60 calls, limit 20, 5 s, provider 20", () => {
    expect(runBatch({ calls: 60, limit: 20, seconds: 5, providerLimit: 20 })).toEqual({ totalSeconds: 15, waves: 3, peakSent: 20, rejected: 0 });
  });

  it("reproduces the 40 report job: 8 waves of 5, and 35 rejected one slot over the limit", () => {
    expect(runBatch({ calls: 40, limit: 5, seconds: 3, providerLimit: 5 })).toEqual({ totalSeconds: 24, waves: 8, peakSent: 5, rejected: 0 });
    expect(runBatch({ calls: 40, limit: 6, seconds: 3, providerLimit: 5 })).toEqual({ totalSeconds: 3, waves: 1, peakSent: 6, rejected: 35 });
  });

  it("rejects nothing when the batch is smaller than the provider limit, whatever the semaphore", () => {
    expect(runBatch({ calls: 4, limit: 20, seconds: 2, providerLimit: 5 }).rejected).toBe(0);
  });

  it("describes a change in words", () => {
    expect(describeBatchChange(start, { ...start, limit: 5 })).toBe(
      "Changing the semaphore limit gives 2 waves of up to 5 calls, 1.0 s each, so the total time fell from 4.0 s to 2.0 s.",
    );
    expect(describeBatchChange(start, { ...start, limit: 6 })).toBe(
      "Changing the semaphore limit lets 6 calls out at once, more than the provider's 5, so 5 calls are now rejected. The batch looks faster at 1.0 s only because most of it failed.",
    );
  });
});
