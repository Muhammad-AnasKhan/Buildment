// Small pure helpers for controls drawn inside a picture: a handle on a bar,
// a knob on a ruler. Keys, snapping and clamping live here so the component
// only maps a pointer to a fraction.

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));

export type KeyRange = { min: number; max: number; step: number; page: number };

/** The value a slider key moves to, or null if the key is not a slider key. */
export function stepByKey(value: number, key: string, r: KeyRange): number | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return clamp(value + r.step, r.min, r.max);
    case "ArrowLeft":
    case "ArrowDown":
      return clamp(value - r.step, r.min, r.max);
    case "PageUp":
      return clamp(value + r.page, r.min, r.max);
    case "PageDown":
      return clamp(value - r.page, r.min, r.max);
    case "Home":
      return r.min;
    case "End":
      return r.max;
    default:
      return null;
  }
}

/** Pull a dragged value onto a snap point when it is within the tolerance. */
export function snapTo(value: number, snaps: readonly number[], tolerance: number): number {
  let best = value;
  let bestGap = tolerance;
  for (const s of snaps) {
    const gap = Math.abs(s - value);
    if (gap <= bestGap) {
      best = s;
      bestGap = gap;
    }
  }
  return best;
}

/** Round to a step, avoiding float noise (0.1 steps). */
export function roundToStep(value: number, step: number): number {
  const n = Math.round(value / step);
  return Math.round(n * step * 1e6) / 1e6;
}

/** Deterministic 0 to 1 value from a whole number: a low-discrepancy sequence, so a few dots already split in the right proportions. */
export function spread(n: number): number {
  const v = n * 0.6180339887498949;
  return v - Math.floor(v);
}

/** Thousands separators without locale surprises, so the server and the browser print the same text. */
export function withCommas(n: number): string {
  const s = String(Math.round(n));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
