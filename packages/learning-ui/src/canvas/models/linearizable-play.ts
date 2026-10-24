import { conflictIds, dotsInside, findLinearization, mayReturn, placeDots, withValue, type HistoryDot, type HistoryOp } from "./history";
import type { HistoryAxis } from "./history-layout";

// 11.3 beat 1: Ada writes x = 1 from 10 to 60; Ben, Dan and Cam each read x.
// Tap a read to flip what it returned (0 or 1). The linearizable checker runs
// after each tap; when an order exists the picture places one instant inside
// every bar, left to right.

export const LIN_CLIENTS = ["Ada", "Ben", "Dan", "Cam"] as const;
export const LIN_AXIS: HistoryAxis = { min: 0, max: 90, step: 10, caption: "time (made-up ms)" };
export const LIN_READS = ["b", "d", "c"] as const;

export function presetHistory(): HistoryOp[] {
  return [
    { id: "a", client: "Ada", kind: "write", key: "x", value: 1, start: 10, end: 60 },
    { id: "b", client: "Ben", kind: "read", key: "x", value: 0, start: 20, end: 30 },
    { id: "d", client: "Dan", kind: "read", key: "x", value: 1, start: 40, end: 50 },
    { id: "c", client: "Cam", kind: "read", key: "x", value: 1, start: 70, end: 80 },
  ];
}

/** Tap a read: 0 becomes 1 and 1 becomes 0. Taps on the write do nothing. */
export function flipRead(ops: readonly HistoryOp[], id: string): HistoryOp[] {
  const op = ops.find((o) => o.id === id);
  if (!op || op.kind !== "read") return ops.slice();
  return withValue(ops, id, op.value === 0 ? 1 : 0);
}

export type LinView = {
  ok: boolean;
  /** One legal order, as ids, when it exists. */
  order: string[] | null;
  dots: HistoryDot[];
  rings: string[];
  verdict: { text: string; tone: "good" | "bad" };
};

const nameOf = (ops: readonly HistoryOp[], id: string) => ops.find((o) => o.id === id)?.client ?? "";

export function analyse(ops: readonly HistoryOp[]): LinView {
  const order = findLinearization(ops);
  if (order) {
    const dots = placeDots(ops, order);
    return { ok: true, order, dots, rings: [], verdict: { text: "Yes: one order fits every bar", tone: "good" } };
  }
  const rings = conflictIds(ops, "lin");
  // First rule: a read that missed a write which finished before it began.
  const missed = ops.find((o) => o.kind === "read" && !mayReturn(ops, o).includes(o.value));
  if (missed) return { ok: false, order, dots: [], rings, verdict: { text: `No: ${missed.client} missed a finished write`, tone: "bad" } };
  // Second rule: two reads in a row that see the write appear and then disappear.
  const reads = rings.filter((id) => ops.find((o) => o.id === id)?.kind === "read").sort((p, q) => (ops.find((o) => o.id === p)?.start ?? 0) - (ops.find((o) => o.id === q)?.start ?? 0));
  const later = reads[reads.length - 1];
  if (later) return { ok: false, order, dots: [], rings, verdict: { text: `No: ${nameOf(ops, later)} saw time go backwards`, tone: "bad" } };
  return { ok: false, order, dots: [], rings, verdict: { text: "No: no order fits every bar", tone: "bad" } };
}

export { dotsInside };
