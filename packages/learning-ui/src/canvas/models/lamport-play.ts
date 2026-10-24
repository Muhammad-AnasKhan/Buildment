// 10.3 beat 4: three nodes with Lamport counters. A local event or a send adds
// 1; a receive sets the counter to the larger of its own value and the stamp,
// then adds 1. The learner guesses each receive before it appears.
// Pure model, no React. Uses lamportTick from the sim clocks for the rule.

import { lamportTick } from "../sim/clocks";

export const NODE_IDS = ["A", "B", "C"] as const;
export type NodeId = (typeof NODE_IDS)[number];
export const NODE_INDEX: Record<NodeId, number> = { A: 0, B: 1, C: 2 };
/** The counters the run starts with: B is already ahead. */
export const START_COUNTERS: Record<NodeId, number> = { A: 0, B: 5, C: 0 };
/** After this many actions the run is full and the learner starts over. */
export const MAX_ACTIONS = 30;

export type Action = { kind: "local"; node: NodeId } | { kind: "send"; from: NodeId; to: NodeId };

/** The scripted run: five steps. */
export const SCRIPT: readonly Action[] = [
  { kind: "local", node: "A" },
  { kind: "send", from: "A", to: "B" },
  { kind: "send", from: "B", to: "C" },
  { kind: "send", from: "C", to: "A" },
  { kind: "send", from: "A", to: "B" },
];

export type RunEvent = {
  /** Row in the picture, 0 is the start. */
  row: number;
  node: NodeId;
  kind: "start" | "local" | "send" | "receive";
  /** The counter after the event. */
  value: number;
  /** For a send, the stamp it attaches; for a receive, the stamp it read. */
  stamp?: number;
  /** For a receive, the counter before it. */
  before?: number;
  /** For a send or receive, the other node. */
  peer?: NodeId;
  /** Index (in events) of the event on the other end of the message. */
  link?: number;
};

export type Run = {
  counters: Record<NodeId, number>;
  events: RunEvent[];
  actions: Action[];
};

export function startRun(): Run {
  const events: RunEvent[] = NODE_IDS.map((node) => ({ row: 0, node, kind: "start", value: START_COUNTERS[node] }));
  return { counters: { ...START_COUNTERS }, events, actions: [] };
}

/** What a receive would produce, and which case it is. */
export type ReceivePlan = {
  from: NodeId;
  to: NodeId;
  stamp: number;
  own: number;
  result: number;
  kase: "behind" | "ahead" | "level";
};

function lastRow(run: Run): number {
  return run.events[run.events.length - 1].row;
}

/** A send adds 1 to the sender; the stamp is the new value. Returns the run with the send done and the receive still to do. */
export function planSend(run: Run, from: NodeId, to: NodeId): { run: Run; plan: ReceivePlan } {
  const stamp = lamportTick(run.counters[from]);
  const own = run.counters[to];
  const result = lamportTick(own, stamp);
  const sendEvent: RunEvent = { row: lastRow(run) + 1, node: from, kind: "send", value: stamp, stamp, peer: to };
  const next: Run = {
    counters: { ...run.counters, [from]: stamp },
    events: [...run.events, sendEvent],
    actions: run.actions,
  };
  const kase = own === stamp ? "level" : own > stamp ? "ahead" : "behind";
  return { run: next, plan: { from, to, stamp, own, result, kase } };
}

/** Finishes a send: the receiver takes the guessed (correct) value. */
export function finishReceive(run: Run, plan: ReceivePlan): Run {
  const sendIndex = run.events.length - 1;
  const receive: RunEvent = {
    row: lastRow(run) + 1,
    node: plan.to,
    kind: "receive",
    value: plan.result,
    stamp: plan.stamp,
    before: plan.own,
    peer: plan.from,
    link: sendIndex,
  };
  const events = run.events.map((e, i) => (i === sendIndex ? { ...e, link: sendIndex + 1 } : e));
  return {
    counters: { ...run.counters, [plan.to]: plan.result },
    events: [...events, receive],
    actions: [...run.actions, { kind: "send", from: plan.from, to: plan.to }],
  };
}

/** A local event adds 1. */
export function localEvent(run: Run, node: NodeId): Run {
  const value = lamportTick(run.counters[node]);
  return {
    counters: { ...run.counters, [node]: value },
    events: [...run.events, { row: lastRow(run) + 1, node, kind: "local", value }],
    actions: [...run.actions, { kind: "local", node }],
  };
}

/** A whole send and receive in one go (used by tests). */
export function sendAndReceive(run: Run, from: NodeId, to: NodeId): Run {
  const { run: sent, plan } = planSend(run, from, to);
  return finishReceive(sent, plan);
}

export function applyAction(run: Run, action: Action): Run {
  return action.kind === "local" ? localEvent(run, action.node) : sendAndReceive(run, action.from, action.to);
}

export type GuessChip = { id: "own" | "stamp" | "larger"; label: string; value: number; correct: boolean };

const CHIP_ORDER = { own: 0, stamp: 1, larger: 2 } as const;

/** The guess chips for a receive: own + 1, stamp + 1, larger + 1; two that give the same number merge. */
export function guessChips(plan: ReceivePlan): GuessChip[] {
  const ownPlus = plan.own + 1;
  const stampPlus = plan.stamp + 1;
  const larger = plan.result;
  const chips: GuessChip[] = [];
  if (ownPlus !== larger) chips.push({ id: "own", label: `own + 1 = ${ownPlus}`, value: ownPlus, correct: false });
  if (stampPlus !== larger && stampPlus !== ownPlus) chips.push({ id: "stamp", label: `stamp + 1 = ${stampPlus}`, value: stampPlus, correct: false });
  chips.push({ id: "larger", label: `larger + 1 = ${larger}`, value: larger, correct: true });
  return chips.sort((a, b) => CHIP_ORDER[a.id] - CHIP_ORDER[b.id]);
}

/** Why a wrong guess is wrong, in 38 characters or fewer. */
export function wrongGuessText(plan: ReceivePlan, chip: GuessChip): string {
  if (chip.id === "stamp" && plan.own > plan.stamp) return "No: the counter would go down";
  if (chip.id === "own" && plan.stamp > plan.own) return "No: that ignores the stamp";
  return "No: take the larger, then add 1";
}

/** "max(5, 2) + 1 = 6". */
export function mergeText(own: number, stamp: number, result: number): string {
  return `max(${own}, ${stamp}) + 1 = ${result}`;
}

export function sameAction(a: Action, b: Action): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "local") return a.node === (b as typeof a).node;
  const other = b as typeof a;
  return a.from === other.from && a.to === other.to;
}

/** How many steps of the script the actions match from the start; -1 once they leave it. */
export function scriptProgress(actions: readonly Action[]): number {
  if (actions.length > SCRIPT.length) return -1;
  for (let i = 0; i < actions.length; i++) if (!sameAction(actions[i], SCRIPT[i])) return -1;
  return actions.length;
}

/** The next step of the script to try, or null once the learner has left it or finished. */
export function nextScriptStep(actions: readonly Action[]): { index: number; action: Action } | null {
  const done = scriptProgress(actions);
  if (done < 0 || done >= SCRIPT.length) return null;
  return { index: done, action: SCRIPT[done] };
}

export function describeAction(a: Action): string {
  return a.kind === "local" ? `tap ${a.node}, then Event on ${a.node}` : `tap ${a.from}, then Send to ${a.to}`;
}

export type PlayVerdict = { text: string; tone: "accent" | "good" | "warn" };

/** The banner for the state after the latest finished event. */
export function playVerdict(run: Run): PlayVerdict {
  if (run.actions.length === 0) return { text: "Tap a node to give it an event", tone: "accent" };
  if (scriptProgress(run.actions) === SCRIPT.length) return { text: "Every receive lands after its send", tone: "good" };
  const last = run.events[run.events.length - 1];
  if (last.kind === "receive") {
    const stamp = last.stamp as number;
    const before = last.before as number;
    if (before === stamp) return { text: "Level with the stamp: it adds 1", tone: "good" };
    if (before > stamp) return { text: "Receiver was ahead: it only adds 1", tone: "good" };
    return { text: "Receiver was behind: it jumps forward", tone: "good" };
  }
  return { text: `${last.node} adds 1: now ${last.value}`, tone: "accent" };
}
