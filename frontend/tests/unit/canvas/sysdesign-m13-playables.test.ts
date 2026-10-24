import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as ring from "@buildment/learning-ui/canvas/sysdesign-m13-ring-write/model";
import * as heal from "@buildment/learning-ui/canvas/sysdesign-m13-cluster-heal/model";
import * as hot from "@buildment/learning-ui/canvas/sysdesign-m13-hot-partition/model";
import * as lww from "@buildment/learning-ui/canvas/sysdesign-m13-lww-skew/model";
import * as cart from "@buildment/learning-ui/canvas/sysdesign-m13-cart-merge/model";
import * as crdt from "@buildment/learning-ui/canvas/sysdesign-m13-crdt-play/model";
import { sysdesignM13RingWrite } from "@buildment/learning-ui/canvas/sysdesign-m13-ring-write/data";
import { sysdesignM13ClusterHeal } from "@buildment/learning-ui/canvas/sysdesign-m13-cluster-heal/data";
import { sysdesignM13HotPartition } from "@buildment/learning-ui/canvas/sysdesign-m13-hot-partition/data";
import { sysdesignM13LwwSkew } from "@buildment/learning-ui/canvas/sysdesign-m13-lww-skew/data";
import { sysdesignM13CartMerge } from "@buildment/learning-ui/canvas/sysdesign-m13-cart-merge/data";
import { sysdesignM13CrdtPlay } from "@buildment/learning-ui/canvas/sysdesign-m13-crdt-play/data";
import { RingWriteCanvas } from "@buildment/learning-ui/canvas/sysdesign-m13-ring-write/RingWriteCanvas";
import { ClusterHealCanvas } from "@buildment/learning-ui/canvas/sysdesign-m13-cluster-heal/ClusterHealCanvas";
import { HotPartitionCanvas } from "@buildment/learning-ui/canvas/sysdesign-m13-hot-partition/HotPartitionCanvas";
import { LwwSkewCanvas } from "@buildment/learning-ui/canvas/sysdesign-m13-lww-skew/LwwSkewCanvas";
import { CartMergeCanvas } from "@buildment/learning-ui/canvas/sysdesign-m13-cart-merge/CartMergeCanvas";
import { CrdtPlayCanvas } from "@buildment/learning-ui/canvas/sysdesign-m13-crdt-play/CrdtPlayCanvas";

const VERDICT_MAX = 38;

describe("13.2 ring write", () => {
  const names = (key: number, skip: boolean) => ring.walkFor(key, skip).copies.join("");
  const table: [number, string, string, number][] = [
    [0, "ABC", "AAB", 2],
    [10, "ABC", "AAB", 2],
    [20, "ABC", "AAB", 2],
    [21, "ABC", "ABC", 3],
    [60, "BCD", "BCB", 2],
    [130, "CBD", "CBD", 3],
    [240, "ECD", "EEC", 2],
    [300, "CDA", "CDA", 3],
    [335, "DAB", "DAA", 2],
    [359, "ABC", "AAB", 2],
  ];
  it.each(table)("key %i: skip on %s, skip off %s with %i machines", (key, on, off, machines) => {
    expect(names(key, true)).toBe(on);
    expect(names(key, false)).toBe(off);
    expect(ring.walkFor(key, false).machines).toHaveLength(machines);
    expect(ring.walkFor(key, true).machines).toHaveLength(3);
  });

  it("marks skipped repeats and numbers the copies", () => {
    const w = ring.walkFor(10, true);
    expect(w.steps.map((s) => s.rank)).toEqual([1, null, 2, 3]);
    expect(w.sweep).toBe(130);
    expect(ring.walkFor(10, false).steps.map((s) => s.rank)).toEqual([1, 2, 3]);
  });

  it("gives the verdicts within 38 characters", () => {
    expect(ring.writeVerdict(ring.walkFor(60, true)).text).toBe("Copies on B, C and D");
    expect(ring.writeVerdict(ring.walkFor(130, false)).text).toBe("Copies on C, B and D");
    expect(ring.writeVerdict(ring.walkFor(10, false)).text).toBe("Only 2 machines hold a copy");
    expect(ring.machineCountText(ring.walkFor(10, false))).toBe("2 machines");
    for (let k = 0; k <= 359; k++) for (const s of [true, false]) expect(ring.writeVerdict(ring.walkFor(k, s)).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("cuts an arc into short segments that close up", () => {
    const segs = ring.arcSegments(0, Math.PI, 100, 100, 50);
    expect(segs).toHaveLength(36);
    expect(segs[0].x1).toBe(100);
    expect(segs[0].y1).toBe(50);
    expect(segs[35].x2).toBeCloseTo(100, 1);
    expect(segs[35].y2).toBeCloseTo(150, 1);
    for (const s of segs) expect(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)).toBeLessThan(5);
    expect(ring.arcSegments(1, 1, 0, 0, 10)).toEqual([]);
  });

  it("describes the key for a screen reader and maps angles to degrees", () => {
    expect(ring.describeKey(10, true)).toBe("key at 10, copies on A, B and C");
    expect(ring.angleToDeg(0)).toBe(0);
    expect(ring.angleToDeg(Math.PI / 2)).toBe(90);
    expect(ring.angleToDeg(-Math.PI / 2)).toBe(270);
    expect(ring.angleToDeg(Math.PI * 2 - 0.0001)).toBe(0);
    expect(ring.clampKey(400)).toBe(359);
    expect(ring.copiesPerMachine(ring.walkFor(10, false))).toEqual({ A: 2, B: 1, C: 0, D: 0, E: 0 });
  });
});

describe("13.3 cluster heal", () => {
  const down = (s: heal.Sim, ...n: number[]) => n.reduce((acc, i) => heal.toggle(acc, i), s);
  const xs = (s: heal.Sim) => s.x.join(",");

  it("saves a sloppy write on the stand-ins as hints, then reads stale, then heals", () => {
    let s = down(heal.initial("sloppy", true), 0, 1, 2);
    s = heal.advance(heal.write(s), 0);
    expect(s.hints).toEqual([
      { holder: 3, owner: 0, value: 7 },
      { holder: 4, owner: 1, value: 7 },
    ]);
    expect(s.verdict?.text).toBe("Write saved on N4 and N5 (hints)");
    expect(s.writes[0].acked).toHaveLength(2);
    s = down(s, 0, 1, 2);
    expect(xs(heal.read(s))).toBe("6,6,6,6,6");
    expect(heal.read(s).verdict?.text).toBe("Read returned old x = 6");
    s = heal.advance(s, heal.WAIT_TICKS);
    expect(s.x.slice(0, 3)).toEqual([7, 7, 6]);
    expect(heal.read(s).verdict?.text).toBe("Read returned new x = 7");
  });

  it("heals from any starting tick within one Wait", () => {
    for (let lead = 0; lead < 4; lead++) {
      let s = down(heal.initial("sloppy", true), 0, 1, 2);
      s = heal.advance(heal.write(s), 0);
      s = down(s, 0, 1, 2);
      s = heal.advance(s, lead);
      s = heal.advance(s, heal.WAIT_TICKS);
      expect(s.x.slice(0, 2)).toEqual([7, 7]);
    }
  });

  it("never heals with hints off", () => {
    let s = down(heal.initial("sloppy", false), 0, 1, 2);
    s = heal.advance(heal.write(s), 0);
    expect(s.hints).toHaveLength(2);
    s = down(s, 0, 1, 2);
    s = heal.advance(s, 10);
    expect(s.x.slice(0, 3)).toEqual([6, 6, 6]);
    expect(s.hints.map((h) => h.value)).toEqual([7, 7]);
    expect(heal.read(s).verdict?.text).toBe("Read returned old x = 6");
  });

  it("refuses a strict write with the usual three down, and confirms with only N3 down", () => {
    let s = down(heal.initial("strict", true), 0, 1, 2);
    s = heal.write(s);
    expect(s.verdict?.text).toBe("Write refused: 0 of 2 acks");
    expect(xs(s)).toBe("6,6,6,6,6");
    s = down(heal.initial("strict", true), 2);
    s = heal.advance(heal.write(s), 0);
    expect(s.x.slice(0, 3)).toEqual([7, 7, 6]);
    expect(s.verdict?.text).toBe("Write confirmed: 2 acks");
  });

  it("confirms a plain write with 3 acks and refuses a write with one live target", () => {
    let s = heal.advance(heal.write(heal.initial()), 0);
    expect(s.verdict?.text).toBe("Write confirmed: 3 acks");
    s = down(heal.initial("strict", true), 1, 2);
    s = heal.advance(heal.write(s), 0);
    expect(s.verdict?.text).toBe("Write refused: 1 of 2 acks");
  });

  it("refuses a read with fewer than 2 usual nodes up, and loses hints when a stand-in goes down", () => {
    let s = down(heal.initial(), 0, 1);
    expect(heal.read(s).verdict?.text).toBe("Read refused: fewer than 2 nodes");
    s = down(heal.initial(), 0, 1, 2);
    s = heal.advance(heal.write(s), 0);
    s = down(s, 3);
    expect(s.hints.map((h) => h.holder)).toEqual([4]);
  });

  it("picks the coordinator, reports answers, and keeps every verdict within 38 characters", () => {
    const s = down(heal.initial(), 0, 1, 2);
    expect(heal.coordinatorOf(s.up)).toBe(3);
    expect(heal.coordinatorOf(heal.initial().up)).toBe(0);
    const r = heal.read(heal.initial());
    expect(r.answers.map((a) => [a.node, a.counted])).toEqual([[0, true], [1, true], [2, false]]);
    expect(heal.describeNode(s, 1)).toBe("N2, down");
    const verdicts = [
      "Write saved on N4 and N5 (hints)",
      "Write refused: 0 of 2 acks",
      "Read returned old x = 6",
      "Read returned new x = 7",
      "Read refused: fewer than 2 nodes",
      "Write confirmed: 3 acks, hints N4, N5",
    ];
    for (const t of verdicts) expect(t.length).toBeLessThanOrEqual(VERDICT_MAX);
    // A mixed write: N2 and N3 down, stand-ins up.
    let m = down(heal.initial(), 1, 2);
    m = heal.advance(heal.write(m), 0);
    expect(m.verdict?.text).toBe("Write confirmed: 3 acks, hints N4, N5");
  });
});

describe("13.4 hot partition", () => {
  const table: [number, number, number, number, number, number, number][] = [
    [300, 300, 0, 300, 0, 900, 900],
    [500, 500, 0, 500, 0, 1100, 1100],
    [800, 500, 300, 800, 0, 1100, 1400],
    [1000, 500, 500, 1000, 0, 1100, 1600],
    [1500, 500, 1000, 1000, 500, 1100, 1600],
    [2000, 500, 1500, 1000, 1000, 1100, 1600],
  ];
  it.each(table)("demand %i", (d, offAcc, offRej, onAcc, onRej, offUse, onUse) => {
    const off = hot.outcome(d, false);
    const on = hot.outcome(d, true);
    expect([off.accepted, off.rejected, off.tableUse]).toEqual([offAcc, offRej, offUse]);
    expect([on.accepted, on.rejected, on.tableUse]).toEqual([onAcc, onRej, onUse]);
  });

  it("gives the verdicts within 38 characters", () => {
    expect(hot.verdict(300, false).text).toBe("Within its share: nothing rejected");
    expect(hot.verdict(800, false).text).toBe("Rejects 300/s: share is only 500");
    expect(hot.verdict(800, true).text).toBe("Borrowed spare capacity: none rejected");
    expect(hot.verdict(1500, true).text).toBe("Ceiling 1,000/s: 500 still rejected");
    for (let d = 0; d <= hot.DEMAND_MAX; d += 100) for (const a of [true, false]) expect(hot.verdict(d, a).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("snaps the drag and describes it", () => {
    expect(hot.snapDemand(849)).toBe(800);
    expect(hot.snapDemand(851)).toBe(900);
    expect(hot.snapDemand(-5)).toBe(0);
    expect(hot.snapDemand(9999)).toBe(2000);
    expect(hot.snapDemand(Number.NaN)).toBe(0);
    expect(hot.describeDemand(800, false)).toBe("hot key 800 writes a second, 300 rejected");
  });
});

describe("13.5 last write wins and skew", () => {
  const table: [number, number, number][] = [
    [0, 0, 0],
    [2, 1, 1],
    [5, 4, 1],
    [10, 9, 1],
    [15, 14, 1],
    [20, 19, 1],
    [30, 20, 0],
  ];
  it.each(table)("skew %i: %i wrong winners, %i ties out of 20", (s, wrong, ties) => {
    expect(lww.counts(s, "sequential")).toEqual({ wrong, ties });
  });

  it("loses one write in every concurrent pair", () => {
    for (const s of lww.SKEWS) expect(lww.counts(s, "concurrent")).toEqual({ wrong: 20, ties: 0 });
    expect(lww.counterText(20, "sequential")).toBe("19 of 20 pairs have the wrong winner");
  });

  it("stamps and verdicts at the default", () => {
    expect(lww.stamps(20, 5)).toEqual({ stamp1: 30, stamp2: 15 });
    expect(lww.winner(20, 5)).toBe(1);
    expect(lww.verdict(20, 5, "sequential").text).toBe("Later write lost: its clock ran slow");
    expect(lww.verdict(5, 20, "sequential").text).toBe("The later write wins: correct");
    expect(lww.winner(5, 20)).toBe(2);
    expect(lww.verdict(10, 10, "sequential").text).toBe("Equal stamps: the tie rule decides");
    expect(lww.winner(10, 10)).toBe(0);
    expect(lww.verdict(20, 5, "concurrent").text).toBe("Concurrent: one of the two is lost");
    for (const s of lww.SKEWS) for (const g of lww.GAPS) for (const m of ["sequential", "concurrent"] as const) expect(lww.verdict(s, g, m).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("snaps the rails", () => {
    expect(lww.skewFromFraction(lww.skewToFraction(20))).toBe(20);
    for (const s of lww.SKEWS) expect(lww.skewFromFraction(lww.skewToFraction(s))).toBe(s);
    expect(lww.skewFromFraction(0.5)).toBe(15);
    expect(lww.skewFromFraction(Number.NaN)).toBe(0);
    for (const g of lww.GAPS) expect(lww.gapFromFraction(lww.gapToFraction(g))).toBe(g);
    expect(lww.gapFromFraction(2)).toBe(30);
  });

  it("keeps two labels apart and inside the picture", () => {
    for (const [a, b] of [[158, 164], [164, 158], [10, 12], [410, 411], [200, 200]]) {
      const [l, r] = lww.spreadPair(a, b, 100, 8, 412);
      expect(Math.abs(l - r)).toBeGreaterThanOrEqual(104 - 1e-9);
      expect(Math.min(l, r)).toBeGreaterThanOrEqual(8 + 50 - 1e-9);
      expect(Math.max(l, r)).toBeLessThanOrEqual(412 - 50 + 1e-9);
      if (a !== b) expect(a < b ? l < r : r < l).toBe(true);
    }
    expect(lww.spreadPair(100, 300, 100, 8, 412)).toEqual([100, 300]);
  });
});

describe("13.6 cart merge", () => {
  const items = (rule: cart.Rule, c: cart.CaseId, flipped = false) => cart.merge(rule, c, flipped).join(",");
  it("makes the carts in the chapter's table", () => {
    expect(items("lww", 1)).toBe("eggs,milk,tea");
    expect(items("union", 1)).toBe("eggs,milk,tea");
    expect(items("byName", 1)).toBe("eggs,tea");
    expect(items("tagged", 1)).toBe("eggs,tea");
    expect(items("lww", 2)).toBe("eggs,milk");
    expect(items("union", 2)).toBe("eggs,milk");
    expect(items("byName", 2)).toBe("eggs");
    expect(items("tagged", 2)).toBe("eggs,milk");
  });

  it("shows the other result of last write wins when the stamps flip", () => {
    expect(items("lww", 1, true)).toBe("eggs");
    expect(items("lww", 2, true)).toBe("eggs");
    expect(cart.stampsFor(false)).toEqual({ hana: 10, dina: 12 });
    expect(cart.stampsFor(true)).toEqual({ hana: 12, dina: 10 });
  });

  it("grades each result against what people meant", () => {
    expect(cart.grade(cart.merge("union", 1, false), cart.intendedFor(1))).toEqual([
      { item: "eggs", mark: "right" },
      { item: "milk", mark: "back" },
      { item: "tea", mark: "right" },
    ]);
    expect(cart.grade(cart.merge("byName", 2, false), cart.intendedFor(2))).toEqual([
      { item: "eggs", mark: "right" },
      { item: "milk", mark: "lost" },
    ]);
  });

  it("gives the verdicts within 38 characters", () => {
    expect(cart.verdict("union", 1, false).text).toBe("Milk came back");
    expect(cart.verdict("lww", 1, false).text).toBe("Milk came back");
    expect(cart.verdict("byName", 2, false).text).toBe("Dina's add was lost");
    expect(cart.verdict("lww", 1, true).text).toBe("Dina's add was lost");
    expect(cart.verdict("union", 2, false).text).toBe("Both people's intent kept");
    expect(cart.verdict("tagged", 1, false).text).toBe("Both people's intent kept");
    expect(cart.verdict("tagged", 2, false).text).toBe("Both people's intent kept");
    expect(cart.verdict("lww", 2, false).text).toBe("Right only if Dina's stamp is later");
    for (const r of cart.RULES) for (const c of [1, 2] as const) for (const f of [false, true]) expect(cart.verdict(r.id, c, f).text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("describes the result for a screen reader", () => {
    expect(cart.describeResult("union", 1, false)).toBe("Union, case 1: eggs, milk and tea. Milk came back.");
  });
});

describe("13.7 CRDT play", () => {
  const types: crdt.SetType[] = ["plain", "byName", "orset"];
  const expected: Record<crdt.SetType, string> = { plain: "eggs,milk,rice", byName: "eggs", orset: "eggs,rice" };

  it.each(types)("%s: every merge order ends in the same state", (type) => {
    const start = crdt.initialReplicas(type);
    expect(crdt.allEqual(start)).toBe(false);
    for (const order of crdt.ORDERS) {
      const end = crdt.mergeAllVia(start, order);
      expect(crdt.allEqual(end)).toBe(true);
      expect(crdt.visible(type, end.A).join(",")).toBe(expected[type]);
    }
  });

  it("starts from the local changes", () => {
    const plain = crdt.initialReplicas("plain");
    expect(crdt.visible("plain", plain.A)).toEqual([]);
    expect(crdt.visible("plain", plain.C)).toEqual(["eggs", "milk", "rice"]);
    const orset = crdt.initialReplicas("orset");
    expect(crdt.visible("orset", orset.A)).toEqual([]);
    expect(crdt.visible("orset", orset.B)).toEqual(["milk", "rice"]);
    expect(crdt.rows("orset", orset.A)).toEqual([
      { text: "milk s:1", removed: true },
      { text: "rice s:2", removed: true },
    ]);
  });

  it("merge is commutative, associative and idempotent", () => {
    for (const type of types) {
      const { A, B, C } = crdt.initialReplicas(type);
      expect(crdt.mergeStates(A, B)).toEqual(crdt.mergeStates(B, A));
      expect(crdt.mergeStates(crdt.mergeStates(A, B), C)).toEqual(crdt.mergeStates(A, crdt.mergeStates(B, C)));
      expect(crdt.mergeStates(A, A)).toEqual(A);
      expect(crdt.mergeStates(crdt.mergeStates(A, B), B)).toEqual(crdt.mergeStates(A, B));
    }
  });

  it("gives the verdicts within 38 characters", () => {
    const end = (t: crdt.SetType) => crdt.mergeAllVia(crdt.initialReplicas(t), ["A", "B", "C"]);
    expect(crdt.verdict("plain", crdt.initialReplicas("plain")).text).toBe("Replicas still differ: keep merging");
    expect(crdt.verdict("plain", end("plain")).text).toBe("All agree, but milk came back");
    expect(crdt.verdict("byName", end("byName")).text).toBe("All agree, but rice was lost");
    expect(crdt.verdict("orset", end("orset")).text).toBe("All agree: eggs and rice. Correct.");
    for (const text of ["Replicas still differ: keep merging", "All agree, but milk came back", "All agree, but rice was lost", "All agree: eggs and rice. Correct.", "All agree, but not the right cart"]) expect(text.length).toBeLessThanOrEqual(VERDICT_MAX);
  });

  it("shows the OR-Set with all four tags after a full merge", () => {
    const e = crdt.mergeAllVia(crdt.initialReplicas("orset"), ["B", "C", "A"]);
    expect(crdt.rows("orset", e.A).map((r) => `${r.text}${r.removed ? " gone" : ""}`)).toEqual(["eggs C:1", "milk s:1 gone", "rice B:1", "rice s:2 gone"]);
  });
});

describe("the M13 playables", () => {
  const specs = [
    ["ring-write", sysdesignM13RingWrite, RingWriteCanvas],
    ["cluster-heal", sysdesignM13ClusterHeal, ClusterHealCanvas],
    ["hot-partition", sysdesignM13HotPartition, HotPartitionCanvas],
    ["lww-skew", sysdesignM13LwwSkew, LwwSkewCanvas],
    ["cart-merge", sysdesignM13CartMerge, CartMergeCanvas],
    ["crdt-play", sysdesignM13CrdtPlay, CrdtPlayCanvas],
  ] as const;
  const html = (i: number) => {
    const [, spec, Component] = specs[i];
    return renderToString(createElement(Component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
  };

  it("are custom canvases with a purpose and an honest limits note", () => {
    for (const [, spec] of specs) {
      expect(spec.kind).toBe("custom");
      expect(spec.title.length).toBeGreaterThan(5);
      expect(spec.purpose.length).toBeGreaterThan(40);
      expect(spec.limits.length).toBeGreaterThan(60);
      expect(`${spec.title}${spec.purpose}${spec.limits}`).not.toContain("2014");
    }
  });

  it.each(specs.map(([slug, spec, Component]) => [slug, spec, Component] as const))("%s renders on the server with its picture and its limits fold", (_slug, spec, Component) => {
    const out = renderToString(createElement(Component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
    expect(out).toContain("<svg");
    expect(out).toContain("What this picture leaves out");
    expect(out).not.toContain("NaN");
    expect(out).not.toContain("2014");
    expect(out).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });

  it("show their first picture at the default settings", () => {
    const ringHtml = html(0);
    expect(ringHtml).toContain('role="slider"');
    expect(ringHtml).toContain("key at 10, copies on A, B and C");
    expect(ringHtml).toContain("Tap Write to place the copies");
    expect(ringHtml).not.toContain("Copies on");
    expect(html(1)).toContain("All five nodes are up and x = 6 on each");
    expect(html(1)).toContain("N2, up");
    expect(html(2)).toContain("Rejects 300/s: share is only 500");
    expect(html(2)).toContain("hot key 800 writes a second, 300 rejected");
    expect(html(3)).toContain("Later write lost: its clock ran slow");
    expect(html(3)).toContain("19 of 20 pairs have the wrong winner");
    expect(html(4)).toContain("Milk came back");
    expect(html(5)).toContain("Replicas still differ: keep merging");
  });
});
