import type { Tone } from "../primitives/tones";
import { withCommas } from "./picture-controls";
import { serverLoad } from "./server-load";
import { AVERAGE_UPLOADS, WORKER_SECONDS_PER_VIDEO } from "./lamha-numbers";

// 27.3 "Drag the uploads, watch the backlog". The transcode line is a fluid
// model with no randomness: a video is one job of 15 worker-minutes (900
// worker-seconds), so W machines finish W / 900 videos a second. The day has
// three hours in one-minute steps: hour 1 at the chosen rate, hours 2 and 3 at
// the average of 5.8 a second. The busy-or-not tone comes from the Module 2.5
// knee model (serverLoad), as in sysdesign-m15-backlog-play. Pure, no React.
//
//   backlog(m) = max(0, backlog(m-1) + (arrivals - capacity) x 60)
//   wait at the end of hour 1 = backlog(60) / capacity, in minutes

export const RATE_STOPS = [5.8, 11.6, 17.4, 26, 35] as const;
export const RATE_DEFAULT = 17.4;
export const MACHINE_STOPS = [4_000, 8_000, 12_000, 16_000, 20_000] as const;
export const MACHINES_DEFAULT = 12_000;

export const BUSY_MINUTES = 60;
export const DAY_MINUTES = 180;
/** The promise: a new video is watchable within this many minutes. */
export const TARGET_MINUTES = 10;

export const capacityOf = (machines: number) => machines / WORKER_SECONDS_PER_VIDEO;
export const arrivalsAt = (minute: number, rate: number) => (minute < BUSY_MINUTES ? rate : AVERAGE_UPLOADS);

export type Run = {
  rate: number;
  machines: number;
  /** Videos finished a second. */
  capacity: number;
  /** series[m] is the backlog (videos) at minute m, 0 to 180. */
  series: number[];
  /** Backlog at the end of the busy hour (minute 60). */
  backlog: number;
  /** backlog / capacity at minute 60, in minutes (not rounded). */
  waitMinutes: number;
  /** The first minute after 60 at which the line is empty; null if never, or if there was no line. */
  emptyAt: number | null;
  /** The line is still above 0 at minute 180. */
  never: boolean;
  /** The line was empty at the end of the busy hour. */
  none: boolean;
  /** Backlog that the 10 minute target allows: 10 x 60 x capacity. */
  targetBacklog: number;
};

const half = (v: number) => Math.round(v * 2) / 2;

export function runBacklog(rate: number, machines: number): Run {
  const capacity = capacityOf(machines);
  const series = new Array<number>(DAY_MINUTES + 1);
  series[0] = 0;
  let backlog = 0;
  for (let m = 1; m <= DAY_MINUTES; m++) {
    backlog = Math.max(0, backlog + (arrivalsAt(m - 1, rate) - capacity) * 60);
    series[m] = backlog;
  }
  const atEnd = series[BUSY_MINUTES];
  const none = half(atEnd) === 0;
  let emptyAt: number | null = null;
  if (!none) {
    for (let m = BUSY_MINUTES + 1; m <= DAY_MINUTES; m++) {
      if (half(series[m]) === 0) {
        emptyAt = m;
        break;
      }
    }
  }
  return {
    rate,
    machines,
    capacity,
    series,
    backlog: atEnd,
    waitMinutes: atEnd / capacity / 60,
    emptyAt,
    never: !none && emptyAt === null,
    none,
    targetBacklog: TARGET_MINUTES * 60 * capacity,
  };
}

export const waitText = (run: Run) => `${Math.round(run.waitMinutes)} min`;

export type Verdict = { text: string; tone: Tone };

/** At most 38 characters. The wait is judged in whole minutes, as it is written. */
export function backlogVerdict(run: Run): Verdict {
  if (run.never) return { text: "Line never empties: add machines", tone: "bad" };
  if (run.none) return { text: "No backlog: watchable at once", tone: "good" };
  const wait = Math.round(run.waitMinutes);
  if (wait <= TARGET_MINUTES) return { text: `Wait of ${wait} min: inside the target`, tone: "good" };
  if (wait < 60) return { text: `Wait of ${wait} min: over the target`, tone: "warn" };
  return { text: `Wait of ${wait} min: far over the target`, tone: "bad" };
}

export function valueText(run: Run): string {
  const rate = `${run.rate} uploads a second, ${withCommas(run.machines)} machines`;
  if (run.none) return `${rate}, no videos waiting after one hour, watchable at once`;
  const empty = run.emptyAt === null ? "the line is not empty within 3 hours" : `empty at minute ${run.emptyAt}`;
  return `${rate}, ${withCommas(run.backlog)} videos waiting after one hour, a wait of ${Math.round(run.waitMinutes)} minutes, ${empty}`;
}

/** Backlog at a minute (may be fractional), by straight lines between whole minutes. */
export function backlogAt(run: Run, minute: number): number {
  const c = Math.max(0, Math.min(DAY_MINUTES, minute));
  const i = Math.floor(c);
  return run.series[i] + (i < DAY_MINUTES ? (run.series[i + 1] - run.series[i]) * (c - i) : 0);
}

/** How busy the machines are at a minute: full while a line waits, else arrivals against capacity (knee model). */
export function busyAt(run: Run, minute: number): { busy: number; tone: Tone } {
  const load = serverLoad(arrivalsAt(minute, run.rate), run.capacity);
  const busy = backlogAt(run, minute) >= 0.5 ? Math.max(1, load.busy) : load.busy;
  return { busy, tone: busy < 0.8 ? "good" : busy < 1 ? "warn" : "bad" };
}

/** Chart top: the smallest round value above the line and the target mark. */
export const Y_STEPS = [10_000, 20_000, 30_000, 50_000, 70_000, 100_000, 150_000, 200_000] as const;
export function chartMax(run: Run): number {
  const top = Math.max(...run.series, run.targetBacklog) * 1.4;
  return Y_STEPS.find((s) => s >= top) ?? Y_STEPS[Y_STEPS.length - 1];
}

/** Where the playhead is for a clock reading: a sweep over the three hours, then a rest. */
export const SWEEP_S = 10;
export const LOOP_S = 12.5;
export function playhead(seconds: number): number {
  const p = (((seconds % LOOP_S) + LOOP_S) % LOOP_S) / SWEEP_S;
  return Math.min(1, p) * DAY_MINUTES;
}

/** "46,640 waiting", or "110k waiting" once past ten thousand, to fit the pill. */
export function waitingText(n: number): string {
  if (n < 0.5) return "empty";
  return n >= 10_000 ? `${Math.round(n / 1000)}k waiting` : `${withCommas(Math.round(n))} waiting`;
}

/** Dots a second into the queue, set by the rate against the top of the rail. */
export const rateShare = (rate: number) => rate / RATE_STOPS[RATE_STOPS.length - 1];
