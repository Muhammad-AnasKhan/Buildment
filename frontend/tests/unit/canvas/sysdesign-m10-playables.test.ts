import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DRIFT_LADDER,
  SYNC_LADDER,
  driftVerdict,
  flipAfterSeconds,
  flipped,
  formatGap,
  formatInterval,
  gapMs,
  ladderFromFraction,
  ladderToFraction,
  largestGapMs,
  shareAbove,
  stillCursor,
  sweepAt,
  cycleSeconds,
} from "@/canvas/models/drift-sync";
import {
  MAX_ACTIONS as LAMPORT_MAX,
  SCRIPT,
  applyAction,
  guessChips,
  localEvent,
  mergeText,
  nextScriptStep,
  planSend,
  playVerdict,
  scriptProgress,
  sendAndReceive,
  startRun,
  wrongGuessText,
} from "@/canvas/models/lamport-play";
import {
  CONCURRENT_TOTAL,
  EVENTS,
  allPairs,
  chain,
  compareVerdict,
  concurrentPairs,
  deciders,
  pairKey,
  relation,
} from "@/canvas/models/vector-compare";
import {
  DEFAULT_OFFSETS,
  OPENING,
  brokenReceives,
  clampOffset,
  hlcReceive,
  hlcTick,
  hlcVerdict,
  maxAhead,
  runEvents,
  spread,
  stampText,
  type Action,
} from "@/canvas/models/hlc-skewed";
import {
  STEP_BACKS,
  bitsVerdict,
  fleetPerSecond,
  formatCount,
  formatLifetime,
  idsPerMs,
  lifetimeYears,
  machines,
  rollback,
  shortRate,
  split,
} from "@/canvas/models/snowflake-bits";
import { sysdesignM10DriftSync } from "@/canvas/sysdesign-m10-drift-sync/data";
import { sysdesignM10LamportPlay } from "@/canvas/sysdesign-m10-lamport-play/data";
import { sysdesignM10VectorCompare } from "@/canvas/sysdesign-m10-vector-compare/data";
import { sysdesignM10HlcSkewed } from "@/canvas/sysdesign-m10-hlc-skewed/data";
import { sysdesignM10SnowflakeBits } from "@/canvas/sysdesign-m10-snowflake-bits/data";

const MAX_VERDICT = 38;
const DASH = String.fromCharCode(0x2014);

describe("10.2 drift and sync", () => {
  it("gives the chapter's largest gaps at 50 ppm", () => {
    const at = (t: number) => largestGapMs(50, t);
    expect(at(1)).toBeCloseTo(0.1, 10);
    expect(at(10)).toBeCloseTo(1, 10);
    expect(at(60)).toBeCloseTo(6, 10);
    expect(at(600)).toBeCloseTo(60, 10);
    expect(at(3600)).toBeCloseTo(360, 10);
    expect(at(86400)).toBeCloseTo(8640, 6);
  });

  it("gives the share of each cycle above 1 ms", () => {
    expect(flipAfterSeconds(50)).toBe(10);
    expect(shareAbove(50, 1)).toBe(0);
    expect(shareAbove(50, 10)).toBe(0);
    expect(Math.round(shareAbove(50, 60) * 100)).toBe(83);
    expect(Math.round(shareAbove(50, 600) * 100)).toBe(98);
    expect(shareAbove(50, 3600) * 100).toBeCloseTo(99.72, 1);
    expect(shareAbove(50, 86400) * 100).toBeCloseTo(99.99, 1);
    expect(Math.round(shareAbove(10, 60) * 100)).toBe(17);
    expect(flipAfterSeconds(10)).toBe(50);
    expect(Math.round(shareAbove(1, 600) * 100)).toBe(17);
    expect(flipAfterSeconds(1)).toBe(500);
  });

  it("flips the writes only while the gap is above 1 ms", () => {
    expect(flipped(50, 5)).toBe(false);
    expect(flipped(50, 10)).toBe(false);
    expect(flipped(50, 11)).toBe(true);
    expect(gapMs(50, 10)).toBe(1);
  });

  it("words the verdicts in 38 characters or fewer, for every rung pair", () => {
    expect(driftVerdict(50, 1).text).toBe("Safe: the gap never passes 1 ms");
    expect(driftVerdict(50, 10).text).toBe("Safe: the gap never passes 1 ms");
    expect(driftVerdict(50, 60).text).toBe("Flips after 10 s: 83% of each cycle");
    expect(driftVerdict(50, 600).text).toBe("Flips after 10 s: 98% of each cycle");
    expect(driftVerdict(50, 3600).text).toBe("Flips after 10 s: 99.7% of each cycle");
    expect(driftVerdict(50, 86400).text).toBe("A day: wrong almost all the time");
    expect(driftVerdict(5, 86400).text).toBe("Flips after 100 s: 99.8% of each cycle");
    expect(driftVerdict(1, 86400).text).toBe("Flips after 500 s: 99.4% of each cycle");
    for (const d of DRIFT_LADDER) for (const t of SYNC_LADDER) expect(driftVerdict(d, t).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("puts the rungs on a log rail and snaps back to the nearest", () => {
    expect(ladderToFraction(DRIFT_LADDER, 1)).toBe(0);
    expect(ladderToFraction(DRIFT_LADDER, 100)).toBe(1);
    for (const v of DRIFT_LADDER) expect(ladderFromFraction(DRIFT_LADDER, ladderToFraction(DRIFT_LADDER, v))).toBe(v);
    for (const v of SYNC_LADDER) expect(ladderFromFraction(SYNC_LADDER, ladderToFraction(SYNC_LADDER, v))).toBe(v);
    expect(ladderFromFraction(SYNC_LADDER, Number.NaN)).toBe(1);
  });

  it("formats gaps and intervals in plain units", () => {
    expect(formatGap(0.1)).toBe("0.1 ms");
    expect(formatGap(0.002)).toBe("0.002 ms");
    expect(formatGap(6)).toBe("6 ms");
    expect(formatGap(360)).toBe("360 ms");
    expect(formatGap(8640)).toBe("8.64 s");
    expect(formatInterval(60)).toBe("1 min");
    expect(formatInterval(600)).toBe("10 min");
    expect(formatInterval(3600)).toBe("1 h");
    expect(formatInterval(86400)).toBe("1 day");
  });

  it("sweeps three teeth and rests inside the red part when still", () => {
    expect(sweepAt(0)).toBe(0);
    expect(sweepAt(7)).toBe(0);
    expect(sweepAt(3.5)).toBe(0.5);
    const rest = stillCursor(50, 60);
    expect(flipped(50, cycleSeconds(rest, 60))).toBe(true);
    expect(flipped(50, cycleSeconds(stillCursor(50, 1), 1))).toBe(false);
  });
});

describe("10.3 Lamport play", () => {
  it("plays the scripted run with the chapter's counters", () => {
    let run = startRun();
    run = applyAction(run, SCRIPT[0]);
    expect(run.counters.A).toBe(1);
    run = applyAction(run, SCRIPT[1]);
    expect([run.counters.A, run.counters.B]).toEqual([2, 6]);
    run = applyAction(run, SCRIPT[2]);
    expect([run.counters.B, run.counters.C]).toEqual([7, 8]);
    run = applyAction(run, SCRIPT[3]);
    expect([run.counters.C, run.counters.A]).toEqual([9, 10]);
    run = applyAction(run, SCRIPT[4]);
    expect([run.counters.A, run.counters.B]).toEqual([11, 12]);
    expect(run.counters.C).toBe(9);
    expect(scriptProgress(run.actions)).toBe(SCRIPT.length);
    expect(playVerdict(run).text).toBe("Every receive lands after its send");
  });

  it("starts at 0, 5, 0 and offers the next script step until the learner leaves it", () => {
    const run = startRun();
    expect(run.counters).toEqual({ A: 0, B: 5, C: 0 });
    expect(nextScriptStep(run.actions)?.index).toBe(0);
    expect(nextScriptStep(localEvent(run, "A").actions)?.index).toBe(1);
    expect(nextScriptStep(localEvent(run, "B").actions)).toBeNull();
    expect(scriptProgress(localEvent(run, "B").actions)).toBe(-1);
  });

  it("never lowers a counter, whoever is ahead", () => {
    let run = startRun();
    const seen = { A: 0, B: 5, C: 0 };
    const moves: [string, string][] = [["B", "A"], ["A", "C"], ["C", "B"], ["B", "C"], ["A", "B"], ["C", "A"], ["B", "A"]];
    for (const [from, to] of moves) {
      run = sendAndReceive(run, from as "A", to as "A");
      for (const n of ["A", "B", "C"] as const) {
        expect(run.counters[n]).toBeGreaterThanOrEqual(seen[n]);
        seen[n] = run.counters[n];
      }
    }
  });

  it("builds the guess chips and merges the ones that agree", () => {
    const behind = planSend(startRun(), "B", "A").plan; // B sends stamp 6; A has 0
    expect(behind.kase).toBe("behind");
    expect(guessChips(behind).map((c) => c.label)).toEqual(["own + 1 = 1", "larger + 1 = 7"]);
    const ahead = planSend(applyAction(startRun(), SCRIPT[0]), "A", "B").plan; // A sends stamp 2; B has 5
    expect(ahead.kase).toBe("ahead");
    expect(ahead.result).toBe(6);
    const chips = guessChips(ahead);
    expect(chips.map((c) => c.label)).toEqual(["stamp + 1 = 3", "larger + 1 = 6"]);
    expect(chips.filter((c) => c.correct)).toHaveLength(1);
    expect(wrongGuessText(ahead, chips[0])).toBe("No: the counter would go down");
    expect(wrongGuessText(behind, guessChips(behind)[0])).toBe("No: that ignores the stamp");
    const level = { ...ahead, own: 4, stamp: 4, result: 5, kase: "level" as const };
    expect(guessChips(level)).toHaveLength(1);
  });

  it("words the receive verdicts and the formula in 38 characters or fewer", () => {
    const ahead = sendAndReceive(applyAction(startRun(), SCRIPT[0]), "A", "B");
    expect(playVerdict(ahead).text).toBe("Receiver was ahead: it only adds 1");
    const behind = sendAndReceive(startRun(), "B", "A");
    expect(playVerdict(behind).text).toBe("Receiver was behind: it jumps forward");
    const last = ahead.events[ahead.events.length - 1];
    expect(mergeText(last.before as number, last.stamp as number, last.value)).toBe("max(5, 2) + 1 = 6");
    expect(playVerdict(startRun()).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(playVerdict(localEvent(startRun(), "A")).text).toBe("A adds 1: now 1");
    expect(LAMPORT_MAX).toBeGreaterThan(SCRIPT.length);
  });
});

describe("10.4 vector compare", () => {
  it("counts 36 pairs: 29 ordered and 7 concurrent, the seven named in the chapter", () => {
    const pairs = allPairs();
    expect(pairs).toHaveLength(36);
    const concurrent = pairs.filter(([x, y]) => relation(x, y) === "concurrent");
    expect(concurrent).toHaveLength(CONCURRENT_TOTAL);
    expect(pairs.length - concurrent.length).toBe(29);
    expect(concurrentPairs().sort()).toEqual(["A1-B1", "A1-C1", "A2-B1", "A2-C1", "B1-C1", "B2-C1", "C1-B3"].sort());
  });

  it("orders the chapter's examples", () => {
    expect(relation("A2", "B2")).toBe("before");
    expect(relation("B2", "C2")).toBe("before");
    expect(relation("A3", "C3")).toBe("after");
    expect(relation("A1", "A3")).toBe("before");
    expect(relation("B2", "C1")).toBe("concurrent");
    expect(pairKey("B1", "A1")).toBe("A1-B1");
    expect(EVENTS).toHaveLength(9);
  });

  it("circles the deciding slots", () => {
    expect(deciders("A2", "B2")).toEqual({ x: 1, y: 1 }); // [2,0,0] vs [2,2,0]: slot B is smaller on A2
    expect(deciders("A3", "C3")).toEqual({ x: 0, y: 0 }); // [3,3,3] after [2,3,3]: slot A differs
    expect(deciders("A1", "B1")).toEqual({ x: 0, y: 1 }); // [1,0,0] vs [0,1,0]: each leads in one slot
    expect(deciders("B2", "C1")).toEqual({ x: 0, y: 2 });
  });

  it("finds the chain of messages and steps joining two ordered events", () => {
    expect(chain("A2", "B2")).toEqual(["A2", "B2"]);
    expect(chain("A1", "A3")).toEqual(["A1", "A2", "A3"]);
    expect(chain("C2", "B2")).toEqual(["B2", "B3", "C2"]);
    expect(chain("A1", "B1")).toBeNull();
    expect(chain("A1", "A3")?.length).toBe(3);
    // Every ordered pair is joined by some chain: that is what the vectors promise.
    for (const [x, y] of allPairs()) if (relation(x, y) !== "concurrent") expect(chain(x, y), `${x} ${y}`).not.toBeNull();
  });

  it("words the verdicts in 38 characters or fewer", () => {
    const none = new Set<string>();
    expect(compareVerdict(null, null, none).text).toBe("Tap two events to compare");
    expect(compareVerdict("A2", null, none).text).toBe("A2 chosen: tap a second event");
    expect(compareVerdict("A2", "B2", none).text).toBe("A2 happened before B2");
    expect(compareVerdict("A3", "C3", none).text).toBe("A3 happened after C3");
    expect(compareVerdict("A1", "B1", none).text).toBe("Concurrent: each leads in one slot");
    const six = new Set(concurrentPairs().filter((k) => k !== "C1-B3"));
    expect(compareVerdict("B3", "C1", six).text).toBe("All 7 concurrent pairs found");
    for (const [x, y] of allPairs()) expect(compareVerdict(x, y, none).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });
});

describe("10.5 hybrid clocks with skewed clocks", () => {
  const run: Action[] = [
    { kind: "send", from: "A", to: "B" },
    { kind: "local", node: "B" },
    { kind: "send", from: "B", to: "C" },
    { kind: "send", from: "C", to: "A" },
  ];

  it("gives the chapter's stamps for offsets 0, -40 and +25", () => {
    const e = runEvents(DEFAULT_OFFSETS, run);
    const row = e.map((v) => [v.trueMs, v.node, v.clock, stampText(v, "hybrid")]);
    expect(row).toEqual([
      [100, "A", 100, "(100,0)"],
      [110, "B", 70, "(100,1)"],
      [120, "B", 80, "(100,2)"],
      [130, "B", 90, "(100,3)"],
      [140, "C", 165, "(165,0)"],
      [150, "C", 175, "(175,0)"],
      [160, "A", 160, "(175,1)"],
    ]);
  });

  it("stamps the effect before its cause with wall clocks, and never with hybrid", () => {
    const e = runEvents(DEFAULT_OFFSETS, OPENING);
    expect(stampText(e[0], "wall")).toBe("100");
    expect(stampText(e[1], "wall")).toBe("70");
    expect(hlcVerdict(e, "wall").text).toBe("Receive stamped before its send");
    expect(hlcVerdict(e, "hybrid").text).toBe("Receive (100,1) after send (100,0)");
    expect(brokenReceives(e, "wall")).toBe(1);
    expect(brokenReceives(e, "hybrid")).toBe(0);
    const all = runEvents(DEFAULT_OFFSETS, run);
    expect(brokenReceives(all, "hybrid")).toBe(0);
    expect(brokenReceives(all, "wall")).toBe(2);
  });

  it("measures how far l runs ahead of the clock", () => {
    const all = runEvents(DEFAULT_OFFSETS, run);
    expect(all.slice(1, 4).map((v) => v.ahead)).toEqual([30, 20, 10]);
    expect(maxAhead(all)).toBe(30);
    expect(spread(DEFAULT_OFFSETS)).toBe(65);
    expect(maxAhead(all)).toBeLessThanOrEqual(spread(DEFAULT_OFFSETS));
  });

  it("says when l is ahead and when the clock catches up", () => {
    const local: Action[] = [...OPENING, { kind: "local", node: "B" }];
    expect(hlcVerdict(runEvents(DEFAULT_OFFSETS, local), "hybrid").text).toBe("Time part is 20 ms ahead of the clock");
    // B's clock is 40 behind: three more B events hold l at 100, and at clock 110 the stamp follows the clock again.
    const many: Action[] = [...OPENING, ...Array.from({ length: 4 }, () => ({ kind: "local", node: "B" }) as Action)];
    const ev = runEvents(DEFAULT_OFFSETS, many);
    expect(ev.map((v) => stampText(v, "hybrid"))).toEqual(["(100,0)", "(100,1)", "(100,2)", "(100,3)", "(100,4)", "(110,0)"]);
    expect(hlcVerdict(ev, "hybrid").text).toBe("Clock caught up: counter back to 0");
    // A clock only 5 ms behind catches up at once, with nothing ahead.
    const near = runEvents({ A: 0, B: -5, C: 0 }, [...OPENING, { kind: "local", node: "B" }]);
    expect(near.map((v) => stampText(v, "hybrid"))).toEqual(["(100,0)", "(105,0)", "(115,0)"]);
    expect(hlcVerdict(near, "hybrid").text).toBe("Stamped with the clock: counter 0");
  });

  it("follows the receive rules in every tie case", () => {
    expect(hlcTick({ l: 100, c: 0 }, 70)).toEqual({ l: 100, c: 1 });
    expect(hlcTick({ l: 100, c: 3 }, 105)).toEqual({ l: 105, c: 0 });
    expect(hlcReceive({ l: 50, c: 2 }, { l: 50, c: 4 }, 55)).toEqual({ l: 55, c: 0 }); // the clock alone
    expect(hlcReceive({ l: 50, c: 2 }, { l: 50, c: 4 }, 40)).toEqual({ l: 50, c: 5 }); // both tie
    expect(hlcReceive({ l: 60, c: 3 }, { l: 50, c: 9 }, 40)).toEqual({ l: 60, c: 4 }); // own l
    expect(hlcReceive({ l: 50, c: 3 }, { l: 60, c: 9 }, 40)).toEqual({ l: 60, c: 10 }); // message l
    expect(hlcReceive({ l: 60, c: 3 }, { l: 50, c: 9 }, 60)).toEqual({ l: 60, c: 4 }); // clock ties own l
  });

  it("keeps offsets in range and snaps near the marked values", () => {
    expect(clampOffset(-80)).toBe(-50);
    expect(clampOffset(80)).toBe(50);
    expect(clampOffset(24)).toBe(25);
    expect(clampOffset(-9)).toBe(-10);
    expect(clampOffset(1)).toBe(0);
    expect(clampOffset(Number.NaN)).toBe(0);
    expect(clampOffset(17)).toBe(17);
  });

  it("words the verdicts in 38 characters or fewer, across offsets", () => {
    for (const a of [-50, 0, 50]) for (const b of [-50, -10, 0, 25, 50]) {
      const ev = runEvents({ A: a, B: b, C: 0 }, [...run, { kind: "local", node: "A" }, { kind: "local", node: "B" }]);
      for (let n = 1; n <= ev.length; n++) for (const mode of ["wall", "hybrid"] as const) expect(hlcVerdict(ev.slice(0, n), mode).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    }
  });
});

describe("10.7 Snowflake bits", () => {
  it("gives the chapter's check points", () => {
    const row = (w: number, s: number) => {
      const { t } = split(w, s);
      return [machines(w), idsPerMs(s), t, formatLifetime(t), fleetPerSecond(w, s)];
    };
    expect(row(10, 12)).toEqual([1024, 4096, 41, "69.7 years", 4_194_304_000]);
    expect(row(12, 10)).toEqual([4096, 1024, 41, "69.7 years", 4_194_304_000]);
    expect(row(8, 12)).toEqual([256, 4096, 43, "278.7 years", 1_048_576_000]);
    expect(row(10, 8)).toEqual([1024, 256, 45, "1,115 years", 262_144_000]);
    expect(row(16, 16)).toEqual([65_536, 65_536, 31, "24.9 days", 4_294_967_296_000]);
    expect(lifetimeYears(41)).toBeCloseTo(69.69, 1);
  });

  it("splits 63 bits and clamps the sliders", () => {
    expect(split(10, 12)).toEqual({ w: 10, s: 12, t: 41 });
    expect(split(99, -3)).toEqual({ w: 16, s: 0, t: 47 });
    expect(split(Number.NaN, 5).w).toBe(0);
  });

  it("repeats or waits or refuses on a step back (r = 20)", () => {
    const trust = (R: number) => rollback(R, "trust").repeated;
    expect([2, 5, 10, 50].map(trust)).toEqual([40, 100, 200, 1000]);
    expect(rollback(2, "guard")).toMatchObject({ waitMs: 1, refused: 0, repeated: 0 });
    expect(rollback(5, "guard")).toMatchObject({ waitMs: 4, refused: 0 });
    expect(rollback(10, "guard")).toMatchObject({ waitMs: 9, refused: 0 });
    expect(rollback(50, "guard")).toMatchObject({ waitMs: 10, refused: 780, repeated: 0 });
    expect(rollback(0, "trust")).toMatchObject({ repeated: 0, waitMs: 0, refused: 0 });
  });

  it("asks for no more IDs a millisecond than the count field allows", () => {
    expect(rollback(5, "trust", 2).repeated).toBe(5 * 4);
    expect(rollback(5, "trust", 0).repeated).toBe(5);
  });

  it("words the verdicts in 38 characters or fewer", () => {
    expect(bitsVerdict(10, 12, 10_000_000, 0, "trust").text).toBe("Enough: 4.2 billion IDs a second");
    expect(bitsVerdict(10, 8, 1_000_000_000, 0, "trust").text).toBe("Too few: the count field runs out");
    expect(bitsVerdict(16, 16, 1_000, 0, "trust").text).toBe("Time runs out in 25 days");
    expect(bitsVerdict(12, 13, 1_000, 0, "trust").text).toBe("Time runs out in 8.7 years");
    expect(bitsVerdict(12, 14, 1_000, 0, "trust").text).toBe("Time runs out in 4.4 years");
    expect(bitsVerdict(10, 12, 1_000, 5, "trust").text).toBe("Trusting: 100 repeated IDs");
    expect(bitsVerdict(10, 12, 1_000, 50, "trust").text).toBe("Trusting: 1,000 repeated IDs");
    expect(bitsVerdict(10, 12, 1_000, 5, "guard").text).toBe("Waits 4 ms, no repeats");
    expect(bitsVerdict(10, 12, 1_000, 50, "guard").text).toBe("Refuses 780 requests, no repeats");
    expect(bitsVerdict(10, 12, 1_000, 0, "guard").text).toBe("Enough: 4.2 billion IDs a second");
    for (let w = 0; w <= 16; w++) for (let s = 0; s <= 16; s++) for (const need of [1_000, 1_000_000_000]) for (const step of STEP_BACKS) for (const h of ["trust", "guard"] as const) {
      expect(bitsVerdict(w, s, need, step, h).text.length, `${w} ${s} ${need} ${step} ${h}`).toBeLessThanOrEqual(MAX_VERDICT);
    }
  });

  it("shortens big numbers", () => {
    expect(shortRate(4_194_304_000)).toBe("4.2 billion");
    expect(shortRate(4_294_967_296_000)).toBe("4.3 trillion");
    expect(shortRate(262_144_000)).toBe("262 million");
    expect(shortRate(1_000)).toBe("1 thousand");
    expect(shortRate(100_000)).toBe("100 thousand");
    expect(formatCount(4_194_304_000)).toBe("4,194,304,000");
  });
});

describe("the five server-rendered pictures", () => {
  const specs = [sysdesignM10DriftSync, sysdesignM10LamportPlay, sysdesignM10VectorCompare, sysdesignM10HlcSkewed, sysdesignM10SnowflakeBits];
  for (const spec of specs) {
    it(`renders ${spec.title} with its picture and its limits fold`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(html).not.toContain(DASH);
    });
  }

  it("keeps the course wording free of em dashes and the drawing free of hex colours and banned SVG parts", () => {
    for (const spec of specs) expect(spec.title + spec.purpose + spec.limits).not.toContain(DASH);
    const root = path.resolve(__dirname, "../../../src/canvas");
    const files = [
      ...fs
        .readdirSync(root)
        .filter((d) => /^sysdesign-m10-(drift-sync|lamport-play|vector-compare|hlc-skewed|snowflake-bits)$/.test(d))
        .flatMap((d) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".md")).map((f) => path.join(root, d, f))),
      path.join(root, "primitives/lane-sequence.tsx"),
      ...["drift-sync", "lamport-play", "vector-compare", "hlc-skewed", "snowflake-bits"].map((m) => path.join(root, "models", `${m}.ts`)),
    ];
    expect(files.length).toBeGreaterThanOrEqual(21);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}(?![\w-])/);
      expect(src, f).not.toMatch(/foreignObject|<animate|<use[ >]|<image[ >]/);
      expect(src, f).not.toContain(DASH);
    }
  });
});
