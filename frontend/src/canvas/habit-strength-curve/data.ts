import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Building Habits That Last course, chapter 1.4 "How long a habit takes".
// One claim: a habit grows fastest in the first weeks and then levels off, so
// each week adds less than the week before; the speed differs a lot between
// people and habits, but the shape is the same. A labelled toy model: the
// shape and the wide range come from research, the formula does not. The
// three curves reach 95% of their own top level at 18, 66 and 254 days done:
// the range and the middle value in one study. See spec.md.

/** Days done at which each speed reaches 95% of its top level. */
export const DAYS_TO_95: Record<1 | 2 | 3, number> = { 1: 18, 2: 66, 3: 254 };
export const SPEED_NAMES: Record<1 | 2 | 3, string> = { 1: "fast", 2: "typical", 3: "slow" };
/** The weeks whose gains are drawn as bars. */
export const BAR_WEEKS = [1, 4, 8, 12] as const;

export type CurveInputs = {
  /** Days the habit has been done. */
  days: number;
  /** 1 fast, 2 typical, 3 slow. */
  speed: 1 | 2 | 3;
};

/**
 * Toy rule: strength = 100 x (1 - 20^(-days / T)), where T is the number of
 * days done at which this speed reaches 95% (at days = T the strength is
 * exactly 100 x (1 - 1/20) = 95).
 */
export function habitStrength(days: number, speed: 1 | 2 | 3): number {
  const t = DAYS_TO_95[speed];
  return 100 * (1 - Math.pow(20, -Math.max(0, days) / t));
}

/** Points added in week n (days 7n - 6 to 7n). */
export function weekGain(week: number, speed: 1 | 2 | 3): number {
  return habitStrength(7 * week, speed) - habitStrength(7 * (week - 1), speed);
}

/** Points added in the 7 days up to and including `days` (fewer at the very start). */
export function lastSevenDays(days: number, speed: 1 | 2 | 3): number {
  return habitStrength(days, speed) - habitStrength(Math.max(0, days - 7), speed);
}

function toSpeed(value: unknown): 1 | 2 | 3 {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 2;
  return n <= 1 ? 1 : n >= 3 ? 3 : 2;
}

export function inputsFrom(values: SliderValues): CurveInputs {
  const d = values.days;
  const days = typeof d === "number" && Number.isFinite(d) ? Math.max(1, Math.round(d)) : 21;
  return { days, speed: toSpeed(values.speed) };
}

export const percent = (strength: number) => `${Math.round(strength)}%`;
export const points = (gain: number) => `+${Math.round(gain)}`;
const dayWord = (n: number) => (n === 1 ? "day" : "days");
/** "+10 points", "+1 point". */
export const pointsText = (gain: number) => `${points(gain)} ${Math.round(gain) === 1 ? "point" : "points"}`;

export function computeCurve(values: SliderValues): SliderResult {
  const { days, speed } = inputsFrom(values);
  const strength = habitStrength(days, speed);
  const stillNeeded = Math.max(0, DAYS_TO_95[speed] - days);
  const name = SPEED_NAMES[speed];
  return {
    stats: [
      { label: "Habit strength", value: percent(strength), detail: `of its own top level, day ${days}` },
      { label: "Last 7 days added", value: pointsText(lastSevenDays(days, speed)), detail: `week 1 added ${points(weekGain(1, speed))}` },
      { label: "To reach 95%", value: stillNeeded === 0 ? "reached" : `${stillNeeded} more ${dayWord(stillNeeded)}`, detail: `at a ${name} speed` },
    ],
    bars: BAR_WEEKS.map((week) => {
      const gain = weekGain(week, speed);
      return { label: `Week ${week} adds`, value: gain, display: pointsText(gain) };
    }),
    summary: `After ${days} ${dayWord(days)}, a ${name} habit is at ${percent(strength)} of its top level on this toy curve. Week 1 adds ${points(weekGain(1, speed))} points and week 12 adds ${points(weekGain(12, speed))}: each week adds less than the one before.`,
  };
}

export function describeCurveChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const from = percent(habitStrength(a.days, a.speed));
  const to = percent(habitStrength(b.days, b.speed));
  const daysChanged = a.days !== b.days;
  const speedChanged = a.speed !== b.speed;

  if (!daysChanged && !speedChanged) return "Nothing changed.";
  if (daysChanged && speedChanged) {
    return `Strength went from ${from} to ${to}: now day ${b.days} at a ${SPEED_NAMES[b.speed]} speed. The shape is the same at every speed.`;
  }
  if (speedChanged) {
    return `A ${SPEED_NAMES[b.speed]} habit at day ${b.days}: strength is ${to} instead of ${from}, and week 1 adds ${points(weekGain(1, b.speed))} points. The speed changed; the shape did not.`;
  }
  const last = points(lastSevenDays(b.days, b.speed));
  const verb = b.days > a.days ? "raised" : "lowered";
  return `Going from day ${a.days} to day ${b.days} ${verb} strength from ${from} to ${to}. The 7 days up to day ${b.days} added ${last} points, against ${points(weekGain(1, b.speed))} in week 1.`;
}

export const habitStrengthCurve: SliderSpec = {
  kind: "slider",
  title: "How a habit grows: a toy curve",
  purpose: "Change the days and the speed, and see that each week adds less than the week before, at any speed.",
  intro:
    "Rami builds a study habit. This toy curve, a very simple made-up example and not real data, has the shape research found. The fast, typical and slow curves reach 95% of their top level at 18, 66 and 254 days done. Predict how the weekly gains change as the weeks go by.",
  inputs: [
    { id: "days", label: "Days done", min: 1, max: 300, step: 1, default: 21, unit: "days" },
    { id: "speed", label: "How fast it forms", min: 1, max: 3, step: 1, default: 2, unit: "(1 fast, 3 slow)" },
  ],
  compute: computeCurve,
  describeChange: describeCurveChange,
  barsTitle: "Points added in one week",
  tryThis: [
    "Check your prediction in the bars. For a typical habit, week 1 adds 27 points, week 4 adds 10, week 8 adds 3 and week 12 adds 1.",
    "Move the days from 7 to 14 to 21. The strength climbs 27%, 47%, 61%: each week adds less than the week before.",
    "Switch the speed to 3, slow. Week 1 adds only 8 points and the gains shrink more slowly, but they still shrink. At day 66 the slow habit is at 54%, the typical one at 95%.",
  ],
  limits:
    "This is a simple illustration, not a research finding. Only the shape and the wide range between people come from research. Real habits do not follow a smooth curve, and real days include missed days, which this toy model leaves out.",
};
