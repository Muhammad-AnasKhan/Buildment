import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkDesign, designFrame, VERDICT_MAX } from "@/canvas/models/design-stepper";
import { formatBytes } from "@/canvas/models/envelope-estimate";
import {
  chainRates,
  chatEstimate,
  driver,
  estimateTail,
  estimateVerdict,
  gatewaysText,
  linesText,
  MESSAGE_STEPS,
  ONLINE_STEPS,
  ratePerSecond,
  USER_STEPS,
} from "@/canvas/models/dardasha-estimate";
import {
  CHAT_SERVERS,
  GATEWAYS,
  OPEN_LINES,
  PEAK_DELIVERIES,
  PEAK_MESSAGES,
} from "@/canvas/models/dardasha-numbers";
import {
  dardashaDesign,
  designNumbers,
  partitionVerdict,
  PARTITION_CHOICES,
  planText,
  planTone,
  PUSH_JOBS,
  REGISTRY_OPERATIONS,
} from "@/canvas/models/dardasha-design";
import {
  dotCount,
  dotProgress,
  K_CHOICES,
  linesAt,
  restartRun,
  restartValueText,
  restartVerdict,
  returned,
  secondsText,
  SPREAD_STEPS,
} from "@/canvas/models/gateway-restart";
import {
  DELAY_STEPS,
  finalOrder,
  holdMs,
  legProgress,
  legs,
  listText,
  loopSeconds,
  orderRun,
  orderVerdict,
  phoneRows,
  phonesAgree,
  simAt,
} from "@/canvas/models/dardasha-order";
import { GAP_STEPS, presenceRun, presenceValueText, presenceVerdict, storeTone, storeWritesText } from "@/canvas/models/dardasha-presence";
import { LIMIT_STEPS, limitLine, OUTAGE_STEPS, outageRun, outageValueText, outageVerdict } from "@/canvas/models/dardasha-outage";
import { sysdesignM22EstimatePlay } from "@/canvas/sysdesign-m22-estimate-play/data";
import { sysdesignM22DesignStepper } from "@/canvas/sysdesign-m22-design-stepper/data";
import { sysdesignM22ConnectionsPlay } from "@/canvas/sysdesign-m22-connections-play/data";
import { sysdesignM22SequencePlay } from "@/canvas/sysdesign-m22-sequence-play/data";
import { sysdesignM22PresencePlay } from "@/canvas/sysdesign-m22-presence-play/data";
import { sysdesignM22OutagePlay } from "@/canvas/sysdesign-m22-outage-play/data";

const MAX = 38;

describe("m22 estimate model (22.1)", () => {
  const row = (users: number, perUser: number, online: number) => chatEstimate({ users, perUser, online });

  it("matches the spec's table", () => {
    const base = row(10e6, 40, 0.2);
    expect(base.messagesPerDay).toBe(400e6);
    expect(Math.round(base.averagePerSecond)).toBe(4_630);
    expect(Math.round(base.peakPerSecond)).toBe(13_889);
    expect(Math.round(base.deliveriesPerSecond)).toBe(41_667);
    expect(base.openLines).toBe(3_000_000);
    expect(base.gateways).toBe(60);
    expect(formatBytes(base.storageBytes)).toBe("43.8 TB");
    expect(driver(base)).toBe("lines");

    const one = row(1e6, 40, 0.2);
    expect(Math.round(one.averagePerSecond)).toBe(463);
    expect(Math.round(one.peakPerSecond)).toBe(1_389);
    expect(Math.round(one.deliveriesPerSecond)).toBe(4_167);
    expect(one.openLines).toBe(300_000);
    expect(one.gateways).toBe(6);
    expect(formatBytes(one.storageBytes)).toBe("4.38 TB");
    expect(driver(one)).toBe("none");

    const fifty = row(50e6, 40, 0.2);
    expect(Math.round(fifty.averagePerSecond)).toBe(23_148);
    expect(Math.round(fifty.peakPerSecond)).toBe(69_444);
    expect(Math.round(fifty.deliveriesPerSecond)).toBe(208_333);
    expect(fifty.openLines).toBe(15_000_000);
    expect(fifty.gateways).toBe(300);
    expect(formatBytes(fifty.storageBytes)).toBe("219 TB");

    const few = row(10e6, 10, 0.2);
    expect(Math.round(few.averagePerSecond)).toBe(1_157);
    expect(Math.round(few.peakPerSecond)).toBe(3_472);
    expect(Math.round(few.deliveriesPerSecond)).toBe(10_417);
    expect(formatBytes(few.storageBytes)).toBe("10.9 TB");
    expect(driver(few)).toBe("lines");

    const many = row(10e6, 160, 0.2);
    expect(Math.round(many.averagePerSecond)).toBe(18_519);
    expect(Math.round(many.peakPerSecond)).toBe(55_556);
    expect(Math.round(many.deliveriesPerSecond)).toBe(166_667);
    expect(formatBytes(many.storageBytes)).toBe("175 TB");

    expect(row(10e6, 40, 0.1).openLines).toBe(1_500_000);
    expect(row(10e6, 40, 0.1).gateways).toBe(30);
    expect(row(10e6, 40, 0.3).openLines).toBe(4_500_000);
    expect(row(10e6, 40, 0.3).gateways).toBe(90);

    const peaky = row(1e6, 160, 0.1);
    expect(Math.round(peaky.averagePerSecond)).toBe(1_852);
    expect(Math.round(peaky.peakPerSecond)).toBe(5_556);
    expect(Math.round(peaky.deliveriesPerSecond)).toBe(16_667);
    expect(peaky.openLines).toBe(150_000);
    expect(peaky.gateways).toBe(3);
    expect(driver(peaky)).toBe("peak");

    const tiny = row(1e6, 10, 0.1);
    expect(Math.round(tiny.averagePerSecond)).toBe(116);
    expect(Math.round(tiny.peakPerSecond)).toBe(347);
    expect(Math.round(tiny.deliveriesPerSecond)).toBe(1_042);
    expect(formatBytes(tiny.storageBytes)).toBe("1.09 TB");
    expect(driver(tiny)).toBe("none");
  });

  it("does not trip on floating point when it counts gateways", () => {
    // 1.5 x 0.2 x 1,000,000 is 300,000.00000000006 before rounding; it must be 6 gateways, not 7.
    expect(row(1e6, 40, 0.2).gateways).toBe(6);
    expect(row(5e6, 40, 0.2).gateways).toBe(30);
  });

  it("writes the numbers the way the picture shows them", () => {
    const base = row(10e6, 40, 0.2);
    expect(ratePerSecond(base.averagePerSecond)).toBe("4,630 /s");
    expect(ratePerSecond(base.peakPerSecond)).toBe("13,889 /s");
    expect(ratePerSecond(base.deliveriesPerSecond)).toBe("41,667 /s");
    expect(linesText(base.openLines)).toBe("3.0 million");
    expect(linesText(150_000)).toBe("150,000");
    expect(linesText(4_500_000)).toBe("4.5 million");
    expect(gatewaysText(base.gateways)).toBe("60 gateways");
    expect(gatewaysText(1)).toBe("1 gateway");
    expect(estimateTail(base)).toBe("3.0 million open lines, 60 gateways, 13,889 messages a second at peak, 43.8 terabytes a year");
  });

  it("rings and words the verdict by the first rule that holds", () => {
    expect(estimateVerdict(row(10e6, 40, 0.2))).toEqual({ text: "Open connections drive it", tone: "warn" });
    expect(estimateVerdict(row(1e6, 160, 0.1))).toEqual({ text: "Message rate drives it", tone: "warn" });
    // 5M users, 20 messages, 10% online: 15 gateways, 3,472 a second, 10.95 TB.
    const storage = row(5e6, 20, 0.1);
    expect(driver(storage)).toBe("storage");
    expect(estimateVerdict(storage)).toEqual({ text: "Storage drives it", tone: "warn" });
    expect(estimateVerdict(row(1e6, 10, 0.1))).toEqual({ text: "One small cluster could serve this", tone: "good" });
  });

  it("keeps every verdict to 38 characters or fewer across every input", () => {
    const seen = new Set<string>();
    for (const u of USER_STEPS) for (const m of MESSAGE_STEPS) for (const o of ONLINE_STEPS) {
      const v = estimateVerdict(row(u, m, o));
      seen.add(v.text);
      expect(v.text.length, v.text).toBeLessThanOrEqual(MAX);
    }
    expect(seen.size).toBe(4);
  });

  it("flows faster for bigger values", () => {
    const small = chainRates(row(1e6, 10, 0.1));
    const big = chainRates(row(50e6, 160, 0.3));
    expect(big.peak).toBeGreaterThan(small.peak);
    expect(big.lines).toBeGreaterThan(small.lines);
    expect(big.storage).toBeGreaterThan(small.storage);
  });
});

describe("m22 design model (22.2)", () => {
  it("draws every step cleanly for each partition count", () => {
    for (const k of PARTITION_CHOICES) expect(checkDesign(dardashaDesign(k)), `k = ${k}`).toEqual([]);
  });

  it("has the five steps of the spec", () => {
    expect(dardashaDesign().steps.map((s) => s.title)).toEqual(["One box", "Gateways", "Split store", "Registry", "Notifier"]);
  });

  it("matches the spec's numbers", () => {
    expect(PEAK_MESSAGES).toBe(13_889);
    expect(PEAK_DELIVERIES).toBe(41_667);
    expect(OPEN_LINES).toBe(3_000_000);
    expect(GATEWAYS).toBe(60);
    expect(CHAT_SERVERS).toBe(7);
    expect(REGISTRY_OPERATIONS).toBe(44_792);
    expect(PUSH_JOBS).toBe(4_167);
    expect(designNumbers(1).timesPlan).toBe(60);
    expect(designNumbers(2).timesPlan).toBeCloseTo(5.56, 2);
    expect(Math.round(designNumbers(3, 4).load)).toBe(3_472);
    expect(designNumbers(3, 4).timesPlan).toBeCloseTo(1.39, 2);
    expect(Math.round(designNumbers(3, 6).load)).toBe(2_315);
    expect(designNumbers(3, 6).timesPlan).toBeCloseTo(0.93, 2);
    expect(Math.round(designNumbers(3, 8).load)).toBe(1_736);
    expect(designNumbers(3, 8).timesPlan).toBeCloseTo(0.69, 2);
    expect(designNumbers(4).timesPlan).toBeCloseTo(0.9, 2);
    expect(Math.round(designNumbers(4).load / 2)).toBe(22_396);
    expect(designNumbers(4).load / 2 / 50_000).toBeCloseTo(0.45, 2);
    expect(designNumbers(5).load).toBe(4_167);
  });

  it("tones a block by how many times its plan it carries", () => {
    expect(planTone(60)).toBe("bad");
    expect(planTone(1.39)).toBe("bad");
    expect(planTone(0.93)).toBe("warn");
    expect(planTone(0.8)).toBe("warn");
    expect(planTone(0.69)).toBe("good");
    expect(planText(60)).toBe("60x its plan");
    expect(planText(5.56)).toBe("5.6x its plan");
    expect(planText(0.93)).toBe("93% of plan");
    expect(planText(0.69)).toBe("69% of plan");
  });

  it("gives the verdicts of the spec, each 38 characters or fewer", () => {
    const steps = dardashaDesign().steps;
    expect(steps[0].verdict).toEqual({ text: "One server holds 60 times its plan", tone: "bad" });
    expect(steps[1].verdict).toEqual({ text: "Lines fit; the store is 5.6x its plan", tone: "warn" });
    expect(partitionVerdict(8)).toEqual({ text: "Each partition has room", tone: "good" });
    expect(partitionVerdict(6)).toEqual({ text: "Tight: 93% of one node's plan", tone: "warn" });
    expect(partitionVerdict(4)).toEqual({ text: "Still 1.4x one node's plan", tone: "bad" });
    expect(steps[3].verdict).toEqual({ text: "Lookups fit on two registry nodes", tone: "good" });
    expect(steps[4].verdict).toEqual({ text: "Off-line phones go through a queue", tone: "good" });
    for (const k of PARTITION_CHOICES) for (let s = 0; s < 5; s++) expect(designFrame(dardashaDesign(k), s, 0).verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("shows the partition pill on the store card in step 3", () => {
    const pill = (k: number) => designFrame(dardashaDesign(k), 2, 0).actors.find((a) => a.id === "store")?.status;
    expect(pill(8)).toEqual({ text: "69% of plan", tone: "good" });
    expect(pill(6)).toEqual({ text: "93% of plan", tone: "warn" });
    expect(pill(4)).toEqual({ text: "1.4x its plan", tone: "bad" });
    const registry = designFrame(dardashaDesign(8), 3, 0).actors.find((a) => a.id === "registry");
    expect(registry?.status?.text).toBe("45% each");
  });
});

describe("m22 gateway restart model (22.3)", () => {
  it("matches the spec's table", () => {
    const rows: [number, number, number, number, number, boolean, number, number][] = [
      // k, J, phones, fleet accepts, arrivals, over, time, lines each
      [1, 0, 50_000, 29_500, 50_000, true, 1.7, 50_847],
      [1, 5, 50_000, 29_500, 10_000, false, 5, 50_847],
      [6, 0, 300_000, 27_000, 300_000, true, 11.1, 55_556],
      [6, 5, 300_000, 27_000, 60_000, true, 11.1, 55_556],
      [6, 15, 300_000, 27_000, 20_000, false, 15, 55_556],
      [6, 30, 300_000, 27_000, 10_000, false, 30, 55_556],
      [15, 30, 750_000, 22_500, 25_000, true, 33.3, 66_667],
      [30, 30, 1_500_000, 15_000, 50_000, true, 100, 100_000],
    ];
    for (const [k, j, phones, accepts, arrival, over, time, lines] of rows) {
      const r = restartRun(k, j);
      expect(r.phones, `${k}/${j}`).toBe(phones);
      expect(r.accepts, `${k}/${j}`).toBe(accepts);
      expect(Math.round(r.arrival), `${k}/${j}`).toBe(arrival);
      expect(r.over, `${k}/${j}`).toBe(over);
      expect(Math.round(r.time * 10) / 10, `${k}/${j}`).toBe(time);
      expect(Math.round(r.linesEach), `${k}/${j}`).toBe(lines);
    }
  });

  it("gives the verdicts of the spec", () => {
    expect(restartVerdict(restartRun(1, 0))).toEqual({ text: "Too many at once: retries pile up", tone: "bad" });
    expect(restartVerdict(restartRun(6, 5))).toEqual({ text: "Too many at once: retries pile up", tone: "bad" });
    expect(restartVerdict(restartRun(1, 5))).toEqual({ text: "Back in 5 s, no overload", tone: "good" });
    expect(restartVerdict(restartRun(6, 15))).toEqual({ text: "Back in 15 s, no overload", tone: "good" });
    expect(restartVerdict(restartRun(30, 30))).toEqual({ text: "Gateways full: lines at the limit", tone: "bad" });
    expect(restartVerdict(restartRun(15, 30))).toEqual({ text: "Too many at once: retries pile up", tone: "bad" });
    for (const k of K_CHOICES) for (const j of SPREAD_STEPS) expect(restartVerdict(restartRun(k, j)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("brings the phones back over the time it takes, and fills the lines to the end", () => {
    const r = restartRun(6, 15);
    expect(returned(r, 0)).toBe(0);
    expect(returned(r, 7.5)).toBeCloseTo(0.5, 5);
    expect(returned(r, 99)).toBe(1);
    expect(linesAt(r, 0)).toBe(50_000);
    expect(Math.round(linesAt(r, 99))).toBe(55_556);
    expect(secondsText(1.69)).toBe("1.7 s");
    expect(secondsText(5)).toBe("5 s");
    expect(secondsText(100)).toBe("100 s");
  });

  it("sends dots for a bigger restart over the window, and none before or after", () => {
    expect(dotCount(1)).toBeLessThan(dotCount(6));
    expect(dotCount(30)).toBe(30);
    const r = restartRun(6, 15);
    expect(dotProgress(r, 0, 0)).toBeNull();
    const early = dotProgress(r, 0, 0.8);
    expect(early).not.toBeNull();
    expect(dotProgress(r, 0, 20)).toBeNull();
  });

  it("says the state in one sentence", () => {
    expect(restartValueText(restartRun(6, 15))).toBe("6 gateways restart, spread 15 seconds, 20,000 arrivals a second, fleet accepts 27,000");
    expect(restartValueText(restartRun(1, 0))).toBe("1 gateway restarts, no spread, 50,000 arrivals a second, fleet accepts 29,500");
  });
});

describe("m22 order model (22.4)", () => {
  it("matches the spec's table by arrival and by number", () => {
    const table: [number, number[], number[], boolean, number[], number][] = [
      [50, [1, 2], [1, 2], true, [1, 2], 0],
      [100, [1, 2], [1, 2], true, [1, 2], 0],
      [200, [1, 2], [2, 1], false, [1, 2], 60],
      [500, [1, 2], [2, 1], false, [1, 2], 360],
      [1000, [1, 2], [2, 1], false, [1, 2], 860],
    ];
    for (const [d, layla, sami, agree, byNumber, hold] of table) {
      const run = orderRun("dana", d);
      expect(finalOrder(run, "layla", "arrival"), `D=${d}`).toEqual(layla);
      expect(finalOrder(run, "sami", "arrival"), `D=${d}`).toEqual(sami);
      expect(phonesAgree(run, "arrival"), `D=${d}`).toBe(agree);
      expect(finalOrder(run, "sami", "number"), `D=${d}`).toEqual(byNumber);
      expect(phonesAgree(run, "number"), `D=${d}`).toBe(true);
      expect(holdMs(run), `D=${d}`).toBe(hold);
    }
  });

  it("uses the times of the spec", () => {
    const run = orderRun("omar", 200);
    const [m1, m2] = run.msgs;
    expect(m1.sender).toBe("omar");
    expect(m2.sender).toBe("dana");
    expect([m1.sentAt, m1.atService, m1.atLayla, m1.atSami]).toEqual([0, 30, 70, 230]);
    expect([m2.sentAt, m2.atService, m2.atLayla, m2.atSami]).toEqual([100, 130, 170, 170]);
  });

  it("avoids the tie at 140 ms in its snap points", () => {
    expect(DELAY_STEPS).not.toContain(140);
  });

  it("gives the verdicts of the spec", () => {
    expect(orderVerdict(orderRun("dana", 200), "arrival")).toEqual({ text: "Phones disagree on the order", tone: "bad" });
    expect(orderVerdict(orderRun("dana", 100), "arrival")).toEqual({ text: "Same order, only by luck", tone: "warn" });
    expect(orderVerdict(orderRun("dana", 200), "number")).toEqual({ text: "Same order on every phone", tone: "good" });
    for (const d of DELAY_STEPS) for (const s of ["arrival", "number"] as const) expect(orderVerdict(orderRun("dana", d), s).text.length).toBeLessThanOrEqual(MAX);
  });

  it("holds message 2 greyed until message 1 is in, in number mode", () => {
    const run = orderRun("dana", 500);
    // At 200 ms message 2 is at Sami and message 1 is not.
    const held = phoneRows(run, "sami", "number", 200);
    expect(held[0]).toBeNull();
    expect(held[1]).toEqual({ n: 2, sender: "omar", state: "held" });
    const after = phoneRows(run, "sami", "number", 600);
    expect(after[0]?.state).toBe("shown");
    expect(after[1]?.state).toBe("shown");
    // By arrival the same moment shows message 2 first.
    const early = phoneRows(run, "sami", "arrival", 200);
    expect(early[0]).toEqual({ n: 2, sender: "omar", state: "shown" });
  });

  it("describes a list in words", () => {
    expect(listText(orderRun("dana", 200), "sami", "arrival")).toBe("Sami's phone shows: Omar's message, then Dana's");
    expect(listText(orderRun("dana", 200), "sami", "number")).toBe("Sami's phone shows: Dana's message, then Omar's");
  });

  it("plays in a loop that ends on the finished picture", () => {
    const run = orderRun("dana", 1000);
    const loop = loopSeconds(run);
    expect(loop).toBeGreaterThan(5);
    expect(simAt(run, 0)).toBe(0);
    expect(simAt(run, loop - 0.01)).toBeGreaterThan(1000);
    const all = legs(run);
    expect(all).toHaveLength(6);
    const first = all[0];
    expect(legProgress(first, first.t0 - 1)).toBeNull();
    expect(legProgress(first, (first.t0 + first.t1) / 2)).toBeCloseTo(0.5, 5);
  });

  it("shows one message while only the first sender has tapped", () => {
    const run = orderRun("dana", 200, 1);
    expect(run.msgs).toHaveLength(1);
    expect(holdMs(run)).toBe(0);
    expect(phoneRows(run, "layla", "arrival", 1_000)[1]).toBeNull();
  });
});

describe("m22 presence model (22.4)", () => {
  it("matches the spec's table", () => {
    const table: [number, number, number, number][] = [
      [5, 600_000, 43.2, 10],
      [15, 200_000, 14.4, 30],
      [30, 100_000, 7.2, 60],
      [60, 50_000, 3.6, 120],
      [120, 25_000, 1.8, 240],
    ];
    for (const [gap, pings, times, offline] of table) {
      const store = presenceRun(gap, "store");
      expect(store.pingsPerSecond).toBe(pings);
      expect(Math.round(store.timesMessages * 10) / 10).toBe(times);
      expect(store.offlineAfter).toBe(offline);
      expect(store.storeWrites).toBe(pings);
      const gateway = presenceRun(gap, "gateway");
      expect(gateway.pingsPerSecond).toBe(pings);
      expect(gateway.storeWrites).toBeGreaterThanOrEqual(3_125);
      expect(gateway.storeWrites).toBeLessThan(3_200);
      expect(storeWritesText(gateway)).toBe("~3,125 /s");
    }
  });

  it("gives the verdicts by the first rule that holds", () => {
    expect(presenceVerdict(presenceRun(30, "store"))).toEqual({ text: "Pings are 7x the message rate", tone: "bad" });
    expect(presenceVerdict(presenceRun(5, "store"))).toEqual({ text: "Pings are 43x the message rate", tone: "bad" });
    expect(presenceVerdict(presenceRun(60, "store"))).toEqual({ text: "Pings are 4x the message rate", tone: "bad" });
    expect(presenceVerdict(presenceRun(120, "store"))).toEqual({ text: "Pings below 2x the message rate", tone: "warn" });
    expect(presenceVerdict(presenceRun(120, "gateway"))).toEqual({ text: "Cheap, but a dot 4 minutes late", tone: "warn" });
    expect(presenceVerdict(presenceRun(30, "gateway"))).toEqual({ text: "Cheap: store sees only changes", tone: "good" });
    for (const g of GAP_STEPS) for (const e of ["store", "gateway"] as const) expect(presenceVerdict(presenceRun(g, e)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("tones the store by how close a node is to its plan", () => {
    expect(storeTone(600_000)).toBe("bad");
    expect(storeTone(100_000)).toBe("bad");
    expect(storeTone(50_000)).toBe("warn");
    expect(storeTone(25_000)).toBe("warn");
    expect(storeTone(3_137)).toBe("good");
  });

  it("says the state in one sentence", () => {
    expect(presenceValueText(presenceRun(30, "store"))).toBe(
      "ping every 30 seconds, 100,000 pings a second, 7.2 times the message rate, offline shown after 60 seconds, each ping is written to the store, store writes 100,000 a second"
    );
    expect(presenceValueText(presenceRun(30, "gateway"))).toContain("the store sees only changes, store writes about 3,125 a second");
  });
});

describe("m22 outage model (22.5)", () => {
  it("matches the spec's table", () => {
    const table: [number, number, number, number, number, number][] = [
      // outage, limit (0 = never), waiting at end, dropped, longest wait (min), back to normal (min)
      [1, 0, 6_000, 0, 1, 2],
      [2, 0, 12_000, 0, 2, 4],
      [5, 0, 30_000, 0, 5, 10],
      [10, 0, 60_000, 0, 10, 20],
      [5, 10, 30_000, 0, 5, 10],
      [5, 5, 30_000, 0, 5, 10],
      [5, 2, 30_000, 18_000, 2, 4],
      [10, 5, 60_000, 30_000, 5, 10],
      [10, 2, 60_000, 48_000, 2, 4],
      [2, 2, 12_000, 0, 2, 4],
    ];
    for (const [outage, limit, waiting, dropped, longest, back] of table) {
      const r = outageRun(outage, limit);
      const where = `${outage} min, limit ${limit}`;
      expect(r.waiting, where).toBe(waiting);
      expect(r.dropped, where).toBe(dropped);
      expect(r.longestWait / 60, where).toBe(longest);
      expect(r.backSeconds / 60, where).toBe(back);
      expect(r.afterDrop, where).toBe(waiting - dropped);
    }
  });

  it("rises while the provider is down, then shrinks by the spare capacity", () => {
    const r = outageRun(5, 0);
    expect(r.series[0]).toBe(100);
    expect(r.series[299]).toBe(30_000);
    expect(r.series[300]).toBe(29_950);
    expect(r.series[600]).toBe(29_950 - 300 * 50);
    expect(r.series[899]).toBe(0);
    expect(r.series[1800]).toBe(0);
  });

  it("gives the verdicts of the spec", () => {
    expect(outageVerdict(outageRun(5, 2))).toEqual({ text: "18,000 stale dropped; clear in 4 min", tone: "good" });
    expect(outageVerdict(outageRun(10, 2))).toEqual({ text: "48,000 stale dropped; clear in 4 min", tone: "good" });
    expect(outageVerdict(outageRun(5, 0))).toEqual({ text: "Old codes sent late: clear in 10 min", tone: "warn" });
    expect(outageVerdict(outageRun(2, 2))).toEqual({ text: "Old codes sent late: clear in 4 min", tone: "warn" });
    expect(outageVerdict(outageRun(1, 0))).toEqual({ text: "Short outage: clear in 2 min", tone: "good" });
    for (const o of OUTAGE_STEPS) for (const l of LIMIT_STEPS) expect(outageVerdict(outageRun(o, l)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("puts the stale line where the oldest code is as old as the limit", () => {
    expect(limitLine(2)).toBe(12_000);
    expect(limitLine(5)).toBe(30_000);
    expect(limitLine(10)).toBe(60_000);
  });

  it("says the state in one sentence", () => {
    expect(outageValueText(outageRun(5, 2))).toBe("5 minute outage, drop codes older than 2 minutes, 30,000 waiting at the end, 18,000 dropped, back to normal in 4 minutes");
    expect(outageValueText(outageRun(5, 0))).toContain("never drop codes");
  });
});

describe("m22 playables as data and on the server", () => {
  const specs = [
    sysdesignM22EstimatePlay,
    sysdesignM22DesignStepper,
    sysdesignM22ConnectionsPlay,
    sysdesignM22SequencePlay,
    sysdesignM22PresencePlay,
    sysdesignM22OutagePlay,
  ];

  it("are custom canvases with a title, a purpose, limits and a component", () => {
    for (const s of specs) {
      expect(s.kind).toBe("custom");
      expect(s.title.length).toBeGreaterThan(5);
      expect(s.purpose.length).toBeGreaterThan(20);
      expect(s.limits.length).toBeGreaterThan(20);
      expect(typeof s.component).toBe("function");
      expect(`${s.title}${s.purpose}${s.limits}`).not.toContain(String.fromCharCode(0x2014));
    }
  });

  it("render on the server with an svg and the limits fold", () => {
    for (const s of specs) {
      const html = renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits }));
      expect(html, s.title).toContain("<svg");
      expect(html, s.title).toContain("What this picture leaves out");
    }
  });

  it("start on the default case of the chapter", () => {
    const render = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits }));
    expect(render(sysdesignM22EstimatePlay)).toContain("Open connections drive it");
    expect(render(sysdesignM22DesignStepper)).toContain("One server holds 60 times its plan");
    expect(render(sysdesignM22ConnectionsPlay)).toContain("Too many at once");
    expect(render(sysdesignM22SequencePlay)).toContain("Phones disagree on the order");
    expect(render(sysdesignM22PresencePlay)).toContain("Pings are 7x the message rate");
    expect(render(sysdesignM22OutagePlay)).toContain("Old codes sent late: clear in 10 min");
  });
});
