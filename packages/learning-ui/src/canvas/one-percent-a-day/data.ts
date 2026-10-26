import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// 1% Better course (one-percent-better), chapter 1.2 "Small and steady". The
// arithmetic behind James Clear's "1% better every day" picture: a value that
// grows by p% on a good day and shrinks by p% on a slip day. Slip days are
// spread evenly, so over n days there are round(n x slips / 7) of them.
// - steady: (1 + p)^n, every day a good day;
// - with slips: (1 + p)^good x (1 - p)^slip;
// - backwards: (1 - p)^n, every day a slip.
// This is a picture of compounding only. Iman, reward and the worth of a deed
// are not numbers, and nobody can measure 1% of a prayer. See spec.md.

export type CompoundLevels = {
  /** Daily change as a percentage, for example 1 for 1%. */
  pct: number;
  days: number;
  /** Slip days a week, each one the same size as a good day, in reverse. */
  slips: number;
  slipDays: number;
  goodDays: number;
  steady: number;
  withSlips: number;
  backwards: number;
};

/** A number inside [min, max], snapped to the step; anything that is not a finite number falls back to the default. */
function snap(value: unknown, fallback: number, min: number, max: number, step: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  const snapped = Math.round((n - min) / step) * step + min;
  return Math.max(min, Math.min(max, Number(snapped.toFixed(4))));
}

export function compoundLevels(values: SliderValues): CompoundLevels {
  const pct = snap(values.pct, 1, 0.5, 2, 0.5);
  const days = snap(values.days, 365, 30, 365, 5);
  const slips = snap(values.slips, 0, 0, 3, 1);
  const rate = pct / 100;
  const slipDays = Math.round((days * slips) / 7);
  const goodDays = days - slipDays;
  return {
    pct,
    days,
    slips,
    slipDays,
    goodDays,
    steady: (1 + rate) ** days,
    withSlips: (1 + rate) ** goodDays * (1 - rate) ** slipDays,
    backwards: (1 - rate) ** days,
  };
}

/** A level as "x37.8", "x1.65" or "x0.03": one decimal from 10 up, two below. */
export function formatLevel(level: number): string {
  if (level >= 10) return `x${level.toFixed(1)}`;
  return `x${level.toFixed(2)}`;
}

function slipWords(slips: number): string {
  if (slips === 0) return "no slip days";
  return `${slips} slip ${slips === 1 ? "day" : "days"} a week`;
}

function computeOnePercent(values: SliderValues): SliderResult {
  const r = compoundLevels(values);
  return {
    stats: [
      { label: "With your slip days", value: formatLevel(r.withSlips), detail: `${r.goodDays} good, ${r.slipDays} slip` },
      { label: "Every day a good day", value: formatLevel(r.steady), detail: `${r.pct}% better for ${r.days} days` },
      { label: "Every day a slip", value: formatLevel(r.backwards), detail: `${r.pct}% worse for ${r.days} days` },
    ],
    bars: [
      { label: "Every day a good day", value: r.steady, display: formatLevel(r.steady), tone: "good" },
      { label: "With your slip days", value: r.withSlips, display: formatLevel(r.withSlips) },
      { label: "Where you started", value: 1, display: "x1.00" },
      { label: "Every day a slip", value: r.backwards, display: formatLevel(r.backwards), tone: "bad" },
    ],
    summary: `Over ${r.days} days at ${r.pct}% a day with ${slipWords(r.slips)}, you end at ${formatLevel(r.withSlips)} of where you started. With no slips it would be ${formatLevel(r.steady)}, and with a slip every day it would be ${formatLevel(r.backwards)}.`,
  };
}

/** "What changed": which input moved and what it did to the level with slip days. */
export function describeOnePercentChange(before: SliderValues, after: SliderValues): string {
  const a = compoundLevels(before);
  const b = compoundLevels(after);
  const end = `You now end at ${formatLevel(b.withSlips)}, from ${formatLevel(a.withSlips)}.`;
  const moved = [a.pct !== b.pct, a.days !== b.days, a.slips !== b.slips].filter(Boolean).length;
  if (moved === 0) return "Nothing changed.";
  if (moved > 1) return end;
  if (a.pct !== b.pct) return `Changing the daily step from ${a.pct}% to ${b.pct}% changes every day at once. ${end}`;
  if (a.days !== b.days) {
    return `${b.days > a.days ? "More" : "Fewer"} days: ${b.days} instead of ${a.days}. Small steps add up slowly at first and quickly later. ${end}`;
  }
  const stillAhead = b.withSlips > 1 ? " You are still ahead of where you started." : " You are now at or below where you started.";
  return `With ${slipWords(b.slips)} instead of ${slipWords(a.slips)}, ${b.slipDays} of the ${b.days} days go backwards. ${end}${stillAhead}`;
}

export const onePercentADay: SliderSpec = {
  kind: "slider",
  title: "1% a day, with real days in it",
  purpose: "Change the size of the daily step, the number of days and the slip days a week, and see where small steps add up to.",
  intro:
    "James Clear's picture: if something gets 1% better each day for a year, it ends about 37 times where it started; 1% worse each day, and it shrinks almost to nothing. Real weeks have bad days. Hamza wants to know what happens when one or two days a week slip backwards by the same amount. Before you move anything, predict: with one slip day every week, does a year of 1% steps still end far ahead, or close to where it started?",
  inputs: [
    { id: "pct", label: "Daily step", min: 0.5, max: 2, step: 0.5, default: 1, unit: "%" },
    { id: "days", label: "Days", min: 30, max: 365, step: 5, default: 365, unit: "days" },
    { id: "slips", label: "Slip days a week", min: 0, max: 3, step: 1, default: 0, unit: "days" },
  ],
  compute: computeOnePercent,
  describeChange: describeOnePercentChange,
  barsTitle: "Where you end, compared with where you started (x1.00)",
  tryThis: [
    "Start with the defaults: 1% for 365 days and no slip days ends at x37.8. Now predict what one slip day a week does before you set it.",
    "Set slip days to 1. The year still ends at x13.4: one bad day a week does not cancel six good ones.",
    "Set days to 30. A month of 1% steps ends at x1.35. Small steps look like nothing at first, which is why people quit early.",
    "Set slip days to 3. Four good days against three slips still ends above where you started, at x1.67, but only just.",
  ],
  limits:
    "This is arithmetic, not a measurement. It assumes every good day adds the same percentage and every slip takes the same amount away, which no real habit does. Nobody can measure 1% of a prayer, a page of Quran or a heart, and Allah's reward is not a number on this screen. Use it only to see why small, steady steps matter more than one big start.",
};
