// 15.6 beat 2: the same eight events cut into tumbling, sliding and session
// windows. Tumbling windows are 60 s and start at multiples of 60; sliding
// windows last 60 s and start every 20 s (a window starts at every multiple
// of 20 that still reaches an event); a session ends when the gap to the next
// event is more than 40 s. Pure, no React.

import type { Tone } from "../primitives/tones";

export const EVENTS = [5, 20, 50, 70, 75, 130, 140, 200] as const;
export const AXIS_S = 240;
export const SIZE_S = 60;
export const SLIDE_S = 20;
export const GAP_S = 40;

export type Shape = "tumbling" | "sliding" | "session";
export const SHAPES: readonly { id: Shape; label: string; note: string }[] = [
  { id: "tumbling", label: "tumbling", note: "60 s windows, side by side" },
  { id: "sliding", label: "sliding", note: "60 s window, a new one every 20 s" },
  { id: "session", label: "session", note: "40 s of silence ends a session" },
];

export type Win = {
  /** For tumbling and sliding, the window [from, to). For a session, the first and last event. */
  from: number;
  to: number;
  /** Events inside. */
  count: number;
  /** The time at which the window is closed: its end, or for a session the last event plus the gap. */
  closesAt: number;
  /** Row in the picture, so overlapping windows sit one under another. */
  row: number;
};

export function windowsFor(shape: Shape): Win[] {
  if (shape === "session") {
    const out: Win[] = [];
    let first: number = EVENTS[0];
    let last: number = EVENTS[0];
    let count = 1;
    for (const t of EVENTS.slice(1)) {
      if (t - last > GAP_S) {
        out.push({ from: first, to: last, count, closesAt: last + GAP_S, row: 0 });
        first = t;
        count = 0;
      }
      last = t;
      count++;
    }
    out.push({ from: first, to: last, count, closesAt: last + GAP_S, row: 0 });
    return out;
  }
  const step = shape === "tumbling" ? SIZE_S : SLIDE_S;
  const lastStart = Math.floor(EVENTS[EVENTS.length - 1] / step) * step;
  const firstStart = Math.floor((EVENTS[0] - SIZE_S) / step) * step + step;
  const out: Win[] = [];
  for (let from = shape === "tumbling" ? 0 : firstStart; from <= lastStart; from += step) {
    const to = from + SIZE_S;
    out.push({ from, to, count: EVENTS.filter((t) => t >= from && t < to).length, closesAt: to, row: shape === "tumbling" ? 0 : out.length % 3 });
  }
  return out;
}

/** The windows each event is in, in the order of EVENTS. */
export function membership(shape: Shape): number[] {
  const wins = windowsFor(shape);
  return EVENTS.map((t) => wins.filter((w) => (shape === "session" ? t >= w.from && t <= w.to : t >= w.from && t < w.to)).length);
}

export const totalCounts = (shape: Shape) => membership(shape).reduce((a, b) => a + b, 0);

/** The silences between sessions, in seconds, with the time each one starts. */
export function sessionGaps(): { from: number; to: number; length: number }[] {
  const wins = windowsFor("session");
  return wins.slice(1).map((w, i) => ({ from: wins[i].to, to: w.from, length: w.from - wins[i].to }));
}

export type Verdict = { text: string; tone: Tone; note: string };

export function verdictFor(shape: Shape): Verdict {
  const m = membership(shape);
  const each = Math.max(...m);
  if (shape === "tumbling") return { text: "Each event is in one window", tone: "good", note: `${totalCounts(shape)} counts for ${EVENTS.length} events` };
  if (shape === "sliding") return { text: `Each event is in ${each} windows`, tone: "warn", note: `${totalCounts(shape)} counts for ${EVENTS.length} events: ${each} times the work` };
  return { text: `Windows follow activity: ${windowsFor(shape).length} sessions`, tone: "good", note: `${totalCounts(shape)} counts for ${EVENTS.length} events` };
}

export function windowLabel(w: Win): string {
  return `${w.from} to ${w.to} s`;
}

/** The text table for screen readers: one line per window. */
export function tableRows(shape: Shape): { window: string; events: number }[] {
  return windowsFor(shape).map((w) => ({ window: windowLabel(w), events: w.count }));
}

/** Where the playhead is, in seconds on the axis: a sweep, then a rest. */
export const SWEEP_S = 9;
export const LOOP_S = 11;
export function playhead(seconds: number): number {
  const p = (((seconds % LOOP_S) + LOOP_S) % LOOP_S) / SWEEP_S;
  return Math.min(1, p) * AXIS_S;
}
