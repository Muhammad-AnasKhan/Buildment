// 10.7 beat 5: a 64-bit ID is a budget. 63 usable bits are split into time,
// worker (machine) and count, and a clock that steps back repeats IDs unless
// the generator remembers its last time. Pure model, no React.

export const TOTAL_BITS = 63;
export const BIT_MIN = 0;
export const BIT_MAX = 16;
/** Snap points on the two bit rails. */
export const BIT_SNAPS = [8, 10, 12] as const;
export const DEFAULT_WORKER = 10;
export const DEFAULT_COUNT = 12;
export const MS_PER_YEAR = 31_557_600_000;
export const MS_PER_DAY = 86_400_000;

/** IDs the generator is asked for each millisecond. */
export const REQUESTS_PER_MS = 20;
/** Steps back the learner can pick, in ms. */
export const STEP_BACKS = [0, 2, 5, 10, 50] as const;
/** The guarded generator waits at most this long before it refuses. */
export const MAX_WAIT_MS = 10;
/** Needed IDs per second the learner can pick. */
export const NEEDS = [1_000, 100_000, 10_000_000, 1_000_000_000] as const;
export const DEFAULT_NEED = 10_000_000;

export type Handling = "trust" | "guard";

export function clampBits(value: number): number {
  if (!Number.isFinite(value)) return BIT_MIN;
  return Math.max(BIT_MIN, Math.min(BIT_MAX, Math.round(value)));
}

/** The fields for a split: t = 63 - w - s. */
export function split(worker: number, count: number) {
  const w = clampBits(worker);
  const s = clampBits(count);
  return { w, s, t: TOTAL_BITS - w - s };
}

export function machines(worker: number): number {
  return 2 ** clampBits(worker);
}

export function idsPerMs(count: number): number {
  return 2 ** clampBits(count);
}

export function fleetPerSecond(worker: number, count: number): number {
  return machines(worker) * idsPerMs(count) * 1000;
}

/** Lifetime in milliseconds of the time field. */
export function lifetimeMs(timeBits: number): number {
  return 2 ** timeBits;
}

export function lifetimeYears(timeBits: number): number {
  return lifetimeMs(timeBits) / MS_PER_YEAR;
}

/** "69.7 years", "1,115 years", "24.9 days". */
export function formatLifetime(timeBits: number): string {
  const years = lifetimeYears(timeBits);
  if (years >= 1000) return `${Math.round(years).toLocaleString("en-US")} years`;
  if (years >= 1) return `${Number(years.toFixed(1))} years`;
  return `${Number((lifetimeMs(timeBits) / MS_PER_DAY).toFixed(1))} days`;
}

/** A whole number with commas: 4,194,304,000. */
export function formatCount(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** A rate in words: "4.2 billion", "262 million", "1 thousand". */
export function shortRate(n: number): string {
  const units: [number, string][] = [
    [1e12, "trillion"],
    [1e9, "billion"],
    [1e6, "million"],
    [1e3, "thousand"],
  ];
  for (const [size, name] of units) {
    if (n >= size) {
      const v = n / size;
      return `${Number((v >= 100 ? Math.round(v) : v).toFixed(1))} ${name}`;
    }
  }
  return String(n);
}

/** IDs the generator makes per millisecond, at most what the count field allows. */
export function requestsPerMs(count: number): number {
  return Math.min(REQUESTS_PER_MS, idsPerMs(count));
}

export type Rollback = {
  stepBackMs: number;
  /** IDs made twice. */
  repeated: number;
  /** Time the guarded generator waits, in ms. */
  waitMs: number;
  /** Requests the guarded generator refuses. */
  refused: number;
};

/**
 * What a clock that reads `stepBackMs` behind true time does. The trusting
 * generator repeats r x R IDs. The guarded one sees a gap of R - 1 ms behind
 * its last time: it waits that long if the gap is at most 10 ms, otherwise it
 * refuses r x (gap - 10) requests and then waits 10 ms.
 */
export function rollback(stepBackMs: number, handling: Handling, count: number = DEFAULT_COUNT): Rollback {
  const r = requestsPerMs(count);
  const R = Math.max(0, stepBackMs);
  if (R === 0) return { stepBackMs: 0, repeated: 0, waitMs: 0, refused: 0 };
  if (handling === "trust") return { stepBackMs: R, repeated: r * R, waitMs: 0, refused: 0 };
  const gap = Math.max(0, R - 1);
  if (gap <= MAX_WAIT_MS) return { stepBackMs: R, repeated: 0, waitMs: gap, refused: 0 };
  return { stepBackMs: R, repeated: 0, waitMs: MAX_WAIT_MS, refused: r * (gap - MAX_WAIT_MS) };
}

export type BitsVerdict = { text: string; tone: "good" | "warn" | "bad" };

/** The banner: the step back if there is one, else whether the split covers the need and lasts. */
export function bitsVerdict(worker: number, count: number, need: number, stepBackMs: number, handling: Handling): BitsVerdict {
  const { t } = split(worker, count);
  if (stepBackMs > 1) {
    const rb = rollback(stepBackMs, handling, count);
    if (handling === "trust") return { text: `Trusting: ${formatCount(rb.repeated)} repeated IDs`, tone: "bad" };
    if (rb.refused > 0) return { text: `Refuses ${formatCount(rb.refused)} requests, no repeats`, tone: "warn" };
    return { text: `Waits ${rb.waitMs} ms, no repeats`, tone: "good" };
  }
  if (fleetPerSecond(worker, count) < need) return { text: "Too few: the count field runs out", tone: "bad" };
  const years = lifetimeYears(t);
  if (years < 10) {
    const text = years >= 1 ? `Time runs out in ${Number(years.toFixed(1))} years` : `Time runs out in ${Math.round(lifetimeMs(t) / MS_PER_DAY)} days`;
    return { text, tone: "bad" };
  }
  return { text: `Enough: ${shortRate(fleetPerSecond(worker, count))} IDs a second`, tone: "good" };
}

/** Which card is in trouble, so the picture can colour it. */
export function cardTones(worker: number, count: number, need: number): { perMs: "good" | "bad"; lifetime: "good" | "bad" } {
  const { t } = split(worker, count);
  return {
    perMs: fleetPerSecond(worker, count) < need ? "bad" : "good",
    lifetime: lifetimeYears(t) < 10 ? "bad" : "good",
  };
}
