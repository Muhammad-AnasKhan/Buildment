// Chapter 4.4: a balancer keeps sending a dead server its share until the
// health check has failed `threshold` times in a row. Then the survivors carry
// its load. Piecewise exact: between two events the rates are constant, so the
// failed-request count is computed by adding up whole stretches, not stepping.
// Pure functions, no React.

import type { Tone } from "../primitives/tones";

export const SERVERS = 3;
/** Requests a second reaching the balancer. */
export const TRAFFIC = 180;
/** Requests a second one server can finish. */
export const CAPACITY = 100;
/** Failed checks in a row that take a server out of rotation. */
export const THRESHOLD = 3;
export const INTERVALS = [2, 10] as const;
export type CheckInterval = (typeof INTERVALS)[number];

/** Picture seconds to simulated seconds: the 10 second setting would take 30 s of waiting at 1 to 1. */
export const SPEED = 4;

export type FailEvent = { at: number; server: number; kind: "fail" | "restore" };

export type ServerStatus = "up" | "dead" | "out";

export type FailoverState = {
  status: ServerStatus[];
  /** Requests a second each server is sent. */
  share: number[];
  /** Busy share of each server (0 for a dead one). */
  busy: number[];
  /** Requests that failed so far. */
  failed: number;
  /** Failed requests a second right now. */
  failRate: number;
  /** True when every server is out and the balancer sends traffic to all of them anyway. */
  failOpen: boolean;
  /** Simulated seconds the oldest still-listed dead server has been failing checks, or null. */
  checkAge: number | null;
  /** Failed checks counted for that server (0 to THRESHOLD). */
  checks: number;
  verdict: string;
  tone: Tone;
};

export const detectionTime = (interval: number, threshold = THRESHOLD) => interval * threshold;

export const formatCount = (n: number) => Math.round(n).toLocaleString("en-US");

/** The history after an input: drop anything later than `now`, then add the new event. */
export function addEvent(events: readonly FailEvent[], event: FailEvent): FailEvent[] {
  return [...events.filter((e) => e.at <= event.at), event];
}

/**
 * The state at simulated time `now`. A dead server is removed `interval x
 * threshold` seconds after it died. Restoring a server puts it back at once.
 */
export function failoverAt(events: readonly FailEvent[], interval: number, now: number): FailoverState {
  const detect = detectionTime(interval);
  const sorted = [...events].sort((a, b) => a.at - b.at);
  const failedAt: (number | null)[] = Array(SERVERS).fill(null);
  const out: boolean[] = Array(SERVERS).fill(false);
  let t = 0;
  let failed = 0;
  let next = 0;

  const rotation = () => out.filter((o) => !o).length;
  /** Failed requests a second with the current dead and removed sets. */
  const rate = () => {
    const inRot = rotation();
    const deadIn = failedAt.filter((f, i) => f !== null && !out[i]).length;
    if (inRot === 0) return TRAFFIC; // fail open: everything is sent to dead servers
    return (deadIn * TRAFFIC) / inRot;
  };

  for (;;) {
    let breakAt = Infinity;
    if (next < sorted.length) breakAt = sorted[next].at;
    for (let i = 0; i < SERVERS; i++) {
      const f = failedAt[i];
      if (f !== null && !out[i]) breakAt = Math.min(breakAt, f + detect);
    }
    const stop = Math.min(breakAt, now);
    if (stop > t) {
      failed += rate() * (stop - t);
      t = stop;
    }
    if (breakAt > now) break;
    // Apply everything that happens at breakAt: removals first, then events.
    for (let i = 0; i < SERVERS; i++) {
      const f = failedAt[i];
      if (f !== null && !out[i] && f + detect <= breakAt + 1e-9) out[i] = true;
    }
    while (next < sorted.length && sorted[next].at <= breakAt + 1e-9) {
      const e = sorted[next++];
      if (e.server < 0 || e.server >= SERVERS) continue;
      if (e.kind === "fail") {
        if (failedAt[e.server] === null) failedAt[e.server] = e.at;
      } else {
        failedAt[e.server] = null;
        out[e.server] = false;
      }
    }
  }

  const failOpen = rotation() === 0;
  const inRot = failOpen ? SERVERS : rotation();
  const status: ServerStatus[] = failedAt.map((f, i) => (f === null ? "up" : out[i] && !failOpen ? "out" : "dead"));
  const share = status.map((s) => (s === "out" ? 0 : TRAFFIC / inRot));
  const busy = status.map((s, i) => (s === "up" ? share[i] / CAPACITY : 0));
  const upCount = status.filter((s) => s === "up").length;
  const anyDeadIn = status.includes("dead");

  let verdict: string;
  let tone: Tone;
  if (failOpen) {
    verdict = "No healthy server: fail open";
    tone = "bad";
  } else if (anyDeadIn) {
    verdict = "Dead server still gets traffic";
    tone = "bad";
  } else if (upCount === SERVERS) {
    verdict = `All ${SERVERS} up: each ${Math.round((TRAFFIC / SERVERS / CAPACITY) * 100)}% busy`;
    tone = "good";
  } else if (upCount === 2) {
    verdict = `Out after checks: 2 at ${Math.round((TRAFFIC / 2 / CAPACITY) * 100)}%`;
    tone = "warn";
  } else {
    verdict = `${SERVERS - upCount} down: ${upCount} server, ${TRAFFIC}/s, overloaded`;
    tone = "bad";
  }

  // The oldest dead server still in rotation drives the check ring.
  let checkAge: number | null = null;
  for (let i = 0; i < SERVERS; i++) {
    const f = failedAt[i];
    if (f !== null && !out[i]) checkAge = checkAge === null ? now - f : Math.max(checkAge, now - f);
  }
  const checks = checkAge === null ? 0 : Math.min(THRESHOLD, Math.floor(checkAge / interval + 1e-9));
  const failRate = status.map((s) => s === "dead").some(Boolean) ? rate() : 0;
  return { status, share, busy, failed, failRate, failOpen, checkAge, checks, verdict, tone };
}

/** A time at which every pending removal has happened, for the still picture. */
export function settledAt(events: readonly FailEvent[], interval: number): number {
  const last = events.reduce((m, e) => Math.max(m, e.at), 0);
  return last + detectionTime(interval) + 1;
}
