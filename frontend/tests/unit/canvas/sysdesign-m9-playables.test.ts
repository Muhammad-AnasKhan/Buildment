import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HASH_SPACE, hash32 } from "@/canvas/models/hash32";
import { stepByKey } from "@/canvas/models/picture-controls";
import {
  START,
  SHARD_LIMIT as RANGE_LIMIT,
  clampStart,
  describeWindow,
  hashShardOfOrder,
  loadRatio,
  orderDots,
  rangeVsHashVerdict,
  shardsTouchedHash,
  shardsTouchedRange,
  startFromFraction,
  startToFraction,
  touchedShards,
  writesPerShard,
} from "@/canvas/sysdesign-m9-range-vs-hash/model";
import {
  KEY_COUNT,
  NODE_NAMES,
  POINT_LADDER,
  SAMPLE_KEYS,
  angleToPos,
  arcPath,
  assign,
  buildRing,
  busiestOverFair,
  compare,
  idealMove,
  modMoveShare,
  moveVerdict,
  nodesOf,
  ownerPoint,
  percentText,
  pointsFromFraction,
  pointsToFraction,
  posToAngle,
  ringArcs,
  sectorPaths,
  spreadVerdict,
} from "@/canvas/sysdesign-m9-ring-play/model";
import { SALTS, SHARD_LADDER, averageLoad, hottestVerdict, loadsFor, shardsFromFraction, shardsToFraction, subKeys } from "@/canvas/sysdesign-m9-celebrity-play/model";
import { PROGRESS, bytesToMoveGB, describeProgress, durationText, moveSeconds, progressFromFraction, rebalance } from "@/canvas/sysdesign-m9-rebalance-play/model";
import { askedShards, indexTile, scatterVerdict, searchChance, searchLoad, searchTally, writeCostText, writesPerOrder } from "@/canvas/sysdesign-m9-scatter-play/model";
import { BACKEND_SNAPS, slowChance } from "@/canvas/models/fan-out";
import { sysdesignM9RangeVsHash } from "@/canvas/sysdesign-m9-range-vs-hash/data";
import { sysdesignM9RingPlay } from "@/canvas/sysdesign-m9-ring-play/data";
import { sysdesignM9CelebrityPlay } from "@/canvas/sysdesign-m9-celebrity-play/data";
import { sysdesignM9RebalancePlay } from "@/canvas/sysdesign-m9-rebalance-play/data";
import { sysdesignM9ScatterPlay } from "@/canvas/sysdesign-m9-scatter-play/data";
import { RangeVsHashCanvas } from "@/canvas/sysdesign-m9-range-vs-hash/RangeVsHashCanvas";
import { RingPlayCanvas } from "@/canvas/sysdesign-m9-ring-play/RingPlayCanvas";
import { CelebrityPlayCanvas } from "@/canvas/sysdesign-m9-celebrity-play/CelebrityPlayCanvas";
import { RebalancePlayCanvas } from "@/canvas/sysdesign-m9-rebalance-play/RebalancePlayCanvas";
import { ScatterPlayCanvas } from "@/canvas/sysdesign-m9-scatter-play/ScatterPlayCanvas";

const VERDICT_MAX = 38;

describe("the course hash", () => {
  it("is deterministic and spreads order keys evenly over four shards (chapter 9.2)", () => {
    expect(hash32("order:1")).toBe(hash32("order:1"));
    expect(hash32("a")).not.toBe(hash32("b"));
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 100000; i++) counts[hash32(`order:${i}`) % 4]++;
    expect(counts.map((c) => (c / 1000).toFixed(1))).toEqual(["25.0", "24.9", "25.2", "25.0"]);
    expect(hash32("")).toBeLessThan(HASH_SPACE);
  });
});

describe("9.2 range or hash", () => {
  it("counts the shards a week touches", () => {
    expect(shardsTouchedRange(120)).toBe(1);
    expect(shardsTouchedRange(88)).toBe(2);
    expect(shardsTouchedRange(179)).toBe(2);
    expect(shardsTouchedRange(271)).toBe(2);
    expect(shardsTouchedHash).toBe(4);
    expect(touchedShards(88, "range")).toEqual([0, 1]);
    expect(touchedShards(179, "range")).toEqual([1, 2]);
    expect(touchedShards(271, "range")).toEqual([2, 3]);
    expect(touchedShards(120, "hash")).toEqual([0, 1, 2, 3]);
  });

  it("puts every write on shard 4 under range and 750 on each under hash", () => {
    expect(writesPerShard("range")).toEqual([0, 0, 0, 3000]);
    expect(loadRatio(3000)).toBe(3);
    expect(writesPerShard("hash")).toEqual([750, 750, 750, 750]);
    expect(loadRatio(750)).toBe(0.75);
    expect(RANGE_LIMIT).toBe(1000);
  });

  it("gives the three verdicts within 38 characters", () => {
    expect(rangeVsHashVerdict("range", 120)).toEqual({ text: "Week: 1 shard; all writes: shard 4", tone: "warn" });
    expect(rangeVsHashVerdict("range", 88)).toEqual({ text: "Week: 2 shards; all writes: shard 4", tone: "warn" });
    expect(rangeVsHashVerdict("hash", 120)).toEqual({ text: "Week: all 4 shards; writes even", tone: "warn" });
    for (let s = START.min; s <= START.max; s++) for (const mode of ["range", "hash"] as const) expect(rangeVsHashVerdict(mode, s).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("scatters seven orders a day over all four shards under hash, for every window", () => {
    for (let s = START.min; s <= START.max; s++) {
      const dots = orderDots(s, "hash");
      expect(dots).toHaveLength(49);
      expect(new Set(dots.map((d) => d.shard)).size).toBe(4);
    }
    expect(hashShardOfOrder(120, 3)).toBe(hashShardOfOrder(120, 3));
    // Under range the week sits together.
    expect(new Set(orderDots(120, "range").map((d) => d.shard))).toEqual(new Set([1]));
  });

  it("snaps the drag to the chosen windows, steps by day and by week, and clamps", () => {
    expect(startFromFraction(startToFraction(120))).toBe(120);
    expect(startFromFraction(startToFraction(89))).toBe(88);
    expect(startFromFraction(startToFraction(272))).toBe(271);
    expect(startFromFraction(0)).toBe(1);
    expect(startFromFraction(1)).toBe(359);
    expect(startFromFraction(Number.NaN)).toBe(1);
    expect(clampStart(400)).toBe(359);
    expect(clampStart(-3)).toBe(1);
    const range = { min: START.min, max: START.max, step: 1, page: 7 };
    expect(stepByKey(120, "ArrowRight", range)).toBe(121);
    expect(stepByKey(120, "PageUp", range)).toBe(127);
    expect(stepByKey(358, "PageUp", range)).toBe(359);
  });

  it("describes the window for a screen reader", () => {
    expect(describeWindow(120)).toBe("week starting day 120, touches 1 shard");
    expect(describeWindow(88)).toBe("week starting day 88, touches 2 shards");
    expect(describeWindow(120, "hash")).toBe("week starting day 120, touches 4 shards");
  });
});

describe("9.3 the ring with virtual nodes", () => {
  const four = nodesOf(4);
  const five = nodesOf(5);
  const table: Record<number, [number, number, number, number]> = {
    1: [1.68, 1.3, 2.1, 25.9],
    5: [1.56, 16.0, 1.45, 16.8],
    10: [1.26, 20.9, 1.17, 31.4],
    50: [1.26, 17.7, 1.32, 19.3],
    100: [1.15, 19.7, 1.17, 23.7],
    200: [1.08, 18.9, 1.07, 22.9],
  };

  it("matches the chapter's 10,000 key table", () => {
    for (const [v, [busy4, movedAdd, busy5, movedRemove]] of Object.entries(table)) {
      const a4 = assign(four, Number(v));
      const a5 = assign(five, Number(v));
      expect(busiestOverFair(a4.counts).toFixed(2)).toBe(busy4.toFixed(2));
      expect(busiestOverFair(a5.counts).toFixed(2)).toBe(busy5.toFixed(2));
      expect((compare(a4, a5).share * 100).toFixed(1)).toBe(movedAdd.toFixed(1));
      const without = assign(["node-a", "node-c", "node-d"], Number(v));
      expect((compare(a4, without).share * 100).toFixed(1)).toBe(movedRemove.toFixed(1));
    }
  });

  it("moves keys only to the new node on an add, and only from the removed node on a remove", () => {
    for (const v of POINT_LADDER) {
      const a4 = assign(four, v);
      const a5 = assign(five, v);
      const add = compare(a4, a5);
      expect(add.between).toBe(0);
      for (let i = 0; i < KEY_COUNT; i++) if (a4.owners[i] !== a5.owners[i]) expect(a5.owners[i]).toBe("node-e");
      const a3 = assign(["node-a", "node-b", "node-c"], v);
      const remove = compare(a4, a3);
      expect(remove.between).toBe(0);
      for (let i = 0; i < KEY_COUNT; i++) if (a4.owners[i] !== a3.owners[i]) expect(a4.owners[i]).toBe("node-d");
    }
  });

  it("counts every key once and wraps past the last point", () => {
    const a = assign(four, 10);
    expect(a.counts.reduce((x, y) => x + y, 0)).toBe(KEY_COUNT);
    const pts = buildRing(four, 10);
    expect(pts).toHaveLength(40);
    expect(ownerPoint(pts, HASH_SPACE - 1)).toBe(pts[0]);
    expect(ownerPoint(pts, 0)).toBe(pts[0]);
    expect(ownerPoint(pts, pts[5].pos)).toBe(pts[5]);
    // A tie goes to the smaller name.
    const tie = buildRing(["node-b", "node-a"], 1).concat([]);
    expect(tie[0].pos <= tie[1].pos).toBe(true);
  });

  it("matches the chapter's 100,000 key figures at 100 points are close to the 10,000 key ones", () => {
    // Hash mod 4 to mod 5 moves about 80%.
    expect((modMoveShare(4, 5) * 100).toFixed(1)).toBe("79.9");
  });

  it("gives the verdicts within 38 characters and the right tones", () => {
    expect(spreadVerdict(1.68)).toEqual({ text: "Busiest node: 1.68 times its share", tone: "bad" });
    expect(spreadVerdict(1.26).tone).toBe("warn");
    expect(spreadVerdict(1.08).tone).toBe("good");
    expect(spreadVerdict(1.5).tone).toBe("warn");
    expect(moveVerdict("add", "node-e", 0.197, idealMove("add", 4))).toEqual({ text: "Added node-e: 19.7% of keys moved", tone: "good" });
    expect(moveVerdict("remove", "node-b", 0.237, idealMove("remove", 4))).toEqual({ text: "Removed node-b: 23.7% of keys moved", tone: "good" });
    expect(moveVerdict("remove", "node-b", 0.34, idealMove("remove", 4)).tone).toBe("warn");
    expect(percentText(0.197)).toBe("19.7%");
    for (const name of NODE_NAMES) {
      expect(moveVerdict("remove", name, 0.999, 0.5).text.length).toBeLessThanOrEqual(VERDICT_MAX);
      expect(moveVerdict("add", name, 0.1, 0.5).text.length).toBeLessThanOrEqual(VERDICT_MAX);
    }
    expect(spreadVerdict(3.45).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("walks the dial ladder and clamps", () => {
    expect(POINT_LADDER).toEqual([1, 2, 5, 10, 20, 50, 100, 200]);
    expect(pointsFromFraction(0)).toBe(1);
    expect(pointsFromFraction(1)).toBe(200);
    expect(pointsFromFraction(pointsToFraction(50))).toBe(50);
    expect(pointsFromFraction(Number.NaN)).toBe(1);
    expect(nodesOf(1)).toHaveLength(2);
    expect(nodesOf(20)).toHaveLength(8);
  });

  it("draws arcs that close up into the whole circle", () => {
    for (const v of [1, 5, 200]) {
      const arcs = ringArcs(assign(nodesOf(8), v).points);
      expect(arcs[0].from).toBeLessThan(0);
      let covered = 0;
      for (const a of arcs) covered += a.to - a.from;
      expect(covered).toBeCloseTo(Math.PI * 2, 6);
      expect(arcPath(arcs, 210, 186, 114)).toMatch(/^M/);
    }
    // Cut into sectors, every path stays near its bit of the ring, so a label inside the ring is never under its bounding box.
    for (const v of [1, 200]) {
      const paths = sectorPaths(ringArcs(assign(nodesOf(8), v).points), 210, 186, 114);
      expect(paths.length).toBeLessThanOrEqual(8 * 24);
      for (const p of paths) {
        const nums = [...p.d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
        const xs = nums.filter((_, i) => i % 9 === 0 || i % 9 === 7);
        const ys = nums.filter((_, i) => i % 9 === 1 || i % 9 === 8);
        expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(40);
        expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(40);
      }
    }
    expect(posToAngle(HASH_SPACE / 4)).toBeCloseTo(Math.PI / 2, 9);
    expect(angleToPos(Math.PI / 2)).toBe(HASH_SPACE / 4);
    expect(angleToPos(-Math.PI / 2)).toBe((HASH_SPACE * 3) / 4);
    expect(SAMPLE_KEYS.length).toBeGreaterThan(150);
  });
});

describe("9.4 the hot key", () => {
  const busiest = (s: number, k: number) => loadsFor(s, k).hottestLoad;
  const table: Record<number, number[]> = {
    4: [2100, 1200, 1200, 975, 1088],
    6: [2000, 2000, 1100, 650, 763],
    8: [1950, 1050, 600, 600, 600],
    12: [1900, 1000, 550, 550, 438],
    16: [1875, 975, 525, 300, 413],
  };

  it("matches the chapter's table, including the cells that are not monotone", () => {
    for (const [s, row] of Object.entries(table)) expect(SALTS.map((k) => busiest(Number(s), k))).toEqual(row);
    expect(busiest(4, 16)).toBeGreaterThan(busiest(4, 8));
    expect(busiest(6, 2)).toBe(2000);
  });

  it("lands the four sub-keys on shards 2, 4, 4 and 1 at 4 shards", () => {
    const m = loadsFor(4, 4);
    expect(m.landing.map((s) => s + 1)).toEqual([2, 4, 4, 1]);
    expect(m.load).toEqual([750, 750, 300, 1200]);
    expect(subKeys(4)[3]).toBe("seller:noor-crafts#3");
    expect(subKeys(1)).toEqual(["seller:noor-crafts"]);
    const plain = loadsFor(4, 1);
    expect(plain.hottest).toBe(3);
    expect(plain.load).toEqual([300, 300, 300, 2100]);
  });

  it("gives the verdicts within 38 characters", () => {
    expect(hottestVerdict(2100)).toEqual({ text: "Hottest shard: 2,100 of 1,000 limit", tone: "bad" });
    expect(hottestVerdict(975)).toEqual({ text: "Hottest shard: 975 of 1,000 limit", tone: "warn" });
    expect(hottestVerdict(600)).toEqual({ text: "Hottest shard: 600 of 1,000 limit", tone: "good" });
    expect(hottestVerdict(1000).tone).toBe("warn");
    expect(hottestVerdict(799).tone).toBe("good");
    for (const s of SHARD_LADDER) for (const k of SALTS) expect(hottestVerdict(busiest(s, k)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("shows the average that hides the hot shard, and snaps the rail", () => {
    expect(averageLoad(4)).toBe(750);
    expect(averageLoad(16)).toBe(187.5);
    expect(shardsFromFraction(shardsToFraction(8))).toBe(8);
    expect(shardsFromFraction(0)).toBe(4);
    expect(shardsFromFraction(1)).toBe(16);
    expect(shardsFromFraction(shardsToFraction(8) + 0.02)).toBe(8);
    expect(shardsFromFraction(Number.NaN)).toBe(4);
    expect(SHARD_LADDER).toHaveLength(13);
  });
});

describe("9.5 moving data", () => {
  it("sizes the move for both schemes", () => {
    expect(bytesToMoveGB("mod")).toBe(1440);
    expect(bytesToMoveGB("fixed")).toBe(360);
    expect(moveSeconds("mod")).toBe(14400);
    expect(moveSeconds("fixed")).toBe(3600);
    expect(durationText(14400)).toBe("4 h");
    expect(durationText(3600)).toBe("1 h");
    expect(durationText(5400)).toBe("1.5 h");
    expect(durationText(1800)).toBe("30 min");
  });

  it("counts wrong-node requests half way and at the end", () => {
    const half = rebalance("mod", "old", 50);
    expect(half.movedGB).toBe(720);
    expect(half.wrong).toBe(2000);
    const halfFixed = rebalance("fixed", "old", 50);
    expect(halfFixed.movedGB).toBe(180);
    expect(halfFixed.wrong).toBe(500);
    expect(rebalance("mod", "old", 100).wrong).toBe(4000);
    expect(rebalance("fixed", "old", 100).wrong).toBe(1000);
    expect(rebalance("mod", "fresh", 100).wrong).toBe(0);
    expect(rebalance("fixed", "fresh", 100).wrong).toBe(0);
    expect(rebalance("mod", "old", 0).wrong).toBe(0);
  });

  it("ends with a fifth of the data on every node, whichever scheme moved it", () => {
    for (const scheme of ["mod", "fixed"] as const) {
      expect(rebalance(scheme, "old", 0).volumes).toEqual([450, 450, 450, 450, 0]);
      const end = rebalance(scheme, "old", 100).volumes;
      expect(end.every((v) => Math.abs(v - 360) < 1e-9)).toBe(true);
      expect(rebalance(scheme, "old", 37).volumes.reduce((a, b) => a + b, 0)).toBeCloseTo(1800, 9);
    }
    expect(rebalance("mod", "old", 100).wasteGB).toBe(1080);
    expect(rebalance("fixed", "old", 100).wasteGB).toBe(0);
  });

  it("gives the verdicts within 38 characters", () => {
    expect(rebalance("mod", "old", 0).verdict).toEqual({ text: "1.44 TB to move: about 4 hours", tone: "bad" });
    expect(rebalance("fixed", "old", 0).verdict).toEqual({ text: "360 GB to move: about 1 hour", tone: "good" });
    expect(rebalance("mod", "old", 50).verdict).toEqual({ text: "2,000 requests/s hit the wrong node", tone: "bad" });
    expect(rebalance("fixed", "old", 50).verdict).toEqual({ text: "500 requests/s hit the wrong node", tone: "warn" });
    expect(rebalance("mod", "fresh", 50).verdict).toEqual({ text: "Map is fresh: no wrong-node requests", tone: "good" });
    for (const scheme of ["mod", "fixed"] as const) for (const map of ["old", "fresh"] as const) for (let p = 0; p <= 100; p++) expect(rebalance(scheme, map, p).verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("clamps the progress and describes it for a screen reader", () => {
    expect(rebalance("mod", "old", 400).progress).toBe(100);
    expect(rebalance("mod", "old", -5).progress).toBe(0);
    expect(rebalance("mod", "old", Number.NaN).progress).toBe(0);
    expect(progressFromFraction(0.5)).toBe(50);
    expect(progressFromFraction(2)).toBe(PROGRESS.max);
    expect(describeProgress("mod", "old", 50)).toBe("move 50% done, 720 GB moved, 2,000 wrong-node requests a second");
  });
});

describe("9.6 scatter and gather", () => {
  it("climbs with the shard count under a local index and stays at 1% under a global one", () => {
    const pct = (n: number) => (searchChance(n, "local") * 100).toFixed(1);
    expect(pct(1)).toBe("1.0");
    expect(pct(10)).toBe("9.6");
    expect(pct(20)).toBe("18.2");
    expect(pct(50)).toBe("39.5");
    expect(pct(100)).toBe("63.4");
    for (const n of BACKEND_SNAPS) expect(searchChance(n, "global")).toBeCloseTo(0.01, 12);
    expect(searchChance(20, "local")).toBe(slowChance(20));
  });

  it("says the verdict in at most 38 characters, with the chapter's colours", () => {
    expect(scatterVerdict(20, "local")).toMatchObject({ text: "18% of searches hit a slow shard", tone: "warn" });
    expect(scatterVerdict(20, "global")).toMatchObject({ text: "1% of searches hit a slow shard", tone: "good" });
    expect(scatterVerdict(1, "local").tone).toBe("good");
    expect(scatterVerdict(10, "local")).toMatchObject({ text: "9.6% of searches hit a slow shard", tone: "warn" });
    expect(scatterVerdict(100, "local")).toMatchObject({ text: "63% of searches hit a slow shard", tone: "bad" });
    for (let n = 1; n <= 100; n++) for (const mode of ["local", "global"] as const) expect(scatterVerdict(n, mode).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("asks every shard locally and one globally, and doubles the writes", () => {
    expect(askedShards(20, "local")).toBe(20);
    expect(askedShards(20, "global")).toBe(1);
    expect(searchLoad(20, "local", 3).slow).toHaveLength(20);
    expect(searchLoad(20, "global", 3).slow).toHaveLength(1);
    expect(writesPerOrder("local")).toBe(1);
    expect(writesPerOrder("global")).toBe(2);
    expect(writeCostText("global")).toBe("Each order = 2 writes");
    expect(writeCostText("local")).toBe("Each order = 1 write");
  });

  it("tallies the searches it ran, and the local tally runs slower than the global one over many searches", () => {
    const local = searchTally(100, "local", 0, 399, [], 12);
    const global = searchTally(100, "global", 0, 399, [], 12);
    expect(local.fast + local.slow).toBe(400);
    expect(local.slow / 400).toBeGreaterThan(0.5);
    expect(global.slow / 400).toBeLessThan(0.05);
    expect(local.recent).toHaveLength(12);
  });

  it("picks an index tile in the bottom row for every shard count", () => {
    for (let n = 1; n <= 100; n++) {
      const i = indexTile(n, 104);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(n);
    }
  });
});

describe("the module 9 playable specs", () => {
  const specs = [
    ["range-vs-hash", sysdesignM9RangeVsHash, RangeVsHashCanvas],
    ["ring-play", sysdesignM9RingPlay, RingPlayCanvas],
    ["celebrity-play", sysdesignM9CelebrityPlay, CelebrityPlayCanvas],
    ["rebalance-play", sysdesignM9RebalancePlay, RebalancePlayCanvas],
    ["scatter-play", sysdesignM9ScatterPlay, ScatterPlayCanvas],
  ] as const;

  it("are custom canvases with a purpose and an honest limits note", () => {
    for (const [, spec] of specs) {
      expect(spec.kind).toBe("custom");
      expect(spec.title.length).toBeGreaterThan(5);
      expect(spec.purpose.length).toBeGreaterThan(40);
      expect(spec.limits.length).toBeGreaterThan(60);
      expect(`${spec.title}${spec.purpose}${spec.limits}`).not.toContain("—");
    }
  });

  it.each(specs.map(([slug, spec, Component]) => [slug, spec, Component] as const))("%s renders on the server with its picture and its limits fold", (_slug, spec, Component) => {
    const html = renderToString(createElement(Component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain("role=\"slider\"");
    expect(html).not.toContain("NaN");
  });

  it("show their first verdicts at the default settings", () => {
    const html = (i: number) => {
      const [, spec, Component] = specs[i];
      return renderToString(createElement(Component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
    };
    expect(html(0)).toContain("Week: 1 shard; all writes: shard 4");
    expect(html(1)).toContain("Busiest node: 1.68 times its share");
    expect(html(2)).toContain("Hottest shard: 2,100 of 1,000 limit");
    expect(html(3)).toContain("1.44 TB to move: about 4 hours");
    expect(html(4)).toContain("18% of searches hit a slow shard");
  });
});
