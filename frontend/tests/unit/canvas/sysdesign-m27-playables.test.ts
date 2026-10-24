import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkDesign, designFrame, VERDICT_MAX } from "@buildment/learning-ui/canvas/models/design-stepper";
import {
  chainRates,
  driver,
  estimateVerdict,
  lamhaEstimate,
  machinesText,
  MINUTE_STEPS,
  perSecond,
  UPLOAD_STEPS,
  viewersText,
  VIEW_STEPS,
} from "@buildment/learning-ui/canvas/models/lamha-estimate";
import { formatBits, formatBytes } from "@buildment/learning-ui/canvas/models/envelope-estimate";
import { designNumbers, lamhaDesign, multipleText, tbitText } from "@buildment/learning-ui/canvas/models/lamha-design";
import {
  backlogVerdict,
  chartMax,
  MACHINE_STOPS,
  playhead,
  RATE_STOPS,
  runBacklog,
  valueText as backlogValueText,
  waitText,
} from "@buildment/learning-ui/canvas/models/lamha-backlog";
import { harmonic, harmonicExact, CACHE_STOPS, SKEW_STOPS, skewPlay, skewVerdict, valueText as skewValueText } from "@buildment/learning-ui/canvas/models/lamha-skew";
import { boxLayout, boxTone, railFraction, SHARD_STOPS, shardsPlay, shardsVerdict, VIEW_STOPS as SHARD_VIEW_STOPS, valueText as shardsValueText } from "@buildment/learning-ui/canvas/models/lamha-shards";
import { sysdesignM27EstimatePlay } from "@buildment/learning-ui/canvas/sysdesign-m27-estimate-play/data";
import { sysdesignM27DesignStepper } from "@buildment/learning-ui/canvas/sysdesign-m27-design-stepper/data";
import { sysdesignM27BacklogPlay } from "@buildment/learning-ui/canvas/sysdesign-m27-backlog-play/data";
import { sysdesignM27SkewPlay } from "@buildment/learning-ui/canvas/sysdesign-m27-skew-play/data";
import { sysdesignM27ShardsPlay } from "@buildment/learning-ui/canvas/sysdesign-m27-shards-play/data";

const MAX = 38;

describe("m27 estimate model (27.1)", () => {
  const at = (views: number, minutes: number, uploads: number) => lamhaEstimate({ views, minutes, uploads });

  it("matches the spec's table", () => {
    const rows: [number, number, number, string, string, string, string, string][] = [
      [1e9, 3, 5e5, "11,574 /s", "2.1 million", "12.5 Tbit/s", "135 PB", "15,600"],
      [1e8, 3, 5e5, "1,157 /s", "208,000", "1.25 Tbit/s", "135 PB", "15,600"],
      [5e9, 3, 5e5, "57,870 /s", "10 million", "62.5 Tbit/s", "135 PB", "15,600"],
      [1e9, 10, 5e5, "11,574 /s", "6.9 million", "41.7 Tbit/s", "135 PB", "15,600"],
      [1e8, 1, 2e6, "1,157 /s", "69,400", "417 Gbit/s", "539 PB", "62,500"],
      [1e8, 1, 1e5, "1,157 /s", "69,400", "417 Gbit/s", "27 PB", "3,100"],
    ];
    for (const [views, minutes, uploads, vps, viewers, peak, stored, machines] of rows) {
      const r = at(views, minutes, uploads);
      const label = `${views} ${minutes} ${uploads}`;
      expect(perSecond(r.viewsPerSecond), label).toBe(vps);
      expect(viewersText(r.viewersAtOnce), label).toBe(viewers);
      expect(formatBits(r.sentPeakBps), label).toBe(peak);
      expect(formatBytes(r.storedYearBytes), label).toBe(stored);
      expect(machinesText(r.machinesPeak), label).toBe(machines);
    }
  });

  it("gives the chapter's default numbers", () => {
    const r = at(1e9, 3, 5e5);
    expect(formatBits(r.sentAverageBps)).toBe("4.17 Tbit/s");
    expect(machinesText(r.machinesAverage)).toBe("5,200");
    expect(r.machinesPeak).toBeCloseTo(15_625, 6);
    expect(r.storedYearBytes / 1e15).toBeCloseTo(134.9, 1);
  });

  it("rings the driver and gives the verdicts", () => {
    expect(driver(at(1e9, 3, 5e5))).toBe("sent");
    expect(estimateVerdict(at(1e9, 3, 5e5))).toEqual({ text: "Bandwidth drives it: a CDN is a must", tone: "warn" });
    expect(driver(at(1e8, 1, 1e5))).toBe("stored");
    expect(estimateVerdict(at(1e8, 1, 1e5))).toEqual({ text: "Storage drives it: plan cold tiers", tone: "warn" });
    // Widened inputs, outside the rails: transcoding, then a few servers.
    expect(estimateVerdict({ ...at(1e6, 1, 1e4), ...{} }).text).toBe("A few servers could serve this");
    const transcoding = lamhaEstimate({ views: 1e6, minutes: 1, uploads: 35_000 });
    expect(driver(transcoding)).toBe("machines");
    expect(estimateVerdict(transcoding).text).toBe("Transcoding drives it: size the fleet");
  });

  it("keeps every verdict within 38 characters across all inputs, and always rings something on the rails", () => {
    for (const views of VIEW_STEPS)
      for (const minutes of MINUTE_STEPS)
        for (const uploads of UPLOAD_STEPS) {
          const r = at(views, minutes, uploads);
          expect(estimateVerdict(r).text.length).toBeLessThanOrEqual(MAX);
          expect(driver(r)).not.toBe("none");
          for (const rate of Object.values(chainRates(r))) {
            expect(rate).toBeGreaterThanOrEqual(0.3);
            expect(rate).toBeLessThanOrEqual(6);
          }
        }
  });
});

describe("m27 design model (27.2)", () => {
  const design = lamhaDesign();

  it("draws cleanly at every step and phase", () => {
    expect(checkDesign(design)).toEqual([]);
    expect(design.steps).toHaveLength(5);
  });

  it("has the verdicts and pills of the spec", () => {
    const verdicts: [number, number, string, string][] = [
      [0, 0, "One box: 250 times its plan", "bad"],
      [1, 0, "Storage must send 12.5 Tbit/s", "bad"],
      [2, 0, "CDN: storage now sends 0.63 Tbit/s", "good"],
      [2, 1, "At 70% hits storage sends 3.8 Tbit/s", "bad"],
      [3, 0, "Processing runs off the play path", "good"],
      [4, 0, "Counting spreads over 16 rows", "good"],
    ];
    for (const [step, phase, text, tone] of verdicts) {
      const f = designFrame(design, step, phase);
      expect(f.verdict, `${step}/${phase}`).toEqual({ text, tone });
      expect(text.length).toBeLessThanOrEqual(VERDICT_MAX);
    }
    const pill = (step: number, phase: number, id: string) => designFrame(design, step, phase).actors.find((a) => a.id === id)?.status?.text;
    expect(pill(0, 0, "box")).toBe("250x plan");
    expect(pill(1, 0, "storage")).toBe("12.5 Tbit/s");
    expect(pill(2, 0, "storage")).toBe("0.63 Tbit/s");
    expect(pill(2, 1, "storage")).toBe("3.8 Tbit/s");
    expect(pill(3, 0, "workers")).toBe("15,600 peak");
    expect(pill(4, 0, "counter")).toBe("313 /s each");
  });

  it("computes the numbers behind the steps", () => {
    expect(designNumbers.timesPlan).toBe(250);
    expect(designNumbers.storageTbit(0)).toBe(12.5);
    expect(designNumbers.storageTbit(95)).toBeCloseTo(0.625, 9);
    expect(designNumbers.storageTbit(70)).toBeCloseTo(3.75, 9);
    expect(designNumbers.budgetMultiple(designNumbers.storageTbit(95))).toBeCloseTo(0.625, 9);
    expect(designNumbers.machines).toBe(15_625);
    expect(designNumbers.perShard).toBe(312.5);
    expect(designNumbers.perShardPercent).toBe(63);
    expect(tbitText(0.625)).toBe("0.63 Tbit/s");
    expect(tbitText(3.75)).toBe("3.8 Tbit/s");
    expect(tbitText(12.5)).toBe("12.5 Tbit/s");
    expect(multipleText(12.5)).toBe("12.5x");
    expect(multipleText(0.625)).toBe("0.63x");
    expect(multipleText(3.75)).toBe("3.75x");
  });

  it("sends 19 in 20 requests back at the edge, or 7 in 10 with the toggle", () => {
    const hits = (phase: number) => designFrame(design, 2, phase).flows.filter((f) => f.ids.join() === "viewers,cdn").length;
    const misses = (phase: number) => designFrame(design, 2, phase).flows.filter((f) => f.ids.join() === "viewers,cdn,storage").length;
    expect([hits(0), misses(0)]).toEqual([19, 1]);
    expect([hits(1), misses(1)]).toEqual([7, 3]);
  });
});

describe("m27 backlog model (27.3)", () => {
  it("matches the spec's table", () => {
    // rate, machines, backlog at end of hour 1, wait in minutes, empty at (null: never, "none": no backlog)
    const rows: [number, number, number, number, number | null | "none"][] = [
      [5.8, 4000, 4880, 18, null],
      [5.8, 8000, 0, 0, "none"],
      [11.6, 4000, 25_760, 97, null],
      [11.6, 8000, 9760, 18, 113],
      [11.6, 12000, 0, 0, "none"],
      [17.4, 4000, 46_640, 175, null],
      [17.4, 8000, 30_640, 57, null],
      [17.4, 12000, 14_640, 18, 93],
      [17.4, 16000, 0, 0, "none"],
      [26, 12000, 45_600, 57, 161],
      [26, 16000, 29_600, 28, 102],
      [26, 20000, 13_600, 10, 74],
      [35, 16000, 62_000, 58, 147],
      [35, 20000, 46_000, 34, 107],
      [35, 8000, 94_000, 176, null],
    ];
    for (const [rate, machines, backlog, wait, empty] of rows) {
      const run = runBacklog(rate, machines);
      const label = `${rate} / ${machines}`;
      expect(Math.round(run.backlog), label).toBe(backlog);
      expect(Math.round(run.waitMinutes), label).toBe(wait);
      if (empty === "none") expect(run.none, label).toBe(true);
      else expect(run.emptyAt, label).toBe(empty);
    }
  });

  it("gives the capacity of a fleet", () => {
    expect(runBacklog(17.4, 16000).capacity).toBeCloseTo(17.78, 2);
    expect(runBacklog(17.4, 15_625).capacity).toBeCloseTo(17.36, 2);
  });

  it("gives the verdicts, each 38 characters or fewer", () => {
    expect(backlogVerdict(runBacklog(5.8, 4000))).toEqual({ text: "Line never empties: add machines", tone: "bad" });
    expect(backlogVerdict(runBacklog(5.8, 8000))).toEqual({ text: "No backlog: watchable at once", tone: "good" });
    expect(backlogVerdict(runBacklog(17.4, 12000))).toEqual({ text: "Wait of 18 min: over the target", tone: "warn" });
    expect(backlogVerdict(runBacklog(26, 20000))).toEqual({ text: "Wait of 10 min: inside the target", tone: "good" });
    for (const rate of RATE_STOPS)
      for (const machines of MACHINE_STOPS) {
        const run = runBacklog(rate, machines);
        expect(backlogVerdict(run).text.length, `${rate}/${machines}`).toBeLessThanOrEqual(MAX);
        expect(chartMax(run)).toBeGreaterThanOrEqual(Math.max(...run.series));
      }
    // Outside the rails: a wait of an hour or more that still empties.
    const wide = runBacklog(15, 6000 / 1);
    expect(backlogVerdict({ ...wide, never: false, none: false, waitMinutes: 97 }).text).toBe("Wait of 97 min: far over the target");
    expect("Wait of 176 min: far over the target".length).toBeLessThanOrEqual(MAX);
  });

  it("reads out the rail value and sweeps the playhead", () => {
    expect(backlogValueText(runBacklog(17.4, 12000))).toBe("17.4 uploads a second, 12,000 machines, 14,640 videos waiting after one hour, a wait of 18 minutes, empty at minute 93");
    expect(backlogValueText(runBacklog(5.8, 4000))).toContain("not empty within 3 hours");
    expect(backlogValueText(runBacklog(5.8, 8000))).toContain("no videos waiting");
    expect(waitText(runBacklog(17.4, 12000))).toBe("18 min");
    expect(playhead(0)).toBe(0);
    expect(playhead(10)).toBe(180);
    expect(playhead(12)).toBe(180);
    expect(playhead(12.5)).toBe(0);
  });
});

describe("m27 skew model (27.4)", () => {
  it("approximates H the same as the exact sum", () => {
    expect(harmonic(200_000, 1)).toBeCloseTo(12.78329081, 7);
    expect(harmonicExact(200_000, 1)).toBeCloseTo(12.78329081, 7);
    expect(harmonic(300_000, 0.8)).toBeCloseTo(57.84902932, 7);
    expect(harmonicExact(300_000, 0.8)).toBeCloseTo(57.84902932, 7);
  });

  it("matches the spec's table of hit rates and origin loads", () => {
    const table: Record<number, [number, number][]> = {
      0.8: [[14.6, 10.67], [24.1, 9.49], [39.0, 7.63], [62.6, 4.68]],
      0.9: [[31.7, 8.54], [43.4, 7.08], [58.1, 5.23], [76.7, 2.92]],
      1.0: [[56.8, 5.41], [67.6, 4.05], [78.4, 2.7], [89.2, 1.35]],
      1.1: [[79.6, 2.55], [86.6, 1.68], [92.1, 0.99], [96.5, 0.44]],
      1.2: [[92.4, 0.95], [95.7, 0.54], [97.8, 0.27], [99.2, 0.11]],
      1.3: [[97.5, 0.31], [98.8, 0.15], [99.5, 0.06], [99.8, 0.02]],
    };
    for (const s of SKEW_STOPS)
      CACHE_STOPS.forEach((c, i) => {
        const m = skewPlay(s, c);
        const [hit, origin] = table[s][i];
        expect(Math.round(m.hit * 1000) / 10, `hit ${s}/${c}`).toBeCloseTo(hit, 1);
        expect(Math.round(m.origin * 100) / 100, `origin ${s}/${c}`).toBeCloseTo(origin, 2);
      });
  });

  it("gives the three verdicts, each 38 characters or fewer", () => {
    expect(skewVerdict(skewPlay(1.1, 10_000_000))).toEqual({ text: "Origin under its 1 Tbit/s budget", tone: "good" });
    expect(skewVerdict(skewPlay(1.1, 1_000_000))).toEqual({ text: "Origin sends 1.7 Tbit/s: over budget", tone: "warn" });
    expect(skewVerdict(skewPlay(0.9, 1_000_000))).toEqual({ text: "Origin sends 7.1 Tbit/s: over budget", tone: "bad" });
    for (const s of SKEW_STOPS) for (const c of CACHE_STOPS) expect(skewVerdict(skewPlay(s, c)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("reads out the rail value", () => {
    expect(skewValueText(skewPlay(1.0, 1_000_000))).toBe("skew 1.0, cache of 1 million videos, 67.6 percent of plays answered at the edge, the origin sends 4.05 terabits a second, 4.1 times its budget");
  });
});

describe("m27 shards model (27.5)", () => {
  it("matches the spec's table", () => {
    const rows: [number, number[], number][] = [
      [500, [500, 250, 125, 63, 31, 16, 8], 1],
      [1000, [1000, 500, 250, 125, 63, 31, 16], 2],
      [2000, [2000, 1000, 500, 250, 125, 63, 31], 4],
      [5000, [5000, 2500, 1250, 625, 313, 156, 78], 10],
      [10_000, [10_000, 5000, 2500, 1250, 625, 313, 156], 20],
      [30_000, [30_000, 15_000, 7500, 3750, 1875, 938, 469], 60],
    ];
    for (const [views, per, fewest] of rows) {
      SHARD_STOPS.forEach((n, i) => {
        const m = shardsPlay(views, n);
        expect(Math.round(m.perShard), `${views}/${n}`).toBe(per[i]);
        expect(m.fewest).toBe(fewest);
        expect(m.readRows).toBe(n);
      });
    }
  });

  it("gives the verdicts and box tones, each verdict 38 characters or fewer", () => {
    expect(shardsVerdict(shardsPlay(5000, 1))).toEqual({ text: "Throttled: 5x the row limit", tone: "bad" });
    expect(shardsVerdict(shardsPlay(5000, 2)).text).toBe("Throttled: 2.5x the row limit");
    expect(shardsVerdict(shardsPlay(30_000, 1)).text).toBe("Throttled: 30x the row limit");
    expect(shardsVerdict(shardsPlay(5000, 8))).toEqual({ text: "Over its plan: busy seconds throttle", tone: "warn" });
    expect(shardsVerdict(shardsPlay(1000, 1))).toEqual({ text: "Over its plan: busy seconds throttle", tone: "warn" });
    expect(shardsVerdict(shardsPlay(5000, 16))).toEqual({ text: "Each shard under half its limit", tone: "good" });
    expect(shardsVerdict(shardsPlay(500, 16))).toEqual({ text: "Too many shards for this rate", tone: "warn" });
    expect(boxTone(1001)).toBe("bad");
    expect(boxTone(1000)).toBe("warn");
    expect(boxTone(500)).toBe("good");
    for (const v of SHARD_VIEW_STOPS) for (const n of SHARD_STOPS) expect(shardsVerdict(shardsPlay(v, n)).text.length).toBeLessThanOrEqual(MAX);
  });

  it("reads out the rail value and lays out up to 64 boxes in the picture", () => {
    expect(shardsValueText(shardsPlay(5000, 16))).toBe("5,000 views a second, 16 shards, 313 writes a second each, 31 percent of the row limit, a full read touches 16 rows, boxes are green");
    for (const n of SHARD_STOPS) {
      const l = boxLayout(n, 380, 124);
      expect(l.perRow * l.w + (l.perRow - 1) * l.gap).toBeLessThanOrEqual(380 + 1e-9);
      expect(l.rows * l.h + (l.rows - 1) * l.rowGap).toBeLessThanOrEqual(124 + 1e-9);
      expect(l.h).toBeGreaterThanOrEqual(24);
    }
    expect(railFraction(1)).toBe(0);
    expect(railFraction(64)).toBe(1);
    expect(railFraction(8)).toBeCloseTo(0.5, 9);
    expect(railFraction(10)).toBeGreaterThan(0.5);
  });
});

describe("m27 playable canvases render on the server", () => {
  const specs = [sysdesignM27EstimatePlay, sysdesignM27DesignStepper, sysdesignM27BacklogPlay, sysdesignM27SkewPlay, sysdesignM27ShardsPlay];
  const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits })).replaceAll("<!-- -->", "");

  it("draws an svg and the limits fold, with no hex colours", () => {
    for (const spec of specs) {
      const out = html(spec);
      expect(out, spec.title).toContain("<svg");
      expect(out, spec.title).toContain("What this picture leaves out");
      expect(out, spec.title).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(out, spec.title).not.toMatch(/foreignObject|<animate|<use|<image/);
    }
  });

  it("shows the starting verdicts", () => {
    expect(html(sysdesignM27EstimatePlay)).toContain("Bandwidth drives it: a CDN is a must");
    expect(html(sysdesignM27DesignStepper)).toContain("One box: 250 times its plan");
    expect(html(sysdesignM27BacklogPlay)).toContain("Wait of 18 min: over the target");
    expect(html(sysdesignM27SkewPlay)).toContain("Origin sends 4.1 Tbit/s: over budget");
    expect(html(sysdesignM27ShardsPlay)).toContain("Throttled: 1.3x the row limit");
  });

  it("has no em dashes in the visible text", () => {
    for (const spec of specs) expect(html(spec), spec.title).not.toContain("—");
  });
});
