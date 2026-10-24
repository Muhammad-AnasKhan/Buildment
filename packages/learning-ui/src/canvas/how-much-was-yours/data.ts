import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// The Founder Interview course, chapter 2.4 "How much was yours, and 'I did
// not measure that'". Leen's packing day: 3 hours before; 2 hours after on
// the days she packed with the checklist and the new shelves; and, in the same
// four weeks, 2.5 hours on the days the part-time packer packed the old way.
// The part you can claim = the change you saw, minus the change that happened
// without your work. Arithmetic only. See spec.md.

export type ShareInputs = {
  /** Hours in a packing day before the change. */
  before: number;
  /** Hours in a packing day after, on the days with the new way. */
  after: number;
  /** Change in hours on the comparison days (the old way), same weeks. Negative means they got faster. */
  comparisonChange: number;
};

export type ShareBreakdown = {
  /** Hours saved on the new-way days: before - after. Can be negative. */
  saved: number;
  /** Hours saved on the comparison days without your work. Can be negative. */
  savedWithout: number;
  /** Hours you can claim: saved minus what the comparison days saved without you, between 0 and saved. */
  claim: number;
  /** claim / saved, 0 to 1. Zero when nothing was saved. */
  share: number;
};

function read(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export function inputsFrom(values: SliderValues): ShareInputs {
  return {
    before: read(values.before, 3, 0, 24),
    after: read(values.after, 2, 0, 24),
    comparisonChange: read(values.comparisonChange, -0.5, -24, 24),
  };
}

export function breakdown({ before, after, comparisonChange }: ShareInputs): ShareBreakdown {
  const saved = before - after;
  const savedWithout = -comparisonChange;
  // If the comparison days got slower, that does not add to what you can claim.
  const raw = saved - Math.max(0, savedWithout);
  const claim = saved > 0 ? Math.max(0, raw) : 0;
  return { saved, savedWithout, claim, share: saved > 0 ? claim / saved : 0 };
}

/** Hours, without trailing zeros: 1, 0.5, 0.25. */
export function formatHours(n: number): string {
  const r = Math.round(n * 100) / 100;
  return `${r === 0 ? 0 : r} ${Math.abs(r) === 1 ? "hour" : "hours"}`;
}

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function claimSentence(inputs: ShareInputs): string {
  const b = breakdown(inputs);
  if (b.saved <= 0) {
    return `The packing day did not get shorter on the new-way days (${inputs.before} hours to ${inputs.after} hours), so there is no change to claim.`;
  }
  const opening = `The packing day fell from ${inputs.before} hours to ${inputs.after} hours, which is ${formatHours(b.saved)} less.`;
  if (b.savedWithout >= b.saved) {
    return `${opening} But the comparison days got ${formatHours(b.savedWithout)} faster without the new way, as much or more. From this evidence, none of the change can be claimed as yours.`;
  }
  if (b.savedWithout <= 0) {
    return `${opening} The comparison days did not get faster, so the whole change is a hint that it was yours.`;
  }
  return `${opening} The comparison days got ${formatHours(b.savedWithout)} faster without your work. So about ${formatHours(b.claim)} of the ${formatHours(b.saved)}, about ${formatPercent(b.share)}, is the part you can claim.`;
}

export function computeShare(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const b = breakdown(inputs);
  const pct = inputs.before > 0 ? Math.round(((inputs.after - inputs.before) / inputs.before) * 100) : 0;
  const pctText = pct > 0 ? `+${pct}%` : `${pct}%`;
  const bars = [
    { label: "Total change", value: Math.max(0, b.saved), display: formatHours(Math.max(0, b.saved)) },
    { label: "Seen without your work", value: Math.max(0, Math.min(b.savedWithout, Math.max(0, b.saved))), display: formatHours(Math.max(0, Math.min(b.savedWithout, Math.max(0, b.saved)))) },
    { label: "The part you can claim", value: b.claim, display: formatHours(b.claim), tone: b.claim > 0 ? ("good" as const) : undefined },
  ];
  return {
    stats: [
      { label: "Total change", value: b.saved > 0 ? `${formatHours(b.saved)} less` : b.saved === 0 ? "none" : `${formatHours(-b.saved)} more`, detail: `${pctText} from ${inputs.before} hours` },
      { label: "Seen without your work", value: b.savedWithout > 0 ? `${formatHours(b.savedWithout)} less` : b.savedWithout === 0 ? "none" : `${formatHours(-b.savedWithout)} more`, detail: "on the comparison days" },
      { label: "The part you can claim", value: formatHours(b.claim), detail: b.saved > 0 ? `${formatPercent(b.share)} of the change` : "nothing to claim" },
    ],
    bars,
    barMax: Math.max(1, b.saved),
    summary: claimSentence(inputs),
  };
}

export function describeShareChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  if (a.before === b.before && a.after === b.after && a.comparisonChange === b.comparisonChange) return "Nothing changed.";
  const x = breakdown(a);
  const y = breakdown(b);
  const parts: string[] = [];
  if (a.before !== b.before) parts.push(`the before time from ${a.before} to ${b.before} hours`);
  if (a.after !== b.after) parts.push(`the after time from ${a.after} to ${b.after} hours`);
  if (a.comparisonChange !== b.comparisonChange) parts.push(`the comparison change from ${a.comparisonChange} to ${b.comparisonChange} hours`);
  const claimNow = y.claim === 0 ? "nothing you can claim" : `${formatHours(y.claim)} you can claim`;
  const claimBefore = x.claim === 0 ? "nothing" : formatHours(x.claim);
  const why =
    y.saved <= 0
      ? "The packing day did not get shorter, so there is nothing to claim."
      : y.savedWithout >= y.saved
        ? "The comparison days improved as much or more, so the evidence does not show a part that was yours."
        : `The total change is ${formatHours(y.saved)} and ${formatHours(Math.max(0, y.savedWithout))} of it happened without your work.`;
  return `Changing ${parts.join(" and ")}: you went from ${claimBefore} to ${claimNow}. ${why}`;
}

export const howMuchWasYours: SliderSpec = {
  kind: "slider",
  title: "How much of the change was yours?",
  purpose: "Subtract what happened without your work from the total change, and see how much is left to claim.",
  intro:
    "In this example, Leen's packing day took about 3 hours before her change. In the next four weeks it took about 2 hours on the days she packed with the checklist and the new shelves. In the same four weeks, the days the part-time packer packed the old way took about 2.5 hours, because the shop also stopped selling large glass lamps. Predict first: how much of the 1 hour can Leen claim?",
  inputs: [
    { id: "before", label: "Before: hours a packing day", min: 1, max: 6, step: 0.25, default: 3, unit: "hours" },
    { id: "after", label: "After: days with your work", min: 0.5, max: 6, step: 0.25, default: 2, unit: "hours" },
    { id: "comparisonChange", label: "Change on comparison days", min: -2, max: 1, step: 0.25, default: -0.5, unit: "hours" },
  ],
  compute: computeShare,
  describeChange: describeShareChange,
  barsTitle: "Hours saved in a packing day",
  tryThis: [
    "Check your prediction: at the defaults, the total change is 1 hour, the comparison days saved 0.5 hour without Leen, and the part she can claim is 0.5 hour, half of it.",
    "Set the change on the comparison days to 0, as if nothing else had changed. The whole 1 hour is a hint that it was hers.",
    "Set the change on the comparison days to -1. The old-way days improved as much as hers, so none of the change can be claimed from this evidence.",
  ],
  limits:
    "This is simple arithmetic, and a comparison is a hint, not proof. It assumes the comparison days were like Leen's days before the change, with the same kind of orders. If the two groups were different from the start, the subtraction will be wrong. Say 'about' and say where the numbers came from.",
};
