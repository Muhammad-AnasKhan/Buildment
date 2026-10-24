// 17.4 beat 3: replay an incident and see which alerts page. A fluid model
// with no noise: the SLO is 99.9% (allowance 0.1% of requests), the baseline
// error rate is 0.05%, and an incident adds a fixed error rate r from minute
// 0 to D. The average error rate over the window (x - W, x] is
// b + (r - b) x overlap / W, with overlap = max(0, min(x, D) - max(0, x - W)).
// Burn rate = average / allowance. A rule fires when its long and its short
// window are both at or above its burn number; the naive rule fires when the
// 5 minute burn is at or above 1. Time is whole minutes after the incident
// starts; the history before minute 0 is quiet at the baseline. Course numbers.

import type { Tone } from "../primitives/tones";

export const ALLOWANCE = 0.1; // percent: a 99.9% SLO
export const BASELINE = 0.05; // percent
export const BUDGET_MIN = (ALLOWANCE / 100) * 30 * 1440; // 43.2 bad minutes in 30 days

export type IncidentId = "blip" | "outage" | "leak";
export type AlertId = "naive" | "fast" | "slow";

export type Incident = {
  id: IncidentId;
  label: string;
  /** Minutes the incident lasts. */
  duration: number;
  /** Error rate during the incident, percent. */
  rate: number;
  /** Minutes drawn on the axis. */
  axis: number;
  ticks: readonly number[];
  /** What the incident is called in a sentence. */
  noun: string;
};

export const INCIDENTS: readonly Incident[] = [
  { id: "blip", label: "3 min blip", duration: 3, rate: 8, axis: 60, ticks: [0, 20, 40, 60], noun: "3 minute blip" },
  { id: "outage", label: "30 min outage", duration: 30, rate: 5, axis: 120, ticks: [0, 30, 60, 90, 120], noun: "30 minute outage" },
  { id: "leak", label: "5 h leak", duration: 300, rate: 1.2, axis: 420, ticks: [0, 60, 120, 180, 240, 300, 360, 420], noun: "5 hour leak" },
];

export const DEFAULT_INCIDENT: IncidentId = "outage";
export const incidentOf = (id: IncidentId): Incident => INCIDENTS.find((i) => i.id === id) ?? INCIDENTS[1];

export type Rule = { id: AlertId; long: number; short: number; burn: number };

export const RULES: Record<AlertId, Rule> = {
  naive: { id: "naive", long: 5, short: 5, burn: 1 },
  fast: { id: "fast", long: 60, short: 5, burn: 14.4 },
  slow: { id: "slow", long: 360, short: 30, burn: 6 },
};

export const ALERTS: readonly { id: AlertId; chip: string; label: string; rule: string }[] = [
  { id: "naive", chip: "Naive", label: "Naive: 5 min error rate at or above 0.1%", rule: "5 min rate ≥ 0.1%" },
  { id: "fast", chip: "Fast", label: "Fast: 1 h and 5 min at 14.4x", rule: "1 h and 5 min at 14.4x" },
  { id: "slow", chip: "Slow", label: "Slow: 6 h and 30 min at 6x", rule: "6 h and 30 min at 6x" },
];

export const NAIVE_CAPTION = "plus about 27 false pages a day, challenge 16";

/** Average error rate (percent) over the window (x - w, x]. */
export function averageRate(inc: Incident, x: number, w: number): number {
  const overlap = Math.max(0, Math.min(x, inc.duration) - Math.max(0, x - w));
  return BASELINE + ((inc.rate - BASELINE) * overlap) / w;
}

/** Burn rate over a window: the average error rate in units of the allowance. */
export const burnRate = (inc: Incident, x: number, w: number) => averageRate(inc, x, w) / ALLOWANCE;

const EPS = 1e-9;

export function firing(rule: AlertId, inc: Incident, x: number): boolean {
  const r = RULES[rule];
  return burnRate(inc, x, r.long) >= r.burn - EPS && burnRate(inc, x, r.short) >= r.burn - EPS;
}

/** Whole minutes 0 to axis (inclusive) at which the rule fires. */
export function firingSeries(rule: AlertId, inc: Incident): boolean[] {
  return Array.from({ length: inc.axis + 1 }, (_, x) => firing(rule, inc, x));
}

/** Runs of consecutive firing minutes, as [from, to): the alert is open from `from` and closes at `to`. */
export function firingRuns(rule: AlertId, inc: Incident): { from: number; to: number }[] {
  const s = firingSeries(rule, inc);
  const runs: { from: number; to: number }[] = [];
  let from = -1;
  s.forEach((on, x) => {
    if (on && from < 0) from = x;
    if (!on && from >= 0) {
      runs.push({ from, to: x });
      from = -1;
    }
  });
  if (from >= 0) runs.push({ from, to: s.length });
  return runs;
}

/** Bad minutes spent by minute x of the incident: error rate times minutes of incident so far. */
export const badMinutes = (inc: Incident, x: number) => (inc.rate / 100) * Math.min(Math.max(0, x), inc.duration);
export const budgetShare = (bad: number) => bad / BUDGET_MIN;

export type AlertResult = { page: number | null; clears: number | null; bad: number | null; share: number | null };

export function resultOf(rule: AlertId, inc: Incident): AlertResult {
  const run = firingRuns(rule, inc)[0];
  if (!run) return { page: null, clears: null, bad: null, share: null };
  const bad = badMinutes(inc, run.from);
  return { page: run.from, clears: run.to <= inc.axis ? run.to : null, bad, share: budgetShare(bad) };
}

/** Highest burn rate over a window across the whole axis. */
export function peakBurn(inc: Incident, w: number): number {
  let peak = 0;
  for (let x = 0; x <= inc.axis; x++) peak = Math.max(peak, burnRate(inc, x, w));
  return peak;
}

/** The curve of the burn rate over a window, one point every `step` minutes. */
export function burnCurve(inc: Incident, w: number, step: number): { x: number; v: number }[] {
  const pts: { x: number; v: number }[] = [];
  for (let x = 0; x <= inc.axis; x += step) pts.push({ x, v: burnRate(inc, x, w) });
  if (pts[pts.length - 1].x !== inc.axis) pts.push({ x: inc.axis, v: burnRate(inc, inc.axis, w) });
  return pts;
}

/** 2.0 becomes "2", 4.8 stays "4.8", 0.6 stays "0.6". */
export function pctText(share: number): string {
  const p = (share * 100).toFixed(1);
  return p.endsWith(".0") ? p.slice(0, -2) : p;
}

export type Verdict = { text: string; tone: Tone };

export function verdictFor(incident: IncidentId, on: Record<AlertId, boolean>): Verdict {
  const inc = incidentOf(incident);
  const res = (a: AlertId) => (on[a] ? resultOf(a, inc) : null);
  const anyPage = (Object.keys(on) as AlertId[]).some((a) => res(a)?.page != null);
  if (incident === "blip") {
    return anyPage ? { text: "Paged for a 3 minute blip", tone: "bad" } : { text: "Blip ignored; budget barely touched", tone: "good" };
  }
  const wanted: AlertId = incident === "outage" ? "fast" : "slow";
  const mine = res(wanted);
  if (mine && mine.page !== null && mine.share !== null) {
    const where = incident === "outage" ? "Paged at minute" : "Leak found at minute";
    const gone = incident === "outage" ? `${pctText(mine.share)}% of budget gone` : `${pctText(mine.share)}% gone`;
    return { text: `${where} ${mine.page}; ${gone}`, tone: "good" };
  }
  if (res("naive")?.page != null) return { text: "Paged at once, and for every blip", tone: "warn" };
  return { text: incident === "outage" ? "The outage was never paged" : "The slow leak was never paged", tone: "bad" };
}

/** The alerts firing at minute x among the ones switched on. */
export function firingNow(inc: Incident, x: number, on: Record<AlertId, boolean>): AlertId[] {
  return (Object.keys(RULES) as AlertId[]).filter((a) => on[a] && firing(a, inc, x));
}

/** A burn rate to one decimal, rounding a tie up (25.25 reads 25.3). */
export const burnText = (v: number) => (Math.round(v * 10 + 1e-6) / 10).toFixed(1);

export function scrubText(inc: Incident, x: number, on: Record<AlertId, boolean>): string {
  const fired = firingNow(inc, x, on);
  const names = fired.length ? `${fired.join(" and ")} alert${fired.length > 1 ? "s" : ""} firing` : "no alert firing";
  return `minute ${x}, 1 hour burn ${burnText(burnRate(inc, x, 60))}, ${names}`;
}

/** The next scrub position for a key, or null if it is not a slider key. */
export function scrubKey(x: number, key: string, axis: number): number | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return Math.min(axis, x + 1);
    case "ArrowLeft":
    case "ArrowDown":
      return Math.max(0, x - 1);
    case "PageUp":
      return Math.min(axis, x + 10);
    case "PageDown":
      return Math.max(0, x - 10);
    case "Home":
      return 0;
    case "End":
      return axis;
    default:
      return null;
  }
}
