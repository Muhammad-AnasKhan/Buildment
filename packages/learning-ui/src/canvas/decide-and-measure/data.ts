import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Founder Interview course, chapter 4.4 "Decide and say what you would
// measure". Mais decides to lower the fee on a new customer's second order for
// four weeks. The repeat rate before was 30 percent. She sets her target before
// she looks: she needs a rise of 5 points, so her target is 35 percent. The
// normal swing is about 2 points, so she keeps the change at 37 percent or
// more, changes course at 33 percent or less, and keeps watching in between.
// This is the course's rule of thumb, not statistics. See spec.md.

export type DecideInputs = {
  /** The repeat rate before the change, in percent. */
  baseline: number;
  /** The repeat rate after four weeks, in percent. */
  result: number;
  /** The rise, in points, you decided in advance you need over the baseline. */
  rise: number;
  /** How far the rate usually moves up and down by chance in a month, in points. */
  swing: number;
};

export type Verdict = "keep" | "change" | "watch";

export type Decision = {
  /** The target you set in advance: baseline plus the rise you need. */
  target: number;
  /** Result minus baseline, in points. */
  change: number;
  /** Result minus target, in points. Positive means above the target. */
  gap: number;
  /** The lowest result that keeps the change: target plus the normal swing. */
  keepAt: number;
  /** The highest result that changes course: target minus the normal swing. */
  changeAt: number;
  verdict: Verdict;
};

/**
 * Keep it if the result is at or above target plus the normal swing. Change
 * course if it is at or below target minus the normal swing. Otherwise keep
 * watching. With a swing of 0 the two edges meet at the target, and the keep
 * check comes first, so a result exactly on the target keeps the change.
 */
export function decide({ baseline, result, rise, swing }: DecideInputs): Decision {
  const target = baseline + rise;
  const keepAt = target + swing;
  const changeAt = target - swing;
  let verdict: Verdict = "watch";
  if (result >= keepAt) verdict = "keep";
  else if (result <= changeAt) verdict = "change";
  return { target, change: result - baseline, gap: result - target, keepAt, changeAt, verdict };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  keep: "Keep it",
  change: "Change course",
  watch: "Keep watching",
};

const VERDICT_DETAIL: Record<Verdict, string> = {
  keep: "clear of the target",
  change: "clearly under the target",
  watch: "too close to call",
};

function inputsFrom(values: SliderValues): DecideInputs {
  return {
    baseline: values.baseline ?? 30,
    result: values.result ?? 34,
    rise: values.rise ?? 5,
    swing: values.swing ?? 2,
  };
}

function points(n: number): string {
  const abs = Math.abs(n);
  if (n === 0) return "0 points";
  return `${n > 0 ? "+" : "-"}${abs} ${abs === 1 ? "point" : "points"}`;
}

function gapWords(gap: number): string {
  if (gap === 0) return "exactly on the target";
  const abs = Math.abs(gap);
  return `${abs} ${abs === 1 ? "point" : "points"} ${gap > 0 ? "above" : "below"} the target`;
}

export function computeDecision(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const d = decide(inputs);
  const tone = d.verdict === "keep" ? "good" : d.verdict === "change" ? "bad" : "warn";
  const top = Math.max(inputs.baseline, inputs.result, d.target, 1);

  return {
    stats: [
      { label: "Verdict", value: VERDICT_LABEL[d.verdict], detail: VERDICT_DETAIL[d.verdict] },
      { label: "Change so far", value: points(d.change), detail: `${inputs.baseline}% to ${inputs.result}%` },
      { label: "Your target", value: `${d.target}%`, detail: `keep at ${d.keepAt}% or more, change at ${d.changeAt}% or less` },
    ],
    bars: [
      { label: "Before", value: inputs.baseline, display: `${inputs.baseline}%` },
      { label: "Target you set", value: d.target, display: `${d.target}%` },
      { label: "After 4 weeks", value: inputs.result, display: `${inputs.result}%`, tone },
    ],
    barMax: top,
    summary: `The repeat rate went from ${inputs.baseline} percent to ${inputs.result} percent. The target set in advance was ${d.target} percent, and the result is ${gapWords(d.gap)}. With a normal swing of ${inputs.swing} points the verdict is: ${VERDICT_LABEL[d.verdict].toLowerCase()}.`,
  };
}

export function describeDecisionChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = decide(a);
  const y = decide(b);
  const changed: string[] = [];
  if (a.baseline !== b.baseline) changed.push("the rate before");
  if (a.result !== b.result) changed.push("the result");
  if (a.rise !== b.rise) changed.push("the rise you need");
  if (a.swing !== b.swing) changed.push("the normal swing");
  if (changed.length === 0) return "Nothing changed.";
  const moved = changed.length === 1 ? `Changing ${changed[0]}` : "Changing several inputs";
  const verdictText =
    x.verdict === y.verdict
      ? `The verdict stays: ${VERDICT_LABEL[y.verdict].toLowerCase()}.`
      : `The verdict changes from ${VERDICT_LABEL[x.verdict].toLowerCase()} to ${VERDICT_LABEL[y.verdict].toLowerCase()}.`;
  return `${moved}: the result is now ${gapWords(y.gap)} (target ${y.target}%, normal swing ${b.swing} points, so keep at ${y.keepAt}% or more and change at ${y.changeAt}% or less). ${verdictText}`;
}

export const decideAndMeasure: SliderSpec = {
  kind: "slider",
  title: "Set the target first, then read the result",
  purpose: "Set the rate before, the rise you need and the normal swing, then change the result after four weeks and see whether to keep, change course or keep watching.",
  intro:
    "Mais lowers the fee on a new customer's second order for four weeks. The repeat rate before was 30 percent. Before she looks at any result, she decides she needs a rise of 5 points, so her target is 35 percent. The rate moves up and down by about 2 points by chance. So she keeps the change at 37 or more, changes course at 33 or less, and keeps watching in between. After four weeks the rate is 34 percent. Predict what she should do, then change the result.",
  inputs: [
    { id: "baseline", label: "Repeat rate before", min: 10, max: 60, step: 1, default: 30, unit: "%" },
    { id: "result", label: "Repeat rate after 4 weeks", min: 10, max: 70, step: 1, default: 34, unit: "%" },
    { id: "rise", label: "Rise you need over baseline", min: 1, max: 15, step: 1, default: 5, unit: "points" },
    { id: "swing", label: "Normal month-to-month swing", min: 0, max: 6, step: 1, default: 2, unit: "points" },
  ],
  compute: computeDecision,
  describeChange: describeDecisionChange,
  barsTitle: "Repeat rate: before, your target and the result",
  tryThis: [
    "Before you move anything, predict the verdict. At 34 percent the result is 1 point under the target of 35, which is inside the normal swing of 2 points, so keep watching.",
    "Set the result to 37 percent: it is the target plus one swing, so keep it. Then set it to 33 percent: it is the target minus one swing, so change course.",
    "Set the normal swing to 0 with the result at 34 percent. With no allowance for chance, 34 is under 35 and the target decides: change course. A small change can be chance, which is why the swing matters.",
  ],
  limits:
    "This is a simple illustration and a rule of thumb, not statistics. Real results move up and down for many reasons, and four weeks may be too short or too long. A swing of 2 points is one assumption, taken from past months. It cannot tell you why the rate moved, and it does not replace asking customers. Setting the target before you look is the lesson, not these exact numbers.",
};
