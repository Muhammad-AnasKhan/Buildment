// 10.5 beat 6: three nodes with skewed clocks. A message goes from one node to
// another in 10 ms of true time. In "wall" mode every event is stamped with its
// node's clock; in "hybrid" mode with a pair (l, c) that follows the rules of
// chapter 10.5 and the HybridClock of chapter 10.8.
// Pure model, no React.

export const NODE_IDS = ["A", "B", "C"] as const;
export type NodeId = (typeof NODE_IDS)[number];
export const NODE_INDEX: Record<NodeId, number> = { A: 0, B: 1, C: 2 };

/** Offsets of each clock from true time, in ms. */
export type Offsets = Record<NodeId, number>;
export const DEFAULT_OFFSETS: Offsets = { A: 0, B: -40, C: 25 };
export const OFFSET_MIN = -50;
export const OFFSET_MAX = 50;
/** Snap points for the offset rails, and the keyboard ladder. */
export const OFFSET_SNAPS = [-50, -25, -10, 0, 10, 25, 50] as const;
/** True time of the first event, and the gap between steps, in ms. */
export const START_TRUE_MS = 100;
export const STEP_MS = 10;
/** After this many actions the picture is full and the learner starts over. */
export const MAX_ACTIONS = 12;

export type Mode = "wall" | "hybrid";
export type Action = { kind: "local"; node: NodeId } | { kind: "send"; from: NodeId; to: NodeId };

/** The run the picture opens with: A sends to B. */
export const OPENING: readonly Action[] = [{ kind: "send", from: "A", to: "B" }];

export type Stamp = { l: number; c: number };

export type HlcEvent = {
  node: NodeId;
  kind: "local" | "send" | "receive";
  /** True time of the event, in ms. */
  trueMs: number;
  /** What the node's clock read. */
  clock: number;
  /** The hybrid stamp, as the rules give it. */
  hybrid: Stamp;
  /** How far l is ahead of the clock (0 if the clock is level or past). */
  ahead: number;
  /** The counter the node had before this event; used to see the clock catch up. */
  counterBefore: number;
  /** The other node, for a send or receive. */
  peer?: NodeId;
  /** Index of the event at the other end of the message. */
  link?: number;
};

export function clampOffset(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const v = Math.round(Math.max(OFFSET_MIN, Math.min(OFFSET_MAX, value)));
  const snap = OFFSET_SNAPS.find((s) => Math.abs(s - v) <= 2);
  return snap ?? v;
}

/** The hybrid rule for a local event or a send. */
export function hlcTick(state: Stamp, clock: number): Stamp {
  return clock > state.l ? { l: clock, c: 0 } : { l: state.l, c: state.c + 1 };
}

/** The hybrid rule for a receive: l is the biggest of own l, message l and clock; c counts from the inputs that tie. */
export function hlcReceive(state: Stamp, message: Stamp, clock: number): Stamp {
  const l = Math.max(state.l, message.l, clock);
  const tied: number[] = [];
  if (state.l === l) tied.push(state.c);
  if (message.l === l) tied.push(message.c);
  return { l, c: tied.length ? Math.max(...tied) + 1 : 0 };
}

/** Plays the actions in order and returns every event with its stamps. */
export function runEvents(offsets: Offsets, actions: readonly Action[]): HlcEvent[] {
  const state: Record<NodeId, Stamp> = { A: { l: 0, c: 0 }, B: { l: 0, c: 0 }, C: { l: 0, c: 0 } };
  const events: HlcEvent[] = [];
  let t = START_TRUE_MS;
  const push = (node: NodeId, kind: HlcEvent["kind"], at: number, next: (clock: number) => Stamp, peer?: NodeId, link?: number): HlcEvent => {
    const clock = at + offsets[node];
    const counterBefore = state[node].c;
    const stamp = next(clock);
    state[node] = stamp;
    const e: HlcEvent = { node, kind, trueMs: at, clock, hybrid: stamp, ahead: Math.max(0, stamp.l - clock), counterBefore, peer, link };
    events.push(e);
    return e;
  };
  for (const a of actions) {
    if (a.kind === "local") {
      push(a.node, "local", t, (clock) => hlcTick(state[a.node], clock));
      t += STEP_MS;
    } else {
      const send = push(a.from, "send", t, (clock) => hlcTick(state[a.from], clock), a.to);
      const sendIndex = events.length - 1;
      const msg = send.hybrid;
      push(a.to, "receive", t + STEP_MS, (clock) => hlcReceive(state[a.to], msg, clock), a.from, sendIndex);
      events[sendIndex].link = events.length - 1;
      t += 2 * STEP_MS;
    }
  }
  return events;
}

/** What an event is stamped with in a mode, as a pair (l, c) or a plain clock reading. */
export function stampOf(e: HlcEvent, mode: Mode): Stamp {
  return mode === "wall" ? { l: e.clock, c: 0 } : e.hybrid;
}

/** Text for a stamp: "(100,1)" in hybrid, "70" in wall mode. */
export function stampText(e: HlcEvent, mode: Mode): string {
  return mode === "wall" ? String(e.clock) : `(${e.hybrid.l},${e.hybrid.c})`;
}

/** True when stamp a is after stamp b: time first, then counter. */
export function stampAfter(a: Stamp, b: Stamp): boolean {
  return a.l > b.l || (a.l === b.l && a.c > b.c);
}

export type HlcVerdict = { text: string; tone: "accent" | "good" | "warn" | "bad" };

/** The banner for the latest event in the run. */
export function hlcVerdict(events: readonly HlcEvent[], mode: Mode): HlcVerdict {
  if (events.length === 0) return { text: "Tap a node, then where it sends", tone: "accent" };
  const last = events[events.length - 1];
  if (last.kind === "receive") {
    const send = events[last.link as number];
    if (mode === "wall") {
      return stampAfter(stampOf(last, mode), stampOf(send, mode))
        ? { text: "Receive stamped after its send", tone: "good" }
        : { text: "Receive stamped before its send", tone: "bad" };
    }
    return { text: `Receive ${stampText(last, mode)} after send ${stampText(send, mode)}`, tone: "good" };
  }
  if (mode === "hybrid") {
    if (last.ahead > 0) return { text: `Time part is ${last.ahead} ms ahead of the clock`, tone: "warn" };
    if (last.counterBefore > 0 && last.hybrid.c === 0) return { text: "Clock caught up: counter back to 0", tone: "good" };
  }
  return { text: mode === "wall" ? "Stamped with the clock alone" : "Stamped with the clock: counter 0", tone: "accent" };
}

/** Receives whose stamp is not after the send's, in a mode. */
export function brokenReceives(events: readonly HlcEvent[], mode: Mode): number {
  return events.filter((e) => e.kind === "receive" && !stampAfter(stampOf(e, mode), stampOf(events[e.link as number], mode))).length;
}

/** The largest distance of l ahead of the clock anywhere in the run. */
export function maxAhead(events: readonly HlcEvent[]): number {
  return events.reduce((m, e) => Math.max(m, e.ahead), 0);
}

/** The widest gap between any two clock offsets. */
export function spread(offsets: Offsets): number {
  const v = NODE_IDS.map((n) => offsets[n]);
  return Math.max(...v) - Math.min(...v);
}

export function formatOffset(offset: number): string {
  if (offset === 0) return "0 ms";
  return `${offset > 0 ? "+" : "-"}${Math.abs(offset)} ms`;
}
