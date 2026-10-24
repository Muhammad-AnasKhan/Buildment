// Clocks a node can carry. "True time" is the simulation's virtual clock,
// which no real node can read. Each model here says what a node would read.

/** A physical clock: a fixed offset plus drift in parts per million. */
export type PhysicalClock = { offsetMs: number; driftPpm: number };

/** What a physical clock reads at true time `trueMs`. */
export function readPhysical(clock: PhysicalClock, trueMs: number): number {
  return trueMs + clock.offsetMs + (trueMs * clock.driftPpm) / 1_000_000;
}

/**
 * A TrueTime-style reading: the clock does not return one number but a range
 * that is guaranteed to contain true time, given the node's current error
 * `errorMs` (how far its clock is off) and its uncertainty bound `epsilonMs`.
 * The model requires |errorMs| <= epsilonMs; larger errors are clamped.
 */
export type TimeInterval = { earliest: number; latest: number };

export function trueTimeNow(trueMs: number, errorMs: number, epsilonMs: number): TimeInterval {
  const eps = Math.max(0, epsilonMs);
  const error = Math.max(-eps, Math.min(eps, errorMs));
  const reading = trueMs + error;
  return { earliest: reading - eps, latest: reading + eps };
}

/** Two ranges overlap when neither ends before the other starts. */
export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.earliest <= b.latest && b.earliest <= a.latest;
}

/** Lamport clock: on a local event or send, add one; on receive, take the max and add one. */
export function lamportTick(local: number, received?: number): number {
  return Math.max(local, received ?? -Infinity) + 1;
}

/** Vector clock comparison: before, after, equal or concurrent. */
export type VectorOrder = "before" | "after" | "equal" | "concurrent";

export function compareVectors(a: readonly number[], b: readonly number[]): VectorOrder {
  const n = Math.max(a.length, b.length);
  let less = false;
  let more = false;
  for (let i = 0; i < n; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x < y) less = true;
    if (x > y) more = true;
  }
  if (less && more) return "concurrent";
  if (less) return "before";
  if (more) return "after";
  return "equal";
}
