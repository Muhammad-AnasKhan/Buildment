import { describe, expect, it } from "vitest";
import { adaptiveRoutingCost } from "@/canvas/adaptive-routing-cost/data";
import { describeRoutingChange, formatDollars, formatMs, routeMix, routingResult } from "@/canvas/adaptive-routing-cost/model";
import { defaultValues } from "@/canvas/renderers/slider/model";

describe("adaptive routing cost", () => {
  it("starts at Omar's 30/55/15 mix: 1,960 ms and $4.30 per 1,000 questions", () => {
    const r = routingResult(30, 15);
    expect(r.mix).toEqual({ none: 30, single: 55, multi: 15, multiCapped: false });
    expect(formatMs(r.latencyMs)).toBe("1,960 ms");
    expect(formatDollars(r.cents)).toBe("$4.30");
    expect(r.costSavedPct).toBe(64);
    expect(r.latencySavedPct).toBe(56);
    expect(formatDollars(r.baselineCents)).toBe("$12.00");
    const result = adaptiveRoutingCost.compute(defaultValues(adaptiveRoutingCost));
    expect(result.stats.map((s) => s.value)).toEqual(["55%", "1,960 ms", "$4.30"]);
    expect(result.bars?.map((b) => b.display)).toEqual(["$0.30", "$2.20", "$1.80", "$12.00"]);
  });

  it("sends everything single-step at the minimums", () => {
    const r = routingResult(0, 0);
    expect(r.mix).toEqual({ none: 0, single: 100, multi: 0, multiCapped: false });
    expect(r.latencyMs).toBe(1900);
    expect(formatDollars(r.cents)).toBe("$4.00");
    expect(r.costSavedPct).toBe(67);
  });

  it("caps multi-step at the maximums so the shares never pass 100%", () => {
    const r = routingResult(100, 100);
    expect(r.mix).toEqual({ none: 100, single: 0, multi: 0, multiCapped: true });
    expect(r.latencyMs).toBe(800);
    expect(formatDollars(r.cents)).toBe("$1.00");
    const capped = routingResult(30, 100);
    expect(capped.mix).toEqual({ none: 30, single: 0, multi: 70, multiCapped: true });
    expect(formatMs(capped.latencyMs)).toBe("3,390 ms");
    expect(formatDollars(capped.cents)).toBe("$8.70");
    expect(adaptiveRoutingCost.compute({ none: 30, multi: 100 }).stats[0]?.detail).toMatch(/capped at 70%/);
  });

  it("keeps every share whole, non-negative and summing to 100, even for bad input", () => {
    for (let none = 0; none <= 100; none += 5) {
      for (let multi = 0; multi <= 100; multi += 5) {
        const mix = routeMix(none, multi);
        expect(mix.none + mix.single + mix.multi).toBe(100);
        expect(Math.min(mix.none, mix.single, mix.multi)).toBeGreaterThanOrEqual(0);
      }
    }
    expect(routeMix(Number.NaN, 250)).toEqual({ none: 0, single: 0, multi: 100, multiCapped: false });
    expect(routeMix(-10, -10)).toEqual({ none: 0, single: 100, multi: 0, multiCapped: false });
  });

  it("shows the saving shrinking when hard questions dominate (the chapter's numbers)", () => {
    expect(formatDollars(routingResult(60, 15).cents)).toBe("$3.40");
    expect(formatMs(routingResult(60, 15).latencyMs)).toBe("1,630 ms");
    expect(routingResult(60, 15).costSavedPct).toBe(72);
    expect(formatDollars(routingResult(30, 50).cents)).toBe("$7.10");
    expect(routingResult(30, 50).costSavedPct).toBe(41);
    expect(formatDollars(routingResult(0, 60).cents)).toBe("$8.80");
    expect(routingResult(0, 60).costSavedPct).toBe(27);
    // Transfer question: 5% none, 15% single, 80% multi.
    expect(routingResult(5, 80).latencyMs).toBe(3925);
    expect(routingResult(5, 80).latencySavedPct).toBe(13);
  });

  it("says what changed and why", () => {
    expect(describeRoutingChange({ none: 30, multi: 15 }, { none: 60, multi: 15 })).toBe(
      "The mix (no retrieval/single/multi) went from 30/55/15 to 60/25/15. Average latency fell from 1,960 ms to 1,630 ms and cost per 1,000 questions fell from $4.30 to $3.40, because more questions now take a cheaper route. Against sending everything multi-step, routing now saves 72% of the cost.",
    );
    expect(describeRoutingChange({ none: 30, multi: 15 }, { none: 30, multi: 100 })).toMatch(
      /rose from 1,960 ms to 3,390 ms .* costlier route\. .* Multi-step is capped at 70%, because 30% already go to no retrieval/,
    );
    expect(describeRoutingChange({ none: 30, multi: 70 }, { none: 30, multi: 100 })).toMatch(/^The route mix did not change/);
  });

  it("gives finite stats, bars and sentences at every corner of the inputs", () => {
    const start = defaultValues(adaptiveRoutingCost);
    const corners = [start, ...adaptiveRoutingCost.inputs.flatMap((input) => [{ ...start, [input.id]: input.min }, { ...start, [input.id]: input.max }])];
    corners.push(Object.fromEntries(adaptiveRoutingCost.inputs.map((input) => [input.id, input.min])));
    corners.push(Object.fromEntries(adaptiveRoutingCost.inputs.map((input) => [input.id, input.max])));
    for (const values of corners) {
      const result = adaptiveRoutingCost.compute(values);
      expect(JSON.stringify(result.stats)).not.toMatch(/NaN|Infinity|undefined/);
      for (const bar of result.bars ?? []) {
        expect(Number.isFinite(bar.value) && bar.value >= 0, bar.label).toBe(true);
        expect(bar.display).not.toMatch(/NaN|Infinity|undefined/);
      }
      expect(adaptiveRoutingCost.describeChange(start, values)).not.toMatch(/NaN|Infinity|undefined/);
    }
  });
});
