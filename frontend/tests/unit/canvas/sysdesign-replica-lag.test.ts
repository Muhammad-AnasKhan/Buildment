import { describe, expect, it } from "vitest";
import { describeLagChange, lagTrace, LAG_DEFAULTS, simulateLag } from "@buildment/learning-ui/canvas/models/replica-lag";
import { overlappingLabels, timelineGeometry } from "@buildment/learning-ui/canvas/renderers/timeline/geometry";

describe("replica lag", () => {
  it("shows the comment, loses it, then shows it again by default", () => {
    const o = simulateLag(LAG_DEFAULTS);
    expect(o.fastLagMs).toBe(150);
    expect(o.reads.map((r) => [r.at, r.target, r.saw])).toEqual([
      [200, "r1", true],
      [350, "r2", false],
      [500, "r1", true],
    ]);
    expect(o.missedOwnWrite).toBe(1);
    expect(o.wentBackInTime).toBe(1);
    expect(o.leaderReads).toBe(0);
  });

  it("never misses with the leader, at the cost of leader reads", () => {
    const o = simulateLag({ ...LAG_DEFAULTS, routing: "leader" });
    expect(o.missedOwnWrite).toBe(0);
    expect(o.leaderReads).toBe(3);
  });

  it("never misses with position tokens and falls back to the leader only when no replica has caught up", () => {
    expect(simulateLag({ ...LAG_DEFAULTS, routing: "token" })).toMatchObject({ missedOwnWrite: 0, wentBackInTime: 0, leaderReads: 0 });
    const early = simulateLag({ lagMs: 1500, firstReadMs: 0, routing: "token" });
    expect(early.missedOwnWrite).toBe(0);
    expect(early.reads.map((r) => r.target)).toEqual(["leader", "leader", "leader"]);
  });

  it("has nothing to break with zero lag or slow refreshes", () => {
    expect(simulateLag({ ...LAG_DEFAULTS, lagMs: 0 }).missedOwnWrite).toBe(0);
    // Only refresh 2 (150 ms after the first) reaches replica 2, so 450 ms is enough.
    expect(simulateLag({ ...LAG_DEFAULTS, firstReadMs: 400 }).missedOwnWrite).toBe(1);
    expect(simulateLag({ ...LAG_DEFAULTS, firstReadMs: 450 }).missedOwnWrite).toBe(0);
  });

  it("counts a catch-up at the same moment as a read as caught up, and bounds inputs", () => {
    const tie = simulateLag({ lagMs: 600, firstReadMs: 150, routing: "any" });
    expect(tie.reads[0]).toMatchObject({ at: 150, target: "r1", saw: true });
    expect(simulateLag({ lagMs: 99999, firstReadMs: -3, routing: "x" as never }).inputs).toEqual({ lagMs: 1500, firstReadMs: 0, routing: "any" });
    expect(simulateLag({ lagMs: Number.NaN, firstReadMs: 120, routing: "any" }).inputs).toEqual({ lagMs: 0, firstReadMs: 100, routing: "any" });
  });

  it("builds a trace with one step per event and labels that fit a phone", () => {
    for (const routing of ["any", "leader", "token"] as const) {
      for (const lagMs of [0, 600, 1500]) {
        const trace = lagTrace(simulateLag({ lagMs, firstReadMs: 200, routing }));
        expect(trace.steps).toHaveLength(1 + 2 + 3);
        for (const item of trace.items) expect(item.step).toBeLessThan(trace.steps.length);
        for (const layout of ["narrow", "wide"] as const) {
          const g = timelineGeometry(trace, layout);
          for (const item of trace.items) {
            const half = (item.label.length * g.charW) / 2;
            const at = item.kind === "point" ? item.at : item.kind === "span" ? (item.from + item.to) / 2 : (item.sentAt + item.receivedAt) / 2;
            const x = g.labelX(g.x(at), item.label);
            expect(x - half, `${layout} ${item.label}`).toBeGreaterThanOrEqual(0);
            expect(x + half, `${layout} ${item.label}`).toBeLessThanOrEqual(g.width);
          }
        }
      }
    }
  });

  it("never prints two labels over each other, on a phone or a desktop", () => {
    for (const routing of ["any", "leader", "token"] as const) for (let lagMs = 0; lagMs <= 1500; lagMs += 150) for (let firstReadMs = 0; firstReadMs <= 1000; firstReadMs += 100) {
      const trace = lagTrace(simulateLag({ lagMs, firstReadMs, routing }));
      for (const layout of ["narrow", "wide"] as const) {
        expect(overlappingLabels(trace, layout), `${layout} ${routing} lag ${lagMs} first ${firstReadMs}`).toEqual([]);
      }
    }
  });

  it("explains a change in words", () => {
    const text = describeLagChange(LAG_DEFAULTS, { ...LAG_DEFAULTS, routing: "token" });
    expect(text).toContain("Missed own write: 1 to 0");
    expect(describeLagChange(LAG_DEFAULTS, LAG_DEFAULTS)).toBe("");
  });
});
