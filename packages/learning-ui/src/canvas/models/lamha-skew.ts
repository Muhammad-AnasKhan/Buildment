import type { Tone } from "../primitives/tones";
import { ORIGIN_BUDGET_TBIT, PEAK_SENT_TBIT } from "./lamha-numbers";

// 27.4 "Drag the skew, watch the origin". Views follow a Zipf shape: the video
// ranked r gets views in proportion to 1 / r^s. The edge keeps the C
// most-watched videos, so its hit rate is the share of all views that belong
// to the top C:  hit = H(C, s) / H(N, s),  H(n, s) = sum of r^-s, r = 1..n.
// H is exact up to K = 100,000; beyond that it adds the integral of x^-s from
// K to n (a natural log of n / K for s = 1) and the Euler-Maclaurin terms
//   (n^-s - K^-s) / 2 + s / 12 x (K^(-s-1) - n^(-s-1)).
// Origin = 12.5 x (1 - hit) Tbit/s. No random number at play time. Pure, no React.

export const CATALOGUE = 1_000_000_000;
export const SKEW_STOPS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3] as const;
export const SKEW_DEFAULT = 1.0;
export const CACHE_STOPS = [100_000, 1_000_000, 10_000_000, 100_000_000] as const;
export const CACHE_DEFAULT = 1_000_000;
export const EXACT_UP_TO = 100_000;

const exactCache = new Map<number, number>();

/** H(n, s) by plain summation, smallest terms first for accuracy. */
export function harmonicExact(n: number, s: number): number {
  let sum = 0;
  for (let r = n; r >= 1; r--) sum += Math.pow(r, -s);
  return sum;
}

function exactAtK(s: number): number {
  let v = exactCache.get(s);
  if (v === undefined) {
    v = harmonicExact(EXACT_UP_TO, s);
    exactCache.set(s, v);
  }
  return v;
}

/** H(n, s): exact up to 100,000, then the integral plus the Euler-Maclaurin terms. */
export function harmonic(n: number, s: number): number {
  const K = EXACT_UP_TO;
  if (n <= K) return n === K ? exactAtK(s) : harmonicExact(n, s);
  const integral = s === 1 ? Math.log(n / K) : (Math.pow(n, 1 - s) - Math.pow(K, 1 - s)) / (1 - s);
  const correction = (Math.pow(n, -s) - Math.pow(K, -s)) / 2 + (s / 12) * (Math.pow(K, -s - 1) - Math.pow(n, -s - 1));
  return exactAtK(s) + integral + correction;
}

export const hitRate = (cache: number, skew: number) => harmonic(cache, skew) / harmonic(CATALOGUE, skew);

export type Skew = {
  skew: number;
  cache: number;
  /** Share of plays answered at the edge, 0 to 1. */
  hit: number;
  /** Origin load at peak, Tbit/s. */
  origin: number;
  /** Origin load against the 1 Tbit/s budget. */
  timesBudget: number;
};

export function skewPlay(skew: number, cache: number): Skew {
  const hit = hitRate(cache, skew);
  const origin = PEAK_SENT_TBIT * (1 - hit);
  return { skew, cache, hit, origin, timesBudget: origin / ORIGIN_BUDGET_TBIT };
}

export const percentText = (hit: number) => `${(Math.round(hit * 1000) / 10).toFixed(1)}%`;

/** Whole percent for the label on the shaded part: "68%". */
export const wholePercent = (hit: number) => `${Math.round(hit * 100)}%`;

export function originText(tbit: number): string {
  return tbit < 10 ? tbit.toFixed(2) : tbit.toFixed(1);
}

export const cacheText = (n: number) => (n >= 1e6 ? `${n / 1e6} million` : `${n / 1e3} thousand`);

export type Verdict = { text: string; tone: Tone };

/** At most 38 characters. */
export function skewVerdict(m: Skew): Verdict {
  if (m.origin <= ORIGIN_BUDGET_TBIT) return { text: "Origin under its 1 Tbit/s budget", tone: "good" };
  const oneDecimal = (Math.round(m.origin * 10) / 10).toFixed(1);
  const n = oneDecimal === "1.0" ? m.origin.toFixed(2) : oneDecimal;
  return { text: `Origin sends ${n} Tbit/s: over budget`, tone: m.origin <= 3 ? "warn" : "bad" };
}

export function valueText(m: Skew): string {
  const times = m.timesBudget <= 1 ? "under its budget" : `${Math.round(m.timesBudget * 10) / 10} times its budget`;
  return `skew ${m.skew.toFixed(1)}, cache of ${cacheText(m.cache)} videos, ${(Math.round(m.hit * 1000) / 10).toFixed(1)} percent of plays answered at the edge, the origin sends ${originText(m.origin)} terabits a second, ${times}`;
}

/** The popularity line of rank r against rank 1, in decades below the top: s x log10(r). */
export const decadesBelowTop = (rank: number, skew: number) => skew * Math.log10(Math.max(1, rank));

/** Spacing of the dots on the link from the edge to the origin: 1 / (share that misses), in dot slots. */
export const missShare = (m: Skew) => Math.max(0, 1 - m.hit);

/** Dots for a still picture: how many of six requests miss, at least one while the origin is over budget. */
export function stillMissDots(m: Skew): number {
  const n = Math.round(missShare(m) * 6);
  return n === 0 && m.origin > ORIGIN_BUDGET_TBIT ? 1 : n;
}

export const budgetBarShare = (tbit: number) => Math.min(1, tbit / PEAK_SENT_TBIT);
