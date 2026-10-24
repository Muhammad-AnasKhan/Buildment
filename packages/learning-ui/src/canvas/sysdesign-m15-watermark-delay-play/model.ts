// 15.6 beat 4: tumbling windows of 60 s over 40 events that arrive out of
// order. The watermark is the newest event time seen so far minus the delay,
// read before each event (the same rule as createAggregator in chapter 15.8).
// An event is dropped when the watermark is at or past its window's end plus
// the allowed lateness. Pure, no React.

import type { Tone } from "../primitives/tones";

/** [event time, arrival time] in seconds, sorted by arrival. */
export const EVENTS: readonly (readonly [number, number])[] = [
  [0, 1.4], [3, 5.6], [6, 8.6], [9, 12], [12, 13.3], [15, 20.4], [21, 22.8], [24, 24.3], [30, 31.9], [18, 32],
  [33, 33.1], [39, 40.3], [36, 42.4], [42, 43.6], [45, 45.5], [57, 59.2], [60, 60.3], [48, 63], [54, 63.8], [63, 66.3],
  [51, 66.9], [69, 69.8], [75, 75.6], [27, 77], [72, 79], [78, 82.5], [81, 83.2], [84, 89], [90, 90.4], [87, 91.4],
  [96, 96.8], [99, 99.8], [102, 102.5], [108, 114.4], [111, 115.7], [105, 116.1], [66, 118], [114, 119.4], [117, 127.4], [93, 153],
];

export const WINDOW_S = 60;
export const WINDOWS = 2;
export const EVENT_SPAN_S = 120;
export const LAST_ARRIVAL_S = 153;
export const MAX_LATE_S = 60;
export const DELAYS = [0, 5, 10, 20, 30, 45, 60] as const;
export const DEFAULT_DELAY = 10;
export const LATENESS_S = 30;

export type Fate = "counted" | "dropped" | "corrected";

export type Evaluation = {
  delay: number;
  allowed: number;
  /** One for each event, in the order of EVENTS. */
  fates: Fate[];
  dropped: number;
  corrected: number;
  /** Events that end up in a result: all but the dropped ones. */
  counted: number;
  /** Counted and total events in each window. */
  windows: { counted: number; total: number }[];
};

/** The watermark before each event: newest event time seen so far minus the delay. */
export function watermarks(delay: number): number[] {
  let newest = -Infinity;
  return EVENTS.map(([et]) => {
    const wm = newest === -Infinity ? -Infinity : newest - delay;
    newest = Math.max(newest, et);
    return wm;
  });
}

export const windowOf = (eventTime: number) => Math.floor(eventTime / WINDOW_S);

export function evaluate(delay: number, allowed: number): Evaluation {
  const wms = watermarks(delay);
  const fates: Fate[] = EVENTS.map(([et], i) => {
    const end = (windowOf(et) + 1) * WINDOW_S;
    if (wms[i] >= end + allowed) return "dropped";
    return wms[i] >= end ? "corrected" : "counted";
  });
  const windows = Array.from({ length: WINDOWS }, (_, w) => {
    const idx = EVENTS.flatMap(([et], i) => (windowOf(et) === w ? [i] : []));
    return { counted: idx.filter((i) => fates[i] !== "dropped").length, total: idx.length };
  });
  const dropped = fates.filter((f) => f === "dropped").length;
  return { delay, allowed, fates, dropped, corrected: fates.filter((f) => f === "corrected").length, counted: EVENTS.length - dropped, windows };
}

/** How late an event arrived: arrival time minus event time. */
export const lateness = (i: number) => EVENTS[i][1] - EVENTS[i][0];

export type Verdict = { text: string; tone: Tone };

export function verdictFor(e: Evaluation): Verdict {
  const behind = e.delay === 0 ? "instant" : `${e.delay} s behind`;
  if (e.dropped > 0) return { text: e.delay === 0 ? `${e.dropped} ${e.dropped === 1 ? "event" : "events"} dropped, results instant` : `${e.dropped} dropped, results ${behind}`, tone: "warn" };
  if (e.corrected > 0) return { text: e.delay === 0 ? `${e.corrected} corrected later, results instant` : `${e.corrected} corrected later, ${behind}`, tone: "good" };
  return { text: `Nothing dropped, results ${e.delay} s late`, tone: "good" };
}

export const lagText = (delay: number) => (delay === 0 ? "instant" : `${delay} s behind`);

export function valueText(e: Evaluation): string {
  const fixes = e.corrected > 0 ? `, ${e.corrected} corrected later` : "";
  return `delay ${e.delay} seconds, ${e.dropped} ${e.dropped === 1 ? "event" : "events"} dropped of ${EVENTS.length}${fixes}, results ${e.delay} seconds behind`;
}

/** The newest event time seen by arrival time tau, minus the delay; null before the watermark is above zero. */
export function watermarkAt(delay: number, tau: number): number | null {
  let newest = -Infinity;
  for (const [et, at] of EVENTS) if (at <= tau) newest = Math.max(newest, et);
  const wm = newest - delay;
  return Number.isFinite(wm) && wm > 0 ? Math.min(wm, EVENT_SPAN_S) : null;
}

/** The index of the latest event to have arrived by tau, and how long ago, or null. */
export function latestArrival(tau: number): { index: number; age: number } | null {
  let found = -1;
  EVENTS.forEach(([, at], i) => {
    if (at <= tau) found = i;
  });
  return found < 0 ? null : { index: found, age: tau - EVENTS[found][1] };
}

/** The playhead as an arrival time: a sweep, then a rest. */
export const SWEEP_S = 10;
export const LOOP_S = 12.5;
export function playhead(seconds: number): number {
  const p = (((seconds % LOOP_S) + LOOP_S) % LOOP_S) / SWEEP_S;
  return Math.min(1, p) * LAST_ARRIVAL_S;
}
