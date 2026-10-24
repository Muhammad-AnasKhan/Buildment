import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { admission, admissionControlTokens, describeAdmissionChange } from "@buildment/learning-ui/canvas/admission-control-tokens/data";

const start = defaultValues(admissionControlTokens);
const result = (v: Parameters<typeof admissionControlTokens.compute>[0]) => admissionControlTokens.compute(v);
const values = (v: Parameters<typeof admissionControlTokens.compute>[0]) => result(v).stats.map((s) => s.value);

describe("admission control tokens", () => {
  it("starts at 30 requests of 16,384 tokens: 23 admitted, 7 queued, 491,520 needed, over by 71,520", () => {
    expect(start).toEqual({ arrivals: 30, tokens: 16_384, capacity: 420_000, limit: 90 });
    const a = admission(start);
    expect(a.limitTokens).toBe(378_000);
    expect(a.admitted).toBe(23);
    expect(a.queued).toBe(7);
    expect(a.heldWithout).toBe(491_520);
    expect(a.overBy).toBe(71_520);
    expect(values(start)).toEqual(["23", "7", "Over by 71,520"]);
    expect(result(start).stats[2].detail).toBe("491,520 tokens needed");
    expect(result(start).bars!.map((b) => [b.display, b.tone])).toEqual([
      ["420,000", undefined],
      ["378,000", undefined],
      ["376,832", undefined],
      ["491,520", "bad"],
    ]);
  });

  it("at the minimums the one request is admitted and fits", () => {
    const min = { arrivals: 1, tokens: 1_024, capacity: 100_000, limit: 50 };
    expect(values(min)).toEqual(["1", "0", "Fits"]);
    expect(result(min).stats[2].detail).toBe("1,024 tokens needed, within capacity");
  });

  it("at the maximums 30 of 100 get in and 70 queue", () => {
    const max = { arrivals: 100, tokens: 32_768, capacity: 1_000_000, limit: 100 };
    expect(values(max)).toEqual(["30", "70", "Over by 2,276,800"]);
  });

  it("admits nobody when one request is larger than the limit, and everybody when all fit", () => {
    const none = admission({ arrivals: 5, tokens: 60_000, capacity: 100_000, limit: 50 });
    expect(none.admitted).toBe(0);
    expect(none.queued).toBe(5);
    expect(values({ ...start, arrivals: 10 })).toEqual(["10", "0", "Fits"]);
    expect(JSON.stringify(result({ arrivals: Number.NaN, tokens: 0, capacity: -5, limit: Number.POSITIVE_INFINITY }))).not.toMatch(/NaN|Infinity|undefined/);
    expect(JSON.stringify(result({}))).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("keeps every label within 28 characters", () => {
    for (const input of admissionControlTokens.inputs) expect(input.label.length).toBeLessThanOrEqual(28);
  });

  it("explains a lower admission limit in words", () => {
    expect(describeAdmissionChange(start, { ...start, limit: 70 })).toBe(
      "Moving the admission limit from 90% to 70% of capacity changed the tokens the server will promise from 378,000 to 294,000, so admitted went from 23 to 17. A lower limit leaves more room for requests to grow while they run. Now 17 are admitted and 13 queued; without control, the server would be over capacity by 71,520 tokens.",
    );
  });

  it("explains more arrivals and shorter requests in words", () => {
    expect(describeAdmissionChange(start, { ...start, arrivals: 60 })).toBe(
      "Going from 30 to 60 arrivals added 30 to the queue and nobody to the server: the limit already allowed only 23. Now 23 are admitted and 37 queued; without control, the server would be over capacity by 563,040 tokens.",
    );
    expect(describeAdmissionChange(start, { ...start, tokens: 8_192 })).toMatch(
      /^Each request holding 8,192 tokens instead of 16,384 changes how many fit under the 378,000-token limit, from 23 to 30.* Now 30 are admitted and 0 queued; without control, all 30 would fit\.$/,
    );
    expect(describeAdmissionChange(start, start)).toMatch(/^Nothing changed/);
  });

  it("keeps the try-this numbers true", () => {
    expect(values({ ...start, limit: 70 }).slice(0, 2)).toEqual(["17", "13"]);
    expect(values({ ...start, tokens: 8_192 }).slice(0, 2)).toEqual(["30", "0"]);
    expect(Math.floor(378_000 / 8_192)).toBe(46);
  });
});
