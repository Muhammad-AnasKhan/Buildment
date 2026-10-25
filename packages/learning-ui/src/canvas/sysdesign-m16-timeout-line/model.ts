// 16.4 beat 2: the price of a timeout. Latency of a call to Picks is a quantile
// function Q(u), interpolated in log latency between six course points. The
// share of calls slower than a limit T is 1 - F(T), where F is the inverse of
// Q. When Picks hangs every call waits the full limit, so a hang holds
// rate x T workers (Little's law). Pure, no React.

import type { Tone } from "../primitives/tones";

/** (u, ms): the course's latency points for Picks. */
export const POINTS: readonly (readonly [number, number])[] = [
  [0, 15],
  [0.5, 40],
  [0.9, 80],
  [0.99, 250],
  [0.999, 900],
  [1, 3000],
];

export const RATE = 100; // pages a second
export const POOL = 50; // workers in Checkout
export const BAR_COUNT = 50;
export const LIMIT_SNAPS = [50, 100, 150, 250, 400, 500, 600, 900, 1000] as const;
export const LIMIT_DEFAULT = 250;
export const LIMIT_MIN = 50;
export const LIMIT_MAX = 1000;

/** Latency in ms at quantile u (0 to 1), log-linear between the points. */
export function quantile(u: number): number {
  const x = Math.max(0, Math.min(1, u));
  for (let i = 1; i < POINTS.length; i++) {
    const [u1, q1] = POINTS[i];
    if (x <= u1) {
      const [u0, q0] = POINTS[i - 1];
      return q0 * (q1 / q0) ** ((x - u0) / (u1 - u0));
    }
  }
  return POINTS[POINTS.length - 1][1];
}

/** The share of calls that finish within `ms`: the inverse of quantile. */
export function cdf(ms: number): number {
  if (ms <= POINTS[0][1]) return 0;
  if (ms >= POINTS[POINTS.length - 1][1]) return 1;
  for (let i = 1; i < POINTS.length; i++) {
    const [u1, q1] = POINTS[i];
    if (ms <= q1) {
      const [u0, q0] = POINTS[i - 1];
      return u0 + (u1 - u0) * (Math.log(ms / q0) / Math.log(q1 / q0));
    }
  }
  return 1;
}

/** The share of good calls a limit cuts off, 0 to 1. */
export const cutOff = (limitMs: number) => 1 - cdf(limitMs);

/** Workers held when Picks hangs: every call waits the full limit. */
export const heldInHang = (limitMs: number) => (RATE * limitMs) / 1000;

/** Mean time a call to a healthy Picks holds a worker when cut off at the limit (exact integral). */
export function meanHoldMs(limitMs: number): number {
  const f = cdf(limitMs);
  let sum = 0;
  for (let i = 1; i < POINTS.length; i++) {
    const [u1, q1] = POINTS[i];
    const [u0, q0] = POINTS[i - 1];
    if (u0 >= f) break;
    const top = Math.min(u1, f);
    const qTop = q0 * (q1 / q0) ** ((top - u0) / (u1 - u0));
    // Integral of q0 * (q1/q0)^((u-u0)/(u1-u0)) du from u0 to top.
    sum += ((qTop - q0) * (u1 - u0)) / Math.log(q1 / q0);
  }
  return sum + (1 - f) * limitMs;
}

/** Workers busy while Picks is healthy, at the page rate. */
export const busyHealthy = (limitMs: number) => (RATE * meanHoldMs(limitMs)) / 1000;

/** The latency of each of the 50 bars, slowest last. */
export function bars(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => quantile((i + 0.5) / BAR_COUNT));
}

/** 37.1%, 8.2%, 1.0%, 0.67%, 0.09%: one decimal from 1% up, two below. */
export function formatCut(share: number): string {
  const pct = share * 100;
  return `${pct >= 1 ? pct.toFixed(1) : pct.toFixed(2)}%`;
}

/** The percentage inside a verdict: 37%, 8%, 1%, 0.67%. */
function verdictPct(share: number): string {
  const pct = share * 100;
  return pct >= 1 ? String(Math.round(pct)) + "%" : pct.toFixed(2) + "%";
}

export function verdictFor(limitMs: number): { text: string; tone: Tone } {
  const held = heldInHang(limitMs);
  const cut = cutOff(limitMs);
  if (held > POOL) return { text: `A hang takes ${Math.round(held)} of ${POOL} workers`, tone: "bad" };
  if (cut >= 0.05) return { text: `${verdictPct(cut)} of good calls cut off`, tone: "warn" };
  return { text: `${verdictPct(cut)} cut; a hang holds ${Math.round(held)} of ${POOL}`, tone: "good" };
}

export function valueText(limitMs: number): string {
  const pct = (cutOff(limitMs) * 100).toFixed(cutOff(limitMs) >= 0.01 ? 1 : 2);
  return `limit ${limitMs} ms, ${pct} percent of calls cut off, a hang holds ${Math.round(heldInHang(limitMs))} of ${POOL} workers`;
}
