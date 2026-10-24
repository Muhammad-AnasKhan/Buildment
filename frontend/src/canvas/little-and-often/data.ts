import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Steady Hearts course (faith-and-resilience), chapter 6.3 "Good work, a little
// and often". Tariq wants to learn to write automated tests over 4 weeks. The
// small plan is a short session on some days of the week; the long plan is one
// long session every Friday. Bad days (a power cut, an illness, a family need)
// remove sessions from both plans:
// - a bad day takes the whole day, so any session planned for it is lost;
// - a short session can move to another good day in the same week, so the
//   small plan keeps min(days, 7 - bad days) sessions a week;
// - a long session needs a whole free day, and Friday is the only one, so it
//   is lost when Friday is a bad day. Each day is equally likely to be bad, so
//   on average the long plan keeps 4 x (7 - bad days) / 7 sessions.
// Honest arithmetic of practice time only: no reward, no faith. The defaults
// are the chapter's numbers: 45 minutes on 6 days a week against 5 hours every
// Friday, with 1 bad day a week. See spec.md.

export const WEEKS = 4;
export const DAYS_IN_WEEK = 7;

export type PracticeTotals = {
  /** Small plan: minutes per session, sessions planned per week. */
  minutes: number;
  days: number;
  /** Long plan: hours per Friday session. */
  hours: number;
  /** Bad days a week, each a whole day with no work. */
  bad: number;
  /** Small sessions kept over 4 weeks (whole number). */
  smallSessions: number;
  /** Long sessions kept over 4 weeks, on average (may be a fraction). */
  longSessions: number;
  /** Total minutes over 4 weeks; the long plan's is an average. */
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
  const days = whole(values.days, 6, 0, DAYS_IN_WEEK);
  const hours = whole(values.hours, 5, 0, 8);
  const bad = whole(values.bad, 1, 0, DAYS_IN_WEEK);
  const goodDays = DAYS_IN_WEEK - bad;
  const smallSessions = Math.min(days, goodDays) * WEEKS;
  const longSessions = (WEEKS * goodDays) / DAYS_IN_WEEK;
  const smallMinutes = minutes * smallSessions;
  const longMinutes = hours * 60 * longSessions;
  return {
    minutes,
    days,
    hours,
    bad,
    smallSessions,
    longSessions,
    smallMinutes,
    longMinutes,
    difference: smallMinutes - longMinutes,
  };
}

/** Minutes as "18 h", "40 min" or "17 h 9 min", rounded to the nearest minute. */
export function formatTime(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (rest === 0) return `${h} h`;
  if (h === 0) return `${rest} min`;
  return `${h} h ${rest} min`;
}

/** Sessions as "24 sessions" or, for an average, "3.4 sessions". */
export function formatSessions(n: number): string {
  const shown = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${shown} ${shown === "1" ? "session" : "sessions"}`;
}

/** Which plan is ahead in time, in one plain sentence. Gaps under a minute count as level. */
export function standing(r: PracticeTotals): string {
  if (Math.round(r.difference) > 0) return `The small plan is ahead by ${formatTime(r.difference)}.`;
  if (Math.round(r.difference) < 0) return `The long plan is ahead by ${formatTime(-r.difference)}.`;
  return "Both plans give the same time.";
}

function computePracticeTotals(values: SliderValues): SliderResult {
  const r = practiceTotals(values);
  const gap = Math.round(r.difference);
  const ahead = gap > 0 ? "Small plan" : gap < 0 ? "Long plan" : "Level";
  return {
    stats: [
      {
        label: "Small and often, 4 weeks",
        value: formatTime(r.smallMinutes),
        detail: `${formatSessions(r.smallSessions)} of ${r.minutes} min`,
      },
      {
        label: "Long and rare, 4 weeks",
        value: formatTime(r.longMinutes),
        detail:
          r.longSessions === 0
            ? "no Friday is free"
            : Number.isInteger(r.longSessions)
              ? `${formatSessions(r.longSessions)} of ${r.hours} h`
              : `on average ${formatSessions(r.longSessions)} of ${r.hours} h`,
      },
      {
        label: "Ahead in time",
        value: ahead,
        detail: gap === 0 ? "same time" : `by ${formatTime(Math.abs(r.difference))}`,
      },
    ],
    bars: [
      { label: "Small and often", value: r.smallMinutes / 60, display: formatTime(r.smallMinutes) },
      { label: "Long and rare", value: r.longMinutes / 60, display: formatTime(r.longMinutes) },
    ],
    summary: `Over 4 weeks with ${r.bad} bad ${r.bad === 1 ? "day" : "days"} a week, the small plan gives ${formatTime(r.smallMinutes)} in ${formatSessions(r.smallSessions)}, and the long plan gives ${formatTime(r.longMinutes)} in ${formatSessions(r.longSessions)} on average. ${standing(r)}`,
  };
}

/** "What changed": which input moved, what it did to each plan over 4 weeks, and who is ahead now. */
export function describeLittleAndOftenChange(before: SliderValues, after: SliderValues): string {
  const a = practiceTotals(before);
  const b = practiceTotals(after);
  const moved = [a.minutes !== b.minutes, a.days !== b.days, a.hours !== b.hours, a.bad !== b.bad].filter(Boolean).length;
  if (moved === 0) return "Nothing changed: both plans give the same time as before.";
  if (moved > 1) {
    return `Over 4 weeks, the small plan now gives ${formatTime(b.smallMinutes)} and the long plan ${formatTime(b.longMinutes)}. ${standing(b)}`;
  }
  const change = (delta: number) =>
    Math.round(delta) === 0 ? "changed nothing" : `${delta > 0 ? "added" : "removed"} ${formatTime(Math.abs(delta))} over 4 weeks`;
  const smallDelta = b.smallMinutes - a.smallMinutes;
  const longDelta = b.longMinutes - a.longMinutes;
  if (a.minutes !== b.minutes) {
    return `Changing the small plan from ${a.minutes} to ${b.minutes} minutes a session ${change(smallDelta)}. ${standing(b)}`;
  }
  if (a.days !== b.days) {
    const capped = b.days > DAYS_IN_WEEK - b.bad ? ` Only ${DAYS_IN_WEEK - b.bad} days a week are good, so it keeps ${formatSessions(b.smallSessions)}.` : "";
    return `Changing the small plan from ${a.days} to ${b.days} days a week ${change(smallDelta)}.${capped} ${standing(b)}`;
  }
  if (a.hours !== b.hours) {
    return `Changing each Friday session from ${a.hours} to ${b.hours} hours ${change(longDelta)}. ${standing(b)}`;
  }
  const word = (n: number) => `${n} bad ${n === 1 ? "day" : "days"}`;
  const worse = b.bad > a.bad;
  const smallPart =
    Math.round(smallDelta) === 0
      ? worse
        ? "the small plan lost nothing, because its short sessions moved to good days"
        : "the small plan did not change"
      : `the small plan ${smallDelta < 0 ? "lost" : "gained"} ${formatTime(Math.abs(smallDelta))}, because there are ${DAYS_IN_WEEK - b.bad} good days for its sessions`;
  const longPart = worse
    ? `the long plan lost about ${formatTime(Math.abs(longDelta))}, because a bad Friday cancels a whole session`
    : `the long plan gained about ${formatTime(Math.abs(longDelta))}, because Friday is free more often`;
  return `With ${word(b.bad)} a week instead of ${a.bad}, ${smallPart}, and ${longPart}. ${standing(b)}`;
}

export const littleAndOften: SliderSpec = {
  kind: "slider",
  title: "A little and often, or long and rare?",
  purpose: "Change the size of each plan and the number of bad days, and see which plan adds up to more over 4 weeks.",
  intro:
    "Tariq wants to learn to write automated tests over the next 4 weeks. The small plan is 45 minutes a day on 6 days a week. The long plan is one 5-hour session every Friday. Bad days take a whole day: a power cut, an illness, a family need. A short session can move to another good day in the same week. A 5-hour session needs a whole free day, and Friday is his only one, so a bad Friday cancels it. Before you move anything, predict which plan gives more time with one bad day a week.",
  inputs: [
    { id: "minutes", label: "Small plan: minutes a day", min: 10, max: 120, step: 5, default: 45, unit: "min" },
    { id: "days", label: "Small plan: days a week", min: 1, max: 7, step: 1, default: 6, unit: "days" },
    { id: "hours", label: "Long plan: hours on Friday", min: 1, max: 8, step: 1, default: 5, unit: "h" },
    { id: "bad", label: "Bad days a week", min: 0, max: 4, step: 1, default: 1, unit: "days" },
  ],
  compute: computePracticeTotals,
  describeChange: describeLittleAndOftenChange,
  barsTitle: "Practice time over 4 weeks",
  tryThis: [
    "Before you move anything, predict: with one bad day a week, do 45 minutes on 6 days give more time than 5 hours every Friday?",
    "Set bad days to 0. The long plan has 20 h and leads by 2 h: with no bad days at all, the long plan wins.",
    "Set bad days to 3. Only 4 days a week are good, so the small plan keeps 4 sessions a week, 12 h. The long plan averages 11 h 26 min.",
    "Lower the small plan to 20 minutes a day. Now the long plan leads, 17 h 9 min to 8 h, though it touches the work on far fewer days.",
  ],
  limits:
    "This counts only practice time and sessions. It assumes a bad day takes the whole day, that every day is equally likely to be bad, and that a short session can always move to another good day in the same week while a long one cannot. The long plan's time is an average over many months, not a promise for one month. It leaves out tiredness in a long session, how much you remember between sessions, and the quality of the work. It measures practice time, never faith or reward.",
};
