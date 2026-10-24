// The trace a model hands to a renderer. A model computes; a renderer only
// draws what is in the trace. Every item has the step at which it appears, so
// a step-through can reveal the run one event at a time.

import type { Tone } from "../primitives/tones";

export type TraceLane = { id: string; label: string; sublabel?: string };

/** One moment on a lane: a request, a read, an acknowledgement. */
export type TracePoint = {
  kind: "point";
  lane: string;
  at: number;
  label: string;
  /** Diamond marks a timestamp a node chose; dot marks something that happened. */
  shape?: "dot" | "diamond";
  tone?: Tone;
  /** 0 puts the label just above the point, 1 one row higher, for points close together. */
  labelRow?: 0 | 1;
  step: number;
};

/** A stretch of time on a lane: an uncertainty range, a wait, a lag window. */
export type TraceSpan = {
  kind: "span";
  lane: string;
  from: number;
  to: number;
  label: string;
  tone?: Tone;
  /** 0 draws the bar on the lane line; 1 draws a thinner bar under it, for a second stretch on the same lane. */
  row?: 0 | 1;
  step: number;
};

/** A message between lanes, sent at one time and received at another. */
export type TraceMessage = {
  kind: "message";
  from: string;
  to: string;
  sentAt: number;
  receivedAt: number;
  /** May be empty when the points at each end already say what happened. */
  label: string;
  tone?: Tone;
  step: number;
};

export type TraceItem = TracePoint | TraceSpan | TraceMessage;

/** One step of the run, as the step-through tells it in words. */
export type TraceStep = { title: string; note: string; tone?: Tone; outcome?: string };

export type Trace = {
  lanes: TraceLane[];
  items: TraceItem[];
  steps: TraceStep[];
  /** The time range to draw, in ms. */
  range: [number, number];
  unit: "ms";
};

/** Items visible once the step-through has reached `step`. */
export function itemsUpTo(trace: Trace, step: number): TraceItem[] {
  return trace.items.filter((item) => item.step <= step);
}

/** A tidy axis end: the next multiple of `stepMs` at or above `value`. */
export function roundUp(value: number, stepMs = 10): number {
  return Math.ceil(Math.max(value, stepMs) / stepMs) * stepMs;
}
