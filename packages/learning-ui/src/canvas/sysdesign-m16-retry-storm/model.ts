// 16.4 beat 4: a retry storm. A fluid cohort model with steps of 0.1 s: one
// server with a FIFO queue, normal load, a short blip that cuts capacity,
// clients that give up after a patience time and retry, and a server that still
// spends work on a request whose client has left. Deterministic (expected
// values, no randomness). A toy model for the shape of the effect.
//
// Same results as the reference `simulate` in the module 16 playable specs.
// Two changes only make it fast: cohorts due in the same step with the same
// attempt number are merged, and the give-up check walks a pointer along the
// queue instead of scanning all of it every step. Pure, no React.

import type { Tone } from "../primitives/tones";

export type Rule = "now" | "jitter" | "budget";

export const RETRY_STOPS = [0, 1, 2, 3] as const;
export const RETRY_DEFAULT = 3;
export const RULE_DEFAULT: Rule = "now";
export const SECONDS = 60;
export const BLIP = { from: 5, to: 10, capacity: 30 } as const;
export const CAPACITY = 100;
export const BASE_LOAD = 80;
/** Goodput at or above this, for the rest of the run, counts as recovered. */
export const RECOVERED_GOODPUT = 76;

export type Row = { t: number; good: number; attempts: number; wasted: number; queue: number };

type SimOptions = {
  retries: number;
  mode: "now" | "jitter";
  budget: boolean;
  seconds?: number;
  base?: number;
  capacity?: number;
  dipFrom?: number;
  dipTo?: number;
  dipCapacity?: number;
  patience?: number;
  backoffBase?: number;
  jitterParts?: number;
};

export function simulate({
  retries,
  mode,
  budget,
  seconds = SECONDS,
  base = BASE_LOAD,
  capacity = CAPACITY,
  dipFrom = BLIP.from,
  dipTo = BLIP.to,
  dipCapacity = BLIP.capacity,
  patience = 1,
  backoffBase = 0.5,
  jitterParts = 10,
}: SimOptions): Row[] {
  const dt = 0.1;
  const steps = Math.round(seconds / dt);
  const patienceSteps = Math.round(patience / dt);
  const queue: { step: number; attempt: number; n: number }[] = [];
  let head = 0;
  let flag = 0;
  const due = new Map<number, number[]>();
  let tokens = 0;
  const rows: Row[] = [];
  let good = 0;
  let attempts = 0;
  let wasted = 0;
  const addDue = (step: number, attempt: number, n: number) => {
    let a = due.get(step);
    if (!a) {
      a = new Array<number>(retries + 1).fill(0);
      due.set(step, a);
    }
    a[attempt] += n;
  };
  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    const cap = t >= dipFrom && t < dipTo ? dipCapacity : capacity;
    const n0 = base * dt;
    queue.push({ step: i, attempt: 0, n: n0 });
    attempts += n0;
    tokens = Math.min(10, tokens + n0 * 0.1);
    const d = due.get(i);
    if (d) {
      for (let k = 1; k <= retries; k++) {
        if (d[k] > 0) {
          queue.push({ step: i, attempt: k, n: d[k] });
          attempts += d[k];
        }
      }
      due.delete(i);
    }
    // A cohort that has waited the patience time triggers its retry once.
    if (flag < head) flag = head;
    while (flag < queue.length && i - queue[flag].step >= patienceSteps) {
      const c = queue[flag++];
      if (c.attempt >= retries) continue;
      let n = c.n;
      if (budget) {
        n = Math.min(n, tokens);
        tokens -= n;
      }
      if (n <= 0) continue;
      const attempt = c.attempt + 1;
      const delay = mode === "now" ? 0 : backoffBase * 2 ** (attempt - 1);
      if (mode === "jitter") {
        for (let j = 0; j < jitterParts; j++) addDue(i + Math.max(1, Math.round((((j + 0.5) / jitterParts) * delay) / dt)), attempt, n / jitterParts);
      } else {
        addDue(i + Math.max(1, Math.round(delay / dt)), attempt, n);
      }
    }
    let work = cap * dt;
    while (work > 1e-9 && head < queue.length) {
      const c = queue[head];
      const take = Math.min(c.n, work);
      work -= take;
      c.n -= take;
      if (i - c.step <= patienceSteps) good += take;
      else wasted += take;
      if (c.n <= 1e-9) head++;
    }
    if (i % 10 === 9) {
      let waiting = 0;
      for (let k = head; k < queue.length; k++) waiting += queue[k].n;
      rows.push({ t: Math.round(t + dt), good, attempts, wasted, queue: waiting });
      good = 0;
      attempts = 0;
      wasted = 0;
    }
  }
  return rows;
}

export type Run = {
  retries: number;
  rule: Rule;
  rows: Row[];
  /** Second at which goodput stays at 76 a second or more for the rest of the run; null if never. */
  recoveredAt: number | null;
  peakAttempts: number;
  peakQueue: number;
  queueAtEnd: number;
};

export function runStorm(retries: number, rule: Rule): Run {
  const rows = simulate({ retries, mode: rule === "jitter" ? "jitter" : "now", budget: rule === "budget" });
  let recoveredAt: number | null = null;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].t < BLIP.to) continue;
    if (rows.slice(i).every((r) => r.good >= RECOVERED_GOODPUT)) {
      recoveredAt = rows[i].t;
      break;
    }
  }
  return {
    retries,
    rule,
    rows,
    recoveredAt,
    peakAttempts: Math.max(...rows.map((r) => r.attempts)),
    peakQueue: Math.max(...rows.map((r) => r.queue)),
    queueAtEnd: rows[rows.length - 1].queue,
  };
}

export const RULES: readonly { id: Rule; text: string; label: string }[] = [
  { id: "now", text: "At once", label: "Retry at once" },
  { id: "jitter", text: "Backoff and jitter", label: "Wait with backoff and jitter" },
  { id: "budget", text: "Budget 10%", label: "Retry from a budget of 10 percent" },
];

export function verdictFor(run: Run): { text: string; tone: Tone } {
  if (run.recoveredAt === null) return { text: "Still down a minute later", tone: "bad" };
  const after = run.recoveredAt - BLIP.to;
  return run.retries === 0 ? { text: `Back to normal ${after} s after the blip`, tone: "good" } : { text: `Back ${after} s after the blip`, tone: "good" };
}

export function valueText(run: Run): string {
  const noun = run.retries === 1 ? "retry" : "retries";
  return run.recoveredAt === null
    ? `${run.retries} ${noun}, system still down after ${SECONDS} seconds`
    : `${run.retries} ${noun}, back to normal ${run.recoveredAt - BLIP.to} seconds after the blip`;
}

/** Values at a time in seconds, for the cards that follow the sweep. */
export function rowAt(run: Run, seconds: number): Row {
  const i = Math.max(0, Math.min(run.rows.length - 1, Math.floor(seconds)));
  return run.rows[i];
}
