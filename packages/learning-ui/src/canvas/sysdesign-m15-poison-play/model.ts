// 15.5 beat 2: 1,000 messages in one partition, handled in order. Message 10
// is bad. A good message takes 50 ms. A failed try takes 50 ms and is followed
// by a wait of 1 second before the next try. With a dead letter queue, a
// message that has failed `limit` times is parked and the line moves on.
// All sums are in whole milliseconds. Pure, no React.

import type { Tone } from "../primitives/tones";

export const MESSAGES = 1000;
export const BAD_AT = 10;
export const GOOD_MS = 50;
export const FAIL_MS = 50;
export const WAIT_MS = 1000;
/** A flaky message fails twice and works on the third try. */
export const WORKS_ON = 3;

export const LIMITS = [1, 2, 3, 5, 10] as const;
export const DEFAULT_LIMIT = 5;

export type Bad = "always" | "flaky";
export type Outcome = "blocked" | "parked" | "worked";

export type Plan = {
  dlq: boolean;
  limit: number;
  bad: Bad;
  outcome: Outcome;
  /** Tries made on message 10; null when it is retried for ever. */
  tries: number | null;
  /** Milliseconds until every other message is done; null when the line never moves. */
  totalMs: number | null;
  parked: number;
};

const BEFORE_MS = (BAD_AT - 1) * GOOD_MS;
const AFTER_MS = (MESSAGES - BAD_AT) * GOOD_MS;

export function plan(dlq: boolean, limit: number, bad: Bad): Plan {
  if (bad === "always") {
    if (!dlq) return { dlq, limit, bad, outcome: "blocked", tries: null, totalMs: null, parked: 0 };
    return { dlq, limit, bad, outcome: "parked", tries: limit, totalMs: BEFORE_MS + limit * (FAIL_MS + WAIT_MS) + AFTER_MS, parked: 1 };
  }
  if (!dlq || limit >= WORKS_ON) {
    return { dlq, limit, bad, outcome: "worked", tries: WORKS_ON, totalMs: BEFORE_MS + (WORKS_ON - 1) * (FAIL_MS + WAIT_MS) + GOOD_MS + AFTER_MS, parked: 0 };
  }
  return { dlq, limit, bad, outcome: "parked", tries: limit, totalMs: BEFORE_MS + limit * (FAIL_MS + WAIT_MS) + AFTER_MS, parked: 1 };
}

export type Verdict = { text: string; tone: Tone };

export function verdictFor(p: Plan): Verdict {
  if (p.outcome === "blocked") return { text: "Blocked at message 10 for ever", tone: "bad" };
  if (p.outcome === "worked") return { text: `Flaky message worked on try ${WORKS_ON}`, tone: "good" };
  const seconds = Math.round((p.totalMs ?? 0) / 1000);
  if (p.bad === "flaky") return { text: "A good message was parked too soon", tone: "warn" };
  return { text: `Parked after ${p.tries} ${p.tries === 1 ? "try" : "tries"}, ${seconds} s in all`, tone: "good" };
}

export const seconds2 = (ms: number) => `${(ms / 1000).toFixed(2)} s`;

// ---------- The story clock ----------
// The model runs for about a minute. The picture tells it in a few seconds:
// messages 1 to 9, then each try on message 10 for 0.8 s, then the other 990
// messages in one quick pass. A line that is blocked shows nine tries and stays stuck.

export const EARLY_S = 1;
export const TRY_S = 0.8;
export const REST_S = 1.6;
export const PASS_S = 2.4;
export const SHOWN_TRIES = 9;
/** Part of each try during which it is failing; the rest is the 1 second wait. */
export const FAILING_PART = 0.45;

export type Snapshot = {
  /** Messages finished or parked, from 0 to 1,000. */
  done: number;
  /** The message being handled, 1 based. */
  current: number;
  /** The try on message 10; 0 before it starts. */
  tryNo: number;
  failing: boolean;
  /** Message 10 has been parked. */
  parked: boolean;
  /** Messages behind the current one. */
  waiting: number;
  /** Model time in ms. */
  ms: number;
  finished: boolean;
};

export function storyLength(p: Plan): number {
  const k = p.tries ?? SHOWN_TRIES;
  return EARLY_S + k * TRY_S + (p.outcome === "blocked" ? 0 : PASS_S);
}

/** The state of the story at a clock reading; Infinity gives the end state. */
export function snapshot(p: Plan, seconds: number): Snapshot {
  const k = p.tries ?? SHOWN_TRIES;
  const end = storyLength(p);
  const loop = end + REST_S;
  const s = Number.isFinite(seconds) ? ((seconds % loop) + loop) % loop : end;
  const finished = s >= end;
  const done = (n: number, extra: Partial<Snapshot> = {}): Snapshot => ({ done: n, current: Math.min(MESSAGES, n + 1), tryNo: 0, failing: false, parked: false, waiting: MESSAGES - Math.min(MESSAGES, n + 1), ms: 0, finished: false, ...extra });
  if (s < EARLY_S) {
    const n = Math.floor(((BAD_AT - 1) * s) / EARLY_S);
    return done(n, { ms: (BEFORE_MS * s) / EARLY_S });
  }
  const tryEnd = EARLY_S + k * TRY_S;
  if (s < tryEnd || (p.outcome === "blocked" && s >= tryEnd)) {
    const into = Math.min(s, tryEnd) - EARLY_S;
    const j = Math.min(k, Math.floor(into / TRY_S) + 1);
    const local = s >= tryEnd ? 1 : (into - (j - 1) * TRY_S) / TRY_S;
    const success = p.outcome === "worked" && j === WORKS_ON;
    const ms = BEFORE_MS + (j - 1) * (FAIL_MS + WAIT_MS) + local * (success ? GOOD_MS : FAIL_MS + WAIT_MS);
    // A blocked line goes on counting the wait while it sits stuck.
    const stuckMs = p.outcome === "blocked" && s >= tryEnd ? ((s - tryEnd) / TRY_S) * (FAIL_MS + WAIT_MS) : 0;
    return done(BAD_AT - 1, { current: BAD_AT, tryNo: j, failing: !success && (local < FAILING_PART || p.outcome === "blocked"), waiting: MESSAGES - BAD_AT, ms: ms + stuckMs, finished: p.outcome === "blocked" && finished });
  }
  const t = Math.min(1, (s - tryEnd) / PASS_S);
  const n = BAD_AT + Math.floor((MESSAGES - BAD_AT) * t);
  const ms0 = BEFORE_MS + (p.outcome === "worked" ? (WORKS_ON - 1) * (FAIL_MS + WAIT_MS) + GOOD_MS : k * (FAIL_MS + WAIT_MS));
  return done(n, { tryNo: k, parked: p.outcome === "parked", ms: ms0 + AFTER_MS * t, finished });
}
