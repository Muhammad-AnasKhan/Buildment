import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  allCombinations,
  conflictIds,
  dotsInside,
  findLinearization,
  findSequential,
  isBefore,
  isCausal,
  mayReturn,
  nextValue,
  overlapCount,
  overlaps,
  verdicts,
  withValue,
  type HistoryOp,
} from "@buildment/learning-ui/canvas/models/history";
import { PLOT_X0, PLOT_X1, historyLayout, mayReturnWords, opWords, placeBars, snap, textWidth } from "@buildment/learning-ui/canvas/models/history-layout";
import { BUILD_AXIS, BUILD_CLIENTS, MAX_OPS, NOTICE_FULL, NOTICE_REFUSED, addBar, buildSummary, firstFreeStart, presetHistory, readOptions, removeBar } from "@buildment/learning-ui/canvas/models/history-build";
import { READ_STARTS, VERDICTS as OVERLAP_VERDICTS, allowed, chipText, historyAt, snapStart, zoneOf } from "@buildment/learning-ui/canvas/models/overlap-or-not";
import { LIN_AXIS, LIN_CLIENTS, analyse, flipRead, presetHistory as linPreset } from "@buildment/learning-ui/canvas/models/linearizable-play";
import { PRESETS, countCombinations, describe as describeHistory, presetById, tapRead, valueText } from "@buildment/learning-ui/canvas/models/three-verdicts";
import { READS, simulate, readName } from "@buildment/learning-ui/canvas/models/session-reads";
import { HOLD_WINDOW, nameAt, panel2, writesVerdict } from "@buildment/learning-ui/canvas/models/session-writes";
import {
  AVERAGE_ROUNDS,
  COPIES,
  FIXED_RUN_ROUNDS,
  INTERVALS,
  averageSeconds,
  fixedRun,
  formatSeconds,
  ladderFraction,
  ladderValue,
  partnerOf,
  syncVerdict,
} from "@buildment/learning-ui/canvas/models/sync-rate";
import { MEND_DONE_S, SCRIPT, TRIP_S, accepted, buttonLabel, clashAt, copiesAfterScript, copiesAt, finalRows, nextPhase, rowsAt, verdictFor as cutVerdict, type Mode, type Phase } from "@buildment/learning-ui/canvas/models/cut-network";
import { FAR_ROWS, FAST_DONE_S, barFraction, doneAt, eastRead, eastUpdatesAt, formatMs, formatStale, staleMs, verdictFor as farVerdict, writeMs } from "@buildment/learning-ui/canvas/models/far-copy";
import { sysdesignM11BuildHistory } from "@buildment/learning-ui/canvas/sysdesign-m11-build-history/data";
import { sysdesignM11OverlapOrNot } from "@buildment/learning-ui/canvas/sysdesign-m11-overlap-or-not/data";
import { sysdesignM11IsItLinearizable } from "@buildment/learning-ui/canvas/sysdesign-m11-is-it-linearizable/data";
import { sysdesignM11OneHistoryThreeVerdicts } from "@buildment/learning-ui/canvas/sysdesign-m11-one-history-three-verdicts/data";
import { sysdesignM11SessionReads } from "@buildment/learning-ui/canvas/sysdesign-m11-session-reads/data";
import { sysdesignM11SessionWrites } from "@buildment/learning-ui/canvas/sysdesign-m11-session-writes/data";
import { sysdesignM11SyncRate } from "@buildment/learning-ui/canvas/sysdesign-m11-sync-rate/data";
import { sysdesignM11CutTheNetwork } from "@buildment/learning-ui/canvas/sysdesign-m11-cut-the-network/data";
import { sysdesignM11LatencyOrFresh } from "@buildment/learning-ui/canvas/sysdesign-m11-latency-or-fresh/data";

const MAX_VERDICT = 38;
const DASH = String.fromCharCode(0x2014);

const op = (id: string, client: string, kind: "write" | "read", key: string, value: number, start: number, end: number): HistoryOp => ({ id, client, kind, key, value, start, end });

describe("the history rules", () => {
  it("orders bars by end before start, and treats touching bars as overlapping", () => {
    const a = op("a", "Ada", "write", "x", 1, 10, 30);
    const b = op("b", "Ben", "read", "x", 0, 20, 40);
    const c = op("c", "Cam", "read", "x", 0, 50, 70);
    const touching = op("t", "Dan", "read", "x", 0, 30, 35);
    expect(isBefore(a, c)).toBe(true);
    expect(isBefore(b, c)).toBe(true);
    expect(overlaps(a, b)).toBe(true);
    expect(overlaps(a, touching)).toBe(true);
    expect(overlapCount([a, b, c])).toBe(1);
  });

  it("gives the may-return sets of the preset in 11.2", () => {
    const h = presetHistory();
    expect(mayReturn(h, h[1])).toEqual([0, 1]);
    expect(mayReturn(h, h[2])).toEqual([1]);
  });

  it("hides a finished write that a later finished write covers", () => {
    const h = [op("a", "Ada", "write", "x", 1, 0, 10), op("b", "Ada", "write", "x", 2, 20, 30), op("c", "Ben", "read", "x", 0, 40, 50)];
    expect(mayReturn(h, h[2])).toEqual([2]);
    const both = [op("a", "Ada", "write", "x", 1, 0, 30), op("b", "Bao", "write", "x", 2, 10, 20), op("c", "Ben", "read", "x", 0, 40, 50)];
    expect(mayReturn(both, both[2])).toEqual([1, 2]);
  });

  it("keeps keys apart", () => {
    const h = [op("a", "Ada", "write", "q", 7, 0, 10), op("b", "Ben", "read", "r", 0, 20, 30)];
    expect(mayReturn(h, h[1])).toEqual([0]);
    expect(findLinearization(h)).not.toBeNull();
  });

  it("finds the empty history legal and a lone wrong read illegal", () => {
    expect(findLinearization([])).toEqual([]);
    expect(findLinearization([op("r", "Ada", "read", "x", 1, 0, 5)])).toBeNull();
    expect(isCausal([])).toBe(true);
  });

  it("cycles a read through its values", () => {
    expect(nextValue([0, 1, 2], 0)).toBe(1);
    expect(nextValue([0, 1, 2], 2)).toBe(0);
    expect(nextValue([], 5)).toBe(5);
    expect(withValue(presetHistory(), "b", 1)[1].value).toBe(1);
  });
});

describe("11.3 is it linearizable", () => {
  const settings: [number, number, number, boolean, string[] | null, number[] | null][] = [
    [0, 0, 0, false, null, null],
    [0, 0, 1, true, ["b", "d", "a", "c"], [20, 40, 41, 70]],
    [0, 1, 0, false, null, null],
    [0, 1, 1, true, ["b", "a", "d", "c"], [20, 21, 40, 70]],
    [1, 0, 0, false, null, null],
    [1, 0, 1, false, null, null],
    [1, 1, 0, false, null, null],
    [1, 1, 1, true, ["a", "b", "d", "c"], [10, 20, 40, 70]],
  ];
  const build = (b: number, d: number, c: number) => withValue(withValue(withValue(linPreset(), "b", b), "d", d), "c", c);

  for (const [b, d, c, ok, order, dots] of settings) {
    it(`checks Ben ${b}, Dan ${d}, Cam ${c}: ${ok ? "yes" : "no"}`, () => {
      const h = build(b, d, c);
      const found = findLinearization(h);
      expect(found !== null).toBe(ok);
      const view = analyse(h);
      expect(view.ok).toBe(ok);
      if (ok) {
        expect(found).toEqual(order);
        expect(view.dots.map((x) => x.t)).toEqual(dots);
        expect(dotsInside(h, view.dots)).toBe(true);
        expect(view.rings).toEqual([]);
        expect(view.verdict.text).toBe("Yes: one order fits every bar");
      } else {
        expect(view.dots).toEqual([]);
        expect(view.rings.length).toBeGreaterThan(0);
      }
    });
  }

  it("rings Ada and Cam for the first rule and Ben and Dan for the second", () => {
    const missed = analyse(build(0, 1, 0));
    expect(missed.verdict.text).toBe("No: Cam missed a finished write");
    expect(missed.rings.sort()).toEqual(["a", "c"]);
    const inversion = analyse(build(1, 0, 1));
    expect(inversion.verdict.text).toBe("No: Dan saw time go backwards");
    expect(inversion.rings.sort()).toEqual(["b", "d"]);
    expect(analyse(build(1, 0, 0)).verdict.text).toBe("No: Cam missed a finished write");
  });

  it("flips only reads", () => {
    const h = linPreset();
    expect(flipRead(h, "b")[1].value).toBe(1);
    expect(flipRead(h, "d")[2].value).toBe(0);
    expect(flipRead(h, "a")).toEqual(h);
    expect(LIN_CLIENTS).toEqual(["Ada", "Ben", "Dan", "Cam"]);
    expect(LIN_AXIS.max).toBe(90);
  });
});

describe("11.4 one history, three verdicts", () => {
  const expectCounts: Record<string, { total: number; counts: Record<string, number> }> = {
    fresh: { total: 2, counts: { "no,yes,yes": 1, "yes,yes,yes": 1 } },
    stale: { total: 2, counts: { "no,yes,yes": 1, "yes,yes,yes": 1 } },
    "two-readers": { total: 81, counts: { "no,yes,yes": 45, "no,no,yes": 2, "no,no,no": 32, "yes,yes,yes": 2 } },
    "reply-first": { total: 8, counts: { "no,yes,yes": 6, "no,no,no": 1, "yes,yes,yes": 1 } },
  };
  for (const p of PRESETS) {
    it(`counts every combination of ${p.label}`, () => {
      const got = countCombinations(p);
      expect(got.total).toBe(expectCounts[p.id].total);
      expect(got.byTriple).toEqual(expectCounts[p.id].counts);
    });
  }

  it("starts each preset with the verdicts of the chapter", () => {
    const v = (id: Parameters<typeof presetById>[0]) => verdicts(presetById(id).ops);
    expect(v("fresh")).toEqual({ lin: true, seq: true, causal: true });
    expect(v("stale")).toEqual({ lin: false, seq: true, causal: true });
    expect(v("reply-first")).toEqual({ lin: false, seq: false, causal: false });
  });

  it("matches the spot checks", () => {
    const stale = presetById("stale");
    expect(verdicts(tapRead(stale, stale.ops, "b"))).toEqual({ lin: true, seq: true, causal: true });
    const fresh = presetById("fresh");
    expect(verdicts(tapRead(fresh, fresh.ops, "b"))).toEqual({ lin: false, seq: true, causal: true });
    const two = presetById("two-readers");
    const dansSameAsCams = withValue(withValue(two.ops, "d1", 1), "d2", 2);
    expect(verdicts(dansSameAsCams)).toEqual({ lin: false, seq: true, causal: true });
    const allTwo = ["c1", "c2", "d1", "d2"].reduce((h, id) => withValue(h, id, 2), two.ops);
    expect(verdicts(allTwo)).toEqual({ lin: true, seq: true, causal: true });
    const reply = presetById("reply-first");
    expect(verdicts(withValue(reply.ops, "c2", 7))).toEqual({ lin: true, seq: true, causal: true });
    expect(verdicts(withValue(reply.ops, "c1", 0))).toEqual({ lin: false, seq: true, causal: true });
  });

  it("words the banner for each case and rings the conflict", () => {
    const stale = presetById("stale");
    const sv = describeHistory(stale.ops);
    expect(sv.banner.text).toBe("Linearizable fails; the others pass");
    expect(sv.rings.sort()).toEqual(["a", "b"]);
    expect(describeHistory(presetById("fresh").ops).banner.text).toBe("All three models allow this");
    expect(describeHistory(presetById("fresh").ops).rings).toEqual([]);
    const two = presetById("two-readers");
    const onlyCausal = allCombinations(two.ops, two.lists).find((h) => {
      const v = verdicts(h);
      return !v.lin && !v.seq && v.causal;
    }) as HistoryOp[];
    expect(describeHistory(onlyCausal).banner.text).toBe("Only causal still allows this");
    expect(describeHistory(onlyCausal).rings.length).toBeGreaterThanOrEqual(2);
    const reply = describeHistory(presetById("reply-first").ops);
    expect(reply.banner.text).toBe("All three models reject this");
    expect(reply.rings.sort()).toEqual(["b1", "c1", "c2"]);
  });

  it("checks sequential and causal directly", () => {
    const two = presetById("two-readers").ops;
    expect(findSequential(two)).toBeNull();
    expect(isCausal(two)).toBe(true);
    expect(conflictIds(two, "seq").sort()).toEqual(["c1", "c2", "d1", "d2"]);
    expect(valueText("q", 7)).toBe("Q");
    expect(valueText("r", 0)).toBe("none");
    expect(valueText("x", 2)).toBe("2");
  });

  it("keeps the tabs to the lanes the picture has", () => {
    for (const p of PRESETS) {
      expect(p.clients.length).toBeLessThanOrEqual(4);
      for (const o of p.ops) expect(p.clients).toContain(o.client);
    }
  });
});

describe("the history layout", () => {
  const fits = (ops: HistoryOp[], clients: readonly string[], axis: { min: number; max: number; step: number }, format?: (k: string, v: number) => string, hide = false) => {
    const layout = historyLayout({ clients, axis: { ...axis, caption: "time" }, top: 46 });
    const words = ops.map((o) => opWords(o, { format, hideReadValue: hide && o.kind === "read" }));
    const captions = hide ? ops.filter((o) => o.kind === "read").map((o) => ({ id: o.id, cands: mayReturnWords(mayReturn(ops, o)) })) : [];
    const placed = placeBars(layout, ops, words, captions);
    expect(placed).toHaveLength(ops.length);
    for (const lane of clients.map((_, i) => placed.filter((p) => p.lane === i))) {
      const spans: [number, number][] = [];
      for (const p of lane) {
        if (p.inside) expect(p.inside.w + 6).toBeLessThanOrEqual(p.x1 - p.x0 + 0.01);
        if (p.below) spans.push(p.below.anchor === "start" ? [p.below.x, p.below.x + p.below.w] : [p.below.x - p.below.w, p.below.x]);
        if (p.caption) spans.push([p.caption.x, p.caption.x + p.caption.chipW]);
      }
      spans.sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < spans.length; i++) expect(spans[i][0]).toBeGreaterThanOrEqual(spans[i - 1][1]);
      for (const [a, b] of spans) {
        expect(a).toBeGreaterThanOrEqual(PLOT_X0 - 4);
        expect(b).toBeLessThanOrEqual(PLOT_X1 + 8);
      }
    }
    return placed;
  };

  it("places every label of the four histories without two sharing a place", () => {
    fits(presetHistory(), BUILD_CLIENTS, BUILD_AXIS, undefined, true);
    fits(linPreset(), LIN_CLIENTS, LIN_AXIS);
    for (const p of PRESETS) fits(p.ops, p.clients, p.axis, valueText);
    for (const s of READ_STARTS) fits(historyAt(s), ["Ada", "Ben"], { min: 0, max: 100, step: 10 }, undefined, false);
  });

  it("fits a full write label in a new bar and moves a short bar's words under it", () => {
    const placed = fits(presetHistory(), BUILD_CLIENTS, BUILD_AXIS, undefined, true);
    expect(placed[0].inside?.text).toBe("write x = 1");
    const lin = fits(linPreset(), LIN_CLIENTS, LIN_AXIS);
    expect(lin[1].inside?.text).toBe("0");
    expect(lin[1].below?.text).toBe("read x → 0");
  });

  it("measures text and snaps to steps", () => {
    expect(textWidth("write x = 1")).toBeGreaterThan(textWidth("x = 1"));
    expect(snap(37, 5, 0, 80)).toBe(35);
    expect(snap(99, 5, 0, 80)).toBe(80);
    expect(snap(-4, 5, 0, 80)).toBe(0);
    expect(mayReturnWords([0, 1])[0]).toBe("may return 0 or 1");
    expect(mayReturnWords([1])[0]).toBe("may return 1");
    expect(mayReturnWords([0, 1, 2])[0]).toBe("may return 0, 1 or 2");
  });

  it("maps time to x and back", () => {
    const l = historyLayout({ clients: ["a"], axis: { min: 0, max: 100, step: 10, caption: "" }, top: 40 });
    expect(l.x(0)).toBe(PLOT_X0);
    expect(l.x(100)).toBe(PLOT_X1);
    expect(l.time(l.x(35))).toBeCloseTo(35, 6);
    expect(l.ticks).toHaveLength(11);
  });
});

describe("11.2 build a history", () => {
  it("starts with the preset and its summary", () => {
    const h = presetHistory();
    expect(buildSummary(h)).toBe("3 operations, 1 pair overlaps");
    expect(buildSummary(h)).toHaveLength(29);
    expect(readOptions(h)).toEqual({ b: [0, 1], c: [1] });
  });

  it("snaps the start to 5, clips it to 80 and numbers the writes", () => {
    const h = presetHistory();
    const r = addBar(h, "Ben", 62.4, true);
    expect(r.refused).toBeNull();
    const added = r.ops.find((o) => o.id === r.added) as HistoryOp;
    expect([added.start, added.end, added.kind, added.value]).toEqual([60, 80, "write", 2]);
    const late = addBar(h, "Cam", 99, false);
    expect(late.refused).toBeNull();
    expect((late.ops.find((o) => o.id === late.added) as HistoryOp).start).toBe(80);
    const early = addBar(h, "Ada", -10, false);
    expect(early.refused).toBe("overlap");
    expect(addBar(h, "Ada", 35, false).ops).toHaveLength(4);
  });

  it("refuses a bar that would overlap in the same lane, touching included", () => {
    const h = presetHistory();
    expect(addBar(h, "Ada", 20, false).refused).toBe("overlap");
    expect(addBar(h, "Ada", 30, false).refused).toBe("overlap");
    expect(addBar(h, "Ada", 35, false).refused).toBeNull();
    expect(NOTICE_REFUSED).toBe("A client does one thing at a time");
    expect(NOTICE_REFUSED.length).toBeLessThanOrEqual(34);
  });

  it("stops at six operations and removes a bar", () => {
    let h = presetHistory();
    h = addBar(h, "Ada", 60, false).ops;
    h = addBar(h, "Ben, ".slice(0, 3), 70, false).ops;
    h = addBar(h, "Cam", 0, false).ops;
    expect(h).toHaveLength(MAX_OPS);
    const full = addBar(h, "Cam", 80, false);
    expect(full.refused).toBe("full");
    expect(full.ops).toHaveLength(MAX_OPS);
    expect(NOTICE_FULL).toBe("Six operations is the most");
    expect(removeBar(h, "a")).toHaveLength(5);
  });

  it("finds the first free slot for the keyboard", () => {
    const h = presetHistory();
    expect(firstFreeStart(h, "Cam")).toBe(0);
    expect(firstFreeStart(h, "Ada")).toBe(35);
    expect(addBar(h, "Ada", null, false).added).not.toBeNull();
    expect(BUILD_CLIENTS).toHaveLength(3);
  });

  it("words the summary for one operation and many pairs", () => {
    expect(buildSummary([op("a", "Ada", "read", "x", 0, 0, 5)])).toBe("1 operation, 0 pairs overlap");
    expect(buildSummary([op("a", "Ada", "read", "x", 0, 0, 5), op("b", "Ben", "read", "x", 0, 0, 5), op("c", "Cam", "read", "x", 0, 0, 5)])).toBe("3 operations, 3 pairs overlap");
  });
});

describe("11.2 overlap or not", () => {
  it("splits the read start into before, overlap and after", () => {
    expect(READ_STARTS[0]).toBe(0);
    expect(READ_STARTS[READ_STARTS.length - 1]).toBe(80);
    const zones = READ_STARTS.map((s) => [s, zoneOf(s)] as const);
    expect(zones.filter(([, z]) => z === "before").map(([s]) => s)).toEqual([0, 5]);
    expect(zones.filter(([, z]) => z === "overlap").map(([s]) => s)).toEqual([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]);
    expect(zones.filter(([, z]) => z === "after").map(([s]) => s)).toEqual([65, 70, 75, 80]);
  });

  it("allows 0, 0 or 1, and 1", () => {
    expect(allowed(0)).toEqual([0]);
    expect(allowed(5)).toEqual([0]);
    expect(allowed(10)).toEqual([0, 1]);
    expect(allowed(60)).toEqual([0, 1]);
    expect(allowed(65)).toEqual([1]);
    expect(allowed(80)).toEqual([1]);
    expect(chipText([0])).toBe("may return 0");
    expect(chipText([0, 1])).toBe("may return 0 or 1");
    expect(historyAt(40)[1].end).toBe(60);
    expect(snapStart(42)).toBe(40);
  });

  it("words the three verdicts", () => {
    expect(OVERLAP_VERDICTS.before.text).toBe("Read finished first: only 0");
    expect(OVERLAP_VERDICTS.overlap.text).toBe("Overlap: 0 or 1 are both fine");
    expect(OVERLAP_VERDICTS.after.text).toBe("Write finished first: only 1");
  });
});

describe("11.5 session reads", () => {
  const where = (p: { ownWrites: boolean; noGoingBack: boolean }) => {
    const o = simulate(p);
    return o.reads.map((r) => `${readName(r)}:${r.node}`).join(" ");
  };
  it("matches the four rows of the table", () => {
    const none = simulate({ ownWrites: false, noGoingBack: false });
    expect([none.ownWriteMissed, none.wentBack, none.leaderReads]).toEqual([2, 1, 0]);
    expect(where({ ownWrites: false, noGoingBack: false })).toBe("A1:r1 O1:r1 A2:r2 O2:r2 O3:r1");
    const own = simulate({ ownWrites: true, noGoingBack: false });
    expect([own.ownWriteMissed, own.wentBack, own.leaderReads]).toEqual([0, 1, 1]);
    expect(where({ ownWrites: true, noGoingBack: false })).toBe("A1:leader O1:r1 A2:r1 O2:r2 O3:r1");
    const back = simulate({ ownWrites: false, noGoingBack: true });
    expect([back.ownWriteMissed, back.wentBack, back.leaderReads]).toEqual([2, 0, 0]);
    expect(where({ ownWrites: false, noGoingBack: true })).toBe("A1:r1 O1:r1 A2:r2 O2:r1 O3:r1");
    const both = simulate({ ownWrites: true, noGoingBack: true });
    expect([both.ownWriteMissed, both.wentBack, both.leaderReads]).toEqual([0, 0, 1]);
    expect(where({ ownWrites: true, noGoingBack: true })).toBe("A1:leader O1:r1 A2:r1 O2:r1 O3:r1");
  });

  it("words the verdicts", () => {
    expect(simulate({ ownWrites: false, noGoingBack: false }).verdict.text).toBe("2 missed own write, 1 went back");
    expect(simulate({ ownWrites: true, noGoingBack: false }).verdict.text).toBe("Writer fixed; Omar went back once");
    expect(simulate({ ownWrites: false, noGoingBack: true }).verdict.text).toBe("Omar fixed; Amna missed twice");
    expect(simulate({ ownWrites: true, noGoingBack: true }).verdict.text).toBe("No anomaly; leader took 1 read");
    expect(READS).toHaveLength(5);
  });
});

describe("11.5 session writes", () => {
  it("applies the edits in arrival order without write numbers", () => {
    expect(nameAt(false, 0)).toBe("none");
    expect(nameAt(false, 20)).toBe("Amna K.");
    expect(nameAt(false, 34)).toBe("Amna K.");
    expect(nameAt(false, 35)).toBe("Amna");
    expect(nameAt(false, 40)).toBe("Amna");
    expect(writesVerdict(false).text).toBe("Her last edit was overwritten");
  });

  it("holds edit 2 until edit 1 is applied with write numbers", () => {
    expect(nameAt(true, 20)).toBe("none");
    expect(nameAt(true, 34)).toBe("none");
    expect(nameAt(true, 35)).toBe("Amna K.");
    expect(nameAt(true, 40)).toBe("Amna K.");
    expect(HOLD_WINDOW).toEqual({ from: 20, until: 35 });
    expect(writesVerdict(true).text).toBe("Edits applied in her order");
  });

  it("sends Hana's questions read to the leader when the reply carries its dependency", () => {
    const off = panel2(false);
    expect(off.replies.shows).toBe(true);
    expect(off.questions).toEqual({ at: 60, node: "questions", shows: false });
    expect(off.leaderReads).toBe(0);
    expect(off.verdict.text).toBe("Reply shown before its question");
    const on = panel2(true);
    expect(on.questions).toEqual({ at: 60, node: "leader", shows: true });
    expect(on.leaderReads).toBe(1);
    expect(on.inherits).toBe(true);
    expect(on.verdict.text).toBe("Question read from the leader");
  });
});

describe("11.6 sync rate", () => {
  it("plays the fixed run: 1, 2, 5, 4 and 4 rounds", () => {
    for (const n of COPIES) {
      const run = fixedRun(n);
      expect(run.rounds.length).toBe(FIXED_RUN_ROUNDS[n]);
      expect(run.rounds[run.rounds.length - 1].lit.every(Boolean)).toBe(true);
      expect(run.start.filter(Boolean)).toHaveLength(1);
    }
    expect(fixedRun(5)).toEqual(fixedRun(5));
  });

  it("never picks itself as a partner", () => {
    for (const n of COPIES) for (let i = 0; i < n; i++) for (const r of [0, 0.3, 0.5, 0.99999]) expect(partnerOf(i, n, r)).not.toBe(i);
    expect(partnerOf(2, 5, 0.99999)).toBe(4);
    expect(partnerOf(0, 3, 0)).toBe(1);
  });

  it("gives the times of the table for 5 copies", () => {
    const expected: Record<number, string> = { 0.5: "1.2", 1: "2.4", 2: "4.7", 5: "11.8", 10: "23.6", 30: "70.8" };
    for (const t of INTERVALS) expect(formatSeconds(averageSeconds(5, t))).toBe(expected[t]);
    expect(syncVerdict(5, 2)).toBe("About 4.7 s until all 5 agree");
    expect(syncVerdict(5, 30)).toBe("About 70.8 s until all 5 agree");
    expect(AVERAGE_ROUNDS[32]).toBe(5.11);
  });

  it("keeps every verdict short and snaps the rails evenly", () => {
    for (const n of COPIES) for (const t of INTERVALS) expect(syncVerdict(n, t).length).toBeLessThanOrEqual(36);
    expect(ladderFraction(INTERVALS, 0.5)).toBe(0);
    expect(ladderFraction(INTERVALS, 30)).toBe(1);
    expect(ladderValue(INTERVALS, 0.5)).toBe(INTERVALS[3]);
    expect(ladderValue(COPIES, -2)).toBe(3);
    expect(ladderValue(COPIES, 7)).toBe(32);
  });
});

describe("11.7 cut the network", () => {
  const phases: Phase[] = ["up", "cut", "mended"];
  const modes: Mode[] = ["refuse", "answer"];

  it("words the five verdicts", () => {
    expect(cutVerdict("up", "refuse").text).toBe("Link up: all three copies agree");
    expect(cutVerdict("cut", "refuse").text).toBe("East says try again; no clash");
    expect(cutVerdict("cut", "answer").text).toBe("Both answer; copies now differ");
    expect(cutVerdict("mended", "refuse").text).toBe("Link back: East catches up");
    expect(cutVerdict("mended", "answer").text).toBe("Link back: 1 and 2 must be settled");
  });

  it("refuses East under Refuse and answers everywhere under Answer", () => {
    expect(accepted("refuse", "ada")).toBe(true);
    expect(accepted("refuse", "bao")).toBe(false);
    expect(accepted("refuse", "cam")).toBe(false);
    expect(accepted("answer", "bao")).toBe(true);
    expect(copiesAfterScript("refuse")).toEqual({ w1: 1, w2: 1, e: 0 });
    expect(copiesAfterScript("answer")).toEqual({ w1: 1, w2: 1, e: 2 });
    expect(finalRows("refuse")[1].text).toBe("Bao writes x = 2: try again later");
    expect(finalRows("answer")[2].text).toBe("Cam reads x: gets 2, West says 1");
  });

  it("plays the script in order and ends in agreement or a clash", () => {
    expect(copiesAt("up", "refuse", 99)).toEqual({ w1: 0, w2: 0, e: 0 });
    expect(copiesAt("cut", "answer", 0.5)).toEqual({ w1: 0, w2: 0, e: 0 });
    expect(copiesAt("cut", "answer", SCRIPT[0].at + TRIP_S)).toEqual({ w1: 1, w2: 1, e: 0 });
    expect(copiesAt("cut", "answer", SCRIPT[1].at + TRIP_S)).toEqual({ w1: 1, w2: 1, e: 2 });
    expect(copiesAt("cut", "refuse", 99)).toEqual({ w1: 1, w2: 1, e: 0 });
    expect(copiesAt("mended", "refuse", MEND_DONE_S)).toEqual({ w1: 1, w2: 1, e: 1 });
    expect(copiesAt("mended", "answer", 99)).toEqual({ w1: 1, w2: 1, e: 2 });
    expect(clashAt("mended", "answer", MEND_DONE_S)).toBe(true);
    expect(clashAt("mended", "refuse", 99)).toBe(false);
    expect(clashAt("cut", "answer", 99)).toBe(false);
  });

  it("fills the result rows as the requests land", () => {
    expect(rowsAt("cut", "refuse", 0).every((r) => r.state === "waiting")).toBe(true);
    expect(rowsAt("cut", "refuse", 99).map((r) => r.state)).toEqual(["ok", "refused", "refused", "waiting"]);
    expect(rowsAt("mended", "refuse", 99)[3].text).toBe("Link back: East copies x = 1");
    expect(rowsAt("mended", "answer", 99)[3].state).toBe("clash");
    expect(rowsAt("mended", "answer", 0)[3].text).toBe("");
  });

  it("cycles the button and keeps every verdict short", () => {
    expect(nextPhase("up")).toBe("cut");
    expect(nextPhase("cut")).toBe("mended");
    expect(nextPhase("mended")).toBe("cut");
    expect(buttonLabel("up")).toBe("Cut the cable");
    expect(buttonLabel("cut")).toBe("Mend the cable");
    for (const p of phases) for (const m of modes) expect(cutVerdict(p, m).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });
});

describe("11.7 latency or fresh", () => {
  const expected: [number, string, string, string][] = [
    [0.25, "0.55", "0.3", "0.1"],
    [60, "60.3", "0.3", "30"],
    [80, "80.3", "0.3", "40"],
    [160, "160.3", "0.3", "80"],
  ];
  for (const [rtt, waits, noWait, stale] of expected) {
    it(`gives the table row for a round trip of ${rtt} ms`, () => {
      expect(formatMs(writeMs(rtt, true))).toBe(waits);
      expect(formatMs(writeMs(rtt, false))).toBe(noWait);
      expect(formatStale(staleMs(rtt, false))).toBe(stale);
      expect(staleMs(rtt, true)).toBe(0);
      expect(farVerdict(rtt, true).text).toBe(`Fresh; the write takes ${waits} ms`);
      expect(farVerdict(rtt, false).text).toBe(`Fast: 0.3 ms; far reads stale ${stale} ms`);
      expect(farVerdict(rtt, true).text.length).toBeLessThanOrEqual(31);
      expect(farVerdict(rtt, false).text.length).toBeLessThanOrEqual(36);
    });
  }

  it("draws bars to scale up to 20 ms and breaks them beyond", () => {
    expect(barFraction(0)).toEqual({ fraction: 0, broken: false });
    expect(barFraction(10)).toEqual({ fraction: 0.5, broken: false });
    expect(barFraction(60.3)).toEqual({ fraction: 1, broken: true });
    expect(barFraction(0.3).fraction).toBeCloseTo(0.015, 6);
    expect(FAR_ROWS).toHaveLength(4);
  });

  it("lets an East reader see the old value only inside the window", () => {
    expect(eastRead(FAST_DONE_S + 0.1, false).text).toBe("x = 1, old: stale");
    expect(eastRead(eastUpdatesAt + 0.1, false).text).toBe("x = 2, the new value");
    expect(eastRead(0.1, false).tone).toBeUndefined();
    for (let t = 0; t < 6; t += 0.1) expect(eastRead(t, true).tone).not.toBe("warn");
    expect(doneAt(true)).toBeGreaterThan(eastUpdatesAt);
  });
});

describe("verdict lengths", () => {
  it("keep every verdict at 38 characters or fewer, in every state", () => {
    const texts: string[] = [];
    for (const s of READ_STARTS) texts.push(OVERLAP_VERDICTS[zoneOf(s)].text);
    for (let b = 0; b < 2; b++) for (let d = 0; d < 2; d++) for (let c = 0; c < 2; c++) texts.push(analyse(withValue(withValue(withValue(linPreset(), "b", b), "d", d), "c", c)).verdict.text);
    for (const p of PRESETS) for (const h of allCombinations(p.ops, p.lists)) texts.push(describeHistory(h).banner.text);
    for (let n = 0; n <= 6; n++) texts.push(buildSummary(Array.from({ length: n }, (_, i) => op(`o${i}`, "Ada", "read", "x", 0, i, i))));
    texts.push(NOTICE_FULL, NOTICE_REFUSED, "Tap the bar again to remove it");
    for (const a of [false, true]) for (const b of [false, true]) texts.push(simulate({ ownWrites: a, noGoingBack: b }).verdict.text);
    for (const on of [false, true]) texts.push(writesVerdict(on).text, panel2(on).verdict.text);
    for (const n of COPIES) for (const t of INTERVALS) texts.push(syncVerdict(n, t));
    for (const r of FAR_ROWS) for (const w of [true, false]) texts.push(farVerdict(r.rtt, w).text);
    expect(texts.length).toBeGreaterThan(100);
    for (const t of texts) expect(t.length, t).toBeLessThanOrEqual(MAX_VERDICT);
  });
});

describe("the nine server-rendered pictures", () => {
  const specs = [
    sysdesignM11BuildHistory,
    sysdesignM11OverlapOrNot,
    sysdesignM11IsItLinearizable,
    sysdesignM11OneHistoryThreeVerdicts,
    sysdesignM11SessionReads,
    sysdesignM11SessionWrites,
    sysdesignM11SyncRate,
    sysdesignM11CutTheNetwork,
    sysdesignM11LatencyOrFresh,
  ];
  for (const spec of specs) {
    it(`renders ${spec.title} with its picture and its limits fold`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(html).not.toContain(DASH);
    });
  }

  it("keeps the wording free of em dashes and the drawing free of hex colours and banned SVG parts", () => {
    for (const spec of specs) expect(spec.title + spec.purpose + spec.limits).not.toContain(DASH);
    const root = path.resolve(__dirname, "../../../../packages/learning-ui/src/canvas");
    const slugs = ["build-history", "overlap-or-not", "is-it-linearizable", "one-history-three-verdicts", "session-reads", "session-writes", "sync-rate", "cut-the-network", "latency-or-fresh"];
    const files = [
      ...slugs.flatMap((s) => {
        const dir = path.join(root, `sysdesign-m11-${s}`);
        return fs.readdirSync(dir).map((f) => path.join(dir, f));
      }),
      path.join(root, "primitives/history-view.tsx"),
      ...["history", "history-layout", "history-build", "overlap-or-not", "linearizable-play", "three-verdicts", "session-reads", "session-writes", "sync-rate", "cut-network", "far-copy"].map((m) => path.join(root, "models", `${m}.ts`)),
    ];
    expect(files.length).toBeGreaterThanOrEqual(38);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}(?![\w-])/);
      expect(src, f).not.toMatch(/foreignObject|<animate|<use[ >]|<image[ >]/);
      expect(src, f).not.toContain(DASH);
    }
  });
});
