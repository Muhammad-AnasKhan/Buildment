import type { Tone } from "../primitives/tones";
import { unitHash } from "./server-load";

// 3.6: one blocking call on an event loop, against a thread pool. Pure, no
// React. All numbers are illustrative.
//
//   Every request needs c = 1 ms of CPU and w = 50 ms of async wait; 100
//   requests arrive a second. A share s of them also does B ms of CPU.
//
//   Event loop (one thread runs all JavaScript):
//     ceiling = 1000 / (c + s B) requests a second
//     busy    = arrivals (c + s B) / 1000
//     while a slow call runs, every other request waits up to B ms
//   Thread pool (T = 8 threads, each request holds a thread while it waits):
//     ceiling = 8000 / (c + w + s B) requests a second
//     a slow call ties up only 1 of the 8 threads

export const CPU_MS = 1;
export const WAIT_MS = 50;
export const ARRIVALS = 100;
export const THREADS = 8;

export type Mode = "loop" | "pool";

/** Shares of requests that run the slow call. */
export const SHARES: readonly { value: number; chip: string; words: string }[] = [
  { value: 0, chip: "none", words: "none" },
  { value: 0.01, chip: "1%", words: "1 percent" },
  { value: 0.05, chip: "5%", words: "5 percent" },
] as const;

export const B_MAX = 200;
export const B_SNAPS: readonly number[] = [0, 20, 100, B_MAX];
export const B_LADDER: readonly number[] = Array.from({ length: B_MAX / 10 + 1 }, (_, i) => i * 10);
export const DEFAULT_B = 200;
export const DEFAULT_SHARE = 0.01;

export const clampB = (v: number): number => (Number.isFinite(v) ? Math.max(0, Math.min(B_MAX, Math.round(v))) : DEFAULT_B);

export const bToFraction = (b: number): number => clampB(b) / B_MAX;

/** A point on the rail as milliseconds, snapping to 0, 20, 100 and 200. */
export function bFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 1;
  const v = t * B_MAX;
  for (const s of B_SNAPS) if (Math.abs(s - v) < 4) return s;
  return clampB(Math.round(v / 5) * 5);
}

/** True when some requests really run a slow call. */
export const isBlocking = (share: number, b: number): boolean => share > 0 && b > 0;

export const loopCeiling = (share: number, b: number): number => 1000 / (CPU_MS + share * b);

export const poolCeiling = (share: number, b: number): number => (THREADS * 1000) / (CPU_MS + WAIT_MS + share * b);

export const ceilingOf = (mode: Mode, share: number, b: number): number => (mode === "loop" ? loopCeiling(share, b) : poolCeiling(share, b));

/** Share of the loop's one thread that the arrivals keep busy. 1 or more means the line never ends. */
export const loopBusy = (share: number, b: number): number => (ARRIVALS * (CPU_MS + share * b)) / 1000;

export const formatCeiling = (v: number): string => Math.round(v).toLocaleString("en-US");

export type BlockVerdict = { text: string; tone: Tone };

/** The one line over the picture. At most 38 characters. */
export function blockVerdict(mode: Mode, share: number, b: number): BlockVerdict {
  if (mode === "loop") {
    if (!isBlocking(share, b)) return { text: `No blocking: loop ceiling ${formatCeiling(loopCeiling(0, 0))}/s`, tone: "good" };
    if (loopBusy(share, b) >= 1) return { text: `Ceiling falls to ${formatCeiling(loopCeiling(share, b))} requests/s`, tone: "bad" };
    return { text: `Loop blocked ${b} ms: all requests wait`, tone: "bad" };
  }
  if (!isBlocking(share, b)) return { text: `Pool tops out near ${formatCeiling(poolCeiling(0, 0))} requests/s`, tone: "warn" };
  return { text: `Pool: 1 of ${THREADS} threads stuck`, tone: "warn" };
}

// ---------- Motion ----------

/** Dots a second that stand for the 100 requests a second. */
export const ARRIVAL_DOTS = 4;
export const QUEUE_CAP = 5;
/** Calm time at the start of every cycle, before the slow call starts. */
const CALM_S = 0.7;
const DRAIN_PER_S = 10;

/** How long the slow call takes in the picture, seconds. */
export const callSeconds = (b: number): number => 0.5 + (clampB(b) / B_MAX) * 1.6;

/** Seconds between slow calls in the picture: more often when more requests make one. */
export function cycleSeconds(share: number, b: number): number {
  const d = callSeconds(b);
  const base = share >= 0.05 ? 3.2 : 4.6;
  return Math.max(d + 1.3, base);
}

export type BlockFrame = {
  /** A slow call is running right now. */
  active: boolean;
  /** How far the slow call has got, 0 to 1. */
  progress: number;
  cycle: number;
  /** Dots waiting in front of the event loop. */
  queue: number;
  /** The pool thread running the slow call, 0 to 7, or null. */
  stuck: number | null;
  /** The arrivals are more than the loop can do, so the line never clears. */
  overloaded: boolean;
};

/** The state of the slow call at `seconds`. With `still` it is a frozen mid-call frame. */
export function blockFrame(seconds: number, mode: Mode, share: number, b: number, still: boolean): BlockFrame {
  const blocking = isBlocking(share, b);
  const overloaded = mode === "loop" && blocking && loopBusy(share, b) >= 1;
  if (!blocking) return { active: false, progress: 0, cycle: 0, queue: 0, stuck: null, overloaded: false };
  const d = callSeconds(b);
  const t = still ? CALM_S + d * 0.6 : Number.isFinite(seconds) ? seconds : CALM_S + d * 0.6;
  if (overloaded) {
    // The slow calls come back to back: the loop never gets a calm moment.
    const run = Math.floor(t / d);
    return { active: true, progress: (t - run * d) / d, cycle: run, queue: QUEUE_CAP, stuck: null, overloaded: true };
  }
  const period = cycleSeconds(share, b);
  const cycle = Math.floor(t / period);
  const tau = t - cycle * period;
  const into = tau - CALM_S;
  const active = into >= 0 && into < d;
  const progress = active ? into / d : 0;
  let queue = 0;
  if (mode === "loop") {
    if (active) queue = Math.min(QUEUE_CAP, Math.floor(ARRIVAL_DOTS * into));
    else if (into >= d) queue = Math.max(0, Math.min(QUEUE_CAP, Math.floor(ARRIVAL_DOTS * d)) - Math.floor((into - d) * DRAIN_PER_S));
  }
  const stuck = mode === "pool" && active ? Math.floor(unitHash(cycle, 3) * THREADS) : null;
  return { active, progress, cycle, queue, stuck, overloaded: false };
}
