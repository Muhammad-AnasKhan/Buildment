import { describe, expect, it } from "vitest";
// Relative imports: the package export line for this slug is added by the orchestrator at registration.
import {
  computeFifty,
  describeFiftyChange,
  fiftyTimesTest,
  firstWall,
  partLoads,
  traffic,
} from "@buildment/learning-ui/canvas/fifty-times-test/data";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";

const start = defaultValues(fiftyTimesTest);
const percents = (values: Record<string, number>) =>
  Object.fromEntries(partLoads({ busy: values.busy!, times: values.times!, queue: values.queue! }).map((p) => [p.id, Math.round(p.percent)]));

describe("fifty-times-test model", () => {
  it("starts with 40 requests a minute, a queue, and the email limit as the first wall at 2.5 times", () => {
    expect(start).toEqual({ busy: 40, times: 1, queue: 1 });
    expect(percents(start)).toEqual({ web: 8, database: 13, workers: 25, email: 40 });
    const result = computeFifty(start);
    expect(result.stats.map((s) => s.value)).toEqual(["40", "Email limit", "0 of 4"]);
    expect(result.stats[1]!.detail).toBe("full at 2.5 times today");
    expect(firstWall({ busy: 40, times: 1, queue: 1 }).id).toBe("email");
  });

  it("the try-this values: the email limit passes 100% between 2 and 3 times, long before the others", () => {
    expect(percents({ ...start, times: 2 })).toEqual({ web: 16, database: 27, workers: 50, email: 80 });
    expect(percents({ ...start, times: 3 })).toEqual({ web: 24, database: 40, workers: 75, email: 120 });
    expect(computeFifty({ ...start, times: 3 }).stats[2]!.value).toBe("1 of 4");
    expect(computeFifty({ ...start, times: 50 }).stats[2]!.value).toBe("4 of 4");
    const noQueue = { ...start, queue: 0 };
    expect(percents(noQueue)).toEqual({ web: 50, database: 40, workers: 0, email: 0 });
    expect(firstWall({ busy: 40, times: 1, queue: 0 }).id).toBe("web");
    expect(computeFifty(noQueue).stats[1]!.detail).toBe("full at 2 times today");
  });

  it("marks parts that are not used and keeps every number finite at the edges", () => {
    const corners = [
      { busy: 10, times: 1, queue: 0 },
      { busy: 10, times: 50, queue: 0 },
      { busy: 100, times: 50, queue: 1 },
      { busy: 100, times: 1, queue: 1 },
    ];
    for (const values of corners) {
      const result = computeFifty(values);
      expect(result.stats.length).toBeLessThanOrEqual(3);
      expect((result.bars ?? []).length).toBeLessThanOrEqual(4);
      for (const bar of result.bars ?? []) {
        expect(Number.isFinite(bar.value)).toBe(true);
        expect(bar.display).not.toMatch(/NaN|Infinity|undefined/);
      }
      expect(result.summary).not.toMatch(/NaN|Infinity|undefined/);
    }
    const noQueue = computeFifty({ busy: 40, times: 1, queue: 0 });
    expect(noQueue.bars!.filter((b) => b.display === "not used").map((b) => b.label)).toEqual(["Report workers", "Email limit"]);
    expect(traffic({ busy: 100, times: 50, queue: 1 })).toBe(5000);
  });

  it("describes a change in words", () => {
    expect(describeFiftyChange(start, start)).toBe("Nothing changed.");
    const raised = describeFiftyChange(start, { ...start, times: 3 });
    expect(raised).toContain("from 40 to 120 requests a minute");
    expect(raised).toContain("from 0 to 1 of 4");
    expect(raised).toContain("The first wall stays Email limit");
    const noQueue = describeFiftyChange(start, { ...start, queue: 0 });
    expect(noQueue).toContain("Each request now builds its own report");
    expect(noQueue).toContain("Web server, full at 2 times today's traffic (before: Email limit at 2.5)");
    expect(describeFiftyChange({ ...start, queue: 0 }, start)).toContain("through a queue");
  });

  it("is a slider spec with well-formed inputs and no dashes in its text", () => {
    expect(fiftyTimesTest.inputs.length).toBe(3);
    for (const input of fiftyTimesTest.inputs) {
      expect(input.min).toBeLessThan(input.max);
      expect(input.default).toBeGreaterThanOrEqual(input.min);
      expect(input.default).toBeLessThanOrEqual(input.max);
      expect(input.label.length).toBeLessThanOrEqual(28);
    }
    const text = JSON.stringify({ ...fiftyTimesTest, compute: undefined, describeChange: undefined });
    expect(text.includes(String.fromCharCode(0x2013)) || text.includes(String.fromCharCode(0x2014))).toBe(false);
  });
});
