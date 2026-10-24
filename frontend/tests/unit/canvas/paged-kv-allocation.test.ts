import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describePagedChange, pagedAllocation, pagedKvAllocation } from "@buildment/learning-ui/canvas/paged-kv-allocation/data";

const start = defaultValues(pagedKvAllocation);
const values = (v: Parameters<typeof pagedKvAllocation.compute>[0]) => pagedKvAllocation.compute(v).stats.map((s) => s.value);

describe("paged kv allocation", () => {
  it("starts at 20 requests: contiguous 85.90 GB, paged 15.73 GB, used 15.73 GB", () => {
    expect(start).toEqual({ requests: 20, reserved: 32_768, actual: 6_000 });
    const r = pagedAllocation(start);
    expect(r.contiguousGB.toFixed(2)).toBe("85.90");
    expect(r.pagedGB.toFixed(2)).toBe("15.73");
    expect(r.usedGB.toFixed(2)).toBe("15.73");
    expect(r.pagedTokens).toBe(6_000);
    expect(values(start)).toEqual(["85.90 GB", "15.73 GB", "81.7% vs 0.0%"]);
    expect(pagedKvAllocation.compute(start).bars!.map((b) => b.display)).toEqual(["15.73 GB", "85.90 GB", "15.73 GB"]);
  });

  it("at the minimums one small request wastes little when paged", () => {
    const min = { requests: 1, reserved: 2_048, actual: 100 };
    expect(pagedAllocation(min).pagedTokens).toBe(112);
    expect(values(min)).toEqual(["0.27 GB", "0.015 GB", "95.1% vs 10.7%"]);
    expect(pagedKvAllocation.compute(min).bars!.map((b) => b.display)).toEqual(["0.013 GB", "0.27 GB", "0.015 GB"]);
  });

  it("at the maximums both ways agree because every token is used", () => {
    const max = { requests: 64, reserved: 32_768, actual: 32_768 };
    expect(values(max)).toEqual(["274.88 GB", "274.88 GB", "0.0% vs 0.0%"]);
  });

  it("cuts an average above the reservation down to it, and rounds up to whole blocks", () => {
    const over = { requests: 20, reserved: 2_048, actual: 6_000 };
    const r = pagedAllocation(over);
    expect(r.actual).toBe(2_048);
    expect(r.clamped).toBe(true);
    expect(values(over)).toEqual(["5.37 GB", "5.37 GB", "0.0% vs 0.0%"]);
    expect(pagedAllocation({ requests: 1, reserved: 2_048, actual: 17 }).pagedTokens).toBe(32);
    expect(JSON.stringify(pagedKvAllocation.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("keeps every label within 28 characters", () => {
    for (const input of pagedKvAllocation.inputs) expect(input.label.length).toBeLessThanOrEqual(28);
  });

  it("explains a smaller reservation in words", () => {
    expect(describePagedChange(start, { ...start, reserved: 8_192 })).toBe(
      "Changing the reserved context from 32,768 to 8,192 tokens moved contiguous from 85.90 GB to 21.47 GB, because it holds the full reservation whether or not it is used. Paged stayed at 15.73 GB, because it only follows the tokens in use. Contiguous now uses 21.47 GB (26.8% wasted) and paged 15.73 GB (0.0% wasted).",
    );
  });

  it("explains a shorter average and a no-change move in words", () => {
    expect(describePagedChange(start, { ...start, actual: 100 })).toBe(
      "Changing the average length from 6,000 to 100 tokens moved paged from 15.73 GB to 0.29 GB, because it allocates blocks for the tokens in use. Contiguous stayed at 85.90 GB, because it reserves the full context regardless. Contiguous now uses 85.90 GB (99.7% wasted) and paged 0.29 GB (10.7% wasted).",
    );
    expect(describePagedChange(start, start)).toMatch(/^Nothing changed/);
  });
});
