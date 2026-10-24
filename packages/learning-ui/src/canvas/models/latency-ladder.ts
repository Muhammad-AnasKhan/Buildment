// The latency ladder in human time: stretch time so 1 nanosecond lasts 1
// second, then compare two rungs. Pure functions, no React. The rung data
// (names and values) lives in the slug's data.ts so another course can reuse
// the same model with its own ladder.

export type LatencyRung = {
  id: string;
  /** Name on the ruler, for example "Memory read". */
  name: string;
  /** Subject of the verdict, singular: "Asia trip". */
  short: string;
  /** The rung counted in the verdict, plural: "memory reads". */
  plural: string;
  /** Real time in nanoseconds. */
  ns: number;
};

/** 1 ns of real time becomes 1 second of human time. */
export const HUMAN_SECONDS_PER_NS = 1;

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86_400;
const YEAR = 365 * DAY;
const MONTH = YEAR / 12;

export function humanSeconds(ns: number): number {
  return Math.max(0, ns) * HUMAN_SECONDS_PER_NS;
}

/** One decimal below 10, whole numbers above, never "1.0". */
function short(n: number): string {
  if (n < 10) {
    const r = Math.round(n * 10) / 10;
    return r % 1 === 0 ? String(r) : r.toFixed(1);
  }
  return Math.round(n).toLocaleString("en-US");
}

function unit(n: number, word: string): string {
  const text = short(n);
  return `${text} ${text === "1" ? word : `${word}s`}`;
}

/** Human time in the largest unit that keeps the number at 1 or more. */
export function formatHuman(seconds: number): string {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  if (s < MINUTE) return unit(s, "second");
  if (s < HOUR) return unit(s / MINUTE, "minute");
  if (s < DAY) return unit(s / HOUR, "hour");
  if (s < MONTH) return unit(s / DAY, "day");
  if (s < YEAR) return unit(s / MONTH, "month");
  return unit(s / YEAR, "year");
}

/** Real time with its unit: "100 ns", "250 µs", "160 ms". */
export function formatReal(ns: number): string {
  if (ns < 1_000) return `${short(ns)} ns`;
  if (ns < 1_000_000) return `${short(ns / 1_000)} µs`;
  if (ns < 1_000_000_000) return `${short(ns / 1_000_000)} ms`;
  return `${short(ns / 1_000_000_000)} s`;
}

/** A count in words a learner reads at a glance: "2.5", "800,000", "1.6 million". */
export function formatCount(n: number): string {
  const v = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (v >= 1e9) return `${short(v / 1e9)} billion`;
  if (v >= 1e6) return `${short(v / 1e6)} million`;
  return short(v);
}

export type Comparison = {
  fast: LatencyRung;
  slow: LatencyRung;
  /** How many fast steps fit in one slow step. 1 when the two are the same rung. */
  ratio: number;
  same: boolean;
  verdict: string;
};

/** Compare two rungs: the slower one, counted in the faster one. */
export function compareRungs(a: LatencyRung, b: LatencyRung): Comparison {
  const same = a.id === b.id;
  const [fast, slow] = a.ns <= b.ns ? [a, b] : [b, a];
  const ratio = fast.ns > 0 ? slow.ns / fast.ns : 1;
  const verdict = same ? `${slow.short} = ${formatHuman(humanSeconds(slow.ns))}` : `${slow.short} = ${formatCount(ratio)} ${fast.plural}`;
  return { fast, slow, ratio, same, verdict };
}

/** Where a value sits on a log ruler from min to max, 0 to 1. */
export function logPosition(value: number, min: number, max: number): number {
  if (!(value > 0) || !(min > 0) || !(max > min)) return 0;
  const p = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
  return Math.max(0, Math.min(1, p));
}

/** The rung closest to a position on the ruler. */
export function nearestRung<T extends { ns: number }>(position: number, rungs: readonly T[], min: number, max: number): T {
  let best = rungs[0];
  let gap = Infinity;
  for (const r of rungs) {
    const d = Math.abs(logPosition(r.ns, min, max) - position);
    if (d < gap) {
      gap = d;
      best = r;
    }
  }
  return best;
}

/** The race: the slow trip takes TRIP seconds on screen, then the picture holds. */
export const RACE_TRIP_S = 3.2;
export const RACE_HOLD_S = 1.6;
/** Above this ratio the fast packet is drawn as a stream, not a single dot. */
export const STREAM_RATIO = 12;

export type RaceFrame = {
  /** 0 to 1: how far the slow round trip has gone. */
  progress: number;
  /** How many fast round trips have finished so far. */
  count: number;
  /** 0 to 1: where the fast packet is in its current round trip. */
  fastPhase: number;
  /** Human time passed on the slow trip so far, in seconds. */
  humanElapsed: number;
  holding: boolean;
};

/** One frame of the race. Large `seconds` (reduced motion) gives the finished race. */
export function raceFrame(seconds: number, cmp: Pick<Comparison, "ratio" | "slow">, final = false): RaceFrame {
  const loop = RACE_TRIP_S + RACE_HOLD_S;
  const t = final || !Number.isFinite(seconds) ? loop : Math.max(0, seconds) % loop;
  const progress = Math.min(1, t / RACE_TRIP_S);
  const raw = progress * cmp.ratio;
  return {
    progress,
    count: progress >= 1 ? cmp.ratio : raw,
    fastPhase: progress >= 1 ? 0 : raw % 1,
    humanElapsed: progress * humanSeconds(cmp.slow.ns),
    holding: t >= RACE_TRIP_S,
  };
}

/** Out and back along a track: 0 at the start, 0.5 at the far end, 1 home again. */
export function roundTripAt(phase: number): number {
  const p = Math.max(0, Math.min(1, phase));
  return p <= 0.5 ? p * 2 : 2 - p * 2;
}
