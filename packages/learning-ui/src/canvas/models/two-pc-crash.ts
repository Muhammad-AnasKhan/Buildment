// 14.2 beat "Crash the coordinator at each step": two-phase commit with a
// Stock DB (A) and a Payments DB (B). Pure model, no React. The learner picks
// where the coordinator crashes (five points) and how long it stays down; every
// order needs rows in both databases and orders arrive at 2 a second, so while
// a database is stuck in "prepared" the orders behind it pile up.

export const ORDERS_PER_SECOND = 2;

export type CrashPoint = 0 | 1 | 2 | 3 | 4;
export const CRASH_POINTS: readonly CrashPoint[] = [0, 1, 2, 3, 4];

/** Two short lines under each stop of the strip: what had happened before the crash. */
export const CRASH_LABELS: Record<CrashPoint, readonly [string, string]> = {
  0: ["Nothing", "sent"],
  1: ["Votes", "are in"],
  2: ["Decision", "logged"],
  3: ["Commit to", "Stock only"],
  4: ["Commit to", "both"],
};

export const CRASH_WORDS: Record<CrashPoint, string> = {
  0: "before anything is sent",
  1: "after both voted yes, before the decision is logged",
  2: "after the decision is logged, before it is sent",
  3: "after commit reached Stock only",
  4: "after commit reached both",
};

/** Downtime stops in seconds, log spaced on the rail. */
export const DOWNTIME_SNAPS = [5, 15, 30, 120, 600] as const;
export const DEFAULTS = { point: 1 as CrashPoint, downtime: 15 };

export type DbState = "Working" | "Prepared" | "Committed";
export type Tone = "good" | "warn" | "bad";

export type CrashState = {
  point: CrashPoint;
  downtime: number;
  a: DbState;
  b: DbState;
  /** A database that is prepared holds its locks for the whole downtime. */
  aLocked: boolean;
  bLocked: boolean;
  blocked: boolean;
  /** Payments can ask Stock what was decided. */
  askStock: boolean;
  waiting: number;
  verdict: { text: string; tone: Tone };
};

export function snapDowntime(seconds: number): number {
  let best: number = DOWNTIME_SNAPS[0];
  for (const s of DOWNTIME_SNAPS) if (Math.abs(Math.log(s / seconds)) < Math.abs(Math.log(best / seconds))) best = s;
  return best;
}

export function snapPoint(p: number): CrashPoint {
  const r = Math.round(Number.isFinite(p) ? p : 1);
  return Math.max(0, Math.min(4, r)) as CrashPoint;
}

/** Orders waiting: 2 a second for as long as at least one database is prepared. */
export function ordersWaiting(point: CrashPoint, downtime: number): number {
  return point >= 1 && point <= 3 ? ORDERS_PER_SECOND * downtime : 0;
}

const VERDICTS: Record<CrashPoint, { text: string; tone: Tone }> = {
  0: { text: "Safe: both can abort alone", tone: "good" },
  1: { text: "Both stuck with locks held", tone: "bad" },
  2: { text: "Both stuck until it reads its log", tone: "bad" },
  3: { text: "Payments waits, or asks Stock", tone: "warn" },
  4: { text: "Nothing stuck: both committed", tone: "good" },
};

export function crashState(pointIn: number, downtimeIn: number): CrashState {
  const point = snapPoint(pointIn);
  const downtime = snapDowntime(downtimeIn);
  const a: DbState = point === 0 ? "Working" : point <= 2 ? "Prepared" : "Committed";
  const b: DbState = point === 0 ? "Working" : point <= 3 ? "Prepared" : "Committed";
  return {
    point,
    downtime,
    a,
    b,
    aLocked: a === "Prepared",
    bLocked: b === "Prepared",
    blocked: a === "Prepared" || b === "Prepared",
    askStock: point === 3,
    waiting: ordersWaiting(point, downtime),
    verdict: VERDICTS[point],
  };
}

export function formatDowntime(seconds: number): string {
  return seconds >= 60 ? `${seconds / 60} min` : `${seconds} s`;
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

/** Position of a downtime stop on the rail, 0 to 1, log spaced. */
export function downtimeAt(seconds: number): number {
  const lo = Math.log(DOWNTIME_SNAPS[0]);
  const hi = Math.log(DOWNTIME_SNAPS[DOWNTIME_SNAPS.length - 1]);
  return (Math.log(seconds) - lo) / (hi - lo);
}

/** Dots drawn for a queue: one per order up to a cap, then the rest is a number. */
export const QUEUE_DOT_CAP = 60;
export const queueDots = (waiting: number) => Math.min(QUEUE_DOT_CAP, waiting);
export const queueOverflow = (waiting: number) => Math.max(0, waiting - QUEUE_DOT_CAP);
