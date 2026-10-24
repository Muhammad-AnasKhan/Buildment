import { seededRandom } from "../sim/random";
import type { Tone } from "../primitives/tones";

// 2.4: one page calls n backends at once and waits for all of them. Each call
// is slow (1 s) with chance 1 in 100, independently, so the page is slow with
// chance 1 - 0.99^n: 1% at n = 1, about 18% at 20, 39% at 50, 63% at 100
// (the example in Dean and Barroso's "The Tail at Scale"). Pure, no React.

export const P_SLOW = 0.01;
export const SLOW_MS = 1000;
export const BACKENDS = { min: 1, max: 100, default: 20 } as const;
export const BACKEND_LADDER: readonly number[] = Array.from({ length: BACKENDS.max }, (_, i) => i + 1);
/** Values the drag likes to land on. */
export const BACKEND_SNAPS = [1, 10, 20, 50, 100] as const;

export function clampBackends(v: number): number {
  if (!Number.isFinite(v)) return BACKENDS.default;
  return Math.max(BACKENDS.min, Math.min(BACKENDS.max, Math.round(v)));
}

export const backendsToFraction = (n: number) => (clampBackends(n) - BACKENDS.min) / (BACKENDS.max - BACKENDS.min);

export function backendsFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : backendsToFraction(BACKENDS.default);
  const v = BACKENDS.min + t * (BACKENDS.max - BACKENDS.min);
  for (const s of BACKEND_SNAPS) if (Math.abs(s - v) < 1.2) return s;
  return clampBackends(v);
}

/** Chance that at least one of n calls is slow: 1 - (1 - p)^n. */
export function slowChance(n: number, p = P_SLOW): number {
  return 1 - Math.pow(1 - p, clampBackends(n));
}

export function fanOutVerdict(n: number): { text: string; tone: Tone; percent: number } {
  const percent = Math.round(slowChance(n) * 100);
  const tone: Tone = percent < 5 ? "good" : percent < 30 ? "warn" : "bad";
  return { text: `${percent}% of page loads hit a slow call`, tone, percent };
}

export type PageLoad = {
  /** One entry per backend: is this call slow? */
  slow: boolean[];
  /** Each call's time in ms. */
  ms: number[];
  anySlow: boolean;
  /** The page's time: its slowest call. */
  pageMs: number;
};

/**
 * Page load number k with n backends, from a seeded random source. Backend i
 * draws the same numbers whatever n is, so adding backends never changes the
 * ones already there; it only adds more chances to be slow.
 */
export function pageLoad(n: number, k: number): PageLoad {
  const count = clampBackends(n);
  const rng = seededRandom(0x5eed ^ Math.imul((k | 0) + 1, 0x2545f491));
  const slow: boolean[] = [];
  const ms: number[] = [];
  for (let i = 0; i < count; i++) {
    const s = rng.next() < P_SLOW;
    const fast = 8 + Math.floor(rng.next() * 8);
    slow.push(s);
    ms.push(s ? SLOW_MS : fast);
  }
  return { slow, ms, anySlow: slow.some(Boolean), pageMs: Math.max(...ms) };
}

// ---------- One load as motion ----------

/** Seconds per page load in the picture, including a pause on the result. */
export const LOAD_PERIOD = 3.6;
const OUT = 0.5;
const FAST_LEAVE = 0.6;
const SLOW_LEAVE = 1.9;
const BACK = 0.45;
/** When the page is ready: after the last reply lands. */
export const FAST_READY = FAST_LEAVE + 0.15 + BACK;
export const SLOW_READY = SLOW_LEAVE + BACK;

export type CallFrame = { slow: boolean; out: number; back: number; home: boolean; waiting: boolean };
export type FanOutFrame = { calls: CallFrame[]; backCount: number; ready: boolean; slowPage: boolean; pageMs: number };

/** The page load at t seconds into its period. t at or past LOAD_PERIOD shows the finished load. */
export function fanOutFrame(load: PageLoad, t: number): FanOutFrame {
  const time = Number.isFinite(t) ? Math.max(0, Math.min(LOAD_PERIOD, t)) : LOAD_PERIOD;
  const calls = load.slow.map((slow, i) => {
    const leave = slow ? SLOW_LEAVE : FAST_LEAVE + (load.ms[i] - 8) * 0.02;
    const out = Math.min(1, time / OUT);
    const back = Math.max(0, Math.min(1, (time - leave) / BACK));
    return { slow, out, back, home: back >= 1, waiting: out >= 1 && back <= 0 };
  });
  const backCount = calls.filter((c) => c.home).length;
  return { calls, backCount, ready: backCount === calls.length, slowPage: load.anySlow, pageMs: load.pageMs };
}

// ---------- Many loads ----------

export type Tally = { fast: number; slow: number; recent: boolean[] };

/** Outcomes of loads from..to (both included), skipping any in `skip`. `recent` holds the last `keep` outcomes, true for slow. */
export function tallyLoads(n: number, from: number, to: number, skip: readonly number[] = [], keep = 12): Tally {
  const out: Tally = { fast: 0, slow: 0, recent: [] };
  for (let k = Math.max(0, from); k <= to; k++) {
    if (skip.includes(k)) continue;
    const slow = pageLoad(n, k).anySlow;
    if (slow) out.slow++;
    else out.fast++;
    out.recent.push(slow);
  }
  out.recent = out.recent.slice(-keep);
  return out;
}
