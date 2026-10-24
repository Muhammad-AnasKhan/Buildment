import { mayReturn, overlapCount, overlaps, type HistoryOp } from "./history";
import { snap, type HistoryAxis } from "./history-layout";

// 11.2 beat 1: build a history by tapping lanes. Rules: a bar is 20 long, its
// start snaps to the nearest 5 and is clipped to 0 to 80, a client does one
// thing at a time (a new bar may not overlap another bar in its lane), and
// there are at most six bars. The k-th write stores x = k.

export const BUILD_CLIENTS = ["Ada", "Ben", "Cam"] as const;
export const BUILD_AXIS: HistoryAxis = { min: 0, max: 100, step: 20, caption: "time (made-up ms)" };
export const MAX_OPS = 6;
export const BAR_LENGTH = 20;
export const START_STEP = 5;
export const LAST_START = 80;

export const NOTICE_REFUSED = "A client does one thing at a time";
export const NOTICE_FULL = "Six operations is the most";

const make = (id: string, client: string, kind: "write" | "read", value: number, start: number, end: number): HistoryOp => ({ id, client, kind, key: "x", value, start, end });

/** Ada writes x = 1 from 10 to 30; Ben reads from 20 to 40; Cam reads from 50 to 70. A read's value is not shown here. */
export function presetHistory(): HistoryOp[] {
  return [make("a", "Ada", "write", 1, 10, 30), make("b", "Ben", "read", 0, 20, 40), make("c", "Cam", "read", 0, 50, 70)];
}

export type AddResult = { ops: HistoryOp[]; added: string | null; refused: "overlap" | "full" | null };

function nextId(ops: readonly HistoryOp[]): string {
  let max = 0;
  for (const o of ops) {
    const m = /^n(\d+)$/.exec(o.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `n${max + 1}`;
}

/** The start of the first free slot in a lane, scanning from 0; null when the lane is full. */
export function firstFreeStart(ops: readonly HistoryOp[], client: string): number | null {
  for (let s = 0; s <= LAST_START; s += START_STEP) {
    const probe = make("probe", client, "read", 0, s, s + BAR_LENGTH);
    if (!ops.some((o) => o.client === client && overlaps(o, probe))) return s;
  }
  return null;
}

/** Add a bar to a lane at a tapped time (null: first free slot, for keyboards). */
export function addBar(ops: readonly HistoryOp[], client: string, time: number | null, write: boolean): AddResult {
  if (ops.length >= MAX_OPS) return { ops: ops.slice(), added: null, refused: "full" };
  const start = time === null ? firstFreeStart(ops, client) : snap(time, START_STEP, 0, LAST_START);
  if (start === null) return { ops: ops.slice(), added: null, refused: "overlap" };
  const bar = make(nextId(ops), client, write ? "write" : "read", 0, start, start + BAR_LENGTH);
  if (ops.some((o) => o.client === client && overlaps(o, bar))) return { ops: ops.slice(), added: null, refused: "overlap" };
  if (write) bar.value = ops.reduce((m, o) => (o.kind === "write" ? Math.max(m, o.value) : m), 0) + 1;
  return { ops: [...ops, bar], added: bar.id, refused: null };
}

export function removeBar(ops: readonly HistoryOp[], id: string): HistoryOp[] {
  return ops.filter((o) => o.id !== id);
}

/** "3 operations, 1 pair overlaps". */
export function buildSummary(ops: readonly HistoryOp[]): string {
  const n = ops.length;
  const m = overlapCount(ops);
  return `${n} ${n === 1 ? "operation" : "operations"}, ${m} ${m === 1 ? "pair overlaps" : "pairs overlap"}`;
}

/** What each read may return, by id. */
export function readOptions(ops: readonly HistoryOp[]): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const o of ops) if (o.kind === "read") out[o.id] = mayReturn(ops, o);
  return out;
}
