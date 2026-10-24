// 16.3 beat 3: three calls from Checkout, each set to wait for the answer or to
// send a message. Waits add up; a wait on a service that is down fails the
// order; a message never delays or fails it. Pure, no React.

import type { Tone } from "../primitives/tones";

export type Mode = "wait" | "message";
export type CallId = "stock" | "payments" | "notifications";

export const CALLS: readonly { id: CallId; label: string; ms: number }[] = [
  { id: "stock", label: "Stock", ms: 30 },
  { id: "payments", label: "Payments", ms: 80 },
  { id: "notifications", label: "Notifications", ms: 40 },
];

/** Each service is up 99.9% of the time; waiting for n of them in a row multiplies. */
export const SERVICE_AVAILABILITY = 0.999;

export type PathState = { modes: readonly Mode[]; down: readonly boolean[] };

export const START: PathState = { modes: ["wait", "wait", "wait"], down: [false, false, false] };

export type OrderResult = {
  waitCalls: number;
  waitMs: number;
  /** Index of the first Wait call whose service is down, or null. */
  failedAt: number | null;
  availability: number;
  /** Calls set to Message whose service is down: the message waits in a queue. */
  queued: number[];
  verdict: { text: string; tone: Tone };
};

export function evaluate(state: PathState): OrderResult {
  const waits = CALLS.map((_, i) => state.modes[i] === "wait");
  const waitCalls = waits.filter(Boolean).length;
  const waitMs = CALLS.reduce((s, c, i) => s + (waits[i] ? c.ms : 0), 0);
  const failedIndex = CALLS.findIndex((_, i) => waits[i] && state.down[i]);
  const failedAt = failedIndex === -1 ? null : failedIndex;
  const queued = CALLS.map((_, i) => i).filter((i) => !waits[i] && state.down[i]);
  const availability = SERVICE_AVAILABILITY ** waitCalls;

  let verdict: OrderResult["verdict"];
  if (failedAt !== null) verdict = { text: `Order failed: ${CALLS[failedAt].label} is down`, tone: "bad" };
  else if (!waits[1]) verdict = { text: "Placed; payment unconfirmed", tone: "warn" };
  else if (!waits[0]) verdict = { text: "Placed; stock may run out", tone: "warn" };
  else if (!waits[2]) verdict = { text: `Placed in ${waitMs} ms; email waits`, tone: "good" };
  else verdict = { text: `Order placed in ${waitMs} ms`, tone: "good" };

  return { waitCalls, waitMs, failedAt, availability, queued, verdict };
}

/** Availability as a percentage with one decimal, for example 99.7%. */
export const formatAvailability = (a: number) => `${(a * 100).toFixed(1)}%`;

export function callLabel(index: number, mode: Mode): string {
  const c = CALLS[index];
  return mode === "wait" ? `${c.label}, waits for the answer, ${c.ms} ms` : `${c.label}, sends a message and does not wait`;
}

export function serviceLabel(index: number, down: boolean): string {
  const c = CALLS[index];
  return down ? `${c.label} service: down, press to revive it` : `${c.label} service: up, press to fail it`;
}

export const toggleMode = (state: PathState, i: number): PathState => ({
  ...state,
  modes: state.modes.map((m, k) => (k === i ? (m === "wait" ? "message" : "wait") : m)),
});

export const toggleDown = (state: PathState, i: number): PathState => ({
  ...state,
  down: state.down.map((d, k) => (k === i ? !d : d)),
});

/**
 * Where a request dot is on a call's line, 0 (at the call card) to 1 (at the
 * service), for a clock in seconds. Waits run one after another in a cycle;
 * a message is sent at the start of the cycle. Returns null when the dot is
 * not on this line. After a failed wait, later waits do not start.
 */
export const CYCLE_S = 4.4;
const RUN_S = 3.2;

export function dotProgress(state: PathState, index: number, seconds: number): number | null {
  const phase = seconds % CYCLE_S;
  if (state.modes[index] === "message") {
    const t = phase / 0.9;
    return t >= 0 && t <= 1 ? t : null;
  }
  const result = evaluate(state);
  const waitIdx = CALLS.map((_, i) => i).filter((i) => state.modes[i] === "wait");
  const total = waitIdx.reduce((s, i) => s + CALLS[i].ms, 0) || 1;
  let start = 0;
  for (const i of waitIdx) {
    const len = (CALLS[i].ms / total) * RUN_S;
    if (i === index) {
      if (result.failedAt !== null && index > result.failedAt) return null;
      const t = (phase - start) / len;
      return t >= 0 && t <= 1 ? t : null;
    }
    start += len;
  }
  return null;
}
