import type { Tone } from "../primitives/tones";

// 13.5 beat 3: last write wins compares timestamps. Write 1 happens on node A
// at real time 20 ms. A's clock is s ms ahead of B's: for the same moment A
// reads 20 + s/2 and B reads 20 - s/2. Write 2 happens on node B g ms after
// write 1. stamp1 = 20 + s/2; stamp2 = 20 + g - s/2, so write 2 has the larger
// stamp exactly when g > s (a tie when g = s). Concurrent writes always lose
// one, whatever the clocks say. Pure, no React.

export const WRITE_1_AT = 20;
export const PAIRS = 20;
export const SKEWS = [0, 2, 5, 10, 15, 20, 30] as const;
export const SKEW_MAX = 30;
export const GAP_MIN = 1;
export const GAP_MAX = 30;
export const GAPS: readonly number[] = Array.from({ length: GAP_MAX - GAP_MIN + 1 }, (_, i) => GAP_MIN + i);
export const DEFAULT_SKEW = 20;
export const DEFAULT_GAP = 5;

export type Mode = "sequential" | "concurrent";

export function stamps(skew: number, gap: number): { stamp1: number; stamp2: number } {
  return { stamp1: WRITE_1_AT + skew / 2, stamp2: WRITE_1_AT + gap - skew / 2 };
}

export type Result = "right" | "wrong" | "tie" | "lost";

/** What last write wins does with one pair. Sequential: the second client saw the first write finish. */
export function resultOf(skew: number, gap: number, mode: Mode): Result {
  if (mode === "concurrent") return "lost";
  if (gap > skew) return "right";
  if (gap < skew) return "wrong";
  return "tie";
}

/** Which write the store keeps: 1 or 2 (a tie goes to the tie rule, shown as 0). */
export function winner(skew: number, gap: number): 0 | 1 | 2 {
  const { stamp1, stamp2 } = stamps(skew, gap);
  return stamp1 === stamp2 ? 0 : stamp2 > stamp1 ? 2 : 1;
}

/** The 20 pairs, with gaps 1 to 20 ms. */
export function pairResults(skew: number, mode: Mode): { gap: number; result: Result }[] {
  return Array.from({ length: PAIRS }, (_, i) => ({ gap: i + 1, result: resultOf(skew, i + 1, mode) }));
}

export function counts(skew: number, mode: Mode): { wrong: number; ties: number } {
  const rs = pairResults(skew, mode);
  return { wrong: rs.filter((r) => r.result === "wrong" || r.result === "lost").length, ties: rs.filter((r) => r.result === "tie").length };
}

export function verdict(skew: number, gap: number, mode: Mode): { text: string; tone: Tone } {
  switch (resultOf(skew, gap, mode)) {
    case "lost":
      return { text: "Concurrent: one of the two is lost", tone: "bad" };
    case "right":
      return { text: "The later write wins: correct", tone: "good" };
    case "tie":
      return { text: "Equal stamps: the tie rule decides", tone: "warn" };
    default:
      return { text: "Later write lost: its clock ran slow", tone: "bad" };
  }
}

export function counterText(skew: number, mode: Mode): string {
  const { wrong } = counts(skew, mode);
  return mode === "concurrent" ? `${wrong} of ${PAIRS} pairs lose a write` : `${wrong} of ${PAIRS} pairs have the wrong winner`;
}

export const formatMs = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(1));

// ---------- The rails ----------

export function skewFromFraction(f: number): number {
  const target = (Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0) * SKEW_MAX;
  return SKEWS.reduce((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), SKEWS[0] as number);
}
export const skewToFraction = (s: number): number => Math.max(0, Math.min(1, s / SKEW_MAX));

export function gapFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  return GAP_MIN + Math.round(t * (GAP_MAX - GAP_MIN));
}
export const gapToFraction = (g: number): number => Math.max(0, Math.min(1, (g - GAP_MIN) / (GAP_MAX - GAP_MIN)));

// ---------- Layout helpers (pure, so a test can check tags never overlap) ----------

/**
 * Centres for two labels of width w that want to sit at a and b: pushed apart
 * to leave a gap of 4, kept inside [lo, hi], and in the same left-to-right
 * order as a and b.
 */
export function spreadPair(a: number, b: number, w: number, lo: number, hi: number): [number, number] {
  const clamp = (v: number) => Math.max(lo + w / 2, Math.min(hi - w / 2, v));
  const need = w + 4;
  const aFirst = a <= b;
  const left = clamp(aFirst ? a : b);
  const right = clamp(aFirst ? b : a);
  if (right - left >= need) return aFirst ? [left, right] : [right, left];
  const mid = (a + b) / 2;
  let l = mid - need / 2;
  let r = mid + need / 2;
  if (l < lo + w / 2) {
    r += lo + w / 2 - l;
    l = lo + w / 2;
  }
  if (r > hi - w / 2) {
    l -= r - (hi - w / 2);
    r = hi - w / 2;
  }
  return aFirst ? [l, r] : [r, l];
}
