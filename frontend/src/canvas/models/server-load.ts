import type { Tone } from "../primitives/tones";

// Load on one server, as the M/M/1 queue sees it: random arrivals, random
// service times, one server. Used by 1.1 (launch day: students drive the
// load) and 2.5 (the knee: requests a second drive it). Pure, no React.
//
// busy (rho)      = arrivals / capacity
// time in system  = service time / (1 - busy)      (W, waiting plus work)
// number inside   = busy / (1 - busy)              (L, waiting plus in service)
// Little's law    L = arrivals x W holds for every steady state below 100%.
// At or past 100% there is no steady state: the line grows by
// (arrivals - capacity) every second.

export const SERVICE_MS = 10;
export const CAPACITY_PER_SEC = 1000 / SERVICE_MS;
export const REQUESTS_PER_STUDENT = 0.05;

export type Load = {
  /** Requests arriving a second. */
  arrivals: number;
  /** Share of time the server works; may pass 1. */
  busy: number;
  /** Average time per request, waiting plus work, in ms. Infinity past 100%. */
  timeMs: number;
  /** Average number of requests inside (waiting plus in service). Infinity past 100%. */
  inside: number;
  /** How fast the line grows past 100%, requests a second; 0 below it. */
  growthPerSec: number;
  steady: boolean;
};

export function serverLoad(arrivals: number, capacity = CAPACITY_PER_SEC): Load {
  const a = Number.isFinite(arrivals) ? Math.max(0, arrivals) : 0;
  const mu = Number.isFinite(capacity) && capacity > 0 ? capacity : CAPACITY_PER_SEC;
  const busy = a / mu;
  const steady = busy < 1;
  return {
    arrivals: a,
    busy,
    timeMs: steady ? 1000 / mu / (1 - busy) : Infinity,
    inside: steady ? busy / (1 - busy) : Infinity,
    growthPerSec: steady ? 0 : a - mu,
    steady,
  };
}

/** M/M/1 time per request at a given busy share, for drawing the curve. */
export function timeAtBusy(busy: number, serviceMs = SERVICE_MS): number {
  return busy < 1 ? serviceMs / (1 - Math.max(0, busy)) : Infinity;
}

/**
 * How many request dots a second the picture draws. One dot stands for many
 * requests, so this is a gentle, rising function of how busy the server is,
 * capped so the lane never turns into a solid bar.
 */
export function flowDotsPerSecond(busy: number): number {
  if (!Number.isFinite(busy) || busy <= 0) return 0;
  return Math.min(MAX_FLOW_DOTS, 0.4 + 5.5 * Math.pow(busy, 0.6));
}
export const MAX_FLOW_DOTS = 9;

// ---------- Formatting ----------

export const formatCount = (n: number) => Math.round(n).toLocaleString("en-US");

export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "no limit";
  if (ms < 20 && Math.round(ms * 10) % 10 !== 0) return `${(Math.round(ms * 10) / 10).toFixed(1)} ms`;
  return `${formatCount(ms)} ms`;
}

/**
 * The words by the curve's dot: the time per request, or past 100% how fast
 * the line grows. At exactly 100% the line has no steady length but no fixed
 * growth either (it wanders up without limit), so it says "no limit".
 */
export function loadTimeLabel(load: Load): string {
  if (load.steady) return formatMs(load.timeMs);
  return load.growthPerSec > 0 ? `line grows ${formatCount(load.growthPerSec)}/s` : "no limit";
}

/** Two significant figures, without trailing zeros: 0.011, 0.33, 9, 99, 1,000. */
export function twoFigures(v: number): string {
  if (!Number.isFinite(v)) return "no limit";
  if (v === 0) return "0";
  const digits = Math.floor(Math.log10(Math.abs(v)));
  const factor = Math.pow(10, digits - 1);
  const rounded = Math.round(v / factor) * factor;
  if (rounded >= 100) return formatCount(rounded);
  return String(Number(rounded.toFixed(Math.max(0, 1 - digits))));
}

// ---------- 1.1 launch day: students drive the load ----------

export const STUDENTS = { min: 10, max: 100_000, default: 1000 } as const;
/** Values the picture likes to land on: the chapter's table rows. */
export const STUDENT_SNAPS = [100, 1000, 1800, 10_000] as const;
/** Arrow keys walk this ladder, which slows down around the knee. */
export const STUDENT_LADDER = [10, 20, 50, 100, 200, 500, 1000, 1500, 1800, 1900, 2000, 5000, 10_000, 20_000, 50_000, 100_000] as const;

const LOG_MIN = Math.log10(STUDENTS.min);
const LOG_SPAN = Math.log10(STUDENTS.max) - LOG_MIN;

export function clampStudents(v: number): number {
  if (!Number.isFinite(v)) return STUDENTS.default;
  return Math.max(STUDENTS.min, Math.min(STUDENTS.max, Math.round(v)));
}

/** Where a student count sits on the log rail, 0 to 1. */
export function studentsToFraction(v: number): number {
  return (Math.log10(clampStudents(v)) - LOG_MIN) / LOG_SPAN;
}

/** A point on the log rail as a round student count, snapping to the chapter's rows. */
export function studentsFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : studentsToFraction(STUDENTS.default);
  const log = LOG_MIN + t * LOG_SPAN;
  for (const s of STUDENT_SNAPS) if (Math.abs(Math.log10(s) - log) < 0.02) return s;
  return clampStudents(Number(Math.pow(10, log).toPrecision(2)));
}

export type LaunchDay = Load & {
  students: number;
  tone: Tone;
  verdict: string;
  /** Number of person glyphs in the crowd, 3 at 10 students to 56 at 100,000. */
  crowd: number;
};

export function launchDay(students: number): LaunchDay {
  const s = clampStudents(students);
  const load = serverLoad(s * REQUESTS_PER_STUDENT);
  const tone: Tone = load.busy < 0.7 ? "good" : load.busy < 1 ? "warn" : "bad";
  const verdict =
    load.busy < 0.3
      ? "Fast: the server is mostly idle"
      : load.busy < 0.7
        ? "Fine: pages wait a little"
        : load.busy < 1
          ? "Slower: requests wait in line"
          : "Overloaded: pages time out";
  const crowd = Math.round(3 + 4 * Math.log2(s / STUDENTS.min));
  return { ...load, students: s, tone, verdict, crowd };
}

// ---------- 2.5 the knee: requests a second drive the load ----------

export const ARRIVALS = { min: 10, max: 120, default: 50 } as const;
export const ARRIVAL_SNAPS = [50, 90] as const;
export const ARRIVAL_LADDER: readonly number[] = Array.from({ length: ARRIVALS.max - ARRIVALS.min + 1 }, (_, i) => ARRIVALS.min + i);

export function clampArrivals(v: number): number {
  if (!Number.isFinite(v)) return ARRIVALS.default;
  return Math.max(ARRIVALS.min, Math.min(ARRIVALS.max, Math.round(v)));
}

export const arrivalsToFraction = (v: number) => (clampArrivals(v) - ARRIVALS.min) / (ARRIVALS.max - ARRIVALS.min);

export function arrivalsFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : arrivalsToFraction(ARRIVALS.default);
  const v = ARRIVALS.min + t * (ARRIVALS.max - ARRIVALS.min);
  for (const s of ARRIVAL_SNAPS) if (Math.abs(s - v) < 1.5) return s;
  return clampArrivals(v);
}

export type Knee = Load & {
  tone: Tone;
  verdict: string;
  /** Little's law with the live numbers, for example "9 = 90/s × 0.1 s". */
  little: string;
};

export function kneePlay(arrivals: number): Knee {
  const load = serverLoad(clampArrivals(arrivals));
  const tone: Tone = load.busy < 0.8 ? "good" : load.busy < 0.95 ? "warn" : "bad";
  const verdict =
    load.busy < 0.5
      ? "Calm: requests rarely wait"
      : load.busy < 0.8
        ? "Fine: a short line forms"
        : load.busy < 1
          ? "Past the knee: the wait explodes"
          : "Over 100%: the line never ends";
  const little = load.steady
    ? `${twoFigures(load.inside)} = ${formatCount(load.arrivals)}/s × ${twoFigures(load.timeMs / 1000)} s`
    : "no steady state";
  return { ...load, tone, verdict, little };
}

// ---------- Motion: request dots in the lane ----------

/** Slots per second in the fixed stream that request dots are thinned from. */
export const FLOW_SLOTS = 12;

/** A deterministic number in [0, 1) for slot n, so the picture is the same on every render. */
export function unitHash(n: number, salt = 0): number {
  let t = (Math.imul(n | 0, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b)) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Request dots in flight at time `seconds`, as progress 0 to 1 along the lane.
 * Dots come from a fixed stream of slots, each kept with chance
 * rate / FLOW_SLOTS, so they arrive at random, at the rate the model sets, and
 * changing the rate never makes the dots jump.
 */
export function flowDots(seconds: number, dotsPerSecond: number, travel = 1.1): { id: number; progress: number }[] {
  if (!Number.isFinite(seconds) || dotsPerSecond <= 0) return [];
  const keep = Math.min(1, dotsPerSecond / FLOW_SLOTS);
  const slot = 1 / FLOW_SLOTS;
  const out: { id: number; progress: number }[] = [];
  const last = Math.floor(seconds / slot);
  const first = Math.floor((seconds - travel) / slot) - 1;
  for (let n = first; n <= last; n++) {
    if (unitHash(n, 1) >= keep) continue;
    const born = n * slot + unitHash(n, 2) * slot * 0.8;
    const age = seconds - born;
    if (age >= 0 && age <= travel) out.push({ id: n, progress: age / travel });
  }
  return out;
}
