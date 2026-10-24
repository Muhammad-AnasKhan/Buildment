import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ACCEPTORS,
  DUEL_REFUSALS,
  MAX_ACTIONS,
  PROPOSERS,
  SCRIPT,
  WANTS,
  accept,
  acceptorText,
  canAccept,
  describeStep,
  guide,
  holders,
  nextNumber,
  prepare,
  promiseCount,
  proposalValue,
  scriptProgress,
  startPaxos,
  stateKey,
  stepVerdict,
  valueNote,
  type AcceptorId,
  type PaxosState,
  type ProposerId,
  type Step,
} from "@buildment/learning-ui/canvas/models/paxos-play";
import {
  INTERVAL_LADDER,
  NAMES,
  OFFSETS,
  TTL_LADDER,
  addEvent,
  averageStale,
  defaultVerdict,
  ladderFromFraction,
  ladderToFraction,
  lostBeatsSurvived,
  registryAt,
  staleWindow,
  worstStale,
  type Config,
  type RegEvent,
} from "@buildment/learning-ui/canvas/models/registry-lease";
import { sysdesignM12PaxosPlay } from "@buildment/learning-ui/canvas/sysdesign-m12-paxos-play/data";
import { sysdesignM12RegistryPlay } from "@buildment/learning-ui/canvas/sysdesign-m12-registry-play/data";

const DASH = String.fromCharCode(0x2014);
const ALL: AcceptorId[] = [...ACCEPTORS];

function run(...steps: [ProposerId, "prepare" | "accept", AcceptorId[]][]): { state: PaxosState; steps: Step[] } {
  let state = startPaxos();
  const out: Step[] = [];
  for (const [who, kind, to] of steps) {
    const step = kind === "prepare" ? prepare(state, who, to) : accept(state, who, to);
    if (!step) throw new Error(`${who} ${kind} was refused by the model`);
    out.push(step);
    state = step.state;
  }
  return { state, steps: out };
}

describe("Paxos play: the scripted run", () => {
  it("P1 Prepare(1) to all gives three promises with nothing accepted", () => {
    const { steps } = run(["P1", "prepare", ALL]);
    expect(steps[0].n).toBe(1);
    expect(steps[0].replies.map((r) => r.ok)).toEqual([true, true, true]);
    expect(steps[0].replies.every((r) => r.report === null)).toBe(true);
    expect(stepVerdict(steps[0])).toEqual({ text: "Majority promised: now send Accept", tone: "accent" });
  });

  it("P1 Accept(1, A) to A1 and A2 chooses A with 2 of 3", () => {
    const { state, steps } = run(["P1", "prepare", ALL], ["P1", "accept", ["A1", "A2"]]);
    expect(steps[1].value).toBe("A");
    expect(state.acceptors.A1.accepted).toEqual({ n: 1, v: "A" });
    expect(state.acceptors.A2.accepted).toEqual({ n: 1, v: "A" });
    expect(state.acceptors.A3.accepted).toBeNull();
    expect(state.chosen).toEqual(["A"]);
    expect(steps[1].newlyChosen).toBe("A");
    expect(stepVerdict(steps[1])).toEqual({ text: "A is chosen: 2 of 3 accepted it", tone: "good" });
  });

  it("P2 Prepare(2) to A2 and A3: A2 reports (1, A), A3 reports nothing, and the value is locked to A", () => {
    const { state, steps } = run(["P1", "prepare", ALL], ["P1", "accept", ["A1", "A2"]], ["P2", "prepare", ["A2", "A3"]]);
    const p2 = steps[2];
    expect(p2.n).toBe(2);
    expect(p2.replies).toEqual([
      { to: "A2", ok: true, promised: 2, report: { n: 1, v: "A" } },
      { to: "A3", ok: true, promised: 2, report: null },
    ]);
    expect(promiseCount(state, "P2")).toBe(2);
    const forced = proposalValue(state, "P2");
    expect(forced).toEqual({ value: "A", locked: true, from: "A2", report: { n: 1, v: "A" } });
    expect(stepVerdict(p2)).toEqual({ text: "P2 must propose A, not B", tone: "warn" });
    expect(valueNote(state, "P2")).toBe("A2 reported (1, A): P2 must propose A");
  });

  it("P2 Accept(2, A) to A2 and A3 leaves all three acceptors holding A and one chosen value", () => {
    const { state, steps } = run(["P1", "prepare", ALL], ["P1", "accept", ["A1", "A2"]], ["P2", "prepare", ["A2", "A3"]], ["P2", "accept", ["A2", "A3"]]);
    expect(steps[3].value).toBe("A");
    expect(ACCEPTORS.map((id) => state.acceptors[id].accepted?.v)).toEqual(["A", "A", "A"]);
    expect(state.acceptors.A2.accepted).toEqual({ n: 2, v: "A" });
    expect(state.chosen).toEqual(["A"]);
    expect(stepVerdict(steps[3])).toEqual({ text: "Still one value: A", tone: "good" });
    expect(holders(state, "A")).toBe(2);
  });

  it("the guide follows the script and ends with the duel hint", () => {
    expect(guide(startPaxos()).step).toBe(0);
    const plan: [ProposerId, "prepare" | "accept", AcceptorId[]][] = SCRIPT.map((s) => [s.who, s.kind, [...s.to]]);
    for (let i = 0; i <= plan.length; i++) {
      const { state } = run(...plan.slice(0, i));
      expect(scriptProgress(state.actions)).toBe(i);
      expect(guide(state).step).toBe(i < SCRIPT.length ? i : null);
      expect(guide(state).text.length).toBeGreaterThan(10);
    }
    const off = run(["P2", "prepare", ALL]).state;
    expect(scriptProgress(off.actions)).toBe(0);
    expect(guide(off).step).toBeNull();
  });
});

describe("Paxos play: any majority forces the chosen value", () => {
  it("whichever two acceptors P2 reaches, it must propose A", () => {
    for (const pair of [["A1", "A2"], ["A1", "A3"], ["A2", "A3"]] as AcceptorId[][]) {
      const first = run(["P1", "prepare", ALL], ["P1", "accept", ["A1", "A2"]]).state;
      const step = prepare(first, "P2", pair) as Step;
      const forced = proposalValue(step.state, "P2");
      expect(forced?.value).toBe("A");
    }
  });

  it("P2 reaching only A3 holds 1 promise: Accept stays disabled with a wait note", () => {
    const first = run(["P1", "prepare", ALL], ["P1", "accept", ["A1", "A2"]]).state;
    const step = prepare(first, "P2", ["A3"]) as Step;
    expect(promiseCount(step.state, "P2")).toBe(1);
    expect(proposalValue(step.state, "P2")).toBeNull();
    expect(canAccept(step.state, "P2", ALL)).toBe(false);
    expect(accept(step.state, "P2", ALL)).toBeNull();
    expect(stepVerdict(step)).toEqual({ text: "No majority: P2 must wait", tone: "warn" });
    expect(valueNote(step.state, "P2")).toBe("1 promise: wait for a majority");
  });

  it("a proposer with no accepted value in its promises keeps its own value", () => {
    const { state } = run(["P2", "prepare", ALL]);
    expect(proposalValue(state, "P2")).toEqual({ value: "B", locked: false });
    expect(valueNote(state, "P2")).toBe("Nothing reported: P2 may propose B");
  });

  it("takes the highest numbered report, not the first", () => {
    // A1 accepted (1, A) from P1; P2 then gets A1's report, P1 gets a higher accept in at A2 and A3 with another value.
    let s = run(["P1", "prepare", ALL], ["P1", "accept", ["A1"]]).state;
    s = (prepare(s, "P2", ALL) as Step).state;
    expect(proposalValue(s, "P2")?.report).toEqual({ n: 1, v: "A" });
    s = (accept(s, "P2", ["A2", "A3"]) as Step).state;
    // A2 and A3 hold (2, A); a later P1 round hears (2, A) from A2 and (1, A) from A1: it picks number 2.
    s = (prepare(s, "P1", ALL) as Step).state;
    expect(proposalValue(s, "P1")).toMatchObject({ value: "A", locked: true, report: { n: 2, v: "A" } });
  });

  it("never lets two different values be chosen, in any order of up to five steps and any choice of acceptors", () => {
    const subsets: AcceptorId[][] = [];
    for (let mask = 1; mask < 8; mask++) subsets.push(ALL.filter((_, i) => mask & (1 << i)));
    // Best depth already searched from each state: a state reached again with no more steps left to try is skipped.
    const seen = new Map<string, number>();
    let states = 0;
    let sawChosen = false;
    const dfs = (s: PaxosState, depth: number) => {
      const key = stateKey(s);
      if ((seen.get(key) ?? 99) <= depth) return;
      seen.set(key, depth);
      states++;
      expect(s.chosen.length).toBeLessThanOrEqual(1);
      if (s.chosen.length === 1) sawChosen = true;
      if (depth === 5) return;
      for (const who of PROPOSERS) {
        for (const to of subsets) {
          const p = prepare(s, who, to);
          if (p) dfs(p.state, depth + 1);
          const a = accept(s, who, to);
          if (a) {
            expect(["A", "B"]).toContain(a.value);
            dfs(a.state, depth + 1);
          }
        }
      }
    };
    dfs(startPaxos(), 0);
    expect(states).toBeGreaterThan(500);
    expect(sawChosen).toBe(true);
  }, 60000);
});

describe("Paxos play: the duel", () => {
  it("both Prepare, then P1 Accept(1, A) is refused by all three with promised 2", () => {
    const { state, steps } = run(["P1", "prepare", ALL], ["P2", "prepare", ALL], ["P1", "accept", ALL]);
    expect(steps[2].replies.every((r) => !r.ok && r.promised === 2)).toBe(true);
    expect(stepVerdict(steps[2])).toEqual({ text: "Refused: promised 2", tone: "bad" });
    expect(state.chosen).toEqual([]);
    expect(state.refused).toBe(1);
    expect(ACCEPTORS.every((id) => state.acceptors[id].accepted === null)).toBe(true);
  });

  it("P1 Prepare(3) then P2 Accept(2, B) is refused with promised 3, and the duel hint shows after two refusals", () => {
    const { state, steps } = run(["P1", "prepare", ALL], ["P2", "prepare", ALL], ["P1", "accept", ALL], ["P1", "prepare", ALL], ["P2", "accept", ALL]);
    expect(steps[3].n).toBe(3);
    expect(steps[4].value).toBe("B");
    expect(stepVerdict(steps[4])).toEqual({ text: "Refused: promised 3", tone: "bad" });
    expect(state.refused).toBeGreaterThanOrEqual(DUEL_REFUSALS);
    expect(state.chosen).toEqual([]);
    expect(guide(state).text).toContain("Reset");
  });

  it("each proposer has three numbers and then cannot prepare", () => {
    let s = startPaxos();
    for (const expected of [1, 3, 5]) {
      expect(nextNumber(s, "P1")).toBe(expected);
      s = (prepare(s, "P1", ALL) as Step).state;
    }
    expect(nextNumber(s, "P1")).toBeNull();
    expect(prepare(s, "P1", ALL)).toBeNull();
    expect(nextNumber(startPaxos(), "P2")).toBe(2);
    expect(WANTS).toEqual({ P1: "A", P2: "B" });
  });

  it("stops after the action cap", () => {
    let s = startPaxos();
    s = (prepare(s, "P1", ALL) as Step).state;
    for (let i = 1; i < MAX_ACTIONS; i++) s = (accept(s, "P1", ALL) as Step).state;
    expect(s.actions.length).toBe(MAX_ACTIONS);
    expect(accept(s, "P1", ALL)).toBeNull();
  });

  it("keeps every verdict, note, step line and acceptor text short, plain and free of em dashes", () => {
    const check = (s: PaxosState, step: Step | null) => {
      const v = stepVerdict(step);
      expect(v.text.length).toBeLessThanOrEqual(38);
      expect(v.text).not.toContain(DASH);
      for (const who of PROPOSERS) expect(valueNote(s, who)).not.toContain(DASH);
      for (const id of ACCEPTORS) expect(acceptorText(s, id)).not.toContain(DASH);
      if (step) expect(describeStep(step)).not.toContain(DASH);
      expect(guide(s).text).not.toContain(DASH);
    };
    const subsets: AcceptorId[][] = [["A1", "A2", "A3"], ["A1"], ["A2", "A3"]];
    const dfs = (s: PaxosState, depth: number) => {
      if (depth === 4) return;
      for (const who of PROPOSERS)
        for (const to of subsets) {
          for (const step of [prepare(s, who, to), accept(s, who, to)]) {
            if (!step) continue;
            check(step.state, step);
            dfs(step.state, depth + 1);
          }
        }
    };
    check(startPaxos(), null);
    dfs(startPaxos(), 0);
    for (const s of SCRIPT) expect(s.text).not.toContain(DASH);
  }, 60000);
});

// ---------------------------------------------------------------- registry

const cfg = (ttl: number, interval: number): Config => ({ ttl, interval });
const crash = (inst: 0 | 1 | 2, at: number): RegEvent => ({ kind: "crash", inst, at });
const lose = (inst: 0 | 1 | 2, at: number): RegEvent => ({ kind: "lose", inst, at });

describe("Registry play: the table in the spec", () => {
  const rows: [number, number, number, number, number][] = [
    [10, 3, 10, 8.5, 2],
    [10, 1, 10, 9.5, 8],
    [8, 5, 8, 5.5, 0],
    [15, 5, 15, 12.5, 1],
    [30, 3, 30, 28.5, 8],
    [4, 3, 4, 2.5, 0],
  ];
  for (const [ttl, interval, worst, average, survived] of rows) {
    it(`TTL ${ttl} s, beat every ${interval} s: worst ${worst} s, average ${average} s, survives ${survived}`, () => {
      expect(worstStale(ttl)).toBe(worst);
      expect(averageStale(ttl, interval)).toBe(average);
      expect(lostBeatsSurvived(ttl, interval)).toBe(survived);
      // The stale window measured on the model: crash at every hundredth of a second between two beats.
      const c = cfg(ttl, interval);
      let min = Infinity;
      let max = 0;
      let sum = 0;
      let n = 0;
      const from = 3 * interval;
      for (let k = 0; k < interval * 100; k++) {
        const at = from + k / 100;
        const { stale } = staleWindow(c, at);
        min = Math.min(min, stale);
        max = Math.max(max, stale);
        sum += stale;
        n++;
      }
      expect(max).toBeCloseTo(worst, 6);
      expect(min).toBeGreaterThanOrEqual(ttl - interval);
      expect(sum / n).toBeCloseTo(average + 0.005, 2);
      // The same through the full model: the key of a crashed instance ends exactly at expiry.
      const at = from;
      const view = registryAt(c, [crash(0, at)], at + ttl + 1);
      expect(view.instances[0].listed).toBe(false);
      expect(view.instances[0].goneAt).toBeCloseTo(at + worst, 6);
    });

    it(`TTL ${ttl} s, beat every ${interval} s: the model survives exactly ${survived} lost beats in a row`, () => {
      const c = cfg(ttl, interval);
      for (const lost of [survived, survived + 1]) {
        let events: RegEvent[] = [];
        for (let i = 0; i < lost; i++) events = addEvent(events, "lose", 0, 0.1);
        const view = registryAt(c, events, (lost + 2) * interval + ttl);
        const gone = view.watch.filter((w) => w.inst === 0 && w.kind === "gone");
        if (lost <= survived) expect(gone).toEqual([]);
        else expect(gone.length).toBeGreaterThanOrEqual(1);
      }
    });
  }
});

describe("Registry play: the worked example (lease 10 s, beat every 3 s)", () => {
  const c = cfg(10, 3);

  it("registers all three at the start and renews on each beat", () => {
    const view = registryAt(c, [], 0.5);
    expect(view.instances.every((v) => v.listed)).toBe(true);
    expect(view.instances[0].beats.filter((b) => b.state === "delivered").map((b) => b.time)).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30].filter((x) => x <= 30.5));
    expect(registryAt(c, [], 3).instances[0].expiry).toBe(13);
    expect(registryAt(c, [], 4).instances[1].expiry).toBe(14);
    expect(OFFSETS).toEqual([0, 1, 2]);
    expect(view.verdict).toEqual({ text: "Survives 2 lost beats in a row", tone: "good" });
  });

  it("crash at 4 right after the beat at 3: listed until 13, callers told 9 s later", () => {
    const events = [crash(0, 4)];
    const at4 = registryAt(c, events, 4);
    expect(at4.instances[0].stale).toEqual({ from: 4, to: 13 });
    expect(at4.verdict).toEqual({ text: "Dead one listed for 9 s more", tone: "warn" });
    expect(registryAt(c, events, 8.2).verdict.text).toBe("Dead one listed for 5 s more");
    const at12 = registryAt(c, events, 12.99);
    expect(at12.instances[0].listed).toBe(true);
    expect(at12.instances[0].beats.every((b) => b.time <= 4 || b.state !== "delivered")).toBe(true);
    const at13 = registryAt(c, events, 13);
    expect(at13.instances[0].listed).toBe(false);
    expect(at13.verdict).toEqual({ text: "Gone after 9 s; watcher told", tone: "good" });
    // The watcher hears 0.01 s after the key is deleted.
    expect(at13.watch.some((w) => w.kind === "gone")).toBe(false);
    const told = registryAt(c, events, 13.01);
    expect(told.watch.filter((w) => w.kind === "gone").map((w) => [NAMES[w.inst], w.time])).toEqual([["payments-1", 13]]);
  });

  it("losing the beats at 3 and 6 keeps i1: the beat at 9 arrives before the expiry at 10", () => {
    let events = addEvent([], "lose", 0, 1);
    events = addEvent(events, "lose", 0, 1);
    const view = registryAt(c, events, 9);
    expect(view.instances[0].listed).toBe(true);
    expect(view.instances[0].expiry).toBe(19);
    expect(view.verdict).toEqual({ text: "Survived 2 lost beats", tone: "good" });
    const lostTimes = view.instances[0].beats.filter((b) => b.state === "lost").map((b) => b.time);
    expect(lostTimes).toEqual([3, 6]);
  });

  it("losing 3, 6 and 9 lets the key expire at 10: a healthy instance is removed, then returns at its next beat", () => {
    let events: RegEvent[] = [];
    for (let i = 0; i < 3; i++) events = addEvent(events, "lose", 0, 1);
    const at10 = registryAt(c, events, 10);
    expect(at10.instances[0].listed).toBe(false);
    expect(at10.verdict).toEqual({ text: "Healthy one expired: lease too short", tone: "bad" });
    expect(at10.instances[0].goneAt).toBe(10);
    const back = registryAt(c, events, 12.5);
    expect(back.instances[0].listed).toBe(true);
    expect(back.watch.filter((w) => w.inst === 0).map((w) => w.kind)).toEqual(["added", "gone", "added"]);
  });

  it("a lost beat counts only beats after the press, and a crashed instance sends nothing more", () => {
    const events = [lose(1, 0.5), crash(1, 2)];
    const early = registryAt(c, events, 7);
    const beats = early.instances[1].beats;
    expect(beats.find((b) => b.time === 1)?.state).toBe("lost");
    expect(early.instances[1].crashedAt).toBe(2);
    expect(beats.filter((b) => b.state === "delivered").every((b) => b.time <= 2)).toBe(true);
    // The beat at 1 was lost, so the only renewal was at registration: the key ends at 10.
    expect(registryAt(c, events, 20).instances[1].goneAt).toBe(10);
  });

  it("ignores events in the future and a second crash of the same instance", () => {
    expect(registryAt(c, [crash(2, 9)], 5).instances[2].crashedAt).toBeNull();
    expect(addEvent([crash(0, 4)], "crash", 0, 8)).toEqual([crash(0, 4)]);
    expect(addEvent([], "crash", 1, 4.37)).toEqual([crash(1, 4.3)]);
  });

  it("is a pure function of its inputs", () => {
    const events = [lose(0, 1), crash(2, 5)];
    expect(registryAt(c, events, 17.5)).toEqual(registryAt(c, events, 17.5));
  });
});

describe("Registry play: rails and verdicts", () => {
  it("maps rails to snap values and back", () => {
    expect(TTL_LADDER).toEqual([4, 6, 8, 10, 15, 30]);
    expect(INTERVAL_LADDER).toEqual([1, 2, 3, 5]);
    for (const v of TTL_LADDER) expect(ladderFromFraction(TTL_LADDER, ladderToFraction(TTL_LADDER, v))).toBe(v);
    for (const v of INTERVAL_LADDER) expect(ladderFromFraction(INTERVAL_LADDER, ladderToFraction(INTERVAL_LADDER, v))).toBe(v);
    expect(ladderFromFraction(TTL_LADDER, -1)).toBe(4);
    expect(ladderFromFraction(TTL_LADDER, 2)).toBe(30);
    expect(ladderFromFraction(INTERVAL_LADDER, Number.NaN)).toBeDefined();
  });

  it("keeps every verdict within 38 characters and free of em dashes, for every lease, interval and event", () => {
    const seen = new Set<string>();
    for (const ttl of TTL_LADDER)
      for (const interval of INTERVAL_LADDER) {
        const c = cfg(ttl, interval);
        seen.add(defaultVerdict(c).text);
        const scripts: RegEvent[][] = [[], [crash(0, 4)], [crash(1, 0.3)], [lose(0, 1)], [lose(0, 1), lose(0, 1), lose(0, 1), lose(0, 1)], [lose(2, 0), crash(2, 5)]];
        for (const events of scripts)
          for (let t = 0; t <= 60; t += 0.7) {
            const v = registryAt(c, events, t).verdict;
            expect(v.text.length).toBeLessThanOrEqual(38);
            expect(v.text).not.toContain(DASH);
            seen.add(v.text);
          }
      }
    expect([...seen].some((t) => t.startsWith("Dead one listed"))).toBe(true);
    expect([...seen].some((t) => t.startsWith("Gone after"))).toBe(true);
    expect([...seen].some((t) => t.startsWith("Healthy one expired"))).toBe(true);
    expect([...seen].some((t) => t.startsWith("Survived"))).toBe(true);
  });

  it("never gives a beat view outside the strip window or NaN at the extremes", () => {
    for (const t of [0, 0.001, 29.99, 600]) {
      const view = registryAt(cfg(30, 1), [lose(0, 0)], t);
      for (const v of view.instances) {
        expect(Number.isFinite(v.expiry)).toBe(true);
        for (const b of v.beats) expect(Number.isFinite(b.time)).toBe(true);
      }
    }
  });
});

describe("the two server-rendered pictures", () => {
  const specs = [sysdesignM12PaxosPlay, sysdesignM12RegistryPlay];
  for (const spec of specs) {
    it(`renders ${spec.title} with its picture and its limits fold`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(html).not.toContain(DASH);
    });
  }

  it("shows the first banner, the three acceptors and the rails", () => {
    const paxos = renderToString(createElement(sysdesignM12PaxosPlay.component, { title: "t", purpose: "p", limits: "l" }));
    expect(paxos).toContain("Pick a proposer, then Prepare");
    expect(paxos).toContain("A1 gets it");
    expect(paxos).toContain("Prepare 1");
    expect(paxos).toContain("Accept needs promises from 2 of 3");
    const registry = renderToString(createElement(sysdesignM12RegistryPlay.component, { title: "t", purpose: "p", limits: "l" }));
    expect(registry).toContain("Survives 2 lost beats in a row");
    expect(registry).toContain("role=\"slider\"");
    expect(registry).toContain("Crash payments-2");
  });

  it("keeps the course wording free of em dashes and the drawing free of hex colours and banned SVG parts", () => {
    for (const spec of specs) expect(spec.title + spec.purpose + spec.limits).not.toContain(DASH);
    const root = path.resolve(__dirname, "../../../../packages/learning-ui/src/canvas");
    const files = [
      ...["sysdesign-m12-paxos-play", "sysdesign-m12-registry-play"].flatMap((d) =>
        fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".md")).map((f) => path.join(root, d, f))
      ),
      path.join(root, "primitives/svg-pill-button.tsx"),
      path.join(root, "models/paxos-play.ts"),
      path.join(root, "models/registry-lease.ts"),
    ];
    expect(files.length).toBeGreaterThanOrEqual(9);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}(?![\w-])/);
      expect(src, f).not.toMatch(/foreignObject|<animate|<use[ >]|<image[ >]/);
      expect(src, f).not.toContain(DASH);
    }
  });
});
