import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Building Habits That Last course, chapter 5.3 "Missing a day without losing
// the habit". The defaults are Yousef's month: 20 minutes of practice
// questions after the evening meal, done on days 1 to 23, missed on days 24 to
// 28 (five evenings with no power), done again on days 29 and 30. Pure
// counting, no research numbers. See spec.md.

/** Length of the month on the calendar. */
export const DAYS = 30;

export type StreakInputs = {
  /** How many days were missed, 0 to 10. */
  missed: number;
  /** The day of the first miss, 1 to 30. */
  firstMiss: number;
  /** 0: all misses in a row. 1: spread out, one miss every other day. */
  spread: number;
};

export type MonthCounts = {
  /** The missed days, in order. */
  missedDays: number[];
  /** The day the first miss really lands on, after moving it so every miss fits in 30 days. */
  firstMissUsed: number;
  daysDone: number;
  /** Days done in a row, counted back from day 30. */
  streakOnLastDay: number;
  /** The longest run of days done in a row. */
  longestRun: number;
  /** The longest run of missed days in a row. */
  longestGap: number;
};

/**
 * Place the misses on the calendar. All together: first, first + 1, first + 2
 * and so on. Spread out: first, first + 2, first + 4 and so on. If the misses
 * would run past day 30, the first miss moves earlier until they all fit.
 */
export function missedDaysFor({ missed, firstMiss, spread }: StreakInputs): number[] {
  const count = Math.max(0, Math.min(DAYS, Math.round(missed)));
  if (count === 0) return [];
  const gap = spread >= 1 ? 2 : 1;
  const span = (count - 1) * gap + 1;
  const start = Math.max(1, Math.min(Math.round(firstMiss), DAYS - span + 1));
  return Array.from({ length: count }, (_, i) => start + i * gap);
}

/** Count the month: days done, the streak on day 30, the longest run and the longest gap. */
export function countMonth(inputs: StreakInputs): MonthCounts {
  const missedDays = missedDaysFor(inputs);
  const missedSet = new Set(missedDays);
  let longestRun = 0;
  let longestGap = 0;
  let run = 0;
  let gap = 0;
  for (let day = 1; day <= DAYS; day++) {
    if (missedSet.has(day)) {
      gap += 1;
      run = 0;
    } else {
      run += 1;
      gap = 0;
    }
    longestRun = Math.max(longestRun, run);
    longestGap = Math.max(longestGap, gap);
  }
  let streakOnLastDay = 0;
  for (let day = DAYS; day >= 1 && !missedSet.has(day); day--) streakOnLastDay += 1;
  return {
    missedDays,
    firstMissUsed: missedDays[0] ?? 0,
    daysDone: DAYS - missedDays.length,
    streakOnLastDay,
    longestRun,
    longestGap,
  };
}

function inputsFrom(values: SliderValues): StreakInputs {
  return {
    missed: values.missed ?? 5,
    firstMiss: values.firstMiss ?? 24,
    spread: values.spread ?? 0,
  };
}

export function days(n: number): string {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

/** "24", "24 and 25", "24, 25 and 26". */
export function listDays(list: number[]): string {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

function moved(inputs: StreakInputs, counts: MonthCounts): boolean {
  return counts.missedDays.length > 0 && counts.firstMissUsed !== Math.round(inputs.firstMiss);
}

export function computeStreak(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const c = countMonth(inputs);
  const percent = Math.round((c.daysDone / DAYS) * 100);
  const where =
    c.missedDays.length === 0
      ? "No missed days."
      : `Missed on day${c.missedDays.length === 1 ? "" : "s"} ${listDays(c.missedDays)}.`;
  const note = moved(inputs, c) ? ` The first miss moved to day ${c.firstMissUsed} so every miss fits in 30 days.` : "";

  return {
    stats: [
      { label: "Days done", value: `${c.daysDone} of ${DAYS}`, detail: `${percent}% of the month` },
      { label: "Streak on day 30", value: days(c.streakOnLastDay), detail: `longest run ${days(c.longestRun)}` },
      { label: "Longest gap", value: days(c.longestGap), detail: "missed in a row" },
    ],
    bars: [
      { label: "Days done", value: c.daysDone, display: `${c.daysDone}` },
      { label: "Longest run", value: c.longestRun, display: `${c.longestRun}` },
      { label: "Streak on day 30", value: c.streakOnLastDay, display: `${c.streakOnLastDay}` },
      { label: "Longest gap", value: c.longestGap, display: `${c.longestGap}` },
    ],
    barMax: DAYS,
    summary: `${where}${note} ${c.daysDone} of ${DAYS} days done, a streak of ${days(c.streakOnLastDay)} on day 30, a longest run of ${days(c.longestRun)} and a longest gap of ${days(c.longestGap)}.`,
  };
}

function change(name: string, from: number, to: number, asDays: boolean): string {
  const show = (n: number) => (asDays ? days(n) : `${n}`);
  return from === to ? `${name} stayed at ${show(to)}` : `${name} went from ${show(from)} to ${show(to)}`;
}

export function describeStreakChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const changed: string[] = [];
  if (a.missed !== b.missed) changed.push("the number of missed days");
  if (a.firstMiss !== b.firstMiss) changed.push("the day of the first miss");
  if (a.spread !== b.spread) changed.push(b.spread >= 1 ? "spreading the misses out" : "putting the misses in a row");
  if (changed.length === 0) return "Nothing changed.";
  const x = countMonth(a);
  const y = countMonth(b);
  const what =
    changed.length > 1
      ? "Changing several inputs"
      : changed[0]!.startsWith("the")
        ? `Changing ${changed[0]}`
        : changed[0]!.charAt(0).toUpperCase() + changed[0]!.slice(1);
  const parts = [
    change("days done", x.daysDone, y.daysDone, false),
    change("the streak on day 30", x.streakOnLastDay, y.streakOnLastDay, true),
    change("the longest gap", x.longestGap, y.longestGap, true),
  ];
  const note = moved(b, y) ? ` The first miss moved to day ${y.firstMissUsed} so every miss fits in 30 days.` : "";
  return `${what}: ${parts[0]}, ${parts[1]}, and ${parts[2]}.${note}`;
}

export const streakOrDoneCount: SliderSpec = {
  kind: "slider",
  title: "Streak or days done: what one miss changes",
  purpose: "Change how many days are missed, when the first miss comes and whether the misses fall together, and compare the streak, the days done and the longest gap.",
  intro:
    "Yousef's month: 20 minutes of practice questions after the evening meal. He did days 1 to 23, missed days 24 to 28 when there was no power in the evenings, and restarted on day 29. Predict what a single miss does to the streak and to the days done, then move the sliders.",
  inputs: [
    { id: "missed", label: "Missed days", min: 0, max: 10, step: 1, default: 5, unit: "days" },
    { id: "firstMiss", label: "Day of the first miss", min: 1, max: 30, step: 1, default: 24, unit: "" },
    { id: "spread", label: "Spread out: 0 no, 1 yes", min: 0, max: 1, step: 1, default: 0, unit: "" },
  ],
  compute: computeStreak,
  describeChange: describeStreakChange,
  barsTitle: "Days out of 30",
  tryThis: [
    "Set missed days to 1, with the miss on day 24. On day 30 the streak shows 6 days, while days done shows 29 of 30: from a perfect month, one miss cost the streak 24 days and the month only 1 day.",
    "Go back to 5 missed days from day 24 and set spread out to 1. Days done stays at 25 of 30, but the longest gap falls from 5 days to 1 day. The first miss moves to day 22 so all five fit.",
    "Set 7 missed days all together from day 24, as if Yousef had waited for the first of next month to restart. Days done falls to 23 and the gap grows to 7 days.",
  ],
  limits:
    "This is pure counting on a 30-day calendar, a simple illustration. It does not show that misses in a row harm a habit more than misses spread out: that has not been tested. What research does show is that one missed day did not undo progress, that many misses lowered how automatic a habit became, and that in a large study of gym members a longer gap since the last visit made the next visit less likely.",
};
