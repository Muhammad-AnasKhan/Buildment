import { withCommas } from "../models/picture-controls";
import type { Tone } from "../primitives/tones";

// 9.5 beat 3: going from four nodes to five while requests keep coming. The
// scheme decides how much data must move: 80% for hash mod N (N over N+1),
// 20% for fixed partitions or a ring. While the move runs, a client with the
// old map asks the wrong node for any key that has already moved. Suq's
// numbers (1.8 TB, 5,000 requests a second, 100 MB a second to copy) are
// course assumptions. Pure, no React.

export const DATA_GB = 1800;
export const OLD_NODES = 4;
export const REQUESTS_PER_SECOND = 5000;
export const COPY_MB_PER_SECOND = 100;
export const PROGRESS = { min: 0, max: 100, default: 0 } as const;
export const PROGRESS_LADDER: readonly number[] = Array.from({ length: 101 }, (_, i) => i);

export type Scheme = "mod" | "fixed";
export type MapState = "old" | "fresh";

/** The share of the data that changes node: N over N+1 for mod, 13 of 64 partitions rounded to 20% for fixed partitions. */
export const CHANGED_SHARE: Record<Scheme, number> = { mod: 0.8, fixed: 0.2 };
/** Under hash mod N, the part of the moved data that lands on a node that was already there: (4/5 - 1/5) / (4/5). */
export const WASTE_SHARE = 0.75;

export const bytesToMoveGB = (scheme: Scheme) => CHANGED_SHARE[scheme] * DATA_GB;
/** Seconds to copy: GB to move, over the copy speed (1 GB is 1,000 MB). */
export const moveSeconds = (scheme: Scheme) => (bytesToMoveGB(scheme) * 1000) / COPY_MB_PER_SECOND;

export function clampProgress(v: number): number {
  if (!Number.isFinite(v)) return PROGRESS.default;
  return Math.max(PROGRESS.min, Math.min(PROGRESS.max, Math.round(v)));
}

export const progressFromFraction = (f: number) => clampProgress((Number.isFinite(f) ? f : 0) * PROGRESS.max);
export const progressToFraction = (p: number) => clampProgress(p) / PROGRESS.max;

export type Rebalance = {
  progress: number;
  totalGB: number;
  seconds: number;
  movedGB: number;
  /** Moved data as a share of all the data. */
  movedShare: number;
  /** Requests a second sent to the wrong node. */
  wrong: number;
  /** Moved data that went from one old node to another (hash mod N only). */
  wasteGB: number;
  /** GB on each of the five nodes; the last one is the new node. */
  volumes: number[];
  verdict: { text: string; tone: Tone };
};

export function rebalance(scheme: Scheme, map: MapState, progress: number): Rebalance {
  const p = clampProgress(progress);
  const f = p / 100;
  const totalGB = bytesToMoveGB(scheme);
  const movedGB = f * totalGB;
  const movedShare = movedGB / DATA_GB;
  const wrong = map === "old" ? REQUESTS_PER_SECOND * movedShare : 0;
  const wasteGB = scheme === "mod" ? WASTE_SHARE * movedGB : 0;
  // Every old node starts with a quarter of the data and ends with a fifth, whichever scheme moved it.
  const perOld = DATA_GB / OLD_NODES;
  const fifth = DATA_GB / (OLD_NODES + 1);
  const volumes = [...Array.from({ length: OLD_NODES }, () => perOld - (perOld - fifth) * f), fifth * f];
  return { progress: p, totalGB, seconds: moveSeconds(scheme), movedGB, movedShare, wrong, wasteGB, volumes, verdict: verdictFor(scheme, map, p, totalGB, wrong) };
}

export const roundGB = (gb: number) => Math.round(gb);

function verdictFor(scheme: Scheme, map: MapState, p: number, totalGB: number, wrong: number): { text: string; tone: Tone } {
  if (p === 0) {
    return scheme === "mod" ? { text: "1.44 TB to move: about 4 hours", tone: "bad" } : { text: `${totalGB} GB to move: about 1 hour`, tone: "good" };
  }
  if (map === "fresh") return { text: "Map is fresh: no wrong-node requests", tone: "good" };
  return { text: `${withCommas(wrong)} requests/s hit the wrong node`, tone: wrong > 1500 ? "bad" : "warn" };
}

/** A duration in plain words: "45 min", "2 h", "1.5 h". */
export function durationText(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.round((seconds / 3600) * 10) / 10;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

export function describeProgress(scheme: Scheme, map: MapState, p: number): string {
  const r = rebalance(scheme, map, p);
  return `move ${r.progress}% done, ${withCommas(roundGB(r.movedGB))} GB moved, ${withCommas(Math.round(r.wrong))} wrong-node requests a second`;
}
