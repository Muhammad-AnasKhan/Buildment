import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Building Habits That Last course, chapter 2.2 "Motivation goes up and down,
// so start small". Lina's motivation over 14 days is a fixed example series on
// a 0 to 10 scale. Toy rule: the habit happens on a day when motivation is at
// least the effort the habit needs. A hard second week lowers motivation on
// days 8 to 14. See spec.md.

/** Lina's motivation, days 1 to 14 (day 1 is the Saturday she lost the job). Example numbers. */
export const MOTIVATION = [9, 8, 6, 5, 3, 4, 6, 7, 5, 4, 3, 2, 4, 5] as const;
/** The effort of Lina's smallest version in the chapter: three sentences by hand. */
export const SMALLEST_EFFORT = 2;
/** The effort of her Saturday plan: one hour and a new essay. */
export const BIG_PLAN_EFFORT = 7;

export type WaveInputs = {
  /** Effort the habit needs, 1 to 10. */
  effort: number;
  /** How much lower motivation is on days 8 to 14, 0 to 3. */
  hardWeek: number;
};

export type WaveResult = {
  /** Motivation on each day after the hard week is applied (never below 0). */
  motivation: number[];
  /** Day numbers (1 to 14) when the habit happens. */
  doneDays: number[];
  week1: number;
  week2: number;
  /** Longest run of days in a row without the habit, with its first and last day. */
  longestGap: { length: number; from: number; to: number };
};

export function motivationSeries(hardWeek: number): number[] {
  return MOTIVATION.map((m, i) => (i >= 7 ? Math.max(0, m - hardWeek) : m));
}

/** The toy rule: a day counts when motivation is at least the effort. */
export function habitDays({ effort, hardWeek }: WaveInputs): WaveResult {
  const motivation = motivationSeries(hardWeek);
  const done = motivation.map((m) => m >= effort);
  const doneDays = done.flatMap((d, i) => (d ? [i + 1] : []));
  let longestGap = { length: 0, from: 0, to: 0 };
  let run = 0;
  done.forEach((d, i) => {
    run = d ? 0 : run + 1;
    if (run > longestGap.length) longestGap = { length: run, from: i + 2 - run, to: i + 1 };
  });
  return {
    motivation,
    doneDays,
    week1: done.slice(0, 7).filter(Boolean).length,
    week2: done.slice(7).filter(Boolean).length,
    longestGap,
  };
}

function inputsFrom(values: SliderValues): WaveInputs {
  const num = (v: unknown, fallback: number, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
  return { effort: num(values.effort, BIG_PLAN_EFFORT, 1, 10), hardWeek: num(values.hardWeek, 0, 0, 3) };
}

/** "days 1, 2 and 8", "day 5", "every day" or "no days". */
export function listDays(days: number[]): string {
  if (days.length === 0) return "no days";
  if (days.length === 14) return "every day";
  if (days.length === 1) return `day ${days[0]}`;
  return `days ${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}`;
}

const dayWord = (n: number) => (n === 1 ? "day" : "days");

export function computeWave(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const r = habitDays(inputs);
  const small = habitDays({ effort: SMALLEST_EFFORT, hardWeek: inputs.hardWeek });
  const gap = r.longestGap;
  return {
    stats: [
      { label: "Days it happens", value: `${r.doneDays.length} of 14`, detail: listDays(r.doneDays) },
      {
        label: "Longest gap",
        value: gap.length === 0 ? "none" : `${gap.length} ${dayWord(gap.length)}`,
        detail: gap.length === 0 ? "not a day missed" : gap.length === 1 ? `day ${gap.from}` : `days ${gap.from} to ${gap.to}`,
      },
      { label: "Motivation needed", value: `${inputs.effort} or more`, detail: "on a 0 to 10 scale" },
    ],
    bars: [
      { label: `This habit, week 1`, value: r.week1, display: `${r.week1} of 7` },
      { label: `This habit, week 2`, value: r.week2, display: `${r.week2} of 7` },
      { label: `Smallest version, week 1`, value: small.week1, display: `${small.week1} of 7` },
      { label: `Smallest version, week 2`, value: small.week2, display: `${small.week2} of 7` },
    ],
    barMax: 7,
    summary: `A habit that needs an effort of ${inputs.effort} happens on ${r.doneDays.length} of 14 days (${listDays(r.doneDays)}). Lina's smallest version, effort ${SMALLEST_EFFORT}, happens on ${small.doneDays.length} of 14.`,
  };
}

export function describeWaveChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = habitDays(a).doneDays.length;
  const y = habitDays(b).doneDays.length;
  const now = `${y} of 14 days instead of ${x}`;
  const effortChanged = a.effort !== b.effort;
  const weekChanged = a.hardWeek !== b.hardWeek;

  if (!effortChanged && !weekChanged) return "Nothing changed.";
  if (effortChanged && weekChanged) return `The habit now happens on ${now}.`;
  if (effortChanged) {
    const why =
      b.effort < a.effort
        ? "A smaller habit fits the low days too, not only the high ones."
        : "A bigger habit needs a high day, and high days are few.";
    return `Changing the effort from ${a.effort} to ${b.effort}: the habit now happens on ${now}. ${why}`;
  }
  if (b.hardWeek === 0) return `With an ordinary second week, the habit happens on ${now}.`;
  return `A harder second week (motivation ${b.hardWeek} lower on days 8 to 14): the habit now happens on ${now}. A hard week hurts a big habit far more than a small one.`;
}

export const motivationWaveHabitSize: SliderSpec = {
  kind: "slider",
  title: "Motivation goes up and down",
  purpose: "Change how much effort a habit needs and how hard the second week is, and see on which days the habit still happens.",
  intro:
    "Lina's motivation over two weeks, in this example, on a scale of 0 to 10: 9, 8, 6, 5, 3, 4, 6, 7, 5, 4, 3, 2, 4, 5. A simple rule decides each day: the habit happens when her motivation is at least the effort it needs. Her one-hour essay plan needs an effort of 7. Predict on how many days it happens.",
  inputs: [
    { id: "effort", label: "Effort the habit needs", min: 1, max: 10, step: 1, default: BIG_PLAN_EFFORT, unit: "of 10" },
    { id: "hardWeek", label: "Hard second week", min: 0, max: 3, step: 1, default: 0, unit: "lower" },
  ],
  compute: computeWave,
  describeChange: describeWaveChange,
  barsTitle: "Days done in each week",
  tryThis: [
    "Leave the effort at 7, Lina's one-hour plan. It happens on only 3 of 14 days: days 1, 2 and 8. Then lower the effort to 2, a smallest version: it happens on all 14 days.",
    "Set the hard second week to 2. The smallest version still happens on 12 of 14 days. Now raise the effort back to 7: the big plan happens on 2.",
    "Find the largest effort that still happens on at least 10 of 14 days in an ordinary fortnight. It is 4.",
  ],
  limits:
    "This is a simple illustration, not a research finding. Real motivation is not a number, and the 14 days are example numbers. Real days also depend on time, power, internet and other people, not only on how you feel, which is one more reason to keep the smallest version small.",
};
