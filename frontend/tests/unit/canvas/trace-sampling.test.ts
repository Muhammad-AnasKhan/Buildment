import { describe, expect, it } from "vitest";
import { computeSampling, describeSamplingChange, sampleTraces, traceSampling } from "@/canvas/trace-sampling/data";
import { defaultValues } from "@/canvas/renderers/slider/model";

const start = defaultValues(traceSampling);

describe("trace-sampling model", () => {
  it("matches chapter 10.3 at the defaults: 10 failures, head keeps 1, tail keeps 10, 12 MB", () => {
    expect(start).toEqual({ requestsPerDay: 20000, failurePercent: 0.05, keepPercent: 10 });
    const o = sampleTraces({ requestsPerDay: 20000, failurePercent: 0.05, keepPercent: 10 });
    expect(o.failures).toBeCloseTo(10);
    expect(o.keptTraces).toBe(2000);
    expect(o.headFailuresKept).toBeCloseTo(1);
    expect(o.tailFailuresKept).toBeCloseTo(10);
    expect(o.storageMb).toBe(12);
    expect(computeSampling(start).stats.map((s) => s.value)).toEqual(["1", "10", "12 MB"]);
  });

  it("keeping every trace at 6 KB would be the chapter's 120 MB a day", () => {
    expect(sampleTraces({ requestsPerDay: 20000, failurePercent: 0.05, keepPercent: 100 }).storageMb).toBe(120);
  });

  it("handles the minimum inputs without rounding a fraction up to a whole failure", () => {
    const o = sampleTraces({ requestsPerDay: 5000, failurePercent: 0.05, keepPercent: 1 });
    expect(o.failures).toBeCloseTo(2.5);
    expect(o.headFailuresKept).toBeCloseTo(0.025);
    expect(computeSampling({ requestsPerDay: 5000, failurePercent: 0.05, keepPercent: 1 }).stats.map((s) => s.value)).toEqual(["under 0.1", "2.5", "0.3 MB"]);
  });

  it("handles the maximum inputs", () => {
    const o = sampleTraces({ requestsPerDay: 100000, failurePercent: 5, keepPercent: 50 });
    expect(o.failures).toBe(5000);
    expect(o.headFailuresKept).toBe(2500);
    expect(o.tailFailuresKept).toBe(5000);
    expect(o.storageMb).toBe(300);
  });

  it("caps tail sampling at the storage budget when failures outnumber kept traces", () => {
    const o = sampleTraces({ requestsPerDay: 20000, failurePercent: 5, keepPercent: 2 });
    expect(o.failures).toBe(1000);
    expect(o.keptTraces).toBe(400);
    expect(o.tailFailuresKept).toBe(400);
    expect(o.tailNormalKept).toBe(0);
  });

  it("describes a change in words", () => {
    expect(describeSamplingChange(start, { ...start, keepPercent: 2 })).toBe(
      "Keeping fewer traces changed storage from 12 MB to 2.4 MB a day. Head sampling now keeps about 0.2 of 10 failures, because it keeps failures at the same 2% rate as everything else. Tail sampling still keeps all 10.",
    );
    expect(describeSamplingChange(start, { ...start, failurePercent: 5, keepPercent: 2 })).toBe(
      "Now 1,000 requests fail but only 400 traces fit in storage, so even tail sampling must drop some failures. Head sampling keeps about 20.",
    );
  });
});
