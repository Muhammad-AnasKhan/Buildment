// 17.5 beat 3: two services, 20 requests each, the same average and very
// different tails. Percentiles use the nearest-rank method (chapter 2.4):
// the k-th smallest value with k = ceil(p x n). Course numbers. Pure, no React.

import type { Tone } from "../primitives/tones";

export const A = [88, 92, 96, 100, 104, 108, 111, 114, 117, 120, 122, 125, 128, 131, 134, 137, 139, 140, 144, 150] as const;
export const B = [40, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 700, 810] as const;
export const AXIS_MAX = 900;
export const TARGET_MS = 300;

export type Stat = "average" | "p50" | "p99";
export type Mode = "average" | "merge";

export const STATS: readonly { id: Stat; label: string }[] = [
  { id: "average", label: "Average" },
  { id: "p50", label: "p50" },
  { id: "p99", label: "p99" },
];

export const MODES: readonly { id: Mode; label: string }[] = [
  { id: "average", label: "Average the two p99s" },
  { id: "merge", label: "Merge the requests" },
];

export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const average = (xs: readonly number[]) => sum(xs) / xs.length;

/** Nearest rank: the ceil(p x n)-th smallest value. */
export function percentile(xs: readonly number[], p: number): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const k = Math.max(1, Math.ceil(p * sorted.length - 1e-9));
  return sorted[k - 1];
}

export function statOf(xs: readonly number[], stat: Stat): number {
  return stat === "average" ? average(xs) : percentile(xs, stat === "p50" ? 0.5 : 0.99);
}

/** The 40 requests of A and B together, sorted. */
export const merged = (): number[] => [...A, ...B].sort((x, y) => x - y);

/** What averaging the two p99 values gives (wrong), and what merging the requests gives (right). */
export const averagedP99 = () => (percentile(A, 0.99) + percentile(B, 0.99)) / 2;
export const mergedP99 = () => percentile(merged(), 0.99);

export const meetsTarget = (xs: readonly number[]) => percentile(xs, 0.99) < TARGET_MS;

/** A slow request: the two dots the statistic may hide. */
export const isSlow = (ms: number) => ms >= TARGET_MS;

export type Verdict = { text: string; tone: Tone };

export function verdictFor(stat: Stat, combined: boolean, mode: Mode): Verdict {
  if (combined) {
    return mode === "average"
      ? { text: `Averaged p99 says ${averagedP99()}; truth is ${mergedP99()}`, tone: "bad" }
      : { text: `Merged requests: p99 is ${mergedP99()}`, tone: "good" };
  }
  if (stat === "average") return { text: "Average: A and B look the same", tone: "warn" };
  if (stat === "p50") return { text: "p50: B even looks better than A", tone: "warn" };
  return { text: `p99: B has users waiting ${percentile(B, 0.99)} ms`, tone: "good" };
}

/** The slow dots are amber while the statistic hides them, red once p99 shows them. */
export const slowTone = (stat: Stat, combined: boolean): "warn" | "bad" => (stat === "p99" || combined ? "bad" : "warn");

/**
 * Row (0 to rows - 1) of each dot in a strip, so close values sit on different
 * rows and read as a clump instead of one dot.
 */
export const dotRow = (index: number, rows: number) => index % rows;
