// 6.5 "Same burst, five limiters": every limiter allows 5 requests a minute.
// Burst A is 5 requests at 0:59, and every limiter allows all of them (each
// starts fresh). Burst B is 5 requests at time b seconds, dragged from 59 to
// 119. How many of burst B each limiter lets in:
//   fixed window    5 if b >= 60 (a new minute window), else 0
//   sliding log     5 if b >= 119 (the entries at 59 leave the log), else 0
//   sliding counter floor(5 (b - 60) / 60) for b >= 60, else 0
//   token bucket    min(5, floor((b - 59) / 12)): one token back every 12 s
//   leaky bucket    drains one request every 12 s and holds 5, including the
//                   one being served: queued = max(0, 4 - floor((b - 59) / 12)),
//                   accepted = 5 - queued; accepted requests wait, not fail.
// Pure, no React.

export type LimiterId = "fixed" | "log" | "counter" | "token" | "leaky";

export const LIMIT = 5;
export const A_AT = 59;
export const B_RANGE = { min: 59, max: 119, default: 60, snaps: [59, 60, 75, 90, 119] } as const;
export const B_LADDER: readonly number[] = Array.from({ length: B_RANGE.max - B_RANGE.min + 1 }, (_, i) => B_RANGE.min + i);
export const DRAIN_S = 12;

export const LIMITERS: readonly { id: LimiterId; name: string }[] = [
  { id: "fixed", name: "Fixed window" },
  { id: "log", name: "Sliding log" },
  { id: "counter", name: "Sliding counter" },
  { id: "token", name: "Token bucket" },
  { id: "leaky", name: "Leaky bucket" },
];

export function clampB(b: number): number {
  if (!Number.isFinite(b)) return B_RANGE.default;
  return Math.max(B_RANGE.min, Math.min(B_RANGE.max, Math.round(b)));
}

/** Requests of burst A the leaky bucket still has waiting when burst B arrives. */
export function leakyQueued(b: number): number {
  return Math.max(0, 4 - Math.floor((clampB(b) - A_AT) / DRAIN_S));
}

/** How many of burst B's 5 requests the limiter accepts. */
export function allowedInB(id: LimiterId, rawB: number): number {
  const b = clampB(rawB);
  switch (id) {
    case "fixed":
      return b >= 60 ? LIMIT : 0;
    case "log":
      return b >= 119 ? LIMIT : 0;
    case "counter":
      return b >= 60 ? Math.floor((LIMIT * (b - 60)) / 60 + 1e-9) : 0;
    case "token":
      return Math.min(LIMIT, Math.floor((b - A_AT) / DRAIN_S));
    case "leaky":
      return LIMIT - leakyQueued(b);
  }
}

/** Seconds each accepted leaky-bucket request of burst B waits, in order: about 12 s times its place in the queue. */
export function leakyDelays(b: number): number[] {
  const queued = leakyQueued(b);
  const accepted = allowedInB("leaky", b);
  return Array.from({ length: accepted }, (_, j) => (queued + j) * DRAIN_S);
}

export type LimiterRow = { id: LimiterId; name: string; accepted: number; refused: number };

export function limiterRows(b: number): LimiterRow[] {
  return LIMITERS.map((l) => {
    const accepted = allowedInB(l.id, b);
    return { id: l.id, name: l.name, accepted, refused: LIMIT - accepted };
  });
}

export type BurstVerdict = { text: string; tone: "good" | "warn" | "bad" };

export function burstVerdict(rawB: number): BurstVerdict {
  const b = clampB(rawB);
  if (b < 60) return { text: "Same window: nobody allows more", tone: "good" };
  if (b < 75) return { text: "Only the fixed window let 10 in", tone: "bad" };
  if (b < 119) return { text: "Others allow only what has expired", tone: "warn" };
  return { text: "A full minute later: all allow 5", tone: "good" };
}

/** Time as m:ss, for labels. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
