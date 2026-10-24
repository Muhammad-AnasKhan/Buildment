import { describe, expect, it } from "vitest";
import { describeTrueTimeChange, simulateTrueTime, trueTimeTrace, TRUETIME_DEFAULTS, type ClockErrors } from "@/canvas/models/truetime";
import { overlappingLabels } from "@/canvas/renderers/timeline/geometry";

describe("TrueTime commit wait", () => {
  it("breaks the order by default: A fast, B slow, no wait", () => {
    const o = simulateTrueTime(TRUETIME_DEFAULTS);
    expect(o.rangeA).toEqual({ earliest: 19.6, latest: 27.6 });
    expect(o.s1).toBe(27.6);
    expect(o.s2).toBeCloseTo(22.4);
    expect(o.rangesOverlap).toBe(true);
    expect(o.orderCorrect).toBe(false);
    expect(o.waitMs).toBe(0);
  });

  it("flips to correct once the gap passes the clocks' disagreement", () => {
    // Disagreement is 1.8 x epsilon = 7.2 ms.
    expect(simulateTrueTime({ ...TRUETIME_DEFAULTS, gapMs: 7 }).orderCorrect).toBe(false);
    expect(simulateTrueTime({ ...TRUETIME_DEFAULTS, gapMs: 8 }).orderCorrect).toBe(true);
  });

  it("is always correct with commit wait, and waits 2 x epsilon", () => {
    for (const errors of ["a-fast", "exact", "a-slow"] as const) {
      for (const epsilonMs of [0, 1, 4, 10]) {
        for (const gapMs of [1, 5, 20]) {
          const o = simulateTrueTime({ epsilonMs, gapMs, errors, commitWait: true });
          expect(o.orderCorrect, `${errors} eps ${epsilonMs} gap ${gapMs}`).toBe(true);
          expect(o.waitMs).toBe(2 * epsilonMs);
        }
      }
    }
  });

  it("handles zero uncertainty and bounds bad inputs", () => {
    const zero = simulateTrueTime({ epsilonMs: 0, gapMs: 1, errors: "a-fast", commitWait: false });
    expect(zero.rangeA).toEqual({ earliest: 20, latest: 20 });
    expect(zero.orderCorrect).toBe(true);
    const wild = simulateTrueTime({ epsilonMs: 99, gapMs: -5, errors: "nope" as never, commitWait: false });
    expect(wild.inputs).toEqual({ epsilonMs: 10, gapMs: 1, errors: "a-fast", commitWait: false });
    const nan = simulateTrueTime({ epsilonMs: Number.NaN, gapMs: Number.NaN, errors: "exact", commitWait: true });
    expect(Number.isFinite(nan.s1) && Number.isFinite(nan.s2)).toBe(true);
  });

  it("builds a trace whose steps all have words and whose items fit the range, never below 0 ms", () => {
    for (const commitWait of [false, true]) for (const errors of ["a-fast", "exact", "a-slow"] as ClockErrors[]) for (const epsilonMs of [0, 1, 10]) for (const gapMs of [1, 20]) {
      const o = simulateTrueTime({ commitWait, errors, epsilonMs, gapMs });
      const trace = trueTimeTrace(o);
      expect(trace.range[0]).toBe(0);
      expect(trace.steps).toHaveLength(7);
      for (const step of trace.steps) expect(step.note.length).toBeGreaterThan(20);
      for (const item of trace.items) {
        expect(item.step).toBeLessThan(trace.steps.length);
        const times = item.kind === "point" ? [item.at] : item.kind === "span" ? [item.from, item.to] : [item.sentAt, item.receivedAt];
        for (const t of times) {
          expect(t).toBeGreaterThanOrEqual(trace.range[0]);
          expect(t).toBeLessThanOrEqual(trace.range[1]);
        }
      }
    }
  });

  it("never prints two labels over each other, on a phone or a desktop", () => {
    for (const commitWait of [false, true]) for (const errors of ["a-fast", "exact", "a-slow"] as ClockErrors[]) for (const epsilonMs of [0, 1, 4, 10]) for (const gapMs of [1, 2, 8, 20]) {
      const trace = trueTimeTrace(simulateTrueTime({ commitWait, errors, epsilonMs, gapMs }));
      for (const layout of ["narrow", "wide"] as const) {
        expect(overlappingLabels(trace, layout), `${layout} ${errors} eps ${epsilonMs} gap ${gapMs} wait ${commitWait}`).toEqual([]);
      }
    }
  });

  it("explains a change in words", () => {
    const text = describeTrueTimeChange(TRUETIME_DEFAULTS, { ...TRUETIME_DEFAULTS, commitWait: true });
    expect(text).toContain("commit wait on");
    expect(text).toContain("matches the real order");
    expect(text).toContain("8 ms of commit wait");
    expect(describeTrueTimeChange(TRUETIME_DEFAULTS, TRUETIME_DEFAULTS)).toBe("");
  });
});
