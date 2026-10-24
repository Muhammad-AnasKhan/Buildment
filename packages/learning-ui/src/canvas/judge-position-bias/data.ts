import type { SliderSpec, SliderValues } from "../renderers/slider/types";
import { averageVerdict, describeJudgeChange, formatPercent, judgeRuns } from "./model";

// AI Engineering Interview course, chapter 5.4. B's true win rate and the
// judge's bonus for going first in; B's observed win rate in each order and
// their average out. See spec.md.

function inputs(values: SliderValues) {
  return { trueRate: values.trueRate ?? 62, bias: values.bias ?? 10 };
}

export const judgePositionBias: SliderSpec = {
  kind: "slider",
  title: "A judge that favours the first answer",
  purpose: "See how a bonus for going first inflates whichever answer the judge reads first, and how averaging both orders cancels it.",
  intro:
    "Karim's judge compares prompt B with prompt A on 100 pairs, and every pair has a winner. In this model the judge adds a fixed bonus, in points, to the win rate of whichever answer it reads first, and the rate stays between 0% and 100%. At the start B's true win rate is 62% and the bonus is 10 points. Before you move a slider, predict: if the bonus grows, what happens to the average of the two orders?",
  inputs: [
    { id: "trueRate", label: "B's true win rate", min: 0, max: 100, step: 1, default: 62, unit: "%" },
    { id: "bias", label: "Bonus for going first", min: 0, max: 40, step: 1, default: 10, unit: "points" },
  ],
  compute: (values) => {
    const { trueRate, bias } = inputs(values);
    const r = judgeRuns(trueRate, bias);
    return {
      stats: [
        { label: "B wins, B shown first", value: formatPercent(r.bFirst), detail: "What Karim saw in his first run" },
        { label: "B wins, B shown second", value: formatPercent(r.bSecond), detail: "The same pairs, order swapped" },
        {
          label: "Average of both orders",
          value: formatPercent(r.average),
          detail: r.clipped === null ? `Equals the true ${formatPercent(r.trueRate)}` : `True rate ${formatPercent(r.trueRate)}: one run hit a limit`,
        },
      ],
      bars: [
        { label: "B shown first", value: r.bFirst, display: formatPercent(r.bFirst) },
        { label: "B shown second", value: r.bSecond, display: formatPercent(r.bSecond) },
        { label: "Average of both orders", value: r.average, display: formatPercent(r.average), tone: r.clipped === null ? "good" : "warn" },
        { label: "True win rate", value: r.trueRate, display: formatPercent(r.trueRate) },
      ],
      barMax: 100,
      summary: `B wins ${formatPercent(r.bFirst)} of pairs when shown first and ${formatPercent(r.bSecond)} when shown second. ${averageVerdict(r)}`,
    };
  },
  describeChange: (before, after) => describeJudgeChange(inputs(before), inputs(after)),
  barsTitle: "B's win rate over 100 pairs",
  tryThis: [
    "Raise the bonus from 10 to 30 points. B shown first climbs to 92% and B shown second falls to 32%, but the average stays at 62%.",
    "Set B's true win rate to 50%, so neither prompt is better. With the 10-point bonus, B still wins 60% when shown first; the average shows 50%.",
    "Set the true rate to 95%. B shown first hits the 100% limit, so the average reads 92.5%, not 95%.",
  ],
  limits:
    "Every pair has a winner (no ties) and the bonus is the same for every pair. Near 0% or 100% a run hits the limit and the average drifts from the true rate. Swapping the order does nothing about verbosity bias or self-preference, so the true rate here can still include those.",
};
