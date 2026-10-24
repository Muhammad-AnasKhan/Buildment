import { clamp, spread, withCommas } from "./picture-controls";
import type { Tone } from "../primitives/tones";

// 5.7 "Predict the origin's load". 20 edges each serve the sale page to r
// requests a second, and each keeps a copy for T seconds (max-age or
// s-maxage, RFC 9111, dossier S22).
//
// One copy serves about r x T hits after the miss that fetched it, so
//   miss rate per edge = 1 / (1 + r x T)
//   origin requests a second, no shield = E x r / (1 + r x T)
// With a shield, the edges' misses go to the shield first (a a second); it
// keeps its own copy for T, so the origin gets a / (1 + a x T).
// The oldest page a shopper can see is about T, or about 2 x T with a shield
// (the edge copy can be nearly T old when it was fetched from a shield copy
// that was already nearly T old). Derived for the course; origin shield
// needs a source in the chapter.

export const EDGES = 20;
export const T_MIN = 1;
export const T_MAX = 3600;
export const T_SNAPS = [10, 60, 300, 3600] as const;
export const R_MIN = 0.1;
export const R_MAX = 100;
export const R_SNAPS = [1, 5, 50] as const;
export const DEFAULT_T = 60;
export const DEFAULT_R = 5;

export type CdnLoad = {
  /** Per-edge hit rate, 0 to 1. */
  hitRate: number;
  /** Requests a second that all edges send to the shield, or to the origin when there is no shield. */
  edgeMisses: number;
  /** Requests a second the origin receives. */
  originPerSecond: number;
  originPerMinute: number;
  /** The shield's own hit rate (0 to 1), or null with no shield. */
  shieldHitRate: number | null;
  /** Worst-case age of a page a shopper sees, in seconds. */
  oldestSeconds: number;
  verdict: string;
  tone: Tone;
};

export function cdnLoad(t: number, r: number, shield: boolean): CdnLoad {
  const T = clamp(t, T_MIN, T_MAX);
  const rate = clamp(r, R_MIN, R_MAX);
  const missRate = 1 / (1 + rate * T);
  const edgeMisses = EDGES * rate * missRate;
  const originPerSecond = shield ? edgeMisses / (1 + edgeMisses * T) : edgeMisses;
  const originPerMinute = originPerSecond * 60;
  const oldestSeconds = shield ? 2 * T : T;
  let verdict: string;
  let tone: Tone;
  if (shield && T > 300) {
    verdict = "Fewer fetches, older pages";
    tone = "warn";
  } else if (originPerMinute < 5) {
    verdict = "Origin barely notices the traffic";
    tone = "good";
  } else if (originPerMinute <= 60) {
    verdict = "About one fetch per edge per TTL";
    tone = "accent";
  } else {
    verdict = "Short lifetime: origin works hard";
    tone = "warn";
  }
  return {
    hitRate: 1 - missRate,
    edgeMisses,
    originPerSecond,
    originPerMinute,
    shieldHitRate: shield ? 1 - originPerSecond / edgeMisses : null,
    oldestSeconds,
    verdict,
    tone,
  };
}

/** Seconds as the picture prints them: 45 s, 1 min, 1.5 min, 1 hour, 2 hours. */
export function formatSeconds(s: number): string {
  const v = Math.round(s);
  if (v < 60) return `${v} s`;
  if (v < 3600) {
    const m = Math.round((v / 60) * 10) / 10;
    return `${m} min`;
  }
  const h = Math.round((v / 3600) * 10) / 10;
  return `${h} ${h === 1 ? "hour" : "hours"}`;
}

export function formatRate(r: number): string {
  const v = r < 1 ? Math.round(r * 10) / 10 : Math.round(r);
  return `${v} a second`;
}

export function formatPerMinute(p: number): string {
  if (p >= 10) return `${withCommas(p)} a minute`;
  if (p >= 1) return `${(Math.round(p * 10) / 10).toFixed(1)} a minute`;
  if (p >= 0.1) return `${(Math.round(p * 100) / 100).toFixed(2)} a minute`;
  return "<0.1 a minute";
}

/** A hit rate in percent. Never prints 100.0% for a rate below 1. */
export function formatHit(h: number): string {
  const p = Math.round(h * 1000) / 10;
  return p >= 100 ? "99.9%+" : `${p.toFixed(1)}%`;
}

const logFraction = (v: number, lo: number, hi: number) => clamp(Math.log10(v / lo) / Math.log10(hi / lo), 0, 1);
export const tFraction = (t: number) => logFraction(t, T_MIN, T_MAX);
export const rFraction = (r: number) => logFraction(r, R_MIN, R_MAX);

/** Round to two significant figures. */
const two = (v: number) => {
  const d = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return Math.round(v / d) * d;
};

function fromFraction(f: number, lo: number, hi: number, snaps: readonly number[]): number {
  const raw = lo * Math.pow(hi / lo, clamp(f, 0, 1));
  for (const s of snaps) if (Math.abs(Math.log10(raw / s)) < 0.04) return s;
  return clamp(Math.round(two(raw) * 1000) / 1000, lo, hi);
}
export const tFromFraction = (f: number) => {
  const v = fromFraction(f, T_MIN, T_MAX, T_SNAPS);
  return Math.round(v);
};
export const rFromFraction = (f: number) => fromFraction(f, R_MIN, R_MAX, R_SNAPS);

/** Values the arrow keys step through. */
export const T_LADDER: readonly number[] = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 300, 600, 900, 1200, 1800, 2400, 3600];
export const R_LADDER: readonly number[] = [0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 100];

/** Fetch dots a second drawn for a real rate of fetches a minute: more fetches, more dots, but squeezed so a trickle still moves. */
export function fetchDotRate(perMinute: number): number {
  return clamp(0.12 + 0.55 * Math.sqrt(Math.max(0, perMinute)), 0.12, 6);
}

/** Which of the drawn edges fetch number n comes from (0 to count - 1). */
export const sourceEdge = (n: number, count = 3) => Math.min(count - 1, Math.floor(spread(n + 3) * count));
