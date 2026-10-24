import { mayReturn, type HistoryOp } from "./history";
import { snap, type HistoryAxis } from "./history-layout";

// 11.2 beat 3: one write (Ada, 30 to 60) and one read of length 20 that the
// learner drags. Before the write: only 0. Overlapping: 0 or 1. After: only 1.

export const OVERLAP_AXIS: HistoryAxis = { min: 0, max: 100, step: 10, caption: "time (made-up ms)" };
export const WRITE_START = 30;
export const WRITE_END = 60;
export const READ_LENGTH = 20;
export const READ_STARTS: readonly number[] = Array.from({ length: 17 }, (_, i) => i * 5);
export const DEFAULT_READ_START = 40;

export type Zone = "before" | "overlap" | "after";

export function historyAt(s: number): HistoryOp[] {
  return [
    { id: "w", client: "Ada", kind: "write", key: "x", value: 1, start: WRITE_START, end: WRITE_END },
    { id: "r", client: "Ben", kind: "read", key: "x", value: 0, start: s, end: s + READ_LENGTH },
  ];
}

/** Nearest read start on the 5-step ladder. */
export const snapStart = (s: number) => snap(s, 5, 0, 80);

export function zoneOf(s: number): Zone {
  if (s + READ_LENGTH < WRITE_START) return "before";
  if (s > WRITE_END) return "after";
  return "overlap";
}

export function allowed(s: number): number[] {
  const ops = historyAt(s);
  return mayReturn(ops, ops[1]);
}

export const VERDICTS: Record<Zone, { text: string; tone: "accent" | "good" }> = {
  before: { text: "Read finished first: only 0", tone: "accent" },
  overlap: { text: "Overlap: 0 or 1 are both fine", tone: "good" },
  after: { text: "Write finished first: only 1", tone: "accent" },
};

export function chipText(values: readonly number[]): string {
  return values.length === 1 ? `may return ${values[0]}` : `may return ${values.join(" or ")}`;
}
