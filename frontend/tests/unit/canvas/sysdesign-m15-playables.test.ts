import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as backlog from "@buildment/learning-ui/canvas/sysdesign-m15-backlog-play/model";
import { sysdesignM15BacklogPlay } from "@buildment/learning-ui/canvas/sysdesign-m15-backlog-play/data";
import * as slow from "@buildment/learning-ui/canvas/sysdesign-m15-slow-subscriber-play/model";
import { sysdesignM15SlowSubscriberPlay } from "@buildment/learning-ui/canvas/sysdesign-m15-slow-subscriber-play/data";
import * as wmark from "@buildment/learning-ui/canvas/sysdesign-m15-watermark-delay-play/model";
import { sysdesignM15WatermarkDelayPlay } from "@buildment/learning-ui/canvas/sysdesign-m15-watermark-delay-play/data";
import * as shapes from "@buildment/learning-ui/canvas/sysdesign-m15-window-shapes-play/model";
import { sysdesignM15WindowShapesPlay } from "@buildment/learning-ui/canvas/sysdesign-m15-window-shapes-play/data";
import * as poison from "@buildment/learning-ui/canvas/sysdesign-m15-poison-play/model";
import { sysdesignM15PoisonPlay } from "@buildment/learning-ui/canvas/sysdesign-m15-poison-play/data";
import * as pkey from "@buildment/learning-ui/canvas/sysdesign-m15-partition-key-play/model";
import { sysdesignM15PartitionKeyPlay } from "@buildment/learning-ui/canvas/sysdesign-m15-partition-key-play/data";
import * as retry from "@buildment/learning-ui/canvas/sysdesign-m15-retry-reorder-play/model";
import { sysdesignM15RetryReorderPlay } from "@buildment/learning-ui/canvas/sysdesign-m15-retry-reorder-play/data";
import * as rebalance from "@buildment/learning-ui/canvas/sysdesign-m15-rebalance-play/model";
import { sysdesignM15RebalancePlay } from "@buildment/learning-ui/canvas/sysdesign-m15-rebalance-play/data";

const VERDICT_MAX = 38;

function renders(spec: { title: string; purpose: string; limits: string; component: unknown }) {
  const html = renderToString(createElement(spec.component as never, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  expect(html).toContain("<svg");
  expect(html).toContain("What this picture leaves out");
  expect(html).not.toContain(String.fromCharCode(0x2014));
  return html;
}

describe("15.2 backlog play", () => {
  // workers, burst, peak, oldest wait, seconds to empty after the burst
  const table: [number, number, number, number, number][] = [
    [5, 250, 3000, 15, 60],
    [5, 300, 6000, 30, 120],
    [5, 350, 9000, 45, 180],
    [5, 400, 12000, 60, 240],
    [6, 300, 3600, 15, 40],
    [6, 400, 9600, 40, 107],
    [4, 250, 5400, 34, 540],
    [4, 300, 8400, 53, 840],
  ];
  it.each(table)("%i workers, burst %i: peak %i, oldest %i s, empty after %i s", (w, b, peak, oldest, empty) => {
    const run = backlog.runBacklog(b, w, null);
    expect(run.peak).toBe(peak);
    expect(run.oldestWait).toBe(oldest);
    expect(run.emptyAfter).toBe(empty);
    expect(run.refused).toBe(0);
    // The closed forms of the spec agree with the run.
    expect(peak).toBe((b - run.capacity) * 60);
  });

  it("never empties at 3 workers and forms no line at 8", () => {
    const three = backlog.runBacklog(300, 3, null);
    expect(three.never).toBe(true);
    expect(three.emptyAfter).toBeNull();
    expect(backlog.verdictFor(three)).toEqual({ text: "The line never empties", tone: "bad" });
    expect(backlog.numbersFor(three).empty).toBe("never");
    const eight = backlog.runBacklog(300, 8, null);
    expect(eight.peak).toBe(0);
    expect(backlog.verdictFor(eight)).toEqual({ text: "No line forms", tone: "good" });
  });

  it("refuses jobs above the limit", () => {
    const a = backlog.runBacklog(300, 5, backlog.QUEUE_LIMIT);
    expect([a.peak, a.refused, a.oldestWait, a.emptyAfter]).toEqual([5000, 1000, 25, 100]);
    expect(backlog.verdictFor(a).text).toBe("Queue full: 1,000 jobs refused");
    const b = backlog.runBacklog(400, 5, backlog.QUEUE_LIMIT);
    expect([b.peak, b.refused, b.oldestWait, b.emptyAfter]).toEqual([5000, 7000, 25, 100]);
  });

  it("says the three verdicts of a healthy and a slow run with the number filled in", () => {
    expect(backlog.verdictFor(backlog.runBacklog(250, 5, null)).text).toBe("Spike absorbed, empty in 60 s");
    expect(backlog.verdictFor(backlog.runBacklog(300, 5, null)).text).toBe("Spike absorbed, empty in 120 s");
    expect(backlog.verdictFor(backlog.runBacklog(350, 5, null))).toEqual({ text: "Line outlives the burst by 3 min", tone: "warn" });
  });

  it("keeps every verdict within 38 characters", () => {
    for (let b = backlog.BURST.min; b <= backlog.BURST.max; b += backlog.BURST.step) {
      for (const w of backlog.WORKER_STOPS) {
        for (const limit of [null, backlog.QUEUE_LIMIT]) expect(backlog.verdictFor(backlog.runBacklog(b, w, limit)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
      }
    }
  });

  it("snaps and steps the burst rail", () => {
    expect(backlog.burstFromFraction(0)).toBe(150);
    expect(backlog.burstFromFraction(1)).toBe(400);
    expect(backlog.burstFromFraction(0.4)).toBe(250);
    expect(backlog.burstKey(300, "ArrowRight")).toBe(310);
    expect(backlog.burstKey(400, "ArrowRight")).toBe(400);
    expect(backlog.burstKey(300, "x")).toBeNull();
  });

  it("reads the value text for a screen reader", () => {
    expect(backlog.valueText(backlog.runBacklog(300, 5, null))).toBe("burst 300 jobs per second, 5 workers, peak 6,000, empty 120 seconds after the burst");
  });

  it("server-renders", () => {
    renders(sysdesignM15BacklogPlay);
  });
});

describe("15.3 rebalance play", () => {
  // consumers, assignment, group limit, idle, partitions that move when one more joins
  const table: [number, string, number, number, number | null][] = [
    [1, "012345", 100, 0, 3],
    [2, "024 / 135", 200, 0, 4],
    [3, "03 / 14 / 25", 300, 0, 3],
    [4, "04 / 15 / 2 / 3", 300, 0, 2],
    [5, "05 / 1 / 2 / 3 / 4", 300, 0, 1],
    [6, "0 / 1 / 2 / 3 / 4 / 5", 600, 0, 0],
    [7, "0 / 1 / 2 / 3 / 4 / 5 / -", 600, 1, 0],
    [8, "0 / 1 / 2 / 3 / 4 / 5 / - / -", 600, 2, null],
  ];
  it.each(table)("%i consumers: %s, limit %i, idle %i, moves %s", (c, assignment, limit, idle, moves) => {
    expect(rebalance.assignmentText(c)).toBe(assignment);
    expect(rebalance.groupLimit(c)).toBe(limit);
    expect(rebalance.idleConsumers(c)).toBe(idle);
    expect(rebalance.movesWhenOneJoins(c)).toBe(moves);
  });

  it("gives every partition exactly one owner", () => {
    for (let c = 1; c <= 8; c++) {
      const flat = rebalance.holdsOf(c).flat().sort();
      expect(flat).toEqual([0, 1, 2, 3, 4, 5]);
    }
  });

  it("lists the moved partitions between two sizes", () => {
    expect(rebalance.movedBetween(2, 3)).toEqual([2, 3, 4, 5]);
    expect(rebalance.movedBetween(5, 6)).toEqual([5]);
    expect(rebalance.movedBetween(3, 3)).toEqual([]);
  });

  it("says the verdicts within 38 characters", () => {
    expect(rebalance.verdictFor(3)).toEqual({ text: "Behind: handles 300 of 450", tone: "bad" });
    expect(rebalance.verdictFor(6)).toEqual({ text: "Keeps up: one partition each", tone: "good" });
    expect(rebalance.verdictFor(7).text).toBe("1 consumer sits idle");
    expect(rebalance.verdictFor(8)).toEqual({ text: "2 consumers sit idle", tone: "warn" });
    for (let c = 1; c <= 8; c++) expect(rebalance.verdictFor(c).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("reads the value text", () => {
    expect(rebalance.valueText(4)).toBe("4 consumers, limit 300 events per second, none idle");
    expect(rebalance.valueText(1)).toBe("1 consumer, limit 100 events per second, none idle");
    expect(rebalance.valueText(8)).toBe("8 consumers, limit 600 events per second, 2 idle");
  });

  it("server-renders", () => {
    renders(sysdesignM15RebalancePlay);
  });
});

describe("15.4 retry reorder play", () => {
  const names = (r: retry.Run) => r.log.map((l) => retry.NAMES[l.update]).join(" > ");

  it("send freely, first send lost: refunded then paid, the state is wrong, 55 ms", () => {
    const r = retry.run(true, "free");
    expect(r.log).toEqual([
      { update: 2, writtenAt: 15, applied: true },
      { update: 1, writtenAt: 55, applied: true },
    ]);
    expect(names(r)).toBe("refunded > paid");
    expect([r.final, r.wrong, r.total]).toEqual(["paid", true, 55]);
    expect(retry.verdictFor(r)).toEqual({ text: "Order shows paid, not refunded", tone: "bad" });
  });

  it("send freely, nothing lost: written at 5 and 15, refunded, 15 ms", () => {
    const r = retry.run(false, "free");
    expect(r.log.map((l) => l.writtenAt)).toEqual([5, 15]);
    expect(names(r)).toBe("paid > refunded");
    expect([r.final, r.wrong, r.total]).toEqual(["refunded", false, 15]);
    expect(retry.verdictFor(r)).toEqual({ text: "Order holds, nothing failed", tone: "good" });
  });

  it("one at a time, first lost: update 1 written at 55 and acked at 60, update 2 sent at 60 and written at 65", () => {
    const r = retry.run(true, "one");
    const two = r.messages.find((m) => m.update === 2);
    expect([two?.sentAt, two?.writtenAt]).toEqual([60, 65]);
    expect(r.log.map((l) => l.writtenAt)).toEqual([55, 65]);
    expect(names(r)).toBe("paid > refunded");
    expect([r.final, r.wrong, r.total]).toEqual(["refunded", false, 65]);
    expect(retry.verdictFor(r)).toEqual({ text: "Safe, but 65 ms instead of 15", tone: "warn" });
    expect(r.total / retry.run(false, "free").total).toBeCloseTo(4.33, 2);
  });

  it("one at a time, nothing lost, costs nothing extra", () => {
    const r = retry.run(false, "one");
    expect([r.final, r.total]).toEqual(["refunded", 15]);
    expect(retry.verdictFor(r).text).toBe("Order holds, nothing failed");
  });

  it("version numbers, first lost: the old version is skipped, 55 ms", () => {
    const r = retry.run(true, "version");
    expect(r.log).toEqual([
      { update: 2, writtenAt: 15, applied: true },
      { update: 1, writtenAt: 55, applied: false },
    ]);
    expect([r.final, r.wrong, r.total]).toEqual(["refunded", false, 55]);
    expect(retry.verdictFor(r)).toEqual({ text: "Safe: the old version is skipped", tone: "good" });
    expect(retry.boxLabel(2, "version")).toBe("refunded v2");
    expect(retry.boxLabel(1, "free")).toBe("1 paid");
  });

  it("keeps every verdict within 38 characters and sorts the messages by send time", () => {
    for (const lost of [true, false]) {
      for (const m of retry.MODES) {
        const r = retry.run(lost, m.id);
        expect(retry.verdictFor(r).text.length).toBeLessThanOrEqual(VERDICT_MAX);
        expect(r.messages.map((x) => x.sentAt)).toEqual([...r.messages.map((x) => x.sentAt)].sort((a, b) => a - b));
      }
    }
  });

  it("plays one flight after another", () => {
    expect(retry.flight(0, 3, 0.2)).toBeNull();
    expect(retry.flight(0, 3, 0.7)).toBeCloseTo(0.5, 5);
    expect(retry.flight(1, 3, 0.7)).toBeNull();
    expect(retry.flight(1, 3, 1.6)).toBeCloseTo(0.5, 5);
  });

  it("server-renders", () => {
    renders(sysdesignM15RetryReorderPlay);
  });
});

describe("15.4 partition key play", () => {
  // key, events per partition, largest share, orders in order, customers in order
  const table: [pkey.KeyId, number[], string, boolean, boolean][] = [
    ["order", [250, 250, 250, 250], "25.0%", true, false],
    ["customer", [170, 320, 325, 185], "32.5%", true, true],
    ["country", [900, 60, 40, 0], "90.0%", true, true],
    ["none", [249, 264, 243, 244], "26.4%", false, false],
  ];
  it.each(table)("key %s: %j, largest %s, orders %s, customers %s", (key, counts, largest, orders, customers) => {
    const a = pkey.analyse(key);
    expect(a.counts).toEqual(counts);
    expect(pkey.exactPercent(a.largest)).toBe(largest);
    expect(a.ordersInOrder).toBe(orders);
    expect(a.customersInOrder).toBe(customers);
    expect(a.counts.reduce((x, y) => x + y)).toBe(1000);
  });

  it("builds the data set the spec describes", () => {
    const { events } = pkey.dataset();
    expect(events).toHaveLength(1000);
    const count = (f: (e: pkey.OrderEvent) => boolean) => events.filter(f).length;
    expect([count((e) => e.customer === "c0"), count((e) => e.customer === "c1"), count((e) => e.customer === "c2")]).toEqual([200, 155, 60]);
    expect([count((e) => e.country === "PS"), count((e) => e.country === "EG"), count((e) => e.country === "JO")]).toEqual([900, 60, 40]);
  });

  it("says the four verdicts within 38 characters", () => {
    expect(pkey.verdictFor(pkey.analyse("order"))).toEqual({ text: "Even load, one order stays in order", tone: "good" });
    expect(pkey.verdictFor(pkey.analyse("customer"))).toEqual({ text: "Hot partition: 33% of all events", tone: "warn" });
    expect(pkey.verdictFor(pkey.analyse("country"))).toEqual({ text: "One partition holds 90% of events", tone: "bad" });
    expect(pkey.verdictFor(pkey.analyse("none"))).toEqual({ text: "Even load, but no order at all", tone: "bad" });
    for (const k of pkey.KEYS) expect(pkey.verdictFor(pkey.analyse(k.id)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("colours only the hottest bar: amber above 30%, red above 50%", () => {
    expect(pkey.barTone(0.25, true)).toBe("accent");
    expect(pkey.barTone(0.325, true)).toBe("warn");
    expect(pkey.barTone(0.9, true)).toBe("bad");
    expect(pkey.barTone(0.9, false)).toBe("accent");
  });

  it("server-renders", () => {
    const html = renders(sysdesignM15PartitionKeyPlay);
    expect(html).toContain("250");
  });
});

describe("15.5 poison play", () => {
  it("never finishes with the queue off and an always bad message", () => {
    const p = poison.plan(false, 5, "always");
    expect([p.outcome, p.totalMs, p.parked]).toEqual(["blocked", null, 0]);
    expect(poison.verdictFor(p)).toEqual({ text: "Blocked at message 10 for ever", tone: "bad" });
  });

  // limit, total time, parked
  const always: [number, string, number][] = [
    [1, "51.00 s", 1],
    [3, "53.10 s", 1],
    [5, "55.20 s", 1],
    [10, "60.45 s", 1],
  ];
  it.each(always)("queue on, always bad, limit %i: %s, %i parked", (limit, total, parked) => {
    const p = poison.plan(true, limit, "always");
    expect(poison.seconds2(p.totalMs ?? 0)).toBe(total);
    expect(p.parked).toBe(parked);
  });

  const flaky: [boolean, number, string, number][] = [
    [true, 1, "51.00 s", 1],
    [true, 2, "52.05 s", 1],
    [true, 3, "52.10 s", 0],
    [true, 5, "52.10 s", 0],
    [true, 10, "52.10 s", 0],
    [false, 5, "52.10 s", 0],
  ];
  it.each(flaky)("flaky, queue %s, limit %i: %s, %i parked", (dlq, limit, total, parked) => {
    const p = poison.plan(dlq, limit, "flaky");
    expect(poison.seconds2(p.totalMs ?? 0)).toBe(total);
    expect(p.parked).toBe(parked);
  });

  it("says the verdicts within 38 characters", () => {
    expect(poison.verdictFor(poison.plan(true, 5, "always"))).toEqual({ text: "Parked after 5 tries, 55 s in all", tone: "good" });
    expect(poison.verdictFor(poison.plan(true, 1, "always")).text).toBe("Parked after 1 try, 51 s in all");
    expect(poison.verdictFor(poison.plan(true, 2, "flaky"))).toEqual({ text: "A good message was parked too soon", tone: "warn" });
    expect(poison.verdictFor(poison.plan(true, 3, "flaky"))).toEqual({ text: "Flaky message worked on try 3", tone: "good" });
    expect(poison.verdictFor(poison.plan(false, 5, "flaky")).text).toBe("Flaky message worked on try 3");
    for (const dlq of [true, false]) for (const bad of ["always", "flaky"] as const) for (const l of poison.LIMITS) expect(poison.verdictFor(poison.plan(dlq, l, bad)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("tells the story to the end state, and a blocked line stays stuck", () => {
    const parked = poison.snapshot(poison.plan(true, 5, "always"), Infinity);
    expect([parked.done, parked.waiting, parked.parked, parked.finished]).toEqual([1000, 0, true, true]);
    expect(parked.ms).toBeCloseTo(55_200, 0);
    const worked = poison.snapshot(poison.plan(false, 5, "flaky"), Infinity);
    expect([worked.done, worked.parked]).toEqual([1000, false]);
    expect(worked.ms).toBeCloseTo(52_100, 0);
    const blocked = poison.snapshot(poison.plan(false, 5, "always"), Infinity);
    expect([blocked.done, blocked.current, blocked.waiting, blocked.finished]).toEqual([9, 10, 990, true]);
  });

  it("runs the story forward and starts again", () => {
    const p = poison.plan(true, 3, "always");
    const early = poison.snapshot(p, 0.5);
    expect(early.done).toBeGreaterThan(0);
    expect(early.done).toBeLessThan(9);
    const trying = poison.snapshot(p, poison.EARLY_S + poison.TRY_S * 0.2);
    expect([trying.tryNo, trying.failing, trying.current]).toEqual([1, true, 10]);
    const loop = poison.storyLength(p) + poison.REST_S;
    expect(poison.snapshot(p, loop + 0.5).done).toBe(early.done);
    // A blocked line keeps counting while it sits stuck.
    const b = poison.plan(false, 5, "always");
    expect(poison.snapshot(b, poison.storyLength(b) + 1).ms).toBeGreaterThan(poison.snapshot(b, poison.storyLength(b)).ms);
  });

  it("server-renders", () => {
    renders(sysdesignM15PoisonPlay);
  });
});

describe("15.6 window shapes play", () => {
  const counts = (s: shapes.Shape) => shapes.windowsFor(s).map((w) => w.count);

  it("tumbling: 3, 2, 2, 1 in windows that start at multiples of 60", () => {
    const w = shapes.windowsFor("tumbling");
    expect(w.map((x) => [x.from, x.to, x.count])).toEqual([
      [0, 60, 3],
      [60, 120, 2],
      [120, 180, 2],
      [180, 240, 1],
    ]);
    expect(shapes.membership("tumbling")).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(shapes.totalCounts("tumbling")).toBe(8);
  });

  it("sliding: 13 windows from -40 to 200, every event in 3, 24 counts", () => {
    const w = shapes.windowsFor("sliding");
    expect(w.map((x) => x.from)).toEqual([-40, -20, 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200]);
    expect(counts("sliding")).toEqual([1, 2, 3, 4, 3, 2, 1, 2, 2, 1, 1, 1, 1]);
    expect(shapes.membership("sliding")).toEqual([3, 3, 3, 3, 3, 3, 3, 3]);
    expect(shapes.totalCounts("sliding")).toBe(24);
    expect(new Set(w.map((x) => x.row))).toEqual(new Set([0, 1, 2]));
  });

  it("sliding windows in one row never overlap", () => {
    const w = shapes.windowsFor("sliding");
    for (let r = 0; r < 3; r++) {
      const row = w.filter((x) => x.row === r);
      for (let i = 1; i < row.length; i++) expect(row[i].from).toBeGreaterThanOrEqual(row[i - 1].to);
    }
  });

  it("session: three sessions with gaps of 55 and 60 seconds", () => {
    const w = shapes.windowsFor("session");
    expect(w.map((x) => [x.from, x.to, x.count])).toEqual([
      [5, 75, 5],
      [130, 140, 2],
      [200, 200, 1],
    ]);
    expect(shapes.sessionGaps().map((g) => g.length)).toEqual([55, 60]);
    expect(shapes.membership("session")).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(w.map((x) => x.closesAt)).toEqual([115, 180, 240]);
  });

  it("says the verdicts within 38 characters", () => {
    expect(shapes.verdictFor("tumbling")).toMatchObject({ text: "Each event is in one window", tone: "good" });
    expect(shapes.verdictFor("sliding")).toMatchObject({ text: "Each event is in 3 windows", tone: "warn", note: "24 counts for 8 events: 3 times the work" });
    expect(shapes.verdictFor("session")).toMatchObject({ text: "Windows follow activity: 3 sessions", tone: "good" });
    for (const s of shapes.SHAPES) expect(shapes.verdictFor(s.id).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("lists the windows for screen readers and sweeps the playhead", () => {
    expect(shapes.tableRows("session")).toEqual([
      { window: "5 to 75 s", events: 5 },
      { window: "130 to 140 s", events: 2 },
      { window: "200 to 200 s", events: 1 },
    ]);
    expect(shapes.playhead(0)).toBe(0);
    expect(shapes.playhead(shapes.SWEEP_S)).toBe(shapes.AXIS_S);
    expect(shapes.playhead(shapes.LOOP_S + 4.5)).toBeCloseTo(120, 5);
  });

  it("server-renders with the text table", () => {
    const html = renders(sysdesignM15WindowShapesPlay);
    expect(html).toContain("0 to 60 s");
  });
});

describe("15.6 watermark delay play", () => {
  // delay, dropped of 40, share counted
  const table: [number, number, number][] = [
    [0, 4, 90],
    [5, 1, 97.5],
    [10, 1, 97.5],
    [20, 0, 100],
    [30, 0, 100],
    [45, 0, 100],
    [60, 0, 100],
  ];
  it.each(table)("delay %i s drops %i, %d%% counted", (delay, dropped, share) => {
    const e = wmark.evaluate(delay, 0);
    expect(e.dropped).toBe(dropped);
    expect((e.counted / wmark.EVENTS.length) * 100).toBe(share);
    expect(e.corrected).toBe(0);
  });

  it("drops the events the chapter names", () => {
    const names = (delay: number) => wmark.evaluate(delay, 0).fates.flatMap((f, i) => (f === "dropped" ? [wmark.EVENTS[i][0]] : []));
    expect(names(0).sort((a, b) => a - b)).toEqual([27, 48, 51, 54]);
    expect(names(5)).toEqual([27]);
    expect(names(10)).toEqual([27]);
    expect(names(20)).toEqual([]);
  });

  it("has the four slowest events 60, 52, 50 and 15.9 seconds late", () => {
    const late = wmark.EVENTS.map((_, i) => Math.round(wmark.lateness(i) * 10) / 10).sort((a, b) => b - a);
    expect(late.slice(0, 4)).toEqual([60, 52, 50, 15.9]);
    expect(wmark.EVENTS).toHaveLength(40);
    expect(wmark.EVENTS.every((e, i) => i === 0 || wmark.EVENTS[i - 1][1] <= e[1])).toBe(true);
  });

  it("with 30 s allowed lateness drops nothing and turns the dropped events into corrections", () => {
    const corrected = [0, 5, 10, 20, 30, 45, 60].map((d) => {
      const e = wmark.evaluate(d, wmark.LATENESS_S);
      expect(e.dropped).toBe(0);
      expect(e.counted).toBe(40);
      return e.corrected;
    });
    expect(corrected).toEqual([4, 1, 1, 0, 0, 0, 0]);
  });

  it("counts each window", () => {
    expect(wmark.evaluate(0, 0).windows).toEqual([
      { counted: 16, total: 20 },
      { counted: 20, total: 20 },
    ]);
    expect(wmark.evaluate(20, 0).windows).toEqual([
      { counted: 20, total: 20 },
      { counted: 20, total: 20 },
    ]);
  });

  it("says the verdicts within 38 characters", () => {
    expect(wmark.verdictFor(wmark.evaluate(0, 0))).toEqual({ text: "4 events dropped, results instant", tone: "warn" });
    expect(wmark.verdictFor(wmark.evaluate(10, 0))).toEqual({ text: "1 dropped, results 10 s behind", tone: "warn" });
    expect(wmark.verdictFor(wmark.evaluate(30, 0))).toEqual({ text: "Nothing dropped, results 30 s late", tone: "good" });
    expect(wmark.verdictFor(wmark.evaluate(0, 30)).text).toBe("4 corrected later, results instant");
    for (const d of wmark.DELAYS) for (const a of [0, 30]) expect(wmark.verdictFor(wmark.evaluate(d, a)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("reads the rail value text and moves the watermark with arrivals", () => {
    expect(wmark.valueText(wmark.evaluate(10, 0))).toBe("delay 10 seconds, 1 event dropped of 40, results 10 seconds behind");
    expect(wmark.watermarkAt(10, 0)).toBeNull();
    expect(wmark.watermarkAt(10, 60.3)).toBe(50);
    expect(wmark.watermarkAt(10, 1000)).toBe(107);
    expect(wmark.latestArrival(1000)?.index).toBe(39);
    expect(wmark.latestArrival(0)).toBeNull();
  });

  it("server-renders", () => {
    const html = renders(sysdesignM15WatermarkDelayPlay);
    expect(html).toContain("of 20");
  });
});

describe("15.7 slow subscriber play", () => {
  // Receipts speed, direct: time per order (ms), pool capacity, behind; queues: Receipts backlog after 10 minutes
  const table: [number, number, string, boolean, number][] = [
    [30, 100, "50.0", false, 0],
    [20, 117, "42.9", false, 0],
    [10, 167, "30.0", false, 6000],
    [6, 233, "21.4", false, 8400],
    [4, 317, "15.8", true, 9600],
    [2, 567, "8.8", true, 10800],
  ];
  it.each(table)("Receipts at %i: %i ms, capacity %s, behind %s, queue %i", (speed, ms, capacity, behind, backlog) => {
    const d = slow.direct(speed);
    expect(Math.round(d.timeMs)).toBe(ms);
    expect(slow.oneDecimal(d.capacity)).toBe(capacity);
    expect(d.behind).toBe(behind);
    const q = slow.queues(speed);
    expect(q.receipts).toBe(backlog);
    expect([q.email, q.stats]).toEqual([0, 0]);
    expect(q.orderMs).toBe(5);
  });

  it("counts the orders that wait when the order service falls behind", () => {
    expect(slow.direct(4).waitingAfter).toBe(2526);
    expect(slow.direct(2).waitingAfter).toBe(6706);
    expect(slow.direct(6).waitingAfter).toBe(0);
  });

  it("says the verdicts within 38 characters", () => {
    expect(slow.verdictFor("direct", 6)).toEqual({ text: "Orders slow: 233 ms each", tone: "warn" });
    expect(slow.verdictFor("direct", 4)).toEqual({ text: "Orders fall behind: only 16 a second", tone: "bad" });
    expect(slow.verdictFor("direct", 2).text).toBe("Orders fall behind: only 9 a second");
    expect(slow.verdictFor("queues", 6)).toEqual({ text: "Orders fast; only Receipts waits", tone: "good" });
    expect(slow.verdictFor("queues", 20)).toEqual({ text: "Everyone keeps up", tone: "good" });
    expect(slow.verdictFor("queues", 30).text).toBe("Everyone keeps up");
    for (const design of ["direct", "queues"] as const) for (const s of slow.SPEEDS) expect(slow.verdictFor(design, s).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("reads the value text and places the stops", () => {
    expect(slow.valueText("direct", 6)).toContain("an order takes 233 ms");
    expect(slow.valueText("queues", 6)).toContain("Receipts queue holds 8,400 after 10 minutes");
    expect(slow.speedToFraction(2)).toBe(0);
    expect(slow.speedToFraction(30)).toBe(1);
  });

  it("server-renders", () => {
    const html = renders(sysdesignM15SlowSubscriberPlay);
    expect(html).toContain("8,400");
  });
});
