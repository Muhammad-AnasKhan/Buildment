// 12.4 beat 3: A holds a 10 s lease with token 33, freezes at 2 s and wakes
// after a pause P. B takes the lock at 10.5 s with token 34 and writes at
// 11 s. A writes the moment it wakes, at 2 + P, still with token 33. Storage
// either accepts every write in arrival order or, with fencing on, keeps the
// highest token seen and rejects a lower one. Pure model, no React.

export const LEASE_S = 10;
export const FREEZE_S = 2;
export const B_LOCK_S = 10.5;
export const B_WRITE_S = 11;
export const TOKEN_A = 33;
export const TOKEN_B = 34;
export const TIMELINE_S = 24;

export const PAUSE = { min: 0, max: 20, step: 0.5, page: 5, default: 14 } as const;
export const PAUSE_SNAPS = [0, 2, 5, 8, 8.5, 9, 12, 14, 20] as const;

export type Who = "A" | "B";
export type FencingKind = "inside" | "late" | "overwrite" | "rejected";
export type Write = { who: Who; at: number; token: number; accepted: boolean };

export type FencingState = {
  pause: number;
  wake: number;
  fencing: boolean;
  kind: FencingKind;
  /** In arrival order; a tie at the same second goes to B first. */
  writes: Write[];
  /** Whose write is in storage at the end. */
  stored: Who;
  /** The highest token storage has seen. */
  highestToken: number;
  verdict: { text: string; tone: "good" | "warn" | "bad" };
};

export const clampPause = (p: number) => {
  const v = Number.isFinite(p) ? p : PAUSE.default;
  return Math.round(Math.max(PAUSE.min, Math.min(PAUSE.max, v)) / PAUSE.step) * PAUSE.step;
};

export const wakeAt = (pause: number) => FREEZE_S + clampPause(pause);

/** The pause as the course writes it: 14 or 8.5. */
export const formatSeconds = (s: number) => (Number.isInteger(s) ? String(s) : s.toFixed(1));

export function fencingState(pauseIn: number, fencing: boolean): FencingState {
  const pause = clampPause(pauseIn);
  const wake = wakeAt(pause);
  const requests: Omit<Write, "accepted">[] = [
    { who: "A", at: wake, token: TOKEN_A },
    { who: "B", at: B_WRITE_S, token: TOKEN_B },
  ].sort((p, q) => p.at - q.at || (p.who === "B" ? -1 : 1)) as Omit<Write, "accepted">[];
  let highest = 0;
  const writes: Write[] = requests.map((q) => {
    const accepted = !fencing || q.token >= highest;
    highest = Math.max(highest, q.token);
    return { ...q, accepted };
  });
  const lastAccepted = [...writes].reverse().find((q) => q.accepted) as Write;
  let kind: FencingKind;
  if (pause <= 8) kind = "inside";
  else if (pause < 9) kind = "late";
  else kind = fencing ? "rejected" : "overwrite";
  const verdict = VERDICTS[kind];
  return { pause, wake, fencing, kind, writes, stored: lastAccepted.who, highestToken: highest, verdict };
}

const VERDICTS: Record<FencingKind, { text: string; tone: "good" | "warn" | "bad" }> = {
  inside: { text: "A woke inside its lease: all fine", tone: "good" },
  late: { text: "Late, but B had not written yet", tone: "warn" },
  overwrite: { text: "A overwrote B's newer write", tone: "bad" },
  rejected: { text: "Token 33 rejected: B's write stands", tone: "good" },
};

/** Slider keys: half a second per arrow, five per Page key. */
export function pauseKey(value: number, key: string): number | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return clampPause(value + PAUSE.step);
    case "ArrowLeft":
    case "ArrowDown":
      return clampPause(value - PAUSE.step);
    case "PageUp":
      return clampPause(value + PAUSE.page);
    case "PageDown":
      return clampPause(value - PAUSE.page);
    case "Home":
      return PAUSE.min;
    case "End":
      return PAUSE.max;
    default:
      return null;
  }
}

/** A dragged position becomes the nearest half second; every snap point sits on that grid. */
export function pauseFromFraction(f: number): number {
  return clampPause(PAUSE.min + Math.max(0, Math.min(1, f)) * (PAUSE.max - PAUSE.min));
}

export const pauseToFraction = (p: number) => (clampPause(p) - PAUSE.min) / (PAUSE.max - PAUSE.min);
