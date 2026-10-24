import { describe, expect, it } from "vitest";
import { computeRetries, describeRetryChange, retryBackoffJitter, retrySpread } from "@buildment/learning-ui/canvas/retry-backoff-jitter/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(retryBackoffJitter);

describe("retry-backoff-jitter model", () => {
  it("starts with the chapter 9.4 herd: 1,000 clients, 1 s, no jitter, all in one 100 ms", () => {
    expect(start).toEqual({ clients: 1000, baseSeconds: 1, jitterPercent: 0 });
    expect(retrySpread({ clients: 1000, baseSeconds: 1, jitterPercent: 0 })).toEqual({ spreadSeconds: 0, peak: 1000, averageWait: 1 });
    expect(computeRetries(start).stats.map((s) => s.value)).toEqual(["1,000", "0 ms", "1 s"]);
  });

  it("full jitter over 1 s puts about 100 retries in the busiest 100 ms", () => {
    const spread = retrySpread({ clients: 1000, baseSeconds: 1, jitterPercent: 100 });
    expect(spread.spreadSeconds).toBe(1);
    expect(spread.peak).toBeCloseTo(100);
    expect(spread.averageWait).toBe(0.5);
  });

  it("handles the minimum inputs", () => {
    expect(retrySpread({ clients: 100, baseSeconds: 0.5, jitterPercent: 0 }).peak).toBe(100);
  });

  it("handles the maximum inputs: 5,000 clients spread over 8 s", () => {
    const spread = retrySpread({ clients: 5000, baseSeconds: 8, jitterPercent: 100 });
    expect(spread.peak).toBeCloseTo(62.5);
    expect(computeRetries({ clients: 5000, baseSeconds: 8, jitterPercent: 100 }).stats[0]!.value).toBe("63");
  });

  it("counts every client when the random range is 100 ms or less", () => {
    expect(retrySpread({ clients: 1000, baseSeconds: 1, jitterPercent: 5 }).peak).toBe(1000);
    expect(retrySpread({ clients: 1000, baseSeconds: 1, jitterPercent: 10 }).peak).toBe(1000);
    expect(retrySpread({ clients: 1000, baseSeconds: 1, jitterPercent: 20 }).peak).toBeCloseTo(500);
  });

  it("describes a change in words", () => {
    expect(describeRetryChange(start, { ...start, jitterPercent: 100 })).toBe(
      "Changing the jitter share spreads 1,000 retries over 1 s, so the busiest 100 ms fell from 1,000 to 100. A wider random range means fewer retries in any one moment.",
    );
    expect(describeRetryChange(start, { ...start, jitterPercent: 5 })).toBe(
      "Changing the jitter share: the random part covers only 50 ms, less than one 100 ms window, so all 1,000 retries arrive together (before: 1,000 in the busiest 100 ms).",
    );
  });
});
