// 17.3 beat 4: what an SLO target allows. Allowed bad minutes =
// (1 - target) x days x 1,440. Allowed bad requests per million =
// (1 - target) x 1,000,000. A target is held in hundredths of a percent
// (9990 is 99.90%) so the arithmetic stays exact. Pure, no React.

import type { Tone } from "../primitives/tones";

/** Targets in hundredths of a percent: 99%, 99.5%, 99.9%, 99.95%, 99.99%. */
export const TARGETS = [9900, 9950, 9990, 9995, 9999] as const;
export const TARGET_DEFAULT = 9990;
export const WINDOWS = [7, 28, 30, 90] as const;
export const WINDOW_DEFAULT = 30;
/** The probe incident: a 25 minute bad deploy (the same 25 as the budget-spend scene). */
export const PROBE_MIN = 25;

export type WindowDays = (typeof WINDOWS)[number];

/** 9990 gives "99.9", 9995 gives "99.95", 9900 gives "99". */
export const targetText = (target: number) => String(target / 100);

/** Allowed bad minutes in the window. */
export const allowedMinutes = (target: number, days: number) => ((10000 - target) * days * 1440) / 10000;

/** Allowed bad requests per million. */
export const badPerMillion = (target: number) => (10000 - target) * 100;

const group = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

/**
 * The minutes as the chapter table prints them: one decimal under 100 (5.0,
 * 43.2), and from 100 up one decimal only when there is a fraction (100.8,
 * 129.6, but 216 and 1,296).
 */
export function formatMinutes(min: number): string {
  const r = Math.round(min * 10) / 10;
  if (r < 100) return r.toFixed(1);
  return Math.abs(r - Math.round(r)) < 1e-9 ? group(Math.round(r)) : `${group(Math.floor(r))}.${Math.round((r - Math.floor(r)) * 10)}`;
}

export const formatCount = (n: number) => group(n);

export type Probe = { fits: boolean; leftover: number; over: number; leftoverShare: number };

export function probe(allowed: number): Probe {
  const fits = allowed >= PROBE_MIN;
  return { fits, leftover: fits ? allowed - PROBE_MIN : 0, over: fits ? 0 : PROBE_MIN - allowed, leftoverShare: fits ? (allowed - PROBE_MIN) / allowed : 0 };
}

export type Verdict = { text: string; tone: Tone };

export function verdictFor(target: number, days: number): Verdict {
  const allowed = allowedMinutes(target, days);
  const p = probe(allowed);
  if (!p.fits) return { text: "A 25 min outage busts the budget", tone: "bad" };
  return { text: `A 25 min outage leaves ${formatCount(Math.round(p.leftover))} min`, tone: p.leftoverShare >= 0.5 ? "good" : "warn" };
}

export function valueText(target: number, days: number): string {
  return `target ${targetText(target)} percent, ${formatMinutes(allowedMinutes(target, days))} bad minutes in ${days} days`;
}

/** Width of the allowed sliver on a bar of `barWidth` units, never under 3 so it stays visible. */
export const sliverWidth = (target: number, barWidth: number) => Math.max(3, ((10000 - target) / 10000) * barWidth);

/** The scale of the probe bars: the longer of the allowance and the probe fills the row. */
export const probeScale = (allowed: number) => Math.max(allowed, PROBE_MIN);
