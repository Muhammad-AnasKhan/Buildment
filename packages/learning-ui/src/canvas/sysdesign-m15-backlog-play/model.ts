// 15.2 beat 3: a burst of jobs against a fixed number of workers. A fluid
// model with no randomness: every second the backlog grows by the jobs that
// arrive and shrinks by what the workers finish. The utilisation tone comes
// from the Module 2.5 knee model (serverLoad), so "how busy" means the same
// thing here as in chapter 2.5. Pure, no React.

import type { Tone } from "../primitives/tones";
import { serverLoad } from "../models/server-load";
import { withCommas } from "../models/picture-controls";

export const NORMAL = 150;
export const BURST_FROM = 30;
export const BURST_TO = 90;
export const PER_WORKER = 40;
export const QUEUE_LIMIT = 5000;
/** The chart shows 0 to 420 seconds; the run goes on longer so "empty after" can be found. */
export const HORIZON = 420;
export const RUN_END = 3000;
export const CHART_MAX = 12_000;

export const BURST = { min: 150, max: 400, step: 10, default: 300 } as const;
export const BURST_SNAPS = [150, 200, 250, 300, 350, 400] as const;
export const WORKER_STOPS = [3, 4, 5, 6, 8] as const;
export const WORKERS_DEFAULT = 5;

export const capacityOf = (workers: number) => PER_WORKER * workers;

export function clampBurst(v: number): number {
  if (!Number.isFinite(v)) return BURST.default;
  return Math.max(BURST.min, Math.min(BURST.max, Math.round(v / BURST.step) * BURST.step));
}

export const burstToFraction = (v: number) => (clampBurst(v) - BURST.min) / (BURST.max - BURST.min);

/** A rail position as a burst rate: whole steps of 10, pulled onto a round value when close. */
export function burstFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : burstToFraction(BURST.default);
  const raw = BURST.min + t * (BURST.max - BURST.min);
  for (const s of BURST_SNAPS) if (Math.abs(s - raw) <= 8) return s;
  return clampBurst(raw);
}

export function burstKey(value: number, key: string): number | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return clampBurst(value + BURST.step);
    case "ArrowLeft":
    case "ArrowDown":
      return clampBurst(value - BURST.step);
    case "PageUp":
      return clampBurst(value + 50);
    case "PageDown":
      return clampBurst(value - 50);
    case "Home":
      return BURST.min;
    case "End":
      return BURST.max;
    default:
      return null;
  }
}

export const arrivalsAt = (t: number, burst: number) => (t >= BURST_FROM && t < BURST_TO ? burst : NORMAL);

export type Run = {
  burst: number;
  workers: number;
  capacity: number;
  limit: number | null;
  /** series[t] is the backlog at second t, from 0 to RUN_END. */
  series: number[];
  /** Jobs refused because the queue was full, over the whole run. */
  refused: number;
  /** Highest backlog; for a line that grows for ever, the value at the end of the chart. */
  peak: number;
  /** Seconds after the burst until the line is empty; null when it does not empty. */
  emptyAfter: number | null;
  /** True when capacity is at or below the normal arrivals: the line never shrinks. */
  never: boolean;
  /** Age of the last job in line at the peak, in seconds. */
  oldestWait: number;
};

export function runBacklog(burst: number, workers: number, limit: number | null): Run {
  const b = clampBurst(burst);
  const capacity = capacityOf(workers);
  const series = new Array<number>(RUN_END + 1);
  series[0] = 0;
  let backlog = 0;
  let refused = 0;
  for (let t = 0; t < RUN_END; t++) {
    backlog = Math.max(0, backlog + arrivalsAt(t, b) - capacity);
    if (limit !== null && backlog > limit) {
      refused += backlog - limit;
      backlog = limit;
    }
    series[t + 1] = backlog;
  }
  const never = capacity <= NORMAL;
  const peak = never ? Math.max(...series.slice(0, HORIZON + 1)) : Math.max(...series.slice(0, BURST_TO + 1));
  let emptyAfter: number | null = null;
  if (!never) {
    for (let t = BURST_TO; t <= RUN_END; t++) {
      if (series[t] === 0) {
        emptyAfter = t - BURST_TO;
        break;
      }
    }
  }
  // Refused jobs only count while the chart runs; after that the story is told.
  return { burst: b, workers, capacity, limit, series, refused: never ? sumRefusedTo(b, capacity, limit, HORIZON) : refused, peak, emptyAfter, never, oldestWait: Math.round(peak / capacity) };
}

function sumRefusedTo(burst: number, capacity: number, limit: number | null, end: number): number {
  if (limit === null) return 0;
  let backlog = 0;
  let refused = 0;
  for (let t = 0; t < end; t++) {
    backlog = Math.max(0, backlog + arrivalsAt(t, burst) - capacity);
    if (backlog > limit) {
      refused += backlog - limit;
      backlog = limit;
    }
  }
  return refused;
}

export type Verdict = { text: string; tone: Tone };

export function minutesText(seconds: number): string {
  return `${Math.max(2, Math.round(seconds / 60))} min`;
}

export function verdictFor(run: Run): Verdict {
  if (run.never) return { text: "The line never empties", tone: "bad" };
  if (run.refused > 0) return { text: `Queue full: ${withCommas(run.refused)} jobs refused`, tone: "warn" };
  if (run.peak === 0) return { text: "No line forms", tone: "good" };
  const after = run.emptyAfter ?? RUN_END;
  if (after <= 120) return { text: `Spike absorbed, empty in ${after} s`, tone: "good" };
  return { text: `Line outlives the burst by ${minutesText(after)}`, tone: "warn" };
}

/** The three numbers on the picture. */
export function numbersFor(run: Run): { peak: string; oldest: string; empty: string } {
  if (run.never) return { peak: "growing", oldest: "growing", empty: "never" };
  if (run.peak === 0) return { peak: "0", oldest: "0 s", empty: "no line" };
  const after = run.emptyAfter ?? RUN_END;
  return { peak: withCommas(run.peak), oldest: `${run.oldestWait} s`, empty: `${withCommas(after)} s` };
}

export function valueText(run: Run): string {
  const n = numbersFor(run);
  const limit = run.limit !== null ? `, queue limit ${withCommas(run.limit)}` : "";
  if (run.never) return `burst ${run.burst} jobs per second, ${run.workers} workers${limit}, the line grows for ever and never empties`;
  if (run.peak === 0) return `burst ${run.burst} jobs per second, ${run.workers} workers${limit}, no line forms`;
  return `burst ${run.burst} jobs per second, ${run.workers} workers${limit}, peak ${n.peak}, empty ${run.emptyAfter ?? RUN_END} seconds after the burst`;
}

/** Backlog at a moment (seconds, may be fractional), by straight lines between whole seconds. */
export function backlogAt(run: Run, t: number): number {
  const c = Math.max(0, Math.min(RUN_END, t));
  const i = Math.floor(c);
  const f = c - i;
  return run.series[i] + (i < RUN_END ? (run.series[i + 1] - run.series[i]) * f : 0);
}

/** How busy the workers are at a moment, from the knee model: arrivals against capacity. */
export function busyAt(run: Run, t: number): { busy: number; tone: Tone } {
  const load = serverLoad(arrivalsAt(t, run.burst), run.capacity);
  const waiting = backlogAt(run, t) > 0;
  const busy = waiting ? Math.max(1, load.busy) : load.busy;
  return { busy, tone: busy < 0.8 ? "good" : busy < 1 ? "warn" : "bad" };
}

/** Where the playhead is for a clock reading: a sweep over the chart, then a rest. */
export const SWEEP_S = 12.6;
export const LOOP_S = 15;
export function playhead(seconds: number): number {
  const p = (((seconds % LOOP_S) + LOOP_S) % LOOP_S) / SWEEP_S;
  return Math.min(1, p) * HORIZON;
}
