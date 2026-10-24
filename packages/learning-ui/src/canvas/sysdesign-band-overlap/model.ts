// Beat 3 of 10.6: two writes' time bands, each epsilon wide on either side.
// If the bands overlap, the clocks cannot prove which write came first.

export const OVERLAP_AXIS_MS = 40;
export const OVERLAP_EPS = 4;
export const A_CENTER = 16;
export const B_BOUNDS = { min: 2, max: 38, default: 20 } as const;

export type OverlapVerdict = { overlap: [number, number] | null; order: "unknown" | "a-first" | "b-first" };

export function clampB(value: number): number {
  if (!Number.isFinite(value)) return B_BOUNDS.default;
  return Math.max(B_BOUNDS.min, Math.min(B_BOUNDS.max, Math.round(value * 2) / 2));
}

export function bandOverlap(a: number, b: number, eps = OVERLAP_EPS): OverlapVerdict {
  const lo = Math.max(a - eps, b - eps);
  const hi = Math.min(a + eps, b + eps);
  if (lo <= hi) return { overlap: [lo, hi], order: "unknown" };
  return { overlap: null, order: b > a ? "a-first" : "b-first" };
}
