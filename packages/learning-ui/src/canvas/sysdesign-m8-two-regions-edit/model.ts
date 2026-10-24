// 8.6 beat 2: two regions edit one document. The EU edit happens at t = 0. A
// copy takes 80 ms one way, half of the 160 ms EU West to Singapore round trip
// [S3]. The Singapore edit happens at t = b.
//
//   conflict  <=>  |b| < 80 ms (neither leader had the other's edit)
//   last writer wins: the edit with the larger timestamp is kept; at b = 0 the
//   tie goes to the region name, EU.

export const COPY_MS = 80;
export const B_MIN = -150;
export const B_MAX = 150;
export const B_STEP = 5;
export const B_DEFAULT = 12;
/** Marks on the rail. All are multiples of the 5 ms step, so a drag can land exactly on them. */
export const SNAPS = [-80, 0, 80] as const;
export const AXIS = { from: -150, to: 250 } as const;

export const B_LADDER: readonly number[] = Array.from({ length: (B_MAX - B_MIN) / B_STEP + 1 }, (_, i) => B_MIN + i * B_STEP);

export function clampB(value: number): number {
  if (!Number.isFinite(value)) return B_DEFAULT;
  return Math.max(B_MIN, Math.min(B_MAX, Math.round(value / B_STEP) * B_STEP));
}

export function bFromFraction(f: number): number {
  const t = Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0));
  return clampB(B_MIN + t * (B_MAX - B_MIN));
}

export function bToFraction(b: number): number {
  const v = Number.isFinite(b) ? Math.max(B_MIN, Math.min(B_MAX, b)) : B_DEFAULT;
  return (v - B_MIN) / (B_MAX - B_MIN);
}

export type Rule = "none" | "lww";

export type Edit = { region: "EU" | "SG"; at: number };

export type Outcome = {
  b: number;
  conflict: boolean;
  /** When each edit's copy lands in the other region. */
  euCopyLandsAt: number;
  sgCopyLandsAt: number;
  /** The edit last-writer-wins keeps, and the one it drops; null when there is no conflict or no rule. */
  kept: "EU" | "SG" | null;
  dropped: "EU" | "SG" | null;
};

/** The default is 12 ms, the chapter's worked value, so the model keeps any value in range, not only 5 ms steps. */
export function twoRegions(bIn: number, rule: Rule): Outcome {
  const b = Number.isFinite(bIn) ? Math.max(B_MIN, Math.min(B_MAX, bIn)) : B_DEFAULT;
  const conflict = Math.abs(b) < COPY_MS;
  let kept: "EU" | "SG" | null = null;
  if (conflict && rule === "lww") kept = b > 0 ? "SG" : "EU";
  return {
    b,
    conflict,
    euCopyLandsAt: COPY_MS,
    sgCopyLandsAt: b + COPY_MS,
    kept,
    dropped: kept === null ? null : kept === "SG" ? "EU" : "SG",
  };
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

export function editVerdict(o: Outcome, rule: Rule): Verdict {
  if (!o.conflict) return { text: "Second edit saw the first: no clash", tone: "good" };
  if (rule === "lww") return { text: "Later edit kept; the other is lost", tone: "bad" };
  return { text: "Concurrent: neither saw the other", tone: "warn" };
}

export function signedMs(b: number): string {
  return b > 0 ? `+${b} ms` : b < 0 ? `-${Math.abs(b)} ms` : "0 ms";
}

/** Seconds the time cursor takes to sweep the axis, and the pause at the end. */
export const SWEEP_SECONDS = 5;
export const HOLD_SECONDS = 1.4;

/** Where the sweeping cursor is on the time axis, in ms; reduced motion (a huge clock) shows the end. */
export function cursorT(seconds: number): number {
  const span = AXIS.to - AXIS.from;
  if (!Number.isFinite(seconds) || seconds >= 1e5) return AXIS.to;
  const cycle = SWEEP_SECONDS + HOLD_SECONDS;
  const c = ((seconds % cycle) + cycle) % cycle;
  return AXIS.from + Math.min(1, c / SWEEP_SECONDS) * span;
}
