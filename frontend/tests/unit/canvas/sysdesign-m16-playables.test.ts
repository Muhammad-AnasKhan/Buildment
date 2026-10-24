import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as split from "@buildment/learning-ui/canvas/sysdesign-m16-split-or-not/model";
import { sysdesignM16SplitOrNot } from "@buildment/learning-ui/canvas/sysdesign-m16-split-or-not/data";
import * as order from "@buildment/learning-ui/canvas/sysdesign-m16-order-path/model";
import { sysdesignM16OrderPath } from "@buildment/learning-ui/canvas/sysdesign-m16-order-path/data";
import * as timeout from "@buildment/learning-ui/canvas/sysdesign-m16-timeout-line/model";
import { sysdesignM16TimeoutLine } from "@buildment/learning-ui/canvas/sysdesign-m16-timeout-line/data";

const VERDICT_MAX = 38;

function renders(spec: { title: string; purpose: string; limits: string; component: unknown }) {
  const html = renderToString(createElement(spec.component as never, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  expect(html).toContain("<svg");
  expect(html).toContain("What this picture leaves out");
  expect(html).not.toContain("—");
  return html;
}

describe("16.2 split or not", () => {
  // team, collisions, clarity (0 new idea, 1 mostly clear, 2 stable), points, shape, capped
  const table: [number, number, number, number, split.Shape, boolean][] = [
    [3, 0, 0, 0, "monolith", false],
    [8, 1, 1, 1, "monolith", false],
    [15, 3, 1, 3, "modular", false],
    [15, 3, 2, 4, "modular", false],
    [3, 0, 2, 2, "modular", false],
    [30, 6, 1, 5, "split", false],
    [60, 6, 2, 7, "split", false],
    [120, 10, 0, 6, "modular", true],
    [120, 10, 2, 8, "split", false],
  ];
  it.each(table)("team %i, %i collisions, clarity %i: %i points, %s", (team, collisions, clarity, points, shape, capped) => {
    const w = split.weigh(team, collisions, clarity);
    expect(w.total).toBe(points);
    expect(w.shape).toBe(shape);
    expect(w.capped).toBe(capped);
  });

  it("says the four verdicts", () => {
    expect(split.weigh(3, 0, 0).verdict).toEqual({ text: "Stay one monolith", tone: "good" });
    expect(split.weigh(15, 3, 1).verdict).toEqual({ text: "Modular monolith, hard walls", tone: "accent" });
    expect(split.weigh(30, 6, 1).verdict).toEqual({ text: "Split the parts that hurt", tone: "accent" });
    expect(split.weigh(120, 10, 0).verdict).toEqual({ text: "Walls unclear: stay modular", tone: "warn" });
  });

  it("keeps every verdict within 38 characters and the points within 8", () => {
    for (const t of split.TEAM_STOPS) for (const c of split.COLLISION_STOPS) for (const k of split.CLARITY_STOPS) {
      const w = split.weigh(t, c, k);
      expect(w.verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
      expect(w.total).toBeLessThanOrEqual(split.MAX_TOTAL);
    }
  });

  it("reads each rail as a value text", () => {
    expect(split.teamValueText(15)).toBe("team size 15 people, 1 point");
    expect(split.teamValueText(60)).toBe("team size 60 people, 3 points");
  });

  it("server-renders", () => {
    const html = renders(sysdesignM16SplitOrNot);
    expect(html).toContain("Modular monolith, hard walls");
    expect(html).toContain('role="slider"');
  });
});

describe("16.3 order path", () => {
  const allWait = order.START;
  it.each([
    [[false, false, false], ["wait", "wait", "wait"], 150, "99.7%", "Order placed in 150 ms"],
    [[false, false, false], ["wait", "wait", "message"], 110, "99.8%", "Placed in 110 ms; email waits"],
    [[false, false, false], ["wait", "message", "message"], 30, "99.9%", "Placed; payment unconfirmed"],
    [[false, false, false], ["message", "wait", "wait"], 120, "99.8%", "Placed; stock may run out"],
  ] as [boolean[], order.Mode[], number, string, string][])("down %j modes %j: %i ms, %s", (down, modes, ms, avail, text) => {
    const r = order.evaluate({ modes, down });
    expect(r.waitMs).toBe(ms);
    expect(order.formatAvailability(r.availability)).toBe(avail);
    expect(r.verdict.text).toBe(text);
  });

  it("matches the exact availability of three waits", () => {
    expect(order.evaluate(allWait).availability).toBeCloseTo(0.997003, 6);
    expect(order.evaluate({ modes: ["wait", "wait", "message"], down: [false, false, false] }).availability).toBeCloseTo(0.998001, 6);
  });

  it("fails the order on the first waited service that is down", () => {
    expect(order.evaluate({ modes: allWait.modes, down: [false, false, true] }).verdict).toEqual({ text: "Order failed: Notifications is down", tone: "bad" });
    expect(order.evaluate({ modes: allWait.modes, down: [false, true, true] }).verdict.text).toBe("Order failed: Payments is down");
    expect(order.evaluate({ modes: allWait.modes, down: [true, true, true] }).verdict.text).toBe("Order failed: Stock is down");
  });

  it("lets a message through a dead service and holds it in the queue", () => {
    const r = order.evaluate({ modes: ["wait", "wait", "message"], down: [false, false, true] });
    expect(r.failedAt).toBeNull();
    expect(r.queued).toEqual([2]);
    expect(r.verdict).toEqual({ text: "Placed in 110 ms; email waits", tone: "good" });
  });

  it("keeps every verdict within 38 characters", () => {
    const modes: order.Mode[] = ["wait", "message"];
    for (const a of modes) for (const b of modes) for (const c of modes) for (let d = 0; d < 8; d++) {
      const r = order.evaluate({ modes: [a, b, c], down: [!!(d & 1), !!(d & 2), !!(d & 4)] });
      expect(r.verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
    }
  });

  it("moves a dot along waits one after another and only on the line it is on", () => {
    const at = (i: number, s: number) => order.dotProgress(allWait, i, s);
    expect(at(0, 0.1)).not.toBeNull();
    expect(at(1, 0.1)).toBeNull();
    expect(at(1, 1.2)).not.toBeNull();
    expect(at(2, 1.2)).toBeNull();
    // After a failed wait later waits do not start.
    expect(order.dotProgress({ modes: allWait.modes, down: [true, false, false] }, 1, 1.2)).toBeNull();
  });

  it("server-renders", () => {
    expect(renders(sysdesignM16OrderPath)).toContain("Notifications, waits for the answer, 40 ms");
  });
});

describe("16.4 timeout line", () => {
  // limit, cut-off text, workers held, workers busy when healthy
  const table: [number, string, number, number][] = [
    [50, "37.1%", 5, 3.7],
    [100, "8.2%", 10, 4.6],
    [150, "5.0%", 15, 4.9],
    [250, "1.0%", 25, 5.2],
    [400, "0.67%", 40, 5.3],
    [500, "0.51%", 50, 5.4],
    [600, "0.38%", 60, 5.4],
    [900, "0.10%", 90, 5.5],
    [1000, "0.09%", 100, 5.5],
  ];
  it.each(table)("limit %i ms: %s cut, %i held, %d busy", (limit, cutText, held, busy) => {
    expect(timeout.formatCut(timeout.cutOff(limit))).toBe(cutText);
    expect(timeout.heldInHang(limit)).toBe(held);
    expect(Math.round(timeout.busyHealthy(limit) * 10) / 10).toBe(busy);
  });

  it("passes through the percentile points and a mean of 55.6 ms", () => {
    for (const [u, ms] of [[0.5, 40], [0.9, 80], [0.99, 250], [0.999, 900]]) expect(timeout.quantile(u)).toBeCloseTo(ms, 9);
    expect(timeout.cdf(timeout.quantile(0.7))).toBeCloseTo(0.7, 9);
    expect(Math.round(timeout.meanHoldMs(3000) * 10) / 10).toBe(55.6);
  });

  it("draws 50 sorted bars", () => {
    const b = timeout.bars();
    expect(b).toHaveLength(50);
    expect([...b].sort((x, y) => x - y)).toEqual(b);
    expect(b[49]).toBeCloseTo(250, 6);
  });

  it("says the three verdicts with the number filled in", () => {
    expect(timeout.verdictFor(900)).toEqual({ text: "A hang takes 90 of 50 workers", tone: "bad" });
    expect(timeout.verdictFor(50)).toEqual({ text: "37% of good calls cut off", tone: "warn" });
    expect(timeout.verdictFor(250)).toEqual({ text: "1% cut; a hang holds 25 of 50", tone: "good" });
    expect(timeout.verdictFor(500).tone).toBe("good");
    expect(timeout.valueText(250)).toBe("limit 250 ms, 1.0 percent of calls cut off, a hang holds 25 of 50 workers");
    for (const t of timeout.LIMIT_SNAPS) expect(timeout.verdictFor(t).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("server-renders", () => {
    renders(sysdesignM16TimeoutLine);
  });
});
