import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CRASH_POINTS,
  DOWNTIME_SNAPS,
  crashState,
  downtimeAt,
  formatDowntime,
  ordersWaiting,
  queueDots,
  queueOverflow,
  snapDowntime,
  snapPoint,
} from "@/canvas/models/two-pc-crash";
import { STEPS, cardCounter, sagaState, sagaSummary, stockCounter } from "@/canvas/models/saga-fail";
import { CRASHES, APPROACHES, crashAllowed, fitCrash, outboxRun, type Approach, type Crash } from "@/canvas/models/outbox-crash";
import { ACK_SNAPS, GAP_SNAPS, effects, flow, gapUsed, layoutDots, snapTo, type Consumer } from "@/canvas/models/dedupe-flow";
import { nearestStop, stopXs } from "@/canvas/primitives/snap-stops-rail";
import { sysdesignM14TwoPcCrash } from "@/canvas/sysdesign-m14-2pc-crash/data";
import { sysdesignM14SagaFail } from "@/canvas/sysdesign-m14-saga-fail/data";
import { sysdesignM14OutboxCrash } from "@/canvas/sysdesign-m14-outbox-crash/data";
import { sysdesignM14DedupeFlow } from "@/canvas/sysdesign-m14-dedupe-flow/data";

const DASH = String.fromCharCode(0x2014);
const props = (spec: { title: string; purpose: string; limits: string }) => ({ title: spec.title, purpose: spec.purpose, limits: spec.limits });

describe("2pc crash model", () => {
  it("matches the state table", () => {
    const rows: [number, string, string, boolean][] = [
      [0, "Working", "Working", false],
      [1, "Prepared", "Prepared", true],
      [2, "Prepared", "Prepared", true],
      [3, "Committed", "Prepared", true],
      [4, "Committed", "Committed", false],
    ];
    for (const [p, a, b, blocked] of rows) {
      const s = crashState(p, 15);
      expect(s.a).toBe(a);
      expect(s.b).toBe(b);
      expect(s.blocked).toBe(blocked);
    }
    expect(crashState(3, 15).aLocked).toBe(false);
    expect(crashState(3, 15).bLocked).toBe(true);
    expect(crashState(3, 15).askStock).toBe(true);
    expect(crashState(2, 15).askStock).toBe(false);
  });

  it("counts waiting orders at 2 a second for points 1 to 3 only", () => {
    const checks: [number, number][] = [[5, 10], [15, 30], [30, 60], [120, 240], [600, 1200]];
    for (const [down, waiting] of checks) {
      for (const p of [1, 2, 3] as const) expect(ordersWaiting(p, down)).toBe(waiting);
      expect(ordersWaiting(0, down)).toBe(0);
      expect(ordersWaiting(4, down)).toBe(0);
    }
  });

  it("says the verdicts in 38 characters or fewer", () => {
    const texts = CRASH_POINTS.map((p) => crashState(p, 15).verdict.text);
    expect(texts).toEqual([
      "Safe: both can abort alone",
      "Both stuck with locks held",
      "Both stuck until it reads its log",
      "Payments waits, or asks Stock",
      "Nothing stuck: both committed",
    ]);
    for (const t of texts) expect(t.length).toBeLessThanOrEqual(38);
  });

  it("snaps and formats", () => {
    expect(snapDowntime(20)).toBe(15);
    expect(snapDowntime(1000)).toBe(600);
    expect(snapPoint(7)).toBe(4);
    expect(snapPoint(-2)).toBe(0);
    expect(DOWNTIME_SNAPS.map(formatDowntime)).toEqual(["5 s", "15 s", "30 s", "2 min", "10 min"]);
    expect(downtimeAt(5)).toBe(0);
    expect(downtimeAt(600)).toBe(1);
    expect(queueDots(1200)).toBe(60);
    expect(queueOverflow(1200)).toBe(1140);
    expect(queueOverflow(10)).toBe(0);
  });
});

describe("saga fail model", () => {
  it("matches the check points with undo steps on", () => {
    const names = (ids: number[]) => ids.map((id) => STEPS[id - 1].undo);
    const none = sagaState(0, true);
    expect(none.ran).toEqual([1, 2, 3, 4]);
    expect(none.undone).toEqual([]);
    expect(none.cardNet).toBe(18);
    const f1 = sagaState(1, true);
    expect(f1.ran).toEqual([]);
    expect(f1.undone).toEqual([]);
    expect(f1.cardNet).toBe(0);
    const f2 = sagaState(2, true);
    expect(f2.ran).toEqual([1]);
    expect(names(f2.undone)).toEqual(["Release stock"]);
    expect(f2.stockHeld).toBe(false);
    const f3 = sagaState(3, true);
    expect(f3.ran).toEqual([1, 2]);
    expect(names(f3.undone)).toEqual(["Refund card", "Release stock"]);
    expect(f3.cardNet).toBe(0);
    expect(f3.stockHeld).toBe(false);
    const f4 = sagaState(4, true);
    expect(f4.ran).toEqual([1, 2, 3]);
    expect(f4.undone).toEqual([]);
    expect(f4.retry).toBe(true);
    expect(f4.cardNet).toBe(18);
  });

  it("leaves a half-done order with undo steps off", () => {
    const f2 = sagaState(2, false);
    expect(f2.undone).toEqual([]);
    expect(f2.stockHeld).toBe(true);
    expect(f2.cardNet).toBe(0);
    expect(f2.consistent).toBe(false);
    const f3 = sagaState(3, false);
    expect(f3.stockHeld).toBe(true);
    expect(f3.cardNet).toBe(18);
    expect(f3.consistent).toBe(false);
    expect(cardCounter(f3)).toBe("Card: net 18");
    expect(stockCounter(f3)).toBe("Stock: held");
    expect(cardCounter(sagaState(3, true))).toBe("Card: net 0");
    expect(stockCounter(sagaState(3, true))).toBe("Stock: free");
  });

  it("says the verdicts in 38 characters or fewer", () => {
    const cases: [number, boolean, string][] = [
      [0, true, "All four steps committed"],
      [1, true, "Nothing to undo: step 1 failed"],
      [2, true, "1 undo step: release the stock"],
      [3, true, "2 undo steps, newest first"],
      [4, true, "No undo: retry the receipt"],
      [3, false, "Card charged, stock held, no order"],
      [2, false, "Stock held, no order"],
    ];
    for (const [fail, on, text] of cases) {
      const v = sagaState(fail, on).verdict.text;
      expect(v).toBe(text);
      expect(v.length).toBeLessThanOrEqual(38);
    }
    expect(sagaSummary(sagaState(3, true))).toContain("Refund card, then Release stock");
  });
});

describe("outbox crash model", () => {
  const run = (a: Approach, c: Crash) => outboxRun(a, c);

  it("matches the result table", () => {
    const rows: [Approach, Crash, number, boolean][] = [
      ["save-first", "none", 1, true],
      ["save-first", "between", 0, true],
      ["publish-first", "none", 1, true],
      ["publish-first", "between", 1, false],
      ["outbox", "none", 1, true],
      ["outbox", "between", 1, true],
      ["outbox", "after-publish", 2, true],
    ];
    for (const [a, c, events, saved] of rows) {
      const r = run(a, c);
      expect(r.events).toBe(events);
      expect(r.orderSaved).toBe(saved);
    }
  });

  it("allows the third crash point only for the outbox", () => {
    expect(crashAllowed("save-first", "after-publish")).toBe(false);
    expect(crashAllowed("publish-first", "after-publish")).toBe(false);
    expect(crashAllowed("outbox", "after-publish")).toBe(true);
    expect(fitCrash("save-first", "after-publish")).toBe("between");
    expect(run("publish-first", "after-publish").crash).toBe("between");
  });

  it("says the verdicts in 38 characters or fewer", () => {
    const cases: [Approach, Crash, string][] = [
      ["save-first", "none", "One event, one order"],
      ["save-first", "between", "Order saved, event lost"],
      ["publish-first", "between", "Event for an order that is not there"],
      ["outbox", "between", "Event sent later: nothing lost"],
      ["outbox", "after-publish", "Sent twice: the consumer must cope"],
    ];
    for (const [a, c, text] of cases) {
      const v = run(a, c).verdict.text;
      expect(v).toBe(text);
      expect(v.length).toBeLessThanOrEqual(38);
    }
  });

  it("draws every arrow from a step that exists, with at most six rows and a relay only for the outbox", () => {
    for (const a of APPROACHES) {
      for (const c of CRASHES) {
        const r = run(a.id, c.id);
        const ids = new Set(r.steps.map((s) => s.id));
        for (const s of r.steps) if (s.from) expect(ids.has(s.from)).toBe(true);
        expect(r.rows).toBeLessThanOrEqual(6);
        expect(r.lanes.includes("relay")).toBe(a.id === "outbox");
        expect(r.steps.some((s) => s.lane === "relay")).toBe(a.id === "outbox");
        expect(r.steps.some((s) => s.kind === "cross")).toBe(r.crash !== "none");
      }
    }
  });
});

describe("dedupe flow model", () => {
  const near = (v: number, want: number) => expect(Math.round(v * 10) / 10).toBe(want);

  it("matches the check points", () => {
    const rows: [number, number, number, number, number][] = [
      [0, 0, 100, 100, 100],
      [0.05, 0, 105.3, 100, 100],
      [0.2, 0.05, 125, 105.3, 100],
      [0.2, 0.1, 125, 111.1, 100],
      [0.4, 0.05, 166.7, 105.3, 100],
    ];
    for (const [a, c, none, separate, same] of rows) {
      near(effects("none", a, c), none);
      near(effects("separate", a, c), separate);
      near(effects("same", a, c), same);
    }
  });

  it("matches the challenge 13 expected values for 300 messages", () => {
    near(effects("none", 0.2, 0.05, 300), 375);
    near(effects("separate", 0.2, 0.05, 300), 315.8);
    near(effects("same", 0.2, 0.05, 300), 300);
  });

  it("shows whole numbers and the right verdicts", () => {
    const n = flow("none", 0.2, 0.05);
    expect(n.effectsShown).toBe(125);
    expect(n.extraShown).toBe(25);
    expect(n.verdict.text).toBe("Every copy counts: 25 extra");
    expect(flow("none", 0, 0.05).verdict.text).toBe("No copies, no harm");
    expect(flow("separate", 0.2, 0).verdict.text).toBe("Fine until a crash hits the gap");
    const s = flow("separate", 0.2, 0.05);
    expect(s.effectsShown).toBe(105);
    expect(s.verdict.text).toBe("The crash gap lets 5 through");
    expect(flow("separate", 0.2, 0.1).effectsShown).toBe(111);
    for (const a of ACK_SNAPS) for (const c of GAP_SNAPS) {
      const same = flow("same", a, c);
      expect(same.effectsShown).toBe(100);
      expect(same.extraShown).toBe(0);
      expect(same.verdict.text).toBe("Exactly 100 effects at any chance");
    }
  });

  it("ignores the gap chance for the consumers that do not use it", () => {
    const consumers: Consumer[] = ["none", "same"];
    for (const c of consumers) {
      expect(gapUsed(c)).toBe(false);
      expect(flow(c, 0.2, 0.1).effectsShown).toBe(flow(c, 0.2, 0).effectsShown);
    }
    expect(gapUsed("separate")).toBe(true);
  });

  it("keeps verdicts short and dot counts consistent", () => {
    for (const consumer of ["none", "separate", "same"] as const) {
      for (const a of ACK_SNAPS) for (const c of GAP_SNAPS) {
        const f = flow(consumer, a, c);
        expect(f.verdict.text.length).toBeLessThanOrEqual(38);
        expect(f.dots.length).toBe(100 + f.copiesShown);
        expect(f.dots.filter((d) => d === "original").length).toBe(100);
        expect(f.dots.filter((d) => d === "copy-hit").length).toBe(f.extraShown);
        expect(f.copiesShown).toBeGreaterThanOrEqual(f.extraShown);
        expect(f.dots.length).toBeLessThanOrEqual(200);
      }
    }
  });

  it("lays out dots and snaps", () => {
    expect(layoutDots(4, 2, 1)).toEqual(["original", "original", "copy", "original", "original", "copy-hit"]);
    expect(layoutDots(3, 0, 0)).toEqual(["original", "original", "original"]);
    expect(snapTo(ACK_SNAPS, 0.17)).toBe(0.2);
    expect(snapTo(GAP_SNAPS, 0.5)).toBe(0.1);
  });
});

describe("snap stops rail helpers", () => {
  it("places and picks stops", () => {
    const stops = [{ value: 5, label: "5", at: 0 }, { value: 15, label: "15", at: 0.25 }, { value: 600, label: "600", at: 1 }];
    expect(stopXs(stops, 10, 110)).toEqual([10, 35, 110]);
    expect(nearestStop(stops, 0.1)).toBe(0);
    expect(nearestStop(stops, 0.2)).toBe(1);
    expect(nearestStop(stops, 0.9)).toBe(2);
    expect(stopXs([{ value: 1, label: "a" }, { value: 2, label: "b" }, { value: 3, label: "c" }], 0, 100)).toEqual([0, 50, 100]);
  });
});

describe("m14 playable components", () => {
  const specs = [sysdesignM14TwoPcCrash, sysdesignM14SagaFail, sysdesignM14OutboxCrash, sysdesignM14DedupeFlow];
  for (const spec of specs) {
    it(`server-renders ${spec.title}`, () => {
      const html = renderToString(createElement(spec.component, props(spec)));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(html).not.toContain(DASH);
      expect(html).not.toContain("foreignObject");
      expect(html).not.toContain("<animate");
      expect(html).not.toContain("<use");
      expect(html).not.toContain("<image");
      expect(spec.limits).not.toContain(DASH);
      expect(spec.purpose).not.toContain(DASH);
    });
  }

  it("shows the default state of each picture", () => {
    const a = renderToString(createElement(sysdesignM14TwoPcCrash.component, props(sysdesignM14TwoPcCrash)));
    expect(a).toContain("Both stuck with locks held");
    expect(a).toContain("30 waiting");
    expect(a).toContain('role="slider"');
    const b = renderToString(createElement(sysdesignM14SagaFail.component, props(sysdesignM14SagaFail)));
    expect(b).toContain("2 undo steps, newest first");
    expect(b).toContain("Card: net 0");
    expect(b).toContain("Stock: free");
    expect(sagaSummary(sagaState(3, true))).toContain("Refund card");
    const c = renderToString(createElement(sysdesignM14OutboxCrash.component, props(sysdesignM14OutboxCrash)));
    expect(c).toContain("Order saved, event lost");
    expect(c).toContain("0 events");
    expect(c).toContain("order saved");
    expect(c).toContain('aria-disabled="true"');
    const d = renderToString(createElement(sysdesignM14DedupeFlow.component, props(sysdesignM14DedupeFlow)));
    expect(d).toContain("Every copy counts: 25 extra");
    expect(d).toContain("125 effects applied");
    expect(d).toContain("expected 100");
    expect(d).toContain('role="slider"');
    expect(d).toContain('aria-disabled="true"');
  });
});
