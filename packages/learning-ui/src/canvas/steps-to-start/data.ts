import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Building Habits That Last course, chapter 3.3 "Friction: easier and harder".
// Khaled's energy after his shift over 10 evenings (a fixed series from the
// chapter, on a scale of 0 to 10) is compared with the steps to start studying
// and the steps to start scrolling. The defaults are his old flat: 6 steps to
// study (book in a box under the bed), 0 steps to scroll (phone in his hand).
// The rule is a stated toy rule, not a research finding. See spec.md.

/** Khaled's energy after each of 10 shifts, 0 to 10, in this example. */
export const ENERGY: readonly number[] = [3, 5, 1, 4, 8, 3, 5, 2, 7, 4];

/** An evening with energy at or below this is a tired evening. */
export const TIRED_AT_MOST = 4;

export type StepsInputs = {
  /** Steps to start studying, 0 to 10. */
  studySteps: number;
  /** Steps to start scrolling, 0 to 10. */
  scrollSteps: number;
};

export type StepsOutcome = {
  /** Extra steps studying needs compared with scrolling (can be below zero). */
  gap: number;
  /** For each evening, true when he studies. */
  studied: boolean[];
  studyEvenings: number;
  tiredEvenings: number;
  tiredStudyEvenings: number;
};

/**
 * Toy rule: on each evening, Khaled studies when the extra steps studying
 * needs, compared with scrolling, are no more than his energy that evening.
 * Otherwise he scrolls.
 */
export function stepsOutcome({ studySteps, scrollSteps }: StepsInputs, energy: readonly number[] = ENERGY): StepsOutcome {
  const gap = studySteps - scrollSteps;
  const studied = energy.map((e) => gap <= e);
  const tired = energy.map((e) => e <= TIRED_AT_MOST);
  return {
    gap,
    studied,
    studyEvenings: studied.filter(Boolean).length,
    tiredEvenings: tired.filter(Boolean).length,
    tiredStudyEvenings: studied.filter((s, i) => s && tired[i]).length,
  };
}

function inputsFrom(values: SliderValues): StepsInputs {
  const read = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.round(v)) : fallback);
  return { studySteps: read(values.studySteps, 6), scrollSteps: read(values.scrollSteps, 0) };
}

function stepsWord(n: number): string {
  return n === 1 ? "1 step" : `${n} steps`;
}

function gapText(gap: number): string {
  if (gap > 0) return `${stepsWord(gap)} more than scrolling`;
  if (gap < 0) return `${stepsWord(-gap)} fewer than scrolling`;
  return "the same as scrolling";
}

export function computeSteps(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const out = stepsOutcome(inputs);
  const old = stepsOutcome({ studySteps: 6, scrollSteps: 0 });
  const bookOnTable = stepsOutcome({ studySteps: 2, scrollSteps: 0 });
  const phoneAway = stepsOutcome({ studySteps: 6, scrollSteps: 3 });
  const total = ENERGY.length;

  return {
    stats: [
      { label: "Evenings he studies", value: `${out.studyEvenings} of ${total}`, detail: `scrolls on ${total - out.studyEvenings}` },
      { label: "Tired evenings he studies", value: `${out.tiredStudyEvenings} of ${out.tiredEvenings}`, detail: `energy ${TIRED_AT_MOST} or less` },
      { label: "Steps to study", value: `${inputs.studySteps}`, detail: gapText(out.gap) },
    ],
    bars: [
      { label: "Your settings", value: out.studyEvenings, display: `${out.studyEvenings} of ${total}`, tone: out.studyEvenings >= 8 ? "good" : out.studyEvenings <= 3 ? "bad" : undefined },
      { label: "Old flat: 6 and 0", value: old.studyEvenings, display: `${old.studyEvenings} of ${total}` },
      { label: "Book on table: 2 and 0", value: bookOnTable.studyEvenings, display: `${bookOnTable.studyEvenings} of ${total}` },
      { label: "Phone in bedroom: 6 and 3", value: phoneAway.studyEvenings, display: `${phoneAway.studyEvenings} of ${total}` },
    ],
    barMax: total,
    summary: `With ${stepsWord(inputs.studySteps)} to study and ${stepsWord(inputs.scrollSteps)} to scroll, studying needs ${gapText(out.gap)}, so in this toy rule Khaled studies on ${out.studyEvenings} of ${total} evenings, including ${out.tiredStudyEvenings} of his ${out.tiredEvenings} tired evenings.`,
  };
}

export function describeStepsChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = stepsOutcome(a);
  const y = stepsOutcome(b);
  const changed: string[] = [];
  if (a.studySteps !== b.studySteps) changed.push(b.studySteps < a.studySteps ? "making study easier" : "making study harder");
  if (a.scrollSteps !== b.scrollSteps) changed.push(b.scrollSteps > a.scrollSteps ? "making scrolling harder" : "making scrolling easier");
  if (changed.length === 0) return "Nothing changed.";
  const moved = changed.length === 1 ? changed[0]! : `${changed[0]} and ${changed[1]}`;
  const lead = moved.charAt(0).toUpperCase() + moved.slice(1);
  const gapMove = y.gap < x.gap ? "shrinks" : y.gap > x.gap ? "widens" : "keeps";
  const gapPart = gapMove === "keeps" ? `keeps the gap at ${x.gap}` : `${gapMove} the gap from ${x.gap} to ${y.gap} steps`;
  if (y.studyEvenings === x.studyEvenings) {
    return `${lead} ${gapPart}, but no evening changes: he still studies on ${y.studyEvenings} of ${ENERGY.length}.`;
  }
  const direction = y.studyEvenings > x.studyEvenings ? "rise" : "fall";
  return `${lead} ${gapPart}, so study evenings ${direction} from ${x.studyEvenings} to ${y.studyEvenings} of ${ENERGY.length}, and tired evenings with study go from ${x.tiredStudyEvenings} to ${y.tiredStudyEvenings} of ${y.tiredEvenings}.`;
}

export const stepsToStart: SliderSpec = {
  kind: "slider",
  title: "Steps to start: study or scroll?",
  purpose: "Change the steps to start studying and the steps to start scrolling, and see on which of Khaled's 10 evenings each option wins.",
  intro:
    "Khaled's energy after his shift on 10 evenings was 3, 5, 1, 4, 8, 3, 5, 2, 7 and 4 (0 to 10). Six evenings were tired ones, with energy of 4 or less. In his old flat, studying took 6 steps and scrolling took 0. Predict: with the book open on the table (2 steps), does study win on more tired evenings than before, or about as many?",
  inputs: [
    { id: "studySteps", label: "Steps to start studying", min: 0, max: 10, step: 1, default: 6, unit: "steps" },
    { id: "scrollSteps", label: "Steps to start scrolling", min: 0, max: 10, step: 1, default: 0, unit: "steps" },
  ],
  compute: computeSteps,
  describeChange: describeStepsChange,
  barsTitle: "Evenings with study, out of 10",
  tryThis: [
    "Check your prediction: lower the steps to start studying from 6 to 2 (the book open on the table). Tired evenings with study go from 0 to 5 of 6, and all study evenings from 2 to 9 of 10.",
    "Put studying back to 6 and raise the steps to start scrolling from 0 to 3 (phone charging in the bedroom, app logged out). Study evenings rise to 8 of 10.",
    "Use both changes: 2 steps to study and 3 to scroll. Studying now takes fewer steps than scrolling, and the toy rule gives 10 of 10.",
  ],
  limits:
    "This is a simple illustration with a made-up rule: he studies when the extra steps studying needs are no more than his energy that evening. It is not a research finding. Real evenings depend on much more than steps, and research finds that changes in effort shift behaviour by a modest amount, not by magic. The energy numbers belong to this example only.",
};
