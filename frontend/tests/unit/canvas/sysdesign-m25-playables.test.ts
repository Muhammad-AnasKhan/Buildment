import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_FANS,
  DEFAULT_SEATS,
  dropRates,
  dropRing,
  dropTail,
  dropVerdict,
  estimateDrop,
  FAN_STEPS,
  moneyText,
  percentText,
  perSeat,
  perSecond,
  SEAT_STEPS,
} from "@buildment/learning-ui/canvas/models/ticket-drop";
import {
  ADMIT_STOPS,
  admittedBy,
  DEFAULT_ADMIT,
  insidePill,
  lineDots,
  logFraction,
  planPill,
  roomFlow,
  roomValueText,
  roomVerdict,
  sellOutText,
  sellOutWords,
  soldBy,
  timesText,
  waitingRoom,
} from "@buildment/learning-ui/canvas/models/waiting-room";
import {
  ACCOUNTS,
  ALL_IDS,
  balanceText,
  books,
  booksValueText,
  booksVerdict,
  ENTRIES,
  entryText,
  shown,
} from "@buildment/learning-ui/canvas/models/ledger-entries";
import {
  arrivals,
  DEFAULT_ORDER,
  forwardOnly,
  lastWins,
  markerStep,
  ORDER_STOPS,
  orderLabel,
  orderValueText,
  orderVerdict,
  runOrder,
} from "@buildment/learning-ui/canvas/models/webhook-order";
import { sysdesignM25EstimatePlay } from "@buildment/learning-ui/canvas/sysdesign-m25-estimate-play/data";
import { sysdesignM25WaitingRoom } from "@buildment/learning-ui/canvas/sysdesign-m25-waiting-room/data";
import { sysdesignM25PostEntries } from "@buildment/learning-ui/canvas/sysdesign-m25-post-entries/data";
import { sysdesignM25WebhookOrder } from "@buildment/learning-ui/canvas/sysdesign-m25-webhook-order/data";

const MAX = 38;
const ALL = new Set(ALL_IDS);
const without = (...ids: string[]) => new Set(ALL_IDS.filter((id) => !ids.includes(id)));

describe("m25 estimate model (25.1)", () => {
  // fans, seats, requests/s, fans per seat, must fail %, payments/s, money moved, verdict
  const rows: [number, number, number, number, number, number, number, string][] = [
    [100_000, 5_000, 20_000, 20, 90, 41.7, 400_000, "Contention: 90% of holds must fail"],
    [100_000, 20_000, 20_000, 5, 60, 166.7, 1_600_000, "Contention: 60% of holds must fail"],
    [100_000, 50_000, 20_000, 2, 0, 416.7, 4_000_000, "Every hold can succeed"],
    [200_000, 5_000, 40_000, 40, 95, 41.7, 400_000, "Contention: 95% of holds must fail"],
    [200_000, 20_000, 40_000, 10, 80, 166.7, 1_600_000, "Contention: 80% of holds must fail"],
    [200_000, 50_000, 40_000, 4, 50, 416.7, 4_000_000, "Contention: 50% of holds must fail"],
    [400_000, 5_000, 80_000, 80, 97.5, 41.7, 400_000, "Contention: 98% of holds must fail"],
    [400_000, 20_000, 80_000, 20, 90, 166.7, 1_600_000, "Contention: 90% of holds must fail"],
    [400_000, 50_000, 80_000, 8, 75, 416.7, 4_000_000, "Contention: 75% of holds must fail"],
    [1_000_000, 5_000, 200_000, 200, 99, 41.7, 400_000, "Contention: 99% of holds must fail"],
    [1_000_000, 20_000, 200_000, 50, 96, 166.7, 1_600_000, "Contention: 96% of holds must fail"],
    [1_000_000, 50_000, 200_000, 20, 90, 416.7, 4_000_000, "Contention: 90% of holds must fail"],
  ];

  it("matches the spec table for all twelve inputs", () => {
    for (const [fans, seats, requests, perSeatN, fail, payments, money, text] of rows) {
      const r = estimateDrop({ fans, seats });
      expect(r.requestsPerSecond).toBe(requests);
      expect(r.fansPerSeat).toBe(perSeatN);
      expect(r.failPercent).toBeCloseTo(fail, 9);
      expect(r.paymentsPerSecond).toBeCloseTo(payments, 1);
      expect(r.moneyMoved).toBe(money);
      expect(dropVerdict(r).text, `${fans} ${seats}`).toBe(text);
    }
  });

  it("matches the chapter's default: 80,000 requests, 20 per seat, 90%, 167 a second, 1.6 million", () => {
    const r = estimateDrop({ fans: DEFAULT_FANS, seats: DEFAULT_SEATS });
    expect(r.fansFirst).toBe(200_000);
    expect(r.fansPerSecond).toBe(20_000);
    expect(perSecond(r.requestsPerSecond)).toBe("80,000 /s");
    expect(perSeat(r.fansPerSeat)).toBe("20 per seat");
    expect(percentText(r.failPercent)).toBe("90%");
    expect(perSecond(r.paymentsPerSecond)).toBe("167 /s");
    expect(moneyText(r.moneyMoved)).toBe("1.6 million");
    expect(dropTail({ fans: DEFAULT_FANS, seats: DEFAULT_SEATS }, r)).toBe(
      "400,000 fans, 20,000 seats, 80,000 requests a second at peak, 20 fans per seat, 90 percent of holds must fail, 167 payments a second"
    );
  });

  it("rings the failed share from 50% and payments otherwise", () => {
    expect(dropRing(estimateDrop({ fans: 200_000, seats: 50_000 }))).toBe("failed");
    expect(dropRing(estimateDrop({ fans: 100_000, seats: 50_000 }))).toBe("payments");
    expect(dropVerdict(estimateDrop({ fans: 100_000, seats: 50_000 })).tone).toBe("good");
  });

  it("has a small-contention verdict for a share between 0 and 50%", () => {
    // Not reachable from the steps, but part of the rule: 100,000 fans against 40,000 seats.
    const r = estimateDrop({ fans: 100_000, seats: 40_000 });
    expect(dropVerdict(r)).toEqual({ text: "Some contention: 20% of holds fail", tone: "good" });
  });

  it("keeps every verdict within 38 characters and every number finite, for every input", () => {
    for (const fans of FAN_STEPS) {
      for (const seats of SEAT_STEPS) {
        const r = estimateDrop({ fans, seats });
        expect(dropVerdict(r).text.length).toBeLessThanOrEqual(MAX);
        for (const rate of Object.values(dropRates(r))) {
          expect(Number.isFinite(rate)).toBe(true);
          expect(rate).toBeGreaterThanOrEqual(0.3);
          expect(rate).toBeLessThanOrEqual(6);
        }
      }
    }
  });

  it("handles zero without NaN", () => {
    const r = estimateDrop({ fans: 0, seats: 0 });
    expect(r.failPercent).toBe(0);
    expect(r.fansPerSeat).toBe(0);
    expect(dropVerdict(r).text).toBe("Every hold can succeed");
  });
});

describe("m25 waiting room model (25.2)", () => {
  // admit, inside, load, share of plan %, sell-out s, verdict
  const rows: [number, number, number, number, number, string][] = [
    [10, 1_200, 40, 0.8, 4_000, "Safe but slow: sold out in 67 min"],
    [33, 3_960, 132, 2.64, 1_212.1, "Safe but slow: sold out in 20 min"],
    [100, 12_000, 400, 8, 400, "Within plan: sold out in 7 min"],
    [167, 20_040, 668, 13.36, 239.5, "Within plan: sold out in 4 min"],
    [500, 60_000, 2_000, 40, 80, "Within plan: sold out in 80 s"],
    [1_250, 150_000, 5_000, 100, 32, "Within plan: sold out in 32 s"],
    [5_000, 600_000, 20_000, 400, 8, "Store at 4x its plan"],
    [20_000, 2_400_000, 80_000, 1_600, 2, "Store at 16x its plan"],
  ];

  it("matches the spec table for all eight stops", () => {
    expect(rows.map((r) => r[0])).toEqual([...ADMIT_STOPS]);
    for (const [admit, inside, load, share, sellOut, text] of rows) {
      const r = waitingRoom(admit);
      expect(r.inside).toBe(inside);
      expect(r.load).toBe(load);
      expect(r.timesPlan * 100).toBeCloseTo(share, 6);
      expect(r.sellOut).toBeCloseTo(sellOut, 1);
      expect(roomVerdict(r).text, `${admit}`).toBe(text);
    }
  });

  it("matches the chapter's default of 167 a second", () => {
    expect(DEFAULT_ADMIT).toBe(167);
    const r = waitingRoom(DEFAULT_ADMIT);
    expect(planPill(r)).toBe("13% of plan");
    expect(insidePill(r)).toBe("20,040 inside");
    expect(roomValueText(r)).toBe("167 fans a second, 20,040 inside, store at 13 percent of plan, sold out in 4 minutes");
    expect(planPill(waitingRoom(20_000))).toBe("16x plan");
    expect(planPill(waitingRoom(5_000))).toBe("4x plan");
    expect(planPill(waitingRoom(10))).toBe("0.8% of plan");
  });

  it("colours by the rule: over plan is bad, slow is a warning, else good", () => {
    expect(roomVerdict(waitingRoom(1_250)).tone).toBe("good");
    expect(roomVerdict(waitingRoom(1_251)).tone).toBe("bad");
    expect(roomVerdict(waitingRoom(33)).tone).toBe("warn");
    expect(roomVerdict(waitingRoom(100)).tone).toBe("good");
  });

  it("writes times in seconds below 90 s and minutes otherwise", () => {
    expect(sellOutText(80)).toBe("80 s");
    expect(sellOutText(89.4)).toBe("89 s");
    expect(sellOutText(90)).toBe("2 min");
    expect(sellOutText(239.5)).toBe("4 min");
    expect(sellOutWords(80)).toBe("80 seconds");
    expect(sellOutWords(4000)).toBe("67 minutes");
    expect(timesText(4)).toBe("4");
    expect(timesText(16)).toBe("16");
    expect(timesText(2.5)).toBe("2.5");
  });

  it("keeps every verdict within 38 characters and every pill short", () => {
    for (const a of ADMIT_STOPS) {
      const r = waitingRoom(a);
      expect(roomVerdict(r).text.length).toBeLessThanOrEqual(MAX);
      expect(planPill(r).length).toBeLessThanOrEqual(14);
      expect(Number.isFinite(roomFlow(r))).toBe(true);
    }
  });

  it("sells seats and drains the line in proportion, and stops at sell-out", () => {
    const r = waitingRoom(167);
    expect(soldBy(r, 0)).toBe(0);
    expect(soldBy(r, r.sellOut / 2)).toBeCloseTo(0.5, 9);
    expect(soldBy(r, 10_000)).toBe(1);
    expect(admittedBy(r, 10_000)).toBeCloseTo(40_000, 3);
    expect(lineDots(0, 40)).toBe(40);
    expect(lineDots(40_000, 40)).toBe(36);
    expect(lineDots(1e9, 40)).toBe(0);
  });

  it("gives a log gauge fraction between 0 and 1, and none for zero", () => {
    expect(logFraction(20_000, 1_000, 3_000_000)).toBeGreaterThan(0.3);
    expect(logFraction(0, 1_000, 3_000_000)).toBe(0);
    expect(logFraction(1e12, 1_000, 3_000_000)).toBe(1);
  });

  it("handles a zero rate without NaN", () => {
    const r = waitingRoom(0);
    expect(r.sellOut).toBe(Infinity);
    expect(soldBy(r, 100)).toBe(0);
    expect(sellOutText(r.sellOut)).toBe("never");
  });
});

describe("m25 ledger model (25.3)", () => {
  const sale = (...ids: string[]) => new Set(ids);

  it("balances the whole sale", () => {
    const b = books("sale", ALL);
    expect([b.debits, b.credits, b.diff, b.count]).toEqual([100, 100, 0, 3]);
    expect(booksVerdict("sale", b)).toEqual({ text: "Balanced: debits equal credits", tone: "good" });
    expect(b.balances).toEqual({ "provider-clearing": 100, "organizer-payable": -90, "fee-revenue": -10 });
  });

  it("matches the spec table when entries are taken out of the sale", () => {
    const rows: [string[], number, number, string][] = [
      [["sale-organizer", "sale-fee"], 0, 100, "Off by 100: a debit is missing"],
      [["sale-clearing", "sale-fee"], 100, 10, "Off by 90: a credit is missing"],
      [["sale-fee"], 0, 10, "Off by 10: a debit is missing"],
      [["sale-clearing", "sale-organizer"], 100, 90, "Off by 10: a credit is missing"],
      [["sale-organizer"], 0, 90, "Off by 90: a debit is missing"],
      [["sale-clearing"], 100, 0, "Off by 100: a credit is missing"],
      [[], 0, 0, "Nothing posted yet"],
    ];
    for (const [ids, debits, credits, text] of rows) {
      const b = books("sale", sale(...ids));
      expect([b.debits, b.credits]).toEqual([debits, credits]);
      expect(booksVerdict("sale", b).text, ids.join("+")).toBe(text);
    }
    expect(booksVerdict("sale", books("sale", sale())).tone).toBe("accent");
  });

  it("refunds by adding three reversing entries: six entries, balances 0", () => {
    const b = books("refund", ALL);
    expect([b.debits, b.credits, b.diff, b.count]).toEqual([200, 200, 0, 6]);
    expect(Object.values(b.balances)).toEqual([0, 0, 0]);
    expect(booksVerdict("refund", b)).toEqual({ text: "Refunded: 6 entries, balances 0", tone: "good" });
    expect(Object.keys(b.balances)).toEqual([...ACCOUNTS]);
  });

  it("applies the off-by rule to the six cards together", () => {
    const b = books("refund", without("refund-fee"));
    expect([b.debits, b.credits]).toEqual([190, 200]);
    expect(booksVerdict("refund", b).text).toBe("Off by 10: a debit is missing");
    const c = books("refund", without("sale-organizer"));
    expect([c.debits, c.credits]).toEqual([200, 110]);
    expect(booksVerdict("refund", c).text).toBe("Off by 90: a credit is missing");
    // A balanced subset is balanced, but is not the full refund.
    const d = books("refund", without("sale-clearing", "refund-clearing"));
    expect(d.balanced).toBe(true);
    expect(booksVerdict("refund", d).text).toBe("Balanced: debits equal credits");
  });

  it("counts only the sale in the sale step", () => {
    expect(shown("sale")).toHaveLength(3);
    expect(shown("refund")).toHaveLength(6);
    expect(books("sale", ALL).count).toBe(3);
  });

  it("writes the entries and balances the way the cards and pills do", () => {
    expect(entryText(ENTRIES[0])).toBe("Debit provider-clearing 100");
    expect(entryText(ENTRIES[1])).toBe("Credit organizer-payable 90");
    expect(balanceText("organizer-payable", -90)).toBe("organizer-payable -90");
    expect(booksValueText("sale", books("sale", ALL))).toContain("Debits 100, credits 100. 3 entries.");
  });

  it("keeps every verdict within 38 characters for every subset of the six entries", () => {
    for (let mask = 0; mask < 64; mask++) {
      const ids = new Set(ALL_IDS.filter((_, i) => mask & (1 << i)));
      for (const step of ["sale", "refund"] as const) {
        expect(booksVerdict(step, books(step, ids)).text.length).toBeLessThanOrEqual(MAX);
      }
    }
  });
});

describe("m25 webhook order model (25.4)", () => {
  const finals = (order: number, twice: boolean) => {
    const r = runOrder(order, twice);
    return [r.lastFinal, r.forwardFinal];
  };

  it("matches the spec table for the six arrival orders", () => {
    expect(ORDER_STOPS.map(orderLabel)).toEqual(["A C R", "A R C", "C A R", "C R A", "R A C", "R C A"]);
    expect(finals(0, false)).toEqual(["refunded", "refunded"]);
    expect(finals(1, false)).toEqual(["captured", "refunded"]);
    expect(finals(2, false)).toEqual(["refunded", "refunded"]);
    expect(finals(3, false)).toEqual(["authorized", "refunded"]);
    expect(finals(4, false)).toEqual(["captured", "refunded"]);
    expect(finals(5, false)).toEqual(["authorized", "refunded"]);
  });

  it("ends on captured for last wins with a second captured event, and still on refunded going forward", () => {
    for (const order of ORDER_STOPS) expect(finals(order, true)).toEqual(["captured", "refunded"]);
    expect(arrivals(DEFAULT_ORDER, true)).toEqual(["C", "A", "R", "C"]);
  });

  it("ignores events that would move the payment back, and still keeps them", () => {
    const steps = forwardOnly(["C", "A", "R", "C"]);
    expect(steps.map((s) => s.state)).toEqual(["captured", "captured", "refunded", "refunded"]);
    expect(steps.map((s) => s.ignored)).toEqual([false, true, false, true]);
    expect(lastWins(["C", "A", "R", "C"]).map((s) => s.state)).toEqual(["captured", "authorized", "refunded", "captured"]);
  });

  it("writes the verdicts within 38 characters", () => {
    expect(orderVerdict(runOrder(0, false))).toEqual({ text: "Both end on refunded", tone: "good" });
    expect(orderVerdict(runOrder(1, false))).toEqual({ text: "Last wins: captured. Truth: refunded", tone: "bad" });
    expect(orderVerdict(runOrder(3, false)).text).toBe("Last wins: authorized. Truth: refunded");
    for (const order of ORDER_STOPS) {
      for (const twice of [false, true]) expect(orderVerdict(runOrder(order, twice)).text.length).toBeLessThanOrEqual(MAX);
    }
  });

  it("describes the rail value for a screen reader", () => {
    expect(orderValueText(runOrder(2, false), false)).toBe(
      "Arrival order captured, authorized, refunded; last event wins ends on refunded; forward only ends on refunded"
    );
    expect(orderValueText(runOrder(2, true), true)).toContain("captured arrives twice");
  });

  it("steps the marker through each arrival, then rests on the last", () => {
    expect(markerStep(0, 3)).toBe(0);
    expect(markerStep(0.95, 3)).toBe(1);
    expect(markerStep(1.85, 3)).toBe(2);
    expect(markerStep(2.75, 3)).toBe(3);
    expect(markerStep(5.5, 3)).toBe(3);
    // The loop starts again on "created".
    expect(markerStep((3 + 1) * 0.9 + 2.2 + 0.1, 3)).toBe(0);
  });
});

describe("m25 playable canvases render on the server", () => {
  const specs = [sysdesignM25EstimatePlay, sysdesignM25WaitingRoom, sysdesignM25PostEntries, sysdesignM25WebhookOrder];
  const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits })).replaceAll("<!-- -->", "");

  it("draws an svg and the limits fold, with no hex colours and no banned SVG", () => {
    for (const spec of specs) {
      const out = html(spec);
      expect(out, spec.title).toContain("<svg");
      expect(out, spec.title).toContain("What this picture leaves out");
      expect(out, spec.title).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(out, spec.title).not.toMatch(/foreignObject|<animate|<use|<image/);
    }
  });

  it("starts each picture on its default, with the verdict in words", () => {
    expect(html(sysdesignM25EstimatePlay)).toContain("Contention: 90% of holds must fail");
    expect(html(sysdesignM25WaitingRoom)).toContain("Within plan: sold out in 4 min");
    expect(html(sysdesignM25PostEntries)).toContain("Balanced: debits equal credits");
    expect(html(sysdesignM25WebhookOrder)).toContain("Both end on refunded");
  });

  it("gives each input an accessible slider or button name and value", () => {
    const estimate = html(sysdesignM25EstimatePlay);
    expect(estimate).toContain('role="slider"');
    expect(estimate).toContain("400,000 fans, 20,000 seats, 80,000 requests a second at peak, 20 fans per seat, 90 percent of holds must fail, 167 payments a second");
    expect(html(sysdesignM25WaitingRoom)).toContain("167 fans a second, 20,040 inside, store at 13 percent of plan, sold out in 4 minutes");
    expect(html(sysdesignM25PostEntries)).toContain("Debit provider-clearing 100, included");
    const webhook = html(sysdesignM25WebhookOrder);
    expect(webhook).toContain("Arrival order captured, authorized, refunded; last event wins ends on refunded; forward only ends on refunded");
    expect(webhook).toContain("Captured arrives twice");
  });

  it("keeps the title, purpose and limits as plain data", () => {
    for (const spec of specs) {
      expect(spec.kind).toBe("custom");
      expect(spec.title.length).toBeGreaterThan(5);
      expect(spec.limits.length).toBeGreaterThan(80);
      for (const text of [spec.title, spec.purpose, spec.limits]) expect(text).not.toContain("2014");
    }
  });
});
