import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as lf from "@buildment/learning-ui/canvas/sysdesign-m8-leader-followers/model";
import * as cc from "@buildment/learning-ui/canvas/sysdesign-m8-confirm-count/model";
import * as sb from "@buildment/learning-ui/canvas/sysdesign-m8-split-brain/model";
import * as tr from "@buildment/learning-ui/canvas/sysdesign-m8-two-regions-edit/model";
import * as qn from "@buildment/learning-ui/canvas/sysdesign-m8-quorum-nodes/model";
import { sysdesignM8LeaderFollowers } from "@buildment/learning-ui/canvas/sysdesign-m8-leader-followers/data";
import { sysdesignM8ConfirmCount } from "@buildment/learning-ui/canvas/sysdesign-m8-confirm-count/data";
import { sysdesignM8SplitBrain } from "@buildment/learning-ui/canvas/sysdesign-m8-split-brain/data";
import { sysdesignM8TwoRegionsEdit } from "@buildment/learning-ui/canvas/sysdesign-m8-two-regions-edit/data";
import { sysdesignM8QuorumNodes } from "@buildment/learning-ui/canvas/sysdesign-m8-quorum-nodes/data";

const MAX_VERDICT = 38;
const DASH = String.fromCharCode(0x2014);

describe("8.2 leader and followers", () => {
  const writeAt = (...times: number[]): lf.Run => ({ writes: times, killedAt: null });

  it("fills the leader first, then follower 1 about 300 ms later and follower 2 about 800 ms later (slowed down)", () => {
    const run = writeAt(0);
    const accepted = lf.ACCEPT_S;
    expect(lf.applied(run, "leader", accepted - 0.01)).toBe(0);
    expect(lf.applied(run, "leader", accepted)).toBe(1);
    expect(lf.applied(run, "f1", accepted + lf.copySeconds("f1") - 0.01)).toBe(0);
    expect(lf.applied(run, "f1", accepted + lf.copySeconds("f1"))).toBe(1);
    expect(lf.applied(run, "f2", accepted + lf.copySeconds("f1"))).toBe(0);
    expect(lf.applied(run, "f2", accepted + lf.copySeconds("f2"))).toBe(1);
    expect(lf.copySeconds("f1")).toBeCloseTo(1.2, 5);
    expect(lf.copySeconds("f2")).toBeCloseTo(3.2, 5);
  });

  it("applies entries in the leader's order, so a follower holds the leader as it was a moment ago", () => {
    const run = writeAt(0, 1, 2);
    for (let t = 0; t < 10; t += 0.1) {
      const l = lf.applied(run, "leader", t);
      for (const id of ["f1", "f2"] as const) {
        const n = lf.applied(run, id, t);
        expect(n).toBeLessThanOrEqual(l);
      }
    }
    expect(lf.applied(run, "f2", 20)).toBe(3);
  });

  it("answers a read with the node's own value, amber when behind the leader and green when equal", () => {
    const run = writeAt(0);
    const t = lf.ACCEPT_S + lf.copySeconds("f1") + 0.05; // follower 1 has it, follower 2 does not
    expect(lf.readNode(run, "leader", t)).toEqual({ kind: "value", value: 1, behind: 0, fresh: true });
    expect(lf.readNode(run, "f1", t)).toEqual({ kind: "value", value: 1, behind: 0, fresh: true });
    expect(lf.readNode(run, "f2", t)).toEqual({ kind: "value", value: 0, behind: 1, fresh: false });
    expect(lf.verdict({ kind: "read", result: lf.readNode(run, "f2", t) }).text).toBe("That read is one write behind");
    expect(lf.verdict({ kind: "read", result: lf.readNode(run, "f1", t) }).text).toBe("That copy is up to date");
  });

  it("keeps reads working on followers after the kill, and the leader stops answering", () => {
    const run: lf.Run = { writes: [0], killedAt: 1 };
    expect(lf.isDown(run, 0.5)).toBe(false);
    expect(lf.isDown(run, 1)).toBe(true);
    expect(lf.readNode(run, "leader", 5)).toEqual({ kind: "down" });
    expect(lf.readNode(run, "f1", 5).kind).toBe("value");
    expect(lf.readNode(run, "f2", 5)).toMatchObject({ kind: "value", value: 1, fresh: true });
  });

  it("loses a write that reached the leader only after it was killed", () => {
    const run: lf.Run = { writes: [0.9], killedAt: 1 };
    expect(lf.acceptTimes(run)).toEqual([]);
    expect(lf.applied(run, "f2", 50)).toBe(0);
  });

  it("says each verdict in 38 characters or fewer and as the spec words them", () => {
    expect(lf.verdict({ kind: "write" }).text).toBe("Followers copy the leader's log");
    expect(lf.verdict({ kind: "kill" }).text).toBe("Reads work; writes are stopped");
    expect(lf.verdict({ kind: "refused" }).text).toBe("No leader: nobody can take writes");
    const behind = (n: number): lf.Action => ({ kind: "read", result: { kind: "value", value: 0, behind: n, fresh: n === 0 } });
    for (const a of [{ kind: "none" }, { kind: "write" }, { kind: "kill" }, { kind: "refused" }, { kind: "read", result: { kind: "down" } }, behind(0), behind(1), behind(9)] as lf.Action[]) {
      expect(lf.verdict(a).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    }
  });

  it("shows copies in flight only between the leader accepting and the follower applying", () => {
    const run = writeAt(0);
    expect(lf.copiesInFlight(run, 0)).toEqual([]);
    expect(lf.copiesInFlight(run, lf.ACCEPT_S + 0.5).map((c) => c.node).sort()).toEqual(["f1", "f2"]);
    expect(lf.copiesInFlight(run, 100)).toEqual([]);
    expect(lf.requestsInFlight(run, 0.1)).toHaveLength(1);
    expect(lf.requestsInFlight(run, 1)).toHaveLength(0);
  });
});

describe("8.3 how many followers must confirm", () => {
  it("matches the chapter's worked values with both followers live", () => {
    expect(cc.confirmOutcome(0, true)).toMatchObject({ writeMs: 0.3, copies: 1, atRisk: 15, stalled: false });
    expect(cc.confirmOutcome(1, true)).toMatchObject({ writeMs: 60.3, copies: 2, atRisk: 0, waitedFor: ["west"] });
    expect(cc.confirmOutcome(2, true)).toMatchObject({ writeMs: 80.3, copies: 3, atRisk: 0, waitedFor: ["west", "eu"] });
  });

  it("matches the worked values with West down, and stalls at two confirmations", () => {
    expect(cc.confirmOutcome(0, false)).toMatchObject({ writeMs: 0.3, atRisk: 20 });
    expect(cc.confirmOutcome(1, false)).toMatchObject({ writeMs: 80.3, copies: 2, waitedFor: ["eu"] });
    expect(cc.confirmOutcome(2, false)).toMatchObject({ stalled: true, writeMs: null, copies: null });
  });

  it("only loses acknowledged writes when nobody confirms", () => {
    for (const west of [true, false]) for (const k of cc.K_LADDER) expect(cc.confirmOutcome(k, west).atRisk > 0).toBe(k === 0);
  });

  it("words each verdict as the spec does, in 38 characters or fewer", () => {
    expect(cc.confirmVerdict(cc.confirmOutcome(0, true)).text).toBe("Fast, but 15 writes at risk");
    expect(cc.confirmVerdict(cc.confirmOutcome(0, false)).text).toBe("Fast, but 20 writes at risk");
    expect(cc.confirmVerdict(cc.confirmOutcome(1, true)).text).toBe("60 ms a write; survives 1 failure");
    expect(cc.confirmVerdict(cc.confirmOutcome(1, false)).text).toBe("80 ms a write; survives 1 failure");
    expect(cc.confirmVerdict(cc.confirmOutcome(2, true)).text).toBe("80 ms a write; survives 2 failures");
    expect(cc.confirmVerdict(cc.confirmOutcome(2, false)).text).toBe("Writes stuck: not enough followers");
    for (const west of [true, false]) for (const k of cc.K_LADDER) expect(cc.confirmVerdict(cc.confirmOutcome(k, west)).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("clamps the rail to 0, 1 or 2 and sweeps the cursor to the end under reduced motion", () => {
    expect(cc.clampK(-3)).toBe(0);
    expect(cc.clampK(9)).toBe(2);
    expect(cc.clampK(Number.NaN)).toBe(cc.DEFAULT_K);
    expect(cc.cursorMs(1e6)).toBe(cc.AXIS_MS);
    expect(cc.cursorMs(0)).toBe(0);
    expect(cc.cursorMs(cc.SWEEP_SECONDS / 2)).toBeCloseTo(cc.AXIS_MS / 2, 5);
    expect(cc.trip("west")).toMatchObject({ arrive: 30.3, back: 60.3 });
    expect(cc.msText(60.3)).toBe("60.3 ms");
    expect(cc.msText(0.3)).toBe("0.3 ms");
  });
});

describe("8.5 split brain", () => {
  const cut = (fencing: boolean): sb.State => ({ ...sb.initial(fencing), net: { phase: "cut", cutAt: 0, healAt: null } });
  const after = sb.TIMEOUT_S + 0.1;

  it("keeps one leader before the cut and waits out the timeout after it", () => {
    const s = sb.initial(false);
    expect(sb.verdict(s, 0).text).toBe("One leader, one history");
    expect(sb.roles(s.net, 0).A.role).toBe("leader");
    expect(sb.verdict(cut(false), 1).text).toBe("Followers wait out the timeout");
    expect(sb.roles(cut(false).net, 1).B.role).toBe("waiting");
    expect(sb.countdown(cut(false).net, 1)).toBeCloseTo(0.5, 5);
    expect(sb.countdown(cut(false).net, after)).toBeNull();
  });

  it("promotes B with epoch 2 after the timeout while A still believes it leads", () => {
    const r = sb.roles(cut(false).net, after);
    expect(r.B).toEqual({ role: "leader", epoch: 2 });
    expect(r.C).toEqual({ role: "follower", epoch: 2 });
    expect(r.A).toEqual({ role: "leader", epoch: 1, stale: true });
    expect(sb.verdict(cut(false), after).text).toBe("Two leaders, two histories");
    expect(sb.canWrite(cut(false), "B", 1)).toBe(false);
    expect(sb.canWrite(cut(false), "B", after)).toBe(true);
  });

  it("accepts all four writes of two leaders without fencing (a1 a2 b1 b2)", () => {
    let s = cut(false);
    s = sb.addWrite(s, "A", 0.5);
    s = sb.addWrite(s, "A", 1);
    s = sb.addWrite(s, "B", 3);
    s = sb.addWrite(s, "B", 3.5);
    expect(sb.judge(s).map((w) => [w.label, w.accepted])).toEqual([["a1", true], ["a2", true], ["b1", true], ["b2", true]]);
    expect(sb.history(s).map((w) => w.label)).toEqual(["a1", "a2", "b1", "b2"]);
  });

  it("with fencing refuses a write with epoch 1 once epoch 2 was seen, and says why", () => {
    let s = cut(true);
    s = sb.addWrite(s, "A", 0.5); // before B's first write: accepted
    s = sb.addWrite(s, "B", 3);
    s = sb.addWrite(s, "A", 3.5); // after: refused
    s = sb.addWrite(s, "B", 4);
    const j = sb.judge(s);
    expect(j.map((w) => [w.label, w.accepted])).toEqual([["a1", true], ["b1", true], ["a2", false], ["b2", true]]);
    expect(j.find((w) => w.label === "a2")?.reason).toBe("epoch 1 < 2");
    expect(sb.verdict(s, 5).text).toBe("Old leader's write is refused");
  });

  it("with fencing and no old write sent first, only the new leader's writes are stored", () => {
    let s = cut(true);
    s = sb.addWrite(s, "B", 3);
    s = sb.addWrite(s, "A", 3.5);
    expect(sb.history(s).map((w) => w.label)).toEqual(["b1"]);
    const healed: sb.State = { ...s, net: { phase: "healed", cutAt: 0, healAt: 6 } };
    expect(sb.verdict(healed, 7).text).toBe("Only the new leader's writes remain");
  });

  it("after the heal without fencing one history is thrown away", () => {
    let s = cut(false);
    s = sb.addWrite(s, "A", 0.5);
    s = sb.addWrite(s, "B", 3);
    const healed: sb.State = { ...s, net: { phase: "healed", cutAt: 0, healAt: 6 } };
    expect(sb.verdict(healed, 7).text).toBe("One history must be thrown away");
    expect(sb.thrownAway(healed).map((w) => w.label)).toEqual(["a1"]);
    expect(sb.canWrite(healed, "A", 7)).toBe(false);
    expect(sb.roles(healed.net, 7).A).toEqual({ role: "follower", epoch: 2, stale: false });
  });

  it("caps writes per leader, and keeps every verdict within 38 characters", () => {
    let s = cut(false);
    for (let i = 0; i < 5; i++) s = sb.canWrite(s, "A", 1) ? sb.addWrite(s, "A", 1 + i * 0.01) : s;
    expect(s.writes.filter((w) => w.node === "A")).toHaveLength(sb.MAX_PER_LEADER);
    const healedAfter = (state: sb.State): sb.State => ({ ...state, net: { phase: "healed", cutAt: 0, healAt: 6 } });
    const states = [sb.initial(false), cut(false), cut(true), healedAfter(cut(false)), healedAfter(cut(true)), healedAfter(sb.addWrite(sb.addWrite(cut(true), "B", 3), "A", 4)), healedAfter(sb.addWrite(sb.addWrite(cut(true), "A", 1), "B", 4)), healedAfter(sb.addWrite(sb.addWrite(cut(false), "A", 1), "B", 4))];
    for (const st of states) for (const t of [0, 1, 3, 7]) expect(sb.verdict(st, t).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(sb.verdict(healedAfter(cut(true)), 7).text).toBe("Healed: no writes clashed");
    expect(sb.verdict(healedAfter(sb.addWrite(sb.addWrite(sb.addWrite(cut(true), "A", 1), "B", 3), "A", 4)), 7).text).toBe("Old writes kept; later ones refused");
    expect(sb.verdict(healedAfter(sb.addWrite(sb.addWrite(cut(true), "A", 1), "B", 4)), 7).text).toBe("Healed: no writes clashed");
  });
});

describe("8.6 two regions edit one document", () => {
  it("flags a conflict only when the edits are closer than the copy time", () => {
    for (const [b, conflict] of [[12, true], [-40, true], [79, true], [-79, true], [80, false], [-80, false], [150, false], [-150, false], [0, true]] as const) {
      expect(tr.twoRegions(b, "none").conflict).toBe(conflict);
    }
  });

  it("matches the worked values with last writer wins", () => {
    expect(tr.twoRegions(12, "lww")).toMatchObject({ conflict: true, kept: "SG", dropped: "EU" });
    expect(tr.twoRegions(-40, "lww")).toMatchObject({ conflict: true, kept: "EU", dropped: "SG" });
    expect(tr.twoRegions(0, "lww")).toMatchObject({ kept: "EU", dropped: "SG" });
    expect(tr.twoRegions(80, "lww")).toMatchObject({ conflict: false, kept: null, dropped: null });
    expect(tr.twoRegions(12, "none")).toMatchObject({ kept: null, dropped: null });
  });

  it("lands each copy 80 ms after its edit", () => {
    const o = tr.twoRegions(30, "none");
    expect(o.euCopyLandsAt).toBe(80);
    expect(o.sgCopyLandsAt).toBe(110);
  });

  it("walks the rail in 5 ms steps from -150 to +150 and keeps the 12 ms default", () => {
    expect(tr.B_LADDER[0]).toBe(-150);
    expect(tr.B_LADDER[tr.B_LADDER.length - 1]).toBe(150);
    expect(tr.B_LADDER).toHaveLength(61);
    expect(tr.bFromFraction(0)).toBe(-150);
    expect(tr.bFromFraction(1)).toBe(150);
    expect(tr.bFromFraction(0.5)).toBe(0);
    expect(tr.bToFraction(0)).toBe(0.5);
    expect(tr.twoRegions(tr.B_DEFAULT, "none").b).toBe(12);
    for (const s of tr.SNAPS) expect(tr.B_LADDER).toContain(s);
    expect(tr.clampB(Number.NaN)).toBe(tr.B_DEFAULT);
  });

  it("words each verdict as the spec does, in 38 characters or fewer", () => {
    expect(tr.editVerdict(tr.twoRegions(12, "none"), "none").text).toBe("Concurrent: neither saw the other");
    expect(tr.editVerdict(tr.twoRegions(100, "none"), "none").text).toBe("Second edit saw the first: no clash");
    expect(tr.editVerdict(tr.twoRegions(12, "lww"), "lww").text).toBe("Later edit kept; the other is lost");
    for (const b of tr.B_LADDER) for (const rule of ["none", "lww"] as const) expect(tr.editVerdict(tr.twoRegions(b, rule), rule).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(tr.signedMs(12)).toBe("+12 ms");
    expect(tr.signedMs(-40)).toBe("-40 ms");
    expect(tr.signedMs(0)).toBe("0 ms");
  });

  it("puts the cursor at the axis end under reduced motion", () => {
    expect(tr.cursorT(1e6)).toBe(tr.AXIS.to);
    expect(tr.cursorT(0)).toBe(tr.AXIS.from);
  });
});

describe("8.7 write to three of five, read from two", () => {
  const confirmed = (write: number[]): qn.State => qn.confirm(write.reduce((s, i) => qn.tap(s, i, "pick"), qn.INITIAL));
  const read = (s: qn.State, nodes: number[]) => nodes.reduce((st, i) => qn.tap(st, i, "pick"), s);

  it("lets W = 3 and R = 2 miss when the read hits the two nodes without the write", () => {
    const s = read(confirmed([0, 1, 2]), [3, 4]);
    expect(qn.readResult(s)).toEqual({ kind: "missed", value: 6 });
    expect(qn.verdict(s).text).toBe("Read missed the newest write");
    expect(qn.header(s).line).toBe("W = 3, R = 2, R + W = 5 (not more than 5)");
    expect(qn.header(s).verdict?.text).toBe("A read can miss: R + W is not over 5");
  });

  it("finds the newest value when any read node has the write", () => {
    const s = read(confirmed([0, 1, 2]), [2, 4]);
    expect(qn.readResult(s)).toEqual({ kind: "found", value: 7 });
    expect(qn.overlap(s)).toEqual([2]);
    expect(qn.verdict(s).text).toBe("Read found the newest write");
  });

  it("always finds the write when R + W is more than 5 (every write set and read set)", () => {
    const subsets = Array.from({ length: 31 }, (_, m) => m + 1).map((m) => [0, 1, 2, 3, 4].filter((i) => m & (1 << i)));
    for (const w of subsets) for (const r of subsets) {
      const result = qn.readResult(read(confirmed(w), r));
      expect(result.kind === "found").toBe(r.some((i) => w.includes(i)));
      if (qn.guaranteed(w.length, r.length)) expect(result.kind).toBe("found");
    }
    expect(qn.header(read(confirmed([0, 1, 2]), [2, 3, 4])).verdict?.text).toBe("Overlap guaranteed: R + W is over 5");
    for (const [w, r] of [[3, 3], [4, 2], [5, 1], [1, 5]]) expect(qn.guaranteed(w, r)).toBe(true);
    expect(qn.guaranteed(3, 2)).toBe(false);
  });

  it("can miss for every W and R that add up to 5 or less", () => {
    for (let w = 1; w <= 5; w++) for (let r = 1; r + w <= 5; r++) {
      const s = confirmed(Array.from({ length: w }, (_, i) => i));
      const miss = qn.worstReadSet(s, r);
      expect(miss).toHaveLength(r);
      expect(qn.readResult(read(s, miss)).kind).toBe("missed");
    }
  });

  it("stalls a write or a read that includes a node that is down", () => {
    let s = qn.tap(qn.tap(qn.INITIAL, 3, "down"), 4, "down");
    expect(s.down).toEqual([3, 4]);
    for (const i of [0, 1, 3, 4]) s = qn.tap(s, i, "pick");
    expect(qn.writeStalled(s)).toBe(true);
    expect(qn.canConfirm(s)).toBe(false);
    expect(qn.confirm(s).phase).toBe("write");
    expect(qn.verdict(s).text).toBe("Not enough nodes up to confirm");
    // Drop the down nodes from the write set: now it confirms, then a read that includes a down node stalls.
    s = qn.tap(qn.tap(s, 3, "pick"), 4, "pick");
    const c = qn.confirm(s);
    expect(c.phase).toBe("read");
    expect(qn.readResult(read(c, [4])).kind).toBe("stalled");
    expect(qn.verdict(read(c, [4])).text).toBe("Not enough nodes up to confirm");
  });

  it("Auto-miss confirms, then picks the worst read nodes for the current R", () => {
    const start = [0, 1, 2].reduce((s, i) => qn.tap(s, i, "pick"), qn.INITIAL);
    const m = qn.autoMiss(start);
    expect(m.phase).toBe("read");
    expect(m.readSet).toEqual([3, 4]);
    expect(qn.readResult(m).kind).toBe("missed");
    // With W = 4 and R = 2 the read cannot miss, even from the worst nodes.
    const wide = qn.autoMiss([0, 1, 2, 3].reduce((s, i) => qn.tap(s, i, "pick"), qn.INITIAL));
    expect(wide.readSet).toHaveLength(2);
    expect(qn.readResult(wide).kind).toBe("found");
    // Nothing picked: nothing to do.
    expect(qn.autoMiss(qn.INITIAL)).toEqual(qn.INITIAL);
  });

  it("starts from five copies at x = 6, version 1, and says each verdict in 38 characters or fewer", () => {
    for (let i = 0; i < qn.N; i++) expect([qn.value(qn.INITIAL, i), qn.version(qn.INITIAL, i)]).toEqual([6, 1]);
    expect(qn.verdict(qn.INITIAL).text).toBe("Pick the nodes that get the write");
    const picked = qn.tap(qn.INITIAL, 0, "pick");
    expect(qn.verdict(picked).text).toBe("Tap Confirm write");
    expect(qn.verdict(qn.confirm(picked)).text).toBe("Now pick the nodes to read from");
    expect(qn.header(qn.INITIAL).line).toBe("W = 0, R = 0");
    const texts = [
      qn.verdict(qn.INITIAL), qn.verdict(picked), qn.verdict(qn.confirm(picked)),
      qn.header(read(confirmed([0, 1, 2]), [2, 3, 4])).verdict, qn.header(read(confirmed([0, 1, 2]), [3, 4])).verdict,
    ];
    for (const t of texts) expect(t?.text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });
});

describe("the five server-rendered pictures", () => {
  const specs = [sysdesignM8LeaderFollowers, sysdesignM8ConfirmCount, sysdesignM8SplitBrain, sysdesignM8TwoRegionsEdit, sysdesignM8QuorumNodes];
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
    const root = path.resolve(__dirname, "../../../../packages/learning-ui/src/canvas");
    const files = fs
      .readdirSync(root)
      .filter((d) => /^sysdesign-m8-(leader-followers|confirm-count|split-brain|two-regions-edit|quorum-nodes)$/.test(d))
      .flatMap((d) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".md")).map((f) => path.join(root, d, f)));
    expect(files.length).toBeGreaterThanOrEqual(20);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      if (!f.endsWith(".md")) {
        expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}(?![\w-])/);
        expect(src, f).not.toMatch(/foreignObject|<animate|<use[ >]|<image[ >]/);
      }
      expect(src, f).not.toContain(DASH);
    }
  });
});
