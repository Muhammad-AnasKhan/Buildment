import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { answeredAt, dotLife, dotPose, dotsAt, HIT_SNAPS, oneDecimal, pathNumbers, queriesText, type Hits, DEFAULT_HITS } from "@buildment/learning-ui/canvas/models/cache-path";
import { checkDesign, designFrame } from "@buildment/learning-ui/canvas/models/design-stepper";
import { PATTERNS, patternSpec, type PatternId } from "@buildment/learning-ui/canvas/models/cache-pattern";
import {
  CATALOGUE,
  doublingGain,
  hitRate,
  hitVerdict,
  K_LADDER,
  kFraction,
  kFromFraction,
  labelSize,
  percentText,
  placeLabel,
  zipfPrefix,
} from "@buildment/learning-ui/canvas/models/hit-rate";
import { cacheAt, flightProgress, flights, playhead, raceResult } from "@buildment/learning-ui/canvas/models/stale-race";
import { burstShape, chartSecond, DEFAULT_SETTINGS, peakText, queueAt, shoppersWaiting, spikeHeight, stampede, type Settings } from "@buildment/learning-ui/canvas/models/stampede";
import { cdnLoad, formatHit, formatPerMinute, formatSeconds, rFraction, rFromFraction, tFraction, tFromFraction } from "@buildment/learning-ui/canvas/models/cdn-origin";
import { roundToStep, snapTo, spread, stepByKey, withCommas } from "@buildment/learning-ui/canvas/models/picture-controls";
import { sysdesignM5CachePath } from "@buildment/learning-ui/canvas/sysdesign-m5-cache-path/data";
import { sysdesignM5PatternStepper } from "@buildment/learning-ui/canvas/sysdesign-m5-pattern-stepper/data";
import { sysdesignM5HitRateCurve } from "@buildment/learning-ui/canvas/sysdesign-m5-hit-rate-curve/data";
import { sysdesignM5StaleRace } from "@buildment/learning-ui/canvas/sysdesign-m5-stale-race/data";
import { sysdesignM5StampedeToggles } from "@buildment/learning-ui/canvas/sysdesign-m5-stampede-toggles/data";
import { sysdesignM5CdnOriginLoad } from "@buildment/learning-ui/canvas/sysdesign-m5-cdn-origin-load/data";

const VERDICT_MAX = 38;

describe("picture controls", () => {
  it("steps by key, clamps, and snaps", () => {
    const r = { min: 0, max: 99, step: 1, page: 10 };
    expect(stepByKey(50, "ArrowRight", r)).toBe(51);
    expect(stepByKey(50, "PageDown", r)).toBe(40);
    expect(stepByKey(95, "PageUp", r)).toBe(99);
    expect(stepByKey(0, "ArrowLeft", r)).toBe(0);
    expect(stepByKey(50, "Home", r)).toBe(0);
    expect(stepByKey(50, "End", r)).toBe(99);
    expect(stepByKey(50, "a", r)).toBeNull();
    expect(snapTo(79, HIT_SNAPS, 1.5)).toBe(80);
    expect(snapTo(85, HIT_SNAPS, 1.5)).toBe(85);
    expect(roundToStep(0.30000000000000004, 0.1)).toBe(0.3);
    expect(withCommas(5000)).toBe("5,000");
    const values = Array.from({ length: 200 }, (_, n) => spread(n));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });
});

describe("5.2 cache path model", () => {
  it("matches the chapter's numbers", () => {
    const at = (edge: number, memory: number, valkey: number) => pathNumbers({ edge, memory, valkey });
    const d = at(80, 0, 90);
    expect(oneDecimal(d.addedMs)).toBe("32.2");
    expect(queriesText(d.queries)).toBe("100");
    const e90 = at(90, 0, 90);
    expect(oneDecimal(e90.addedMs)).toBe("16.1");
    expect(queriesText(e90.queries)).toBe("50");
    const v50 = at(80, 0, 50);
    expect(oneDecimal(v50.addedMs)).toBe("32.4");
    expect(queriesText(v50.queries)).toBe("500");
    const zero = at(0, 0, 0);
    expect(oneDecimal(zero.addedMs)).toBe("163.0");
    expect(queriesText(zero.queries)).toBe("5,000");
  });

  it("a weak Valkey is slower than none", () => {
    const none = pathNumbers({ edge: 0, memory: 0, valkey: 0 }).addedMs; // 160 + 0.5 + 2.5
    const withoutValkey = 160 + 2.5;
    expect(none).toBeGreaterThan(withoutValkey);
  });

  it("gives the four verdicts, each within 38 characters", () => {
    expect(pathNumbers({ edge: 90, memory: 0, valkey: 90 })).toMatchObject({ verdict: "Fast for shoppers, calm database", tone: "good" });
    expect(pathNumbers({ edge: 95, memory: 0, valkey: 0 }).verdict).toBe("Fast pages, busy database");
    expect(pathNumbers(DEFAULT_HITS).verdict).toBe("Calm database, slow far away");
    expect(pathNumbers({ edge: 0, memory: 0, valkey: 0 }).verdict).toBe("Slow pages and a busy database");
    for (let e = 0; e <= 99; e += 11) for (let m = 0; m <= 99; m += 33) for (let v = 0; v <= 99; v += 11) expect(pathNumbers({ edge: e, memory: m, valkey: v }).verdict.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("splits the dots by the hit rates", () => {
    const h: Hits = { edge: 50, memory: 0, valkey: 50 };
    const counts = { edge: 0, memory: 0, valkey: 0, database: 0 };
    for (let n = 0; n < 400; n++) counts[answeredAt(n, h)]++;
    expect(counts.edge).toBeGreaterThan(190);
    expect(counts.edge).toBeLessThan(210);
    expect(counts.memory).toBe(0);
    expect(counts.valkey).toBeGreaterThan(90);
    expect(counts.valkey).toBeLessThan(110);
    expect(counts.database).toBeGreaterThan(90);
    expect(counts.database).toBeLessThan(110);
    const all99 = { edge: 99, memory: 0, valkey: 0 };
    expect(Array.from({ length: 100 }, (_, n) => answeredAt(n, all99)).filter((x) => x === "edge").length).toBeGreaterThanOrEqual(98);
  });

  it("moves a dot down, turns it, and brings it back", () => {
    expect(dotPose("edge", 0)).toMatchObject({ row: 0, lane: "down" });
    const life = dotLife("valkey");
    expect(dotPose("valkey", life + 0.01)).toBeNull();
    expect(dotPose("valkey", life)).toMatchObject({ lane: "up" });
    expect(dotPose("valkey", life)?.row).toBeCloseTo(0, 5);
    const mid = dotPose("database", dotLife("database") / 2);
    expect(mid?.row).toBeGreaterThan(3);
    expect(dotLife("database")).toBeGreaterThan(dotLife("edge"));
    for (const d of dotsAt(20, DEFAULT_HITS)) expect(dotPose(d.layer, d.tau)).not.toBeNull();
  });
});

describe("5.3 pattern stepper", () => {
  const ids = PATTERNS.map((p) => p.id);
  const frame = (p: PatternId, step: number, phase = 0) => designFrame(patternSpec(p), step, phase);
  const tag = (p: PatternId, step: number, id: string, phase = 0) => frame(p, step, phase).tags.find((t) => t.id === id)?.text;

  it("draws cleanly for every pattern at every step and phase", () => {
    for (const id of ids) expect(checkDesign(patternSpec(id)), id).toEqual([]);
  });

  it("has four steps and a hit as the second read", () => {
    for (const id of ids) {
      const spec = patternSpec(id);
      expect(spec.steps.map((s) => s.title)).toEqual(["Read", "Write", "Crash", "Again"]);
      expect(frame(id, 0, 0).flows[0].ids.length).toBeGreaterThan(frame(id, 0, 1).flows[0].ids.length);
      expect(frame(id, 0, 1).verdict.text).toBe("Hit: 1 trip");
    }
    expect(frame("aside", 0).flows[0].ids).toEqual(["app", "cache", "app", "db", "app", "cache"]);
    expect(frame("read-through", 0).flows[0].ids).toEqual(["app", "cache", "db", "cache", "app"]);
  });

  it("only write-back loses the confirmed write", () => {
    for (const id of ids) {
      const lost = id === "write-back";
      expect(tag(id, 2, "t-write"), id).toBe(lost ? "database has write: lost" : "database has write: yes");
      expect(tag(id, 3, "t-write"), id).toBe(lost ? "database has write: lost" : "database has write: yes");
      expect(tag(id, 3, "t-reads"), id).toBe("db reads after crash: 1");
      expect(tag(id, 2, "t-reads"), id).toBe("db reads after crash: 0");
      expect(frame(id, 2).actors.find((a) => a.id === "cache")?.broken).toBe(true);
      expect(frame(id, 3).actors.find((a) => a.id === "cache")?.broken).toBe(false);
    }
    expect(tag("write-back", 1, "t-write")).toBe("database has write: not yet");
    expect(tag("write-back", 3, "t-copy")).toBe("cache copy: 999, old");
    expect(tag("aside", 3, "t-copy")).toBe("cache copy: 899, fresh");
    expect(tag("write-around", 1, "t-copy")).toBe("cache copy: 999, stale");
    expect(tag("write-through", 1, "t-copy")).toBe("cache copy: 899, fresh");
    expect(tag("aside", 1, "t-copy")).toBe("cache copy: none");
  });

  it("gives the chapter's verdicts", () => {
    for (const id of ["aside", "read-through", "write-around"] as const) expect(frame(id, 3).verdict.text).toBe("Crash cost speed, not data");
    expect(frame("write-through", 3).verdict.text).toBe("Cold cache, but no write lost");
    expect(frame("write-back", 3).verdict.text).toBe("Crash lost a confirmed write");
    expect(frame("write-back", 1).verdict.text).toBe("Fast ok, database not updated yet");
  });
});

describe("5.4 hit-rate curve", () => {
  const s1 = zipfPrefix(1);
  const pct = (k: number, pre: Float64Array) => percentText(hitRate(k, pre));

  it("matches the chapter's numbers", () => {
    expect(pct(100, s1)).toBe("53.0%");
    expect(pct(1000, s1)).toBe("76.5%");
    expect(pct(2000, s1)).toBe("83.6%");
    expect(pct(5000, s1)).toBe("92.9%");
    expect(pct(1000, zipfPrefix(0.8))).toBe("57.1%");
    expect(pct(1000, zipfPrefix(1.2))).toBe("90.3%");
    expect(pct(1000, zipfPrefix(0))).toBe("10.0%");
    expect(hitRate(CATALOGUE, s1)).toBeCloseTo(1, 10);
  });

  it("gives the verdicts", () => {
    expect(hitVerdict(1000, 0, zipfPrefix(0)).text).toBe("Even traffic: hits = share cached");
    expect(hitVerdict(100, 0, zipfPrefix(0)).text).toBe("Even traffic: hits = share cached");
    expect(hitVerdict(1000, 1, s1).text).toBe("Each extra slot still helps");
    expect(hitVerdict(1000, 1.2, zipfPrefix(1.2)).text).toBe("Past here, more memory buys little");
    expect(hitVerdict(9000, 1, s1).text).toBe("Past here, more memory buys little");
    expect(doublingGain(1000, s1)).toBeGreaterThan(7);
    expect(doublingGain(1000, s1)).toBeLessThan(7.2);
  });

  it("maps the log rail and the snap points", () => {
    expect(kFraction(10)).toBe(0);
    expect(kFraction(10000)).toBe(1);
    expect(kFromFraction(0)).toBe(10);
    expect(kFromFraction(1)).toBe(10000);
    expect(kFromFraction(kFraction(1000))).toBe(1000);
    expect(kFromFraction(kFraction(2000) + 0.003)).toBe(2000);
    expect(K_LADDER).toContain(100);
    expect(K_LADDER).toContain(1000);
    expect(K_LADDER).toContain(2000);
    expect(K_LADDER[0]).toBe(10);
    expect(K_LADDER[K_LADDER.length - 1]).toBe(10000);
    for (let i = 1; i < K_LADDER.length; i++) expect(K_LADDER[i]).toBeGreaterThan(K_LADDER[i - 1]);
  });

  it("finds a clear spot for the live label at every size and skew", () => {
    const X = (k: number) => 48 + kFraction(k) * (404 - 48);
    const bounds = { x: 52, y: 88, w: 344, h: 132 };
    for (const s of [0, 0.4, 0.8, 1, 1.2]) {
      const pre = zipfPrefix(s);
      const even = zipfPrefix(0);
      const curve = Array.from({ length: 301 }, (_, i) => {
        const k = 10 * Math.pow(1000, i / 300);
        return [{ x: X(k), y: 224 - hitRate(k, pre) * 138 }, { x: X(k), y: 224 - hitRate(k, even) * 138 }];
      }).flat();
      for (const k of K_LADDER) {
        const dot = { x: X(k), y: 224 - hitRate(k, pre) * 138 };
        const live = `${k} items: ${percentText(hitRate(k, pre))} of reads`;
        const size = labelSize(live);
        const box = placeLabel(size.w, size.h, dot, [...curve, dot], [], bounds);
        expect(box, `s=${s} k=${k}`).not.toBeNull();
        if (!box) continue;
        expect(box.x).toBeGreaterThanOrEqual(bounds.x);
        expect(box.x + box.w).toBeLessThanOrEqual(bounds.x + bounds.w);
        for (const p of curve) expect(p.x >= box.x - 6 && p.x <= box.x + box.w + 6 && p.y >= box.y - 6 && p.y <= box.y + box.h + 6).toBe(false);
      }
    }
  }, 60_000);
});

describe("5.5 stale race", () => {
  it("gives the three outcomes", () => {
    expect(raceResult(15, false)).toMatchObject({ windowText: "stale 5 ms", verdict: "Delete wins: stale for a few ms", finalText: "empty" });
    expect(raceResult(11, true).windowText).toBe("stale 5 ms");
    expect(raceResult(22, false).windowText).toBe("stale 3 ms");
    expect(raceResult(24, true).windowText).toBe("stale 1 ms");
    expect(raceResult(25, false)).toMatchObject({ windowText: "stale up to 60 s", verdict: "Old price back until the TTL", finalText: "999 (old!)", accepted: true });
    expect(raceResult(40, false).tone).toBe("bad");
    expect(raceResult(40, true)).toMatchObject({ windowText: "no stale time", verdict: "Lease refused the late set", finalText: "empty", accepted: false });
    expect(raceResult(25, true).accepted).toBe(false);
    expect(raceResult(24, true).accepted).toBe(true);
  });

  it("keeps verdicts within 38 characters for every set time", () => {
    for (let s = 11; s <= 60; s++) for (const l of [false, true]) expect(raceResult(s, l).verdict.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("shows what the cache holds as time passes", () => {
    expect(cacheAt(5, 40, false).text).toBe("empty");
    expect(cacheAt(60, 40, false).text).toBe("999 (old!)");
    expect(cacheAt(60, 40, true).text).toBe("empty");
    expect(cacheAt(12, 40, true).text).toBe("lease out");
    expect(cacheAt(16, 15, false).text).toBe("999");
    expect(cacheAt(22, 15, false).text).toBe("999 (old)");
    expect(cacheAt(30, 15, false).text).toBe("empty");
    expect(cacheAt(60, 22, true).text).toBe("empty");
  });

  it("flies each message between its start and end", () => {
    const set = flights(40, false).find((f) => f.id === "set")!;
    expect(set.end).toBe(40);
    expect(flightProgress(set, 38)).toBeCloseTo(0.5);
    expect(flightProgress(set, 41)).toBeNull();
    expect(playhead(0)).toBe(0);
    expect(playhead(3)).toBeCloseTo(30);
    expect(playhead(7)).toBe(60);
    expect(playhead(Number.NaN)).toBe(60);
  });
});

describe("5.6 stampede toggles", () => {
  const set = (patch: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, ...patch });

  it("counts the queries at one expiry", () => {
    expect(stampede(set({}))).toMatchObject({ queries: 250, waitMs: 50, verdict: "250 queries at once: database falls", tone: "bad" });
    expect(stampede(set({ coalesce: true }))).toMatchObject({ queries: 20, verdict: "20 queries: one per app server" });
    expect(stampede(set({ lease: true }))).toMatchObject({ queries: 1, verdict: "One query per expiry", tone: "good" });
    expect(stampede(set({ lease: true, coalesce: true })).queries).toBe(1);
    expect(stampede(set({ lease: true, stale: true }))).toMatchObject({ queries: 1, waitMs: 0, verdict: "One query, and nobody waits" });
    expect(stampede(set({ stale: true })).waitMs).toBe(0);
    expect(stampede(set({ stale: true })).queries).toBe(250);
    expect(stampede(set({ coalesce: true, stale: true })).verdict).toBe("20 queries, and nobody waits");
  });

  it("spreads 1,000 keys with random TTLs", () => {
    expect(stampede(set({ mode: "many" }))).toMatchObject({ queries: 1000, spikeSeconds: 1, verdict: "1,000 misses in the same second", tone: "bad" });
    const j = stampede(set({ mode: "many", jitter: true }));
    expect(j).toMatchObject({ queries: 83, verdict: "Misses spread: about 83 a second", tone: "good" });
    expect(peakText(j)).toBe("83 a second");
    expect(peakText(stampede(set({})))).toBe("5,000 a second");
  });

  it("keeps verdicts within 38 characters", () => {
    for (const mode of ["one", "many"] as const)
      for (const coalesce of [false, true]) for (const lease of [false, true]) for (const stale of [false, true]) for (const jitter of [false, true])
        expect(stampede({ mode, coalesce, lease, stale, jitter }).verdict.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("fills and drains the queue around each expiry, and rests at the peak when still", () => {
    const s = set({});
    const o = stampede(s);
    expect(queueAt(s, o, 0.5, false).count).toBe(0);
    expect(queueAt(s, o, 3.0, false).count).toBeGreaterThan(0);
    expect(queueAt(s, o, 3.3, false).count).toBe(24);
    expect(queueAt(s, o, 4.6, false).count).toBe(0);
    expect(queueAt(s, o, 0, true)).toEqual({ count: 24, more: true });
    const lease = set({ lease: true });
    expect(queueAt(lease, stampede(lease), 0, true)).toEqual({ count: 1, more: false });
    expect(burstShape(lease, stampede(lease)).peak).toBe(1);
    expect(shoppersWaiting(s, o, 3.2)).toBe(true);
    expect(shoppersWaiting(s, o, 1)).toBe(false);
    expect(shoppersWaiting(set({ stale: true }), stampede(set({ stale: true })), 3.2)).toBe(false);
    expect(chartSecond(0)).toBe(0);
    expect(chartSecond(3)).toBeCloseTo(60);
    expect(chartSecond(10)).toBe(180);
    expect(spikeHeight(5000)).toBe(1);
    expect(spikeHeight(800)).toBeCloseTo(0.4);
  });
});

describe("5.7 CDN origin load", () => {
  it("matches the chapter's numbers", () => {
    const base = cdnLoad(60, 5, false);
    expect(formatHit(base.hitRate)).toBe("99.7%");
    expect(Math.round(base.originPerMinute)).toBe(20);
    expect(base.verdict).toBe("About one fetch per edge per TTL");
    const shield = cdnLoad(60, 5, true);
    expect(shield.originPerMinute).toBeGreaterThan(0.9);
    expect(shield.originPerMinute).toBeLessThan(1.0);
    expect(shield.oldestSeconds).toBe(120);
    expect(formatSeconds(shield.oldestSeconds)).toBe("2 min");
    const short = cdnLoad(10, 5, false);
    expect(formatHit(short.hitRate)).toBe("98.0%");
    expect(Math.round(short.originPerMinute)).toBe(118);
    expect(short.verdict).toBe("Short lifetime: origin works hard");
    expect(cdnLoad(10, 5, true).originPerMinute).toBeCloseTo(5.7, 1);
  });

  it("gives the other verdicts", () => {
    expect(cdnLoad(60, 5, true).verdict).toBe("Origin barely notices the traffic");
    expect(cdnLoad(600, 5, true).verdict).toBe("Fewer fetches, older pages");
    expect(cdnLoad(600, 5, false).verdict).not.toBe("Fewer fetches, older pages");
    expect(cdnLoad(3600, 5, false).verdict).toBe("Origin barely notices the traffic");
  });

  it("keeps verdicts within 38 characters and numbers finite across the range", () => {
    for (const t of [1, 10, 60, 300, 3600]) for (const r of [0.1, 1, 5, 50, 100]) for (const shield of [false, true]) {
      const m = cdnLoad(t, r, shield);
      expect(m.verdict.length).toBeLessThanOrEqual(VERDICT_MAX);
      expect(Number.isFinite(m.originPerMinute)).toBe(true);
      expect(m.hitRate).toBeLessThan(1);
      expect(formatHit(m.hitRate)).not.toBe("100.0%");
      expect(shield ? m.originPerSecond <= m.edgeMisses : m.originPerSecond === m.edgeMisses).toBe(true);
      expect(formatPerMinute(m.originPerMinute).length).toBeGreaterThan(0);
    }
  });

  it("maps the log rails and snaps", () => {
    expect(tFromFraction(0)).toBe(1);
    expect(tFromFraction(1)).toBe(3600);
    expect(tFromFraction(tFraction(60))).toBe(60);
    expect(tFromFraction(tFraction(300) - 0.005)).toBe(300);
    expect(rFromFraction(0)).toBe(0.1);
    expect(rFromFraction(1)).toBe(100);
    expect(rFromFraction(rFraction(5))).toBe(5);
    expect(rFromFraction(rFraction(50) + 0.003)).toBe(50);
    expect(formatSeconds(90)).toBe("1.5 min");
    expect(formatSeconds(3600)).toBe("1 hour");
    expect(formatSeconds(7200)).toBe("2 hours");
  });
});

describe("the six Module 5 playables render on the server", () => {
  const specs = [
    sysdesignM5CachePath,
    sysdesignM5PatternStepper,
    sysdesignM5HitRateCurve,
    sysdesignM5StaleRace,
    sysdesignM5StampedeToggles,
    sysdesignM5CdnOriginLoad,
  ];
  it.each(specs.map((s) => [s.title, s] as const))("%s", (_title, spec) => {
    const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });

  it("puts a slider or a button on every control", () => {
    const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits }));
    expect((html(sysdesignM5CachePath).match(/role="slider"/g) ?? []).length).toBe(3);
    expect((html(sysdesignM5HitRateCurve).match(/role="slider"/g) ?? []).length).toBe(2);
    expect((html(sysdesignM5StaleRace).match(/role="slider"/g) ?? []).length).toBe(1);
    expect((html(sysdesignM5CdnOriginLoad).match(/role="slider"/g) ?? []).length).toBe(2);
    expect((html(sysdesignM5StampedeToggles).match(/aria-pressed/g) ?? []).length).toBe(6);
    expect((html(sysdesignM5PatternStepper).match(/aria-pressed/g) ?? []).length).toBeGreaterThanOrEqual(5);
  });
});
