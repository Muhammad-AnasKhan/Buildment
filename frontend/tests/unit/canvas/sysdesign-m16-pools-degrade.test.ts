import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as bulkhead from "@buildment/learning-ui/canvas/sysdesign-m16-bulkhead-pools/model";
import { sysdesignM16BulkheadPools } from "@buildment/learning-ui/canvas/sysdesign-m16-bulkhead-pools/data";
import * as degrade from "@buildment/learning-ui/canvas/sysdesign-m16-degrade-menu/model";
import { sysdesignM16DegradeMenu } from "@buildment/learning-ui/canvas/sysdesign-m16-degrade-menu/data";

const VERDICT_MAX = 38;

function renders(spec: { title: string; purpose: string; limits: string; component: unknown }) {
  const html = renderToString(createElement(spec.component as never, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  expect(html).toContain("<svg");
  expect(html).toContain("What this picture leaves out");
  expect(html).not.toContain("—");
  return html;
}

describe("16.5 bulkhead pools", () => {
  // slow, pool, payments, home, total
  const table: [boolean, number, number, number, number][] = [
    [false, 0, 100, 100, 100],
    [false, 10, 100, 100, 100],
    [false, 45, 100, 62.5, 70],
    [true, 0, 20.7, 20.7, 20.7],
    [true, 1, 50, 20.4, 26.3],
    [true, 2, 100, 20.0, 36.0],
    [true, 5, 100, 18.8, 35.0],
    [true, 10, 100, 16.7, 33.3],
    [true, 20, 100, 12.5, 30.0],
    [true, 30, 100, 8.3, 26.7],
    [true, 45, 100, 2.1, 21.7],
  ];
  it.each(table)("slow %s, pool %i: payments %d, home %d, total %d", (slow, pool, pay, home, total) => {
    const r = bulkhead.serve(pool, slow);
    expect(Math.round(r.payments * 1000) / 10).toBe(pay);
    expect(Math.round(r.home * 1000) / 10).toBe(home);
    expect(Math.round(r.total * 10) / 10).toBe(total);
  });

  it("says the verdicts", () => {
    expect(bulkhead.verdictFor(bulkhead.serve(0, true))).toEqual({ text: "Only 21% of payments get through", tone: "bad" });
    expect(bulkhead.verdictFor(bulkhead.serve(10, true))).toEqual({ text: "Payments safe: 100% served", tone: "good" });
    expect(bulkhead.verdictFor(bulkhead.serve(1, true))).toEqual({ text: "Payment pool too small: 50%", tone: "warn" });
    expect(bulkhead.verdictFor(bulkhead.serve(0, false))).toEqual({ text: "Both fine: nothing is slow", tone: "good" });
    expect(bulkhead.verdictFor(bulkhead.serve(10, false))).toEqual({ text: "Both fine: nothing is slow", tone: "good" });
    expect(bulkhead.verdictFor(bulkhead.serve(45, false)).tone).toBe("warn");
    for (let p = 0; p <= 45; p++) for (const slow of [true, false]) expect(bulkhead.verdictFor(bulkhead.serve(p, slow)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("reads the wall as a value text", () => {
    expect(bulkhead.valueText(bulkhead.serve(10, true))).toBe("10 workers for payments, payments 100 percent served, home 16.7 percent");
  });

  it("gives payments only 2 busy workers, the rest idle", () => {
    const s = bulkhead.workerStates(bulkhead.serve(10, true));
    expect(s.filter((x) => x === "pay-busy")).toHaveLength(2);
    expect(s.slice(0, 10).filter((x) => x === "idle")).toHaveLength(8);
    expect(s.slice(10).every((x) => x === "stuck")).toBe(true);
    expect(bulkhead.workerStates(bulkhead.serve(0, true)).every((x) => x === "stuck")).toBe(true);
    expect(bulkhead.workerStates(bulkhead.serve(0, false)).filter((x) => x === "home-busy")).toHaveLength(8);
  });

  it("steps the wall by one with the keys and maps the rail", () => {
    expect(bulkhead.poolKey(10, "ArrowRight")).toBe(11);
    expect(bulkhead.poolKey(45, "ArrowRight")).toBe(45);
    expect(bulkhead.poolKey(0, "ArrowLeft")).toBe(0);
    expect([bulkhead.poolFromFraction(0), bulkhead.poolFromFraction(1), bulkhead.poolFromFraction(10 / 45)]).toEqual([0, 45, 10]);
  });

  it("server-renders", () => {
    renders(sysdesignM16BulkheadPools);
  });
});

describe("16.6 degrade menu", () => {
  const find = (name: string) => degrade.FEATURES.findIndex((f) => f.service === name);
  const run = (broken: string[], fallbacks: [string, degrade.Fallback][] = []) => {
    const down = degrade.FEATURES.map((f) => broken.includes(f.service));
    const choice = degrade.FEATURES.map((f, i) => {
      const hit = fallbacks.find(([name]) => find(name) === i);
      return hit ? f.fallbacks.indexOf(hit[1]) : 0;
    });
    return degrade.evaluate(down, choice);
  };

  it("starts with every service up and says all features work", () => {
    expect(degrade.evaluate(degrade.START_DOWN, degrade.START_CHOICE).verdict).toEqual({ text: "All features work", tone: "good" });
  });

  it("fails the page when a broken extra has no fallback", () => {
    const o = run(["Picks"]);
    expect(o.verdict).toEqual({ text: "Page fails: Picks is down", tone: "bad" });
    expect(o.canOrder).toBe(false);
  });

  it.each([
    [["Picks"], [["Picks", "hide"]], 1],
    [["Reviews", "Picks"], [["Picks", "hide"], ["Reviews", "hide"]], 2],
    [["Catalog"], [["Catalog", "cached"]], 1],
    [["Routing"], [["Routing", "default"]], 1],
  ] as [string[], [string, degrade.Fallback][], number][])("%j with %j: the customer can still order, %i degraded", (broken, fallbacks, degraded) => {
    const o = run(broken, fallbacks);
    expect(o.verdict).toEqual({ text: "Customer can still order", tone: "good" });
    expect(o.canOrder).toBe(true);
    expect(o.degraded).toBe(degraded);
  });

  it("says cash on delivery only when payments uses another way", () => {
    const o = run(["Payments"], [["Payments", "another"]]);
    expect(o.verdict).toEqual({ text: "Orders work, cash on delivery only", tone: "warn" });
    expect(o.canOrder).toBe(true);
  });

  it("cannot order without the cart, whatever the fallbacks", () => {
    expect(run(["Cart"]).verdict).toEqual({ text: "Cannot order: Cart is down", tone: "bad" });
    expect(run(["Cart"], [["Picks", "hide"]]).canOrder).toBe(false);
  });

  it("lets the customer order when any one service but Cart is down, with the safe fallbacks", () => {
    degrade.FEATURES.forEach((_, i) => {
      const o = degrade.evaluate(degrade.FEATURES.map((__, k) => k === i), degrade.SAFE_CHOICE);
      expect(o.canOrder).toBe(i !== find("Cart"));
    });
  });

  it("cycles through the allowed fallbacks, wraps, and labels a card", () => {
    const picks = find("Picks");
    let c = degrade.START_CHOICE;
    const seen = [degrade.fallbackOf(picks, c)];
    for (let k = 0; k < 3; k++) {
      c = degrade.cycleChoice(c, picks);
      seen.push(degrade.fallbackOf(picks, c));
    }
    expect(seen).toEqual(["fail", "hide", "cached", "fail"]);
    expect(degrade.cycleChoice(c, find("Cart"))).toEqual(c);
    expect(degrade.featureLabel(picks, degrade.START_DOWN, degrade.cycleChoice(degrade.START_CHOICE, picks))).toBe("Picks for you, service up, fallback: hide it");
  });

  it("keeps every verdict within 38 characters", () => {
    const lens = degrade.FEATURES.map((f) => f.fallbacks.length);
    for (let d = 0; d < 64; d++) {
      const down = degrade.FEATURES.map((_, i) => !!(d & (1 << i)));
      for (let a = 0; a < lens[0]; a++) for (let b = 0; b < lens[2]; b++) for (let c = 0; c < lens[3]; c++) for (let e = 0; e < lens[4]; e++) for (let f = 0; f < lens[5]; f++) {
        expect(degrade.evaluate(down, [a, 0, b, c, e, f]).verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
      }
    }
  });

  it("server-renders", () => {
    expect(renders(sysdesignM16DegradeMenu)).toContain("All features work");
  });
});
