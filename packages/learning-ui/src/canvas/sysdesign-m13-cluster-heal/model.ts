import type { Tone } from "../primitives/tones";

// 13.3 beat 3: one key `x` on five nodes, N = 3, W = 2, R = 2. Ring order for
// the key is N1 to N5: the usual nodes are N1, N2, N3 and the stand-ins are
// N4, N5, in that order. Time moves in whole ticks (1 second of the
// animation). A write needs one tick to reach a node and one more for the ack.
// Hints are checked every even tick. Pure, no React; every function returns a
// new Sim.

export const NODE_COUNT = 5;
export const USUAL = [0, 1, 2] as const;
export const STAND_INS = [3, 4] as const;
export const NEED = 2;
export const START_VALUE = 6;
/** Ticks a Wait lasts: enough for one hint check on an even tick and the hand-over one tick later. */
export const WAIT_TICKS = 3;

export type Mode = "strict" | "sloppy";

export const nodeName = (n: number): string => `N${n + 1}`;

export type Hint = { holder: number; owner: number; value: number };

export type Msg = {
  id: number;
  kind: "store" | "ack" | "handover";
  from: number;
  to: number;
  sentAt: number;
  due: number;
  value: number;
  writeId: number;
  /** For a store sent to a stand-in: the usual node it stands in for. */
  hintFor: number | null;
};

export type WriteRec = {
  id: number;
  value: number;
  coordinator: number;
  /** Where each copy was sent: the node and, for a stand-in, the owner it covers. */
  targets: { node: number; hintFor: number | null }[];
  acked: number[];
  outcome: "pending" | "confirmed" | "refused";
};

export type Answer = { node: number; value: number; counted: boolean };

export type Verdict = { text: string; tone: Tone };

export type Sim = {
  tick: number;
  mode: Mode;
  hintsOn: boolean;
  up: boolean[];
  /** The value of x each node holds as its own. */
  x: number[];
  hints: Hint[];
  msgs: Msg[];
  writes: WriteRec[];
  nextValue: number;
  /** The newest value a confirmed write has put in place. */
  committed: number;
  nextId: number;
  /** The answers of the last Read, until something changes. */
  answers: Answer[];
  /** The latest result in words, for the banner. */
  verdict: Verdict | null;
};

export function initial(mode: Mode = "sloppy", hintsOn = true): Sim {
  return {
    tick: 0,
    mode,
    hintsOn,
    up: Array<boolean>(NODE_COUNT).fill(true),
    x: Array<number>(NODE_COUNT).fill(START_VALUE),
    hints: [],
    msgs: [],
    writes: [],
    nextValue: START_VALUE + 1,
    committed: START_VALUE,
    nextId: 1,
    answers: [],
    verdict: null,
  };
}

/** Everything back to the start, keeping the two switches. */
export const reset = (s: Sim): Sim => initial(s.mode, s.hintsOn);

export const setMode = (s: Sim, mode: Mode): Sim => ({ ...s, mode });
export const setHints = (s: Sim, hintsOn: boolean): Sim => ({ ...s, hintsOn });

/** The first node in ring order that is up, or -1. */
export const coordinatorOf = (up: readonly boolean[]): number => up.findIndex(Boolean);

/** Take a node down or bring it back. A node that goes down loses the hints it held. */
export function toggle(s: Sim, n: number): Sim {
  const up = s.up.slice();
  up[n] = !up[n];
  return { ...s, up, hints: up[n] ? s.hints : s.hints.filter((h) => h.holder !== n), answers: [] };
}

/** Where a write goes: the usual nodes that are up, plus (sloppy) a stand-in for each one that is down. */
export function targetsFor(up: readonly boolean[], mode: Mode): { node: number; hintFor: number | null }[] {
  const out: { node: number; hintFor: number | null }[] = [];
  const spare = STAND_INS.filter((n) => up[n]);
  let used = 0;
  for (const owner of USUAL) {
    if (up[owner]) out.push({ node: owner, hintFor: null });
    else if (mode === "sloppy" && used < spare.length) out.push({ node: spare[used++], hintFor: owner });
  }
  return out;
}

const standInNames = (nodes: readonly number[]): string => nodes.map(nodeName).join(" and ");

function writeVerdict(w: WriteRec): Verdict {
  if (w.outcome === "refused") return { text: `Write refused: ${w.acked.length} of ${NEED} acks`, tone: "bad" };
  const hinted = w.targets.filter((t) => t.hintFor !== null && w.acked.includes(t.node)).map((t) => t.node);
  if (hinted.length > 0 && hinted.length === w.acked.length) return { text: `Write saved on ${standInNames(hinted)} (hints)`, tone: "warn" };
  if (hinted.length > 0) return { text: `Write confirmed: ${w.acked.length} acks, ${hinted.length > 1 ? "hints" : "hint"} ${hinted.map(nodeName).join(", ")}`, tone: "warn" };
  return { text: `Write confirmed: ${w.acked.length} acks`, tone: "good" };
}

/** Decide a write once it has enough acks, or once nothing of it is still on the way. */
function settle(s: Sim, w: WriteRec): WriteRec {
  if (w.outcome !== "pending") return w;
  const open = s.msgs.some((m) => m.writeId === w.id);
  if (w.acked.length >= NEED) return { ...w, outcome: "confirmed" };
  if (!open) return { ...w, outcome: "refused" };
  return w;
}

/** Tap Write: x becomes the next number. */
export function write(s: Sim): Sim {
  const coordinator = coordinatorOf(s.up);
  const id = s.nextId;
  const value = s.nextValue;
  const rec: WriteRec = { id, value, coordinator, targets: coordinator === -1 ? [] : targetsFor(s.up, s.mode), acked: [], outcome: "pending" };
  let nextId = id + 1;
  const msgs = rec.targets.map<Msg>((t) => ({ id: nextId++, kind: "store", from: coordinator, to: t.node, sentAt: s.tick, due: s.tick + 1, value, writeId: id, hintFor: t.hintFor }));
  const base: Sim = { ...s, msgs: [...s.msgs, ...msgs], nextValue: value + 1, nextId, answers: [] };
  const settled = settle(base, rec);
  return { ...base, writes: [...s.writes, settled], verdict: settled.outcome === "pending" ? s.verdict : writeVerdict(settled) };
}

/** Tap Read: the coordinator asks the usual three and returns the newest of the first two answers. */
export function read(s: Sim): Sim {
  const live = USUAL.filter((n) => s.up[n]);
  if (live.length < NEED || coordinatorOf(s.up) === -1) {
    return { ...s, answers: live.map((n) => ({ node: n, value: s.x[n], counted: false })), verdict: { text: "Read refused: fewer than 2 nodes", tone: "bad" } };
  }
  const answers = live.map<Answer>((n, i) => ({ node: n, value: s.x[n], counted: i < NEED }));
  const value = Math.max(...answers.filter((a) => a.counted).map((a) => a.value));
  const verdict: Verdict =
    s.committed === START_VALUE && value === START_VALUE
      ? { text: `Read returned x = ${value}`, tone: "good" }
      : value >= s.committed
        ? { text: `Read returned new x = ${value}`, tone: "good" }
        : { text: `Read returned old x = ${value}`, tone: "warn" };
  return { ...s, answers, verdict };
}

/** One tick of time: messages arrive, and on an even tick the stand-ins offer their hints. */
export function tick(s: Sim): Sim {
  const now = s.tick + 1;
  const x = s.x.slice();
  let hints = s.hints.slice();
  let nextId = s.nextId;
  const sent: Msg[] = [];
  const due = s.msgs.filter((m) => m.due <= now).sort((a, b) => a.id - b.id);
  const rest = s.msgs.filter((m) => m.due > now);
  const acks = new Map<number, number[]>();
  for (const m of due) {
    if (m.kind === "store") {
      if (!s.up[m.to]) continue;
      if (m.hintFor === null) x[m.to] = Math.max(x[m.to], m.value);
      else hints = [...hints.filter((h) => !(h.holder === m.to && h.owner === m.hintFor && h.value <= m.value)), { holder: m.to, owner: m.hintFor, value: m.value }];
      sent.push({ id: nextId++, kind: "ack", from: m.to, to: m.from, sentAt: now, due: now + 1, value: m.value, writeId: m.writeId, hintFor: null });
    } else if (m.kind === "ack") {
      acks.set(m.writeId, [...(acks.get(m.writeId) ?? []), m.from]);
    } else if (s.up[m.to]) {
      x[m.to] = Math.max(x[m.to], m.value);
    }
  }
  if (s.hintsOn && now % 2 === 0) {
    const keep: Hint[] = [];
    for (const h of hints) {
      if (s.up[h.holder] && s.up[h.owner]) {
        sent.push({ id: nextId++, kind: "handover", from: h.holder, to: h.owner, sentAt: now, due: now + 1, value: h.value, writeId: 0, hintFor: null });
      } else keep.push(h);
    }
    hints = keep;
  }
  let next: Sim = { ...s, tick: now, x, hints, msgs: [...rest, ...sent], nextId, answers: [] };
  let verdict = s.verdict;
  let committed = s.committed;
  const writes = s.writes.map((w) => {
    const got = acks.get(w.id);
    const grown: WriteRec = got ? { ...w, acked: [...w.acked, ...got] } : w;
    const settled = settle(next, grown);
    if (w.outcome === "pending" && settled.outcome !== "pending") {
      verdict = writeVerdict(settled);
      if (settled.outcome === "confirmed") committed = Math.max(committed, settled.value);
    }
    return settled;
  });
  next = { ...next, writes, verdict, committed };
  return next;
}

/** Whether time still has something to do: a message on the way. */
export const busy = (s: Sim): boolean => s.msgs.length > 0;

/** Run n ticks, then on until nothing is on the way. */
export function advance(s: Sim, n: number): Sim {
  let cur = s;
  for (let i = 0; i < n; i++) cur = tick(cur);
  for (let guard = 0; busy(cur) && guard < 20; guard++) cur = tick(cur);
  return cur;
}

/** Where a node sits in the committed picture: does it hold the newest confirmed value? */
export const isStale = (s: Sim, n: number): boolean => s.x[n] < s.committed;

export function describeNode(s: Sim, n: number): string {
  return `${nodeName(n)}, ${s.up[n] ? "up" : "down"}`;
}

export function describeState(s: Sim): string {
  const parts = Array.from({ length: NODE_COUNT }, (_, n) => `${nodeName(n)} ${s.up[n] ? "up" : "down"}, x = ${s.x[n]}`);
  const hints = s.hints.map((h) => `${nodeName(h.holder)} holds a hint for ${nodeName(h.owner)}: ${h.value}`);
  return [`Tick ${s.tick}.`, ...parts, ...hints].join(". ");
}
