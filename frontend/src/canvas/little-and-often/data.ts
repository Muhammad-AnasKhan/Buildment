import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Steady Hearts course (faith-and-resilience), chapter 6.3 "Good work, a little
// and often". Tariq wants to learn to write automated tests over 4 weeks. The
// small plan is a short session on most days; the long plan is one long
// session every Friday, and a bad Friday (a power cut, an illness, a family
// need) loses that week's session. The model counts only hours and sessions:
// honest arithmetic, no reward, no faith. The defaults are the chapter's
// numbers: 45 minutes on 6 days a week against 5 hours every Friday, with 1
// Friday lost. See spec.md.

export const WEEKS = 4;

export type PracticeTotals = {
  /** Small plan: minutes per session, sessions per week. */
  minutes: number;
  days: number;
  /** Long plan: hours per Friday session, Fridays lost out of 4. */
  hours: number;
  missed: number;
  smallSessions: number;
  longSessions: number;
  /** Total minutes over 4 weeks. */
  smallMinutes: number;
  longMinutes: number;
  /** smallMinutes - longMinutes: positive when the small plan is ahead. */
  difference: number;
};

/** A whole number inside [min, max]; anything that is not a finite number falls back to the default. */
function whole(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.max(min, Math.min(max, n));
}

export function practiceTotals(values: SliderValues): PracticeTotals {
  const minutes = whole(values.minutes, 45, 0, 120);
  const days = whole(values.days, 6, 0, 7);
  const hours = whole(values.hours, 5, 0, 8);
  const missed = whole(values.missed, 1, 0, WEEKS);
  const smallSessions = days * WEEKS;
  const longSessions = WEEKS - missed;
  const smallMinutes = minutes * smallSessions;
  const longMinutes = hours * 60 * longSessions;
  return {
    minutes,
    days,
    hours,
    missed,
    smallSessions,
    longSessions,
    smallMinutes,
    longMinutes,
    difference: smallMinutes - longMinutes,
  };
}

/** Minutes as "18 h", "40 min" or "3 h 20 min". */
export function formatTime(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (rest === 0) return `${h} h`;
  if (h === 0) return `${rest} min`;
  return `${h} h ${rest} min`;
}

const sessions = (n: number) => `${n} ${n === 1 ? "session" : "sessions"}`;

/** Which plan is ahead in hours, in one plain sentence. */
export function standing(r: PracticeTotals): string {
  if (r.difference > 0) return `The small plan is ahead by ${formatTime(r.difference)}.`;
  if (r.difference < 0) return `The long plan is ahead by ${formatTime(-r.difference)}.`;
  return "Both plans give the same hours.";
}

function computePracticeTotals(values: SliderValues): SliderResult {
  const r = practiceTotals(values);
  const ahead = r.difference > 0 ? "Small plan" : r.difference < 0 ? "Long plan" : "Level";
  return {
    stats: [
      {
        label: "Small and often, 4 weeks",
        value: formatTime(r.smallMinutes),
        detail: `${sessions(r.smallSessions)} of ${r.minutes} min`,
      },
      {
        label: "Long and rare, 4 weeks",
        value: formatTime(r.longMinutes),
        detail: r.longSessions === 0 ? "no session happened" : `${sessions(r.longSessions)} of ${r.hours} h`,
      },
      {
        label: "Ahead in hours",
        value: ahead,
        detail: r.difference === 0 ? "same hours" : `by ${formatTime(Math.abs(r.difference))}`,
      },
    ],
    bars: [
      { label: "Small and often", value: r.smallMinutes / 60, display: formatTime(r.smallMinutes) },
      { label: "Long and rare", value: r.longMinutes / 60, display: formatTime(r.longMinutes) },
    ],
    summary: `Over 4 weeks, the small plan gives ${formatTime(r.smallMinutes)} in ${sessions(r.smallSessions)}, and the long plan gives ${formatTime(r.longMinutes)} in ${sessions(r.longSessions)}. ${standing(r)}`,
  };
}

/** "What changed": which input moved, what it did to that plan's 4 weeks, and who is ahead now. */
export function describeLittleAndOftenChange(before: SliderValues, after: SliderValues): string {
  const a = practiceTotals(before);
  const b = practiceTotals(after);
  const moved = [a.minutes !== b.minutes, a.days !== b.days, a.hours !== b.hours, a.missed !== b.missed].filter(Boolean).length;
  if (moved === 0) return "Nothing changed: both plans give the same hours as before.";
  if (moved > 1) {
    return `Over 4 weeks, the small plan now gives ${formatTime(b.smallMinutes)} and the long plan ${formatTime(b.longMinutes)}. ${standing(b)}`;
  }
  const smallDelta = b.smallMinutes - a.smallMinutes;
  const longDelta = b.longMinutes - a.longMinutes;
  const change = (delta: number) => `${delta >= 0 ? "added" : "removed"} ${formatTime(Math.abs(delta))} over 4 weeks`;
  if (a.minutes !== b.minutes) {
    return `Changing the small plan from ${a.minutes} to ${b.minutes} minutes a day ${change(smallDelta)}. ${standing(b)}`;
  }
  if (a.days !== b.days) {
    return `Changing the small plan from ${a.days} to ${b.days} days a week ${change(smallDelta)}, and it now has ${sessions(b.smallSessions)}. ${standing(b)}`;
  }
  if (a.hours !== b.hours) {
    return `Changing each Friday session from ${a.hours} to ${b.hours} hours ${change(longDelta)}. ${standing(b)}`;
  }
  if (b.longSessions === 0) {
    return `With all 4 Fridays lost to bad days, no long session happens at all. ${standing(b)}`;
  }
  const verb = longDelta < 0 ? "loses" : "gains";
  return `With ${b.missed} of 4 Fridays lost instead of ${a.missed}, the long plan ${verb} ${formatTime(Math.abs(longDelta))}, because one bad Friday cancels a whole session. ${standing(b)}`;
}

export const littleAndOften: SliderSpec = {
  kind: "slider",
  title: "A little and often, or long and rare?",
  purpose: "Change the size of each plan and the bad Fridays, and see which plan adds up to more over 4 weeks.",
  intro:
    "Tariq wants to learn to write automated tests over the next 4 weeks, so that his code has fewer bugs. The small plan is 45 minutes a day on 6 days a week. The long plan is one 5-hour session every Friday. In this example, bad days come often: a power cut, an illness, a family need. A 45-minute session can usually fit around them; a 5-hour session needs a whole free day, so one bad Friday loses that whole week's session. Before you move anything, predict which plan gives more hours in a month with one lost Friday.",
  inputs: [
    { id: "minutes", label: "Small plan: minutes a day", min: 10, max: 120, step: 5, default: 45, unit: "min" },
    { id: "days", label: "Small plan: days a week", min: 1, max: 7, step: 1, default: 6, unit: "days" },
    { id: "hours", label: "Long plan: hours on Friday", min: 1, max: 8, step: 1, default: 5, unit: "h" },
    { id: "missed", label: "Fridays lost to bad days", min: 0, max: 4, step: 1, default: 1, unit: "of 4" },
  ],
  compute: computePracticeTotals,
  describeChange: describeLittleAndOftenChange,
  barsTitle: "Hours of practice over 4 weeks",
  tryThis: [
    "Before you move anything, predict: in a month with one lost Friday, do 45 minutes on 6 days a week give more hours than 5 hours every Friday?",
    "Lower the small plan to 20 minutes a day. Now the long plan has more hours, 15 h to 8 h, but it still touches the work on only 3 days out of 28.",
    "Set Fridays lost to 0. The long plan rises to 20 h and leads by 2 h: a rare long plan only wins if no bad day ever lands on it.",
    "Set the small plan to 5 days a week. Both plans give 15 h, but the small plan has 20 sessions and the long plan 3.",
  ],
  limits:
    "This counts only hours and sessions. It assumes every small session happens on its planned days, while bad days fall only on Fridays, which is the chapter's example, not a rule. It leaves out tiredness in a long session, how much you remember between sessions, and the quality of the work. It measures practice time, never faith or reward.",
};
