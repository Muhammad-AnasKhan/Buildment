import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Building Habits That Last course, chapter 1.4 "How long a habit takes".
// A labelled toy model of habit strength. The shape (fast growth at first,
// then levelling off) and the wide range between people come from research;
// the formula does not. The three curves reach 95% of their own top level at
// 18, 66 and 254 days done: the range and the middle value in one study.
// A missed day adds no growth and takes nothing away. See spec.md.

/** Days done at which each speed reaches 95% of its top level. */
export const DAYS_TO_95: Record<1 | 2 | 3, number> = { 1: 18, 2: 66, 3: 254 };
export const SPEED_NAMES: Record<1 | 2 | 3, string> = { 1: "fast", 2: "typical", 3: "slow" };

export type CurveInputs = {
  /** Days since the habit started. */
  days: number;
  /** 1 fast, 2 typical, 3 slow. */
  speed: 1 | 2 | 3;
  /** Missed days so far. */
  missed: number;
};

export type CurvePoint = {
  /** Days the habit was actually done. */
  done: number;
  /** Strength as a percent of the habit's own top level, 0 to 100. */
  strength: number;
  /** More days done still needed to reach 95%. Zero once reached. */
  stillNeeded: number;
};

/**
 * Toy rule: strength = 100 x (1 - 20^(-done / T)), where T is the number of
 * days done at which this speed reaches 95% (at done = T the strength is
 * exactly 100 x (1 - 1/20) = 95). Missed days are not done days, so they add
 * no growth, and they take nothing away.
 */
export function habitStrength(done: number, speed: 1 | 2 | 3): number {
  const t = DAYS_TO_95[speed];
  const d = Math.max(0, done);
  return 100 * (1 - Math.pow(20, -d / t));
}

function toSpeed(value: unknown): 1 | 2 | 3 {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 2;
  return n <= 1 ? 1 : n >= 3 ? 3 : 2;
}

function count(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
}

export function inputsFrom(values: SliderValues): CurveInputs {
  return { days: count(values.days, 21), speed: toSpeed(values.speed), missed: count(values.missed, 0) };
}

export function curvePoint({ days, speed, missed }: CurveInputs): CurvePoint {
  const done = Math.max(0, days - Math.min(missed, days));
  return { done, strength: habitStrength(done, speed), stillNeeded: Math.max(0, DAYS_TO_95[speed] - done) };
}

export const percent = (strength: number) => `${Math.round(strength)}%`;
const dayWord = (n: number) => (n === 1 ? "day" : "days");

export function computeCurve(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const point = curvePoint(inputs);
  const missedShown = Math.min(inputs.missed, inputs.days);
  const speedName = SPEED_NAMES[inputs.speed];
  const bar = (speed: 1 | 2 | 3) => {
    const strength = habitStrength(point.done, speed);
    const mark = speed === inputs.speed ? ", this habit" : "";
    return { label: `${SPEED_NAMES[speed][0]!.toUpperCase()}${SPEED_NAMES[speed].slice(1)} habit, 95% at ${DAYS_TO_95[speed]} days${mark}`, value: strength, display: percent(strength) };
  };

  return {
    stats: [
      { label: "Habit strength", value: percent(point.strength), detail: "of its own top level" },
      { label: "Days done", value: String(point.done), detail: `${inputs.days} ${dayWord(inputs.days)}, ${missedShown} missed` },
      {
        label: "To reach 95%",
        value: point.stillNeeded === 0 ? "reached" : `${point.stillNeeded} more`,
        detail: `days done, at a ${speedName} speed`,
      },
    ],
    bars: [bar(1), bar(2), bar(3)],
    barMax: 100,
    summary: `After ${point.done} ${dayWord(point.done)} done, a ${speedName} habit is at ${percent(point.strength)} of its top level on this toy curve. At the same number of days, a fast habit would be at ${percent(habitStrength(point.done, 1))} and a slow one at ${percent(habitStrength(point.done, 3))}.`,
  };
}

export function describeCurveChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = curvePoint(a);
  const y = curvePoint(b);
  const from = percent(x.strength);
  const to = percent(y.strength);
  const changed = [a.days !== b.days, a.speed !== b.speed, a.missed !== b.missed].filter(Boolean).length;

  if (changed === 0) return "Nothing changed.";
  if (changed > 1) {
    return `Strength went from ${from} to ${to}: now ${y.done} ${dayWord(y.done)} done at a ${SPEED_NAMES[b.speed]} speed.`;
  }
  if (a.missed !== b.missed) {
    if (b.missed > a.missed) {
      const added = Math.min(b.missed, b.days) - Math.min(a.missed, a.days);
      return `You added ${added} missed ${dayWord(added)}. A missed day adds no growth but takes nothing away, so strength went from ${from} to ${to}, not back to zero.`;
    }
    return `Fewer missed days means more days done: strength went from ${from} to ${to}.`;
  }
  if (a.speed !== b.speed) {
    return `Same ${y.done} ${dayWord(y.done)} done, but a ${SPEED_NAMES[b.speed]} habit: strength is ${to} instead of ${from}. People and habits differ a lot in how fast this happens.`;
  }
  if (b.days > a.days) {
    const nextDay = habitStrength(y.done + 1, b.speed) - y.strength;
    return `Going from day ${a.days} to day ${b.days} raised strength from ${from} to ${to}. The first weeks add the most: one more day now adds about ${nextDay.toFixed(1)} points.`;
  }
  return `Going back from day ${a.days} to day ${b.days}: strength is ${to} instead of ${from}. Early days add the most growth.`;
}

export const habitStrengthCurve: SliderSpec = {
  kind: "slider",
  title: "How a habit grows: a toy curve",
  purpose: "Change the days done, the speed and the missed days, and watch the habit grow fast at first and then level off.",
  intro:
    "Rami builds a study habit at a typical speed. This toy curve has the shape research found: fast growth at first, then levelling off. The fast, typical and slow curves reach 95% at 18, 66 and 254 days done. Predict what one missed day does to his strength at day 21.",
  inputs: [
    { id: "days", label: "Days since starting", min: 1, max: 300, step: 1, default: 21, unit: "days" },
    { id: "speed", label: "How fast it forms", min: 1, max: 3, step: 1, default: 2, unit: "(1 fast, 3 slow)" },
    { id: "missed", label: "Missed days so far", min: 0, max: 60, step: 1, default: 0, unit: "days" },
  ],
  compute: computeCurve,
  describeChange: describeCurveChange,
  barsTitle: "Strength after the same days done",
  tryThis: [
    "Set missed days from 0 to 1 at day 21. The strength moves from 61% to 60%, not to zero: a missed day pauses growth and takes nothing away.",
    "Set the days to 66 and switch the speed between 1, 2 and 3. The fast habit is at 100%, the typical one at 95% and the slow one at 54%.",
    "Move the days from 7 to 14 to 21. The strength climbs 27%, 47%, 61%: each week adds less than the week before.",
  ],
  limits:
    "This is a simple illustration, not a research finding. Only the shape and the wide range come from research. In the study, many missed days lowered the level people reached in the end, and a long gap made the next time less likely; this toy model shows neither. Real habits do not follow a smooth curve.",
};
