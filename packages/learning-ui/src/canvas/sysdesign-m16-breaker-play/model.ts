// 16.5 beat 2: Checkout calls Picks 10 times a second through a circuit
// breaker. The breaker is the one chapter 16.7 asks the learner to write
// (createBreaker, five failures in a row, open for 10 s, one probe in
// half-open), driven by a fake clock. Calls to a healthy Picks take 40 ms and
// work; calls to a broken Picks fail after a 300 ms time limit; the breaker is
// asked before each call and a refused call fails at once. Pure, no React.

import type { Tone } from "../primitives/tones";

export type BreakerState = "closed" | "open" | "half-open";

export const FAILURE_THRESHOLD = 5;
export const OPEN_MS = 10_000;
export const CALL_EVERY_MS = 100; // 10 calls a second
export const OK_MS = 40;
export const FAIL_MS = 300;
export const DOT_COUNT = 60;

// ---------- The breaker, as small pure steps ----------

export type Breaker = { failures: number; openedAt: number | null; probeOut: boolean };
export type BreakerConfig = { failureThreshold: number; openMs: number };
export const CONFIG: BreakerConfig = { failureThreshold: FAILURE_THRESHOLD, openMs: OPEN_MS };
export const NEW_BREAKER: Breaker = { failures: 0, openedAt: null, probeOut: false };

export function stateOf(b: Breaker, now: number, cfg: BreakerConfig = CONFIG): BreakerState {
  if (b.openedAt === null) return "closed";
  return now - b.openedAt >= cfg.openMs ? "half-open" : "open";
}

/** Ask before a call. In half-open exactly one call, the probe, is allowed. */
export function allow(b: Breaker, now: number, cfg: BreakerConfig = CONFIG): { breaker: Breaker; allowed: boolean; probe: boolean } {
  const s = stateOf(b, now, cfg);
  if (s === "closed") return { breaker: b, allowed: true, probe: false };
  if (s === "half-open" && !b.probeOut) return { breaker: { ...b, probeOut: true }, allowed: true, probe: true };
  return { breaker: b, allowed: false, probe: false };
}

export function recordSuccess(b: Breaker, now: number, cfg: BreakerConfig = CONFIG): Breaker {
  const s = stateOf(b, now, cfg);
  if (s === "closed") return b.failures === 0 ? b : { ...b, failures: 0 };
  // A late answer while open says nothing about Picks now; only the probe closes the breaker.
  if (s === "half-open" && b.probeOut) return NEW_BREAKER;
  return b;
}

export function recordFailure(b: Breaker, now: number, cfg: BreakerConfig = CONFIG): Breaker {
  const s = stateOf(b, now, cfg);
  if (s === "closed") {
    const failures = b.failures + 1;
    return failures >= cfg.failureThreshold ? { failures, openedAt: now, probeOut: false } : { ...b, failures };
  }
  if (s === "half-open" && b.probeOut) return { ...b, openedAt: now, probeOut: false };
  return b;
}

/** The same breaker as chapter 16.7 asks for: a factory with a clock you pass in. */
export function createBreaker({ failureThreshold = FAILURE_THRESHOLD, openMs = OPEN_MS, now = Date.now }: { failureThreshold?: number; openMs?: number; now?: () => number } = {}) {
  if (!Number.isInteger(failureThreshold) || failureThreshold <= 0) throw new RangeError("failureThreshold must be a positive whole number");
  if (!(openMs > 0)) throw new RangeError("openMs must be positive");
  const cfg = { failureThreshold, openMs };
  let b = NEW_BREAKER;
  return {
    state: () => stateOf(b, now(), cfg),
    allowRequest: () => {
      const r = allow(b, now(), cfg);
      b = r.breaker;
      return r.allowed;
    },
    recordSuccess: () => {
      b = recordSuccess(b, now(), cfg);
    },
    recordFailure: () => {
      b = recordFailure(b, now(), cfg);
    },
  };
}

// ---------- The run ----------

export type DotKind = "ok" | "fail" | "refused" | "probe" | "pending";
export type Dot = { id: number; kind: DotKind };
type Pending = { at: number; id: number; ok: boolean; probe: boolean };

export type Outage = {
  /** Calls made while Picks was broken. */
  calls: number;
  /** Of those, calls that reached Picks. */
  reached: number;
  /** Picks is still broken. */
  active: boolean;
};

export type Sim = {
  /** Time in ms. */
  t: number;
  nextCall: number;
  broken: boolean;
  breaker: Breaker;
  pending: Pending[];
  dots: Dot[];
  nextId: number;
  outage: Outage | null;
  /** When Picks was last fixed, in ms. */
  fixedAt: number | null;
  /** Calls made and refused over the whole run. */
  total: number;
  refused: number;
};

export const START_SIM: Sim = { t: 0, nextCall: 0, broken: false, breaker: NEW_BREAKER, pending: [], dots: [], nextId: 0, outage: null, fixedAt: null, total: 0, refused: 0 };

function settle(sim: Sim, upTo: number): Sim {
  // Results come back in time order; at the same instant a result comes before a new call.
  let { breaker, dots } = sim;
  const pending = [...sim.pending].sort((a, b) => a.at - b.at || a.id - b.id);
  const rest: Pending[] = [];
  for (const p of pending) {
    if (p.at > upTo) {
      rest.push(p);
      continue;
    }
    breaker = p.ok ? recordSuccess(breaker, p.at) : recordFailure(breaker, p.at);
    dots = dots.map((d) => (d.id === p.id && !p.probe ? { id: d.id, kind: p.ok ? "ok" : "fail" } : d));
  }
  return { ...sim, breaker, dots, pending: rest };
}

/** Run the clock forward to `toMs`, making a call every 100 ms. Returns a new Sim. */
export function advance(start: Sim, toMs: number): Sim {
  let sim = start;
  while (sim.nextCall <= toMs) {
    const now = sim.nextCall;
    sim = settle(sim, now);
    const asked = allow(sim.breaker, now);
    const id = sim.nextId;
    const pending = [...sim.pending];
    let kind: DotKind;
    if (!asked.allowed) kind = "refused";
    else {
      kind = asked.probe ? "probe" : "pending";
      pending.push({ at: now + (sim.broken ? FAIL_MS : OK_MS), id, ok: !sim.broken, probe: asked.probe });
    }
    const outage = sim.outage && sim.outage.active ? { ...sim.outage, calls: sim.outage.calls + 1, reached: sim.outage.reached + (asked.allowed ? 1 : 0) } : sim.outage;
    sim = {
      ...sim,
      breaker: asked.breaker,
      pending,
      dots: [...sim.dots, { id, kind }].slice(-DOT_COUNT),
      nextId: id + 1,
      nextCall: now + CALL_EVERY_MS,
      outage,
      total: sim.total + 1,
      refused: sim.refused + (asked.allowed ? 0 : 1),
    };
  }
  sim = settle(sim, toMs);
  return { ...sim, t: Math.max(sim.t, toMs) };
}

export const toggleBroken = (sim: Sim): Sim =>
  sim.broken
    ? { ...sim, broken: false, fixedAt: sim.t, outage: sim.outage ? { ...sim.outage, active: false } : null }
    : { ...sim, broken: true, outage: { calls: 0, reached: 0, active: true } };

/** A healthy run of six seconds, so the dot strip starts full (the last answer lands 40 ms after the last call). */
export const INITIAL_SIM: Sim = advance(START_SIM, 6040);

export const state = (sim: Sim): BreakerState => stateOf(sim.breaker, sim.t);

export function verdictFor(sim: Sim): { text: string; tone: Tone } {
  const s = state(sim);
  if (!sim.broken && s === "closed" && sim.outage && !sim.outage.active && sim.outage.calls > sim.outage.reached) {
    return { text: `${sim.outage.reached} of ${sim.outage.calls} calls reached Picks`, tone: "good" };
  }
  if (!sim.broken && s === "open") return { text: "Picks is back; waiting to probe", tone: "warn" };
  if (s === "open") return { text: "Open: no calls reach Picks", tone: "warn" };
  if (s === "half-open") return { text: "Half-open: one probe call", tone: "accent" };
  if (sim.broken && sim.breaker.failures > 0) return { text: `Closed: ${sim.breaker.failures} of ${FAILURE_THRESHOLD} failures so far`, tone: "warn" };
  return { text: "Closed: calls go through", tone: "good" };
}

export const PILL_TONE: Record<BreakerState, Tone> = { closed: "good", open: "bad", "half-open": "warn" };
export const PILL_TEXT: Record<BreakerState, string> = { closed: "Closed", open: "Open", "half-open": "Half-open" };

export const picksLabel = (broken: boolean) => (broken ? "Picks: broken, press to fix it" : "Picks: healthy, press to break it");

/** Seconds with one decimal, for example 36.3. */
export const seconds = (ms: number) => (ms / 1000).toFixed(1);

// ---------- The scripted run of the chapter ----------

export type Script = {
  openedAt: number[];
  halfOpenAt: number[];
  closedAt: number | null;
  reachedInOutage: number;
  callsInOutage: number;
  refused: number;
  total: number;
};

/** Picks breaks at 5.0 s and is fixed at 35.0 s; 10 calls a second for 60 s. */
export function scriptedRun(breakAt = 5000, fixAt = 35_000, endAt = 60_000): Script {
  let sim: Sim = START_SIM;
  const openedAt: number[] = [];
  const halfOpenAt: number[] = [];
  let closedAt: number | null = null;
  let last = sim.breaker;
  let broke = false;
  let fixed = false;
  for (let t = 0; t < endAt; t += CALL_EVERY_MS) {
    if (!broke && t >= breakAt) {
      sim = toggleBroken(advance(sim, breakAt - 1));
      broke = true;
    }
    if (!fixed && t >= fixAt) {
      sim = toggleBroken(advance(sim, fixAt - 1));
      fixed = true;
    }
    // Step in 10 ms pieces so the instants of change are found exactly.
    for (let k = 0; k < CALL_EVERY_MS; k += 10) {
      sim = advance(sim, t + k);
      const b = sim.breaker;
      if (b.openedAt !== null && b.openedAt !== last.openedAt) {
        openedAt.push(b.openedAt);
        halfOpenAt.push(b.openedAt + OPEN_MS);
      }
      if (last.openedAt !== null && b.openedAt === null && closedAt === null) closedAt = sim.t;
      last = b;
    }
  }
  return {
    openedAt,
    halfOpenAt,
    closedAt,
    reachedInOutage: sim.outage?.reached ?? 0,
    callsInOutage: sim.outage?.calls ?? 0,
    refused: sim.refused,
    total: sim.total,
  };
}
