// 16.5 beat 4: Checkout has 50 workers. Payments needs 20 requests a second at
// 0.1 s each (2 workers). The home page needs 80 a second; it holds a worker
// 0.1 s when Picks is healthy and 3 s when Picks is slow. One shared pool, or a
// wall that gives the first P workers to payments (Little's law: workers busy
// = rate x time held). Pure, no React.

import type { Tone } from "../primitives/tones";
import { clamp, stepByKey } from "../models/picture-controls";

export const WORKERS = 50;
export const PAY_RATE = 20;
export const PAY_HOLD = 0.1;
export const HOME_RATE = 80;
export const HOME_HOLD_OK = 0.1;
export const HOME_HOLD_SLOW = 3;
export const POOL_MAX = 45;
export const POOL_SNAPS = [0, 2, 5, 10, 20, 30, 45] as const;
export const POOL_DEFAULT = 0;
export const SLOW_DEFAULT = true;

/** Workers payments needs: rate x hold. */
export const PAY_NEED = PAY_RATE * PAY_HOLD;

export type Served = {
  pool: number;
  slow: boolean;
  /** Share of payments served, 0 to 1. */
  payments: number;
  /** Share of home-page requests served, 0 to 1. */
  home: number;
  /** Requests served a second, of 100. */
  total: number;
};

export function serve(pool: number, slow: boolean): Served {
  const p = clamp(Math.round(pool), 0, POOL_MAX);
  const hold = slow ? HOME_HOLD_SLOW : HOME_HOLD_OK;
  let payments: number;
  let home: number;
  if (p === 0) {
    // One shared pool: every kind of request gets the same share.
    const s = Math.min(1, WORKERS / (PAY_RATE * PAY_HOLD + HOME_RATE * hold));
    payments = s;
    home = s;
  } else {
    payments = Math.min(1, p / PAY_HOLD / PAY_RATE);
    home = Math.min(1, (WORKERS - p) / hold / HOME_RATE);
  }
  return { pool: p, slow, payments, home, total: PAY_RATE * payments + HOME_RATE * home };
}

/** 100%, 50%, 20.7%, 2.1%: whole at 100, one decimal otherwise. */
export function formatShare(share: number): string {
  const pct = share * 100;
  return Math.abs(pct - 100) < 1e-9 ? "100%" : `${pct.toFixed(1)}%`;
}

export function verdictFor(r: Served): { text: string; tone: Tone } {
  if (r.pool === 0) {
    return r.slow ? { text: `Only ${Math.round(r.payments * 100)}% of payments get through`, tone: "bad" } : { text: "Both fine: nothing is slow", tone: "good" };
  }
  if (r.payments < 1) return { text: `Payment pool too small: ${Math.round(r.payments * 100)}%`, tone: "warn" };
  if (r.slow) return { text: "Payments safe: 100% served", tone: "good" };
  if (r.home < 1) return { text: `Wall too big: home gets ${Math.round(r.home * 100)}%`, tone: "warn" };
  return { text: "Both fine: nothing is slow", tone: "good" };
}

export function valueText(r: Served): string {
  const pct = (s: number) => (Math.abs(s - 1) < 1e-9 ? "100" : (s * 100).toFixed(1));
  return r.pool === 0
    ? `no wall, one shared pool of ${WORKERS} workers, payments ${pct(r.payments)} percent served, home ${pct(r.home)} percent`
    : `${r.pool} workers for payments, payments ${pct(r.payments)} percent served, home ${pct(r.home)} percent`;
}

export const poolFromFraction = (f: number) => clamp(Math.round((Number.isFinite(f) ? f : 0) * POOL_MAX), 0, POOL_MAX);
export const poolToFraction = (p: number) => clamp(p, 0, POOL_MAX) / POOL_MAX;
export const poolKey = (value: number, key: string) => stepByKey(value, key, { min: 0, max: POOL_MAX, step: 1, page: 5 });

export type WorkerState = "pay-busy" | "home-busy" | "stuck" | "idle";

/** What each of the 50 workers is doing; the first `pool` belong to payments. */
export function workerStates(r: Served): WorkerState[] {
  const states: WorkerState[] = new Array<WorkerState>(WORKERS).fill("idle");
  if (r.pool === 0) {
    if (r.slow) return states.fill("stuck");
    for (let i = 0; i < PAY_NEED; i++) states[i] = "pay-busy";
    for (let i = 0; i < HOME_RATE * HOME_HOLD_OK; i++) states[PAY_NEED + i] = "home-busy";
    return states;
  }
  for (let i = 0; i < Math.min(r.pool, PAY_NEED); i++) states[i] = "pay-busy";
  const homeWorkers = WORKERS - r.pool;
  const busy = r.slow ? homeWorkers : Math.min(homeWorkers, HOME_RATE * HOME_HOLD_OK);
  for (let i = 0; i < busy; i++) states[r.pool + i] = r.slow ? "stuck" : "home-busy";
  return states;
}
