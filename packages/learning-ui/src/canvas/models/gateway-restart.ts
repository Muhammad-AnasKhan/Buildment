import { withCommas } from "./picture-controls";
import { GATEWAY_ACCEPT, GATEWAY_MAX, GATEWAY_PLAN } from "./dardasha-numbers";
import type { Tone } from "../primitives/tones";

// 22.3 "Restart a few gateways, spread the return". When k of the 60 gateways
// restart, their phones move to the others. Pure functions, no React.
//
//   phones to move        P = 50,000 x k
//   healthy gateways      H = 60 - k
//   fleet accepts         C = H x 500 new connections a second
//   arrival rate          R = P / max(J, 1)        (J is the spread in seconds)
//   lines on each healthy gateway after the move = 50,000 + P / H
//   time to return        = max(max(J, 1), P / C)

export const FLEET = 60;
export const K_CHOICES = [1, 6, 15, 30] as const;
export const SPREAD_STEPS = [0, 5, 15, 30] as const;
export const K_DEFAULT = 6;
export const SPREAD_DEFAULT = 5;

export type Restart = {
  k: number;
  spread: number;
  phones: number;
  healthy: number;
  accepts: number;
  /** Seconds over which the phones arrive: the spread, or 1 second for no spread. */
  window: number;
  arrival: number;
  linesEach: number;
  /** Seconds until every phone is back. */
  time: number;
  over: boolean;
  full: boolean;
};

export function restartRun(k: number, spread: number): Restart {
  const phones = GATEWAY_PLAN * k;
  const healthy = FLEET - k;
  const accepts = healthy * GATEWAY_ACCEPT;
  const window = Math.max(spread, 1);
  const arrival = phones / window;
  const linesEach = GATEWAY_PLAN + phones / healthy;
  return {
    k,
    spread,
    phones,
    healthy,
    accepts,
    window,
    arrival,
    linesEach,
    time: Math.max(window, phones / accepts),
    over: arrival > accepts,
    full: linesEach >= GATEWAY_MAX,
  };
}

/** Share of the phones that are back after t seconds: they arrive at the slower of the arrival rate and what the fleet accepts. */
export function returned(run: Restart, t: number): number {
  if (!(t > 0)) return 0;
  return Math.min(1, t / run.time);
}

/** Lines on a healthy gateway t seconds in. */
export function linesAt(run: Restart, t: number): number {
  return GATEWAY_PLAN + (run.phones / run.healthy) * returned(run, t);
}

/** Tone of a healthy gateway by its share of the 100,000 line limit. */
export function linesTone(lines: number): Tone {
  const share = lines / GATEWAY_MAX;
  return share >= 1 ? "bad" : share >= 0.8 ? "warn" : "good";
}

/** Seconds as the table writes them: "1.7 s", "5 s", "100 s". */
export function secondsText(t: number): string {
  const r = Math.round(t * 10) / 10;
  return `${Number.isInteger(r) ? r : r.toFixed(1)} s`;
}

export type Verdict = { text: string; tone: Tone };

/** At most 38 characters. */
export function restartVerdict(run: Restart): Verdict {
  if (run.full) return { text: "Gateways full: lines at the limit", tone: "bad" };
  if (run.over) return { text: "Too many at once: retries pile up", tone: "bad" };
  return { text: `Back in ${secondsText(run.time)}, no overload`, tone: "good" };
}

export const gatewaysRestart = (k: number) => `${k} ${k === 1 ? "gateway restarts" : "gateways restart"}`;
export const spreadText = (j: number) => (j === 0 ? "no spread" : `spread ${j} seconds`);

/** The state in one sentence, for a control's value text. */
export function restartValueText(run: Restart): string {
  return `${gatewaysRestart(run.k)}, ${spreadText(run.spread)}, ${withCommas(run.arrival)} arrivals a second, fleet accepts ${withCommas(run.accepts)}`;
}

/** How many dots fly from the dark cells: more for a bigger restart. */
export function dotCount(k: number): number {
  return Math.min(30, 6 + 2 * k);
}

/** Where dot i is at sim time t (seconds): null before it leaves and after it arrives. It leaves evenly over the window. */
export function dotProgress(run: Restart, i: number, t: number, travel = 1.5): number | null {
  const n = dotCount(run.k);
  const leaves = ((i + 0.5) / n) * run.window;
  const age = t - leaves;
  return age >= 0 && age <= travel ? age / travel : null;
}
