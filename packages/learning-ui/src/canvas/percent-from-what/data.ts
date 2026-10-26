import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// The Founder Interview course, chapter 2.2 "A number needs a before".
// Leen's packing day took about 3 hours in the four weeks before her change
// and about 2 hours in the four weeks after. A percentage depends on which
// number it is counted from, and on the size of the numbers underneath it.
// Arithmetic only, from the chapter's case numbers. See spec.md.

export type PercentInputs = {
  /** The first number measured (Leen: hours in a packing day before). */
  before: number;
  /** The second number measured (Leen: hours in a packing day after). */
  after: number;
  /** Weeks measured on each side of the change. */
  weeks: number;
};

function read(value: unknown, fallback: number, min: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, value) : fallback;
}

export function inputsFrom(values: SliderValues): PercentInputs {
  return {
    before: read(values.before, 3, 1),
    after: read(values.after, 2, 0),
    weeks: Math.round(read(values.weeks, 4, 1)),
  };
}

/** Change counted from the before number: (after - before) / before x 100. */
export function percentChange(before: number, after: number): number {
  return ((after - before) / before) * 100;
}

/**
 * The same two numbers counted from the after number: how much more (or less)
 * the before number is than the after number. Null when after is 0.
 */
export function reverseChange(before: number, after: number): number | null {
  if (after === 0) return null;
  return ((before - after) / after) * 100;
}

/** A big percentage on a small base: at least 100 percent, but 10 or fewer in the number itself. */
export function isSmallBase(before: number, after: number): boolean {
  return Math.abs(percentChange(before, after)) >= 100 && Math.abs(after - before) <= 10;
}

export function windowNote(weeks: number): string {
  if (weeks < 2) return "too short: one week can be an unusual week";
  if (weeks < 4) return "short: a hint, not a pattern";
  return "long enough to see normal ups and downs";
}

function whole(n: number): number {
  const r = Math.round(n);
  return r === 0 ? 0 : r;
}

export function formatSigned(n: number): string {
  const r = whole(n);
  return r > 0 ? `+${r}` : `${r}`;
}

export function formatSignedPercent(n: number): string {
  return `${formatSigned(n)}%`;
}

function moreOrLess(n: number): string {
  return n > 0 ? "more" : "less";
}

export function plainSentence({ before, after, weeks }: PercentInputs): string {
  const diff = after - before;
  if (diff === 0) {
    return `From ${before} to ${after} is no change, measured over ${weeks} week${weeks === 1 ? "" : "s"} on each side.`;
  }
  const pct = Math.abs(whole(percentChange(before, after)));
  const base = `From ${before} to ${after} is ${pct}% ${moreOrLess(diff)}, a difference of ${Math.abs(diff)}`;
  const small = isSmallBase(before, after) ? `. A big percentage, but only ${Math.abs(diff)} ${moreOrLess(diff)} in the number itself` : "";
  const reverse = reverseChange(before, after);
  const other =
    reverse === null
      ? ""
      : `. Counted from the after number, ${before} is ${Math.abs(whole(reverse))}% ${moreOrLess(reverse)} than ${after}`;
  return `${base}${small}${other}. Measured over ${weeks} week${weeks === 1 ? "" : "s"} on each side.`;
}

export function computePercent(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const { before, after, weeks } = inputs;
  const pct = percentChange(before, after);
  const reverse = reverseChange(before, after);
  const diff = after - before;
  return {
    stats: [
      {
        label: "Change from before",
        value: formatSignedPercent(pct),
        detail: `from ${before} to ${after}, ${weeks} week${weeks === 1 ? "" : "s"} each: ${windowNote(weeks)}`,
      },
      {
        label: "Change in the number",
        value: formatSigned(diff),
        detail: isSmallBase(before, after) ? "a big percentage on a small base" : "the plain difference",
      },
      {
        label: "Counted from after",
        value: reverse === null ? "n/a" : `${Math.abs(whole(reverse))}%`,
        detail:
          reverse === null
            ? "cannot count from zero"
            : diff === 0
              ? "the same number"
              : `${before} is ${Math.abs(whole(reverse))}% ${moreOrLess(reverse)} than ${after}`,
      },
    ],
    bars: [
      { label: "Before", value: before, display: `${before}` },
      { label: "After", value: after, display: `${after}` },
    ],
    summary: plainSentence(inputs),
  };
}

export function describePercentChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  if (a.before === b.before && a.after === b.after && a.weeks === b.weeks) return "Nothing changed.";
  if (a.before === b.before && a.after === b.after) {
    return `The percentage did not change. Only the window did: ${b.weeks} week${b.weeks === 1 ? "" : "s"} on each side is ${windowNote(b.weeks)}.`;
  }
  const parts: string[] = [];
  if (a.before !== b.before) parts.push(`the before number from ${a.before} to ${b.before}`);
  if (a.after !== b.after) parts.push(`the after number from ${a.after} to ${b.after}`);
  const x = whole(percentChange(a.before, a.after));
  const y = whole(percentChange(b.before, b.after));
  const diffNow = b.after - b.before;
  const tail = isSmallBase(b.before, b.after)
    ? ` That is a big percentage, but only ${Math.abs(diffNow)} ${moreOrLess(diffNow)} in the number itself.`
    : diffNow === 0
      ? " The two numbers are the same."
      : ` In the number itself that is ${Math.abs(diffNow)} ${moreOrLess(diffNow)}.`;
  return `Changing ${parts.join(" and ")}: the change from before goes from ${formatSignedPercent(x)} to ${formatSignedPercent(y)}.${tail}`;
}

export const percentFromWhat: SliderSpec = {
  kind: "slider",
  title: "Percent from what?",
  purpose: "Change the before and after numbers and see how a percentage depends on where you count from and on how big the numbers are.",
  intro:
    "In this example, Leen's packing day took about 3 hours in the four weeks before her change and about 2 hours in the four weeks after. Predict first: is 3 hours to 2 hours '50 percent faster', or something else? Then change the numbers and watch the percentage.",
  inputs: [
    { id: "before", label: "Before: your first number", min: 1, max: 100, step: 1, default: 3, unit: "" },
    { id: "after", label: "After: your second number", min: 0, max: 100, step: 1, default: 2, unit: "" },
    { id: "weeks", label: "Weeks measured on each side", min: 1, max: 12, step: 1, default: 4, unit: "weeks" },
  ],
  compute: computePercent,
  describeChange: describePercentChange,
  barsTitle: "Before and after",
  tryThis: [
    "Check your prediction: at the defaults, 3 to 2 is 33% less. Counted from the after number, 3 is 50% more than 2. Both are correct arithmetic, so the number is only clear when you say what you counted.",
    "Set before to 2 and after to 8, as sign-ups a week. The change is +300%, but it is only 6 sign-ups. Always say the numbers underneath.",
    "Set weeks to 1. The percentage does not change, but one week is too short to tell a change from a normal week.",
  ],
  limits:
    "This is simple arithmetic on two numbers. It cannot tell you whether the change was caused by your work, or whether the numbers were measured in the same way before and after. Chapter 2.4 looks at how much of a change was yours.",
};
