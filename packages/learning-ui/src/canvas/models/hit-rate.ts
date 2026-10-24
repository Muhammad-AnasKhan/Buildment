import { clamp, spread, withCommas } from "./picture-controls";

// 5.4 "Drag the size, watch the hits". A shop has N = 10,000 products and the
// cache holds the k most popular. With skewed traffic (a Zipf-like law with
// skew s, an assumption the chapter flags) the item of rank i gets a share of
// reads proportional to 1 / i^s, so
//
//   hit rate = H_s(k) / H_s(N),   H_s(n) = sum over i = 1..n of 1 / i^s
//
// s = 0 is even traffic and the hit rate is k / N. A real LRU or LFU cache
// only approximates "the top k" (dossier S27), so it sits a little lower.

export const CATALOGUE = 10_000;
export const K_MIN = 10;
export const K_MAX = CATALOGUE;
export const K_SNAPS = [100, 1000, 2000] as const;
export const SKEW_MAX = 1.2;
export const SKEW_STEP = 0.1;
export const SKEW_SNAPS = [0, 0.8, 1.0] as const;
export const DEFAULT_K = 1000;
export const DEFAULT_SKEW = 1.0;

/** Prefix sums of 1 / i^s: entry n is H_s(n). */
export function zipfPrefix(s: number, n = CATALOGUE): Float64Array {
  const pre = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) pre[i] = pre[i - 1] + (s === 0 ? 1 : Math.pow(i, -s));
  return pre;
}

/** Share of reads (0 to 1) answered when the cache holds the top k products. */
export function hitRate(k: number, pre: Float64Array): number {
  const n = pre.length - 1;
  const kk = Math.max(0, Math.min(n, Math.round(k)));
  return pre[kk] / pre[n];
}

/** Points of hit rate gained by doubling the cache from k (0 to 100). */
export function doublingGain(k: number, pre: Float64Array): number {
  const n = pre.length - 1;
  const kk = Math.max(1, Math.min(n, Math.round(k)));
  return (hitRate(Math.min(n, kk * 2), pre) - hitRate(kk, pre)) * 100;
}

/** One decimal, as the chapter prints it: 76.5%. */
export const percentText = (rate: number) => `${(Math.round(rate * 1000 + 1e-9) / 10).toFixed(1)}%`;

export const itemsText = (k: number) => `${withCommas(k)} ${Math.round(k) === 1 ? "item" : "items"}`;

/** Share of the catalogue as a short percentage: 0.1%, 10%, 100%. */
export function shareText(k: number): string {
  const p = (k / CATALOGUE) * 100;
  return `${p < 1 ? p.toFixed(1) : String(Math.round(p * 10) / 10)}%`;
}

export type HitVerdict = { text: string; tone: "good" | "warn" | "accent" };

export function hitVerdict(k: number, s: number, pre: Float64Array): HitVerdict {
  if (s === 0) return { text: "Even traffic: hits = share cached", tone: "accent" };
  if (doublingGain(k, pre) < 5) return { text: "Past here, more memory buys little", tone: "warn" };
  return { text: "Each extra slot still helps", tone: "good" };
}

/** Position of k on the log rail, 0 to 1. */
export const kFraction = (k: number) => clamp(Math.log10(k / K_MIN) / Math.log10(K_MAX / K_MIN), 0, 1);

/** Cache size at a position on the log rail. Snaps near the chapter's sizes, rounds to 3 figures. */
export function kFromFraction(f: number): number {
  const raw = K_MIN * Math.pow(K_MAX / K_MIN, clamp(f, 0, 1));
  for (const snap of K_SNAPS) if (Math.abs(Math.log10(raw / snap)) < 0.035) return snap;
  const digits = Math.pow(10, Math.floor(Math.log10(raw)) - 1);
  return clamp(Math.round(raw / digits) * digits, K_MIN, K_MAX);
}

/** Sizes the arrow keys step through: about 10 to a decade, plus the snap points. */
export const K_LADDER: readonly number[] = (() => {
  const out = new Set<number>();
  for (const decade of [10, 100, 1000]) for (const m of [1, 1.25, 1.6, 2, 2.5, 3.2, 4, 5, 6.3, 8]) out.add(Math.round(decade * m));
  out.add(K_MAX);
  for (const s of K_SNAPS) out.add(s);
  return [...out].sort((a, b) => a - b);
})();

export type Box = { x: number; y: number; w: number; h: number };

/** Size of a label of this text at 12.5 px bold, with a little room round it. */
export const labelSize = (text: string) => ({ w: Math.round(text.length * 7.6 + 8), h: 18 });
type Pt = { x: number; y: number };

const touches = (b: Box, p: Pt, pad: number) => p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;
const overlaps = (a: Box, b: Box, pad: number) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

/**
 * A spot for a w by h label near an anchor, clear of every curve point, of
 * labels already placed and of the plot's edges. Tries the four diagonals
 * first, then above and below. Null when nothing fits.
 */
export function placeLabel(w: number, h: number, anchor: Pt, curve: readonly Pt[], taken: readonly Box[], bounds: Box, gap = 10, pad = 6): Box | null {
  const options: Pt[] = [
    { x: -w - gap, y: -h - gap },
    { x: gap, y: gap },
    { x: -w - gap, y: gap },
    { x: gap, y: -h - gap },
    { x: -w / 2, y: -h - gap - 6 },
    { x: -w / 2, y: gap + 6 },
  ];
  for (const o of options) {
    const box = { x: anchor.x + o.x, y: anchor.y + o.y, w, h };
    if (box.x < bounds.x || box.y < bounds.y || box.x + w > bounds.x + bounds.w || box.y + h > bounds.y + bounds.h) continue;
    if (curve.some((p) => touches(box, p, pad))) continue;
    if (taken.some((t) => overlaps(box, t, pad))) continue;
    return box;
  }
  // Nothing close by is clear: take the free spot nearest the anchor on a coarse grid.
  let best: Box | null = null;
  let bestGap = Infinity;
  for (let y = bounds.y; y + h <= bounds.y + bounds.h; y += 8) {
    for (let x = bounds.x; x + w <= bounds.x + bounds.w; x += 8) {
      const box = { x, y, w, h };
      if (curve.some((p) => touches(box, p, pad))) continue;
      if (taken.some((t) => overlaps(box, t, pad))) continue;
      const gap = Math.hypot(x + w / 2 - anchor.x, y + h / 2 - anchor.y);
      if (gap < bestGap) {
        best = box;
        bestGap = gap;
      }
    }
  }
  return best;
}

/** The reads strip: whether read number n is a hit, given the hit rate. */
export const readIsHit = (n: number, rate: number) => spread(n + 1) < rate;
