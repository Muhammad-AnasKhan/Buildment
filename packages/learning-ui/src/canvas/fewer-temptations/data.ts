import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Building Habits That Last course, chapter 4.2 "Why willpower is not the
// plan". Maha counts about 8 moments each night in bed when she feels pulled
// to open the video app, and resists about half of them. Give-ins per week =
// temptations per day x 7 x the share she does not resist. The defaults are
// her count: 8 a day, 50% resisted, 28 give-ins a week. Arithmetic only, from
// the chapter's case numbers. See spec.md.

export const DAYS_PER_WEEK = 7;
/** The extra resistance the third bar tests, in percentage points. */
export const EXTRA_RESIST_POINTS = 10;

export type TemptationInputs = {
  /** Temptations met per day (per night, in Maha's case). */
  perDay: number;
  /** Share of temptations resisted, 0 to 100. */
  resistedPercent: number;
};

/** Give-ins per week = temptations per day x 7 x (1 - share resisted). */
export function giveInsPerWeek({ perDay, resistedPercent }: TemptationInputs): number {
  const resisted = Math.min(100, Math.max(0, resistedPercent));
  return perDay * DAYS_PER_WEEK * (1 - resisted / 100);
}

/**
 * The share you would need to resist, facing every temptation, to match the
 * give-ins you get by facing half of them: 1 - r' = (1 - r) / 2, so
 * r' = (100 + r) / 2. At 50% that is 75%.
 */
export function resistanceToMatchHalving(resistedPercent: number): number {
  const r = Math.min(100, Math.max(0, resistedPercent));
  return (100 + r) / 2;
}

export type TemptationCompare = {
  now: number;
  halfTemptations: number;
  moreResistance: number;
  /** Resistance used for the third bar, capped at 100. */
  moreResistedPercent: number;
};

export function compareTemptations(inputs: TemptationInputs): TemptationCompare {
  const moreResistedPercent = Math.min(100, inputs.resistedPercent + EXTRA_RESIST_POINTS);
  return {
    now: giveInsPerWeek(inputs),
    halfTemptations: giveInsPerWeek({ ...inputs, perDay: inputs.perDay / 2 }),
    moreResistance: giveInsPerWeek({ ...inputs, resistedPercent: moreResistedPercent }),
    moreResistedPercent,
  };
}

function inputsFrom(values: SliderValues): TemptationInputs {
  const read = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, v) : fallback);
  return { perDay: read(values.perDay, 8), resistedPercent: Math.min(100, read(values.resistedPercent, 50)) };
}

/** Whole numbers, since a give-in is a whole event. "about" is added in prose when rounding hides a fraction. */
export function formatGiveIns(n: number): string {
  return `${Math.round(n)}`;
}

function formatPercent(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

function fewer(base: number, other: number): string {
  const diff = Math.round(base) - Math.round(other);
  if (diff <= 0) return "no fewer";
  return `${diff} fewer`;
}

export function computeTemptations(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const c = compareTemptations(inputs);
  const halfWins = c.halfTemptations < c.moreResistance;
  const tie = Math.round(c.halfTemptations) === Math.round(c.moreResistance);
  return {
    stats: [
      { label: "Give-ins a week now", value: formatGiveIns(c.now), detail: `${inputs.perDay} a day x 7 x ${100 - inputs.resistedPercent}% not resisted` },
      { label: "Half the temptations", value: formatGiveIns(c.halfTemptations), detail: fewer(c.now, c.halfTemptations) },
      { label: "To match halving, resist", value: `${formatPercent(resistanceToMatchHalving(inputs.resistedPercent))}%`, detail: `instead of ${inputs.resistedPercent}%, every night` },
    ],
    bars: [
      { label: "Now", value: c.now, display: formatGiveIns(c.now) },
      { label: "Half the temptations", value: c.halfTemptations, display: formatGiveIns(c.halfTemptations), tone: halfWins && !tie ? "good" : undefined },
      { label: `Resist ${c.moreResistedPercent}%`, value: c.moreResistance, display: formatGiveIns(c.moreResistance), tone: !halfWins && !tie ? "good" : undefined },
    ],
    summary: `Meeting ${inputs.perDay} temptations a day and resisting ${inputs.resistedPercent}% gives about ${formatGiveIns(c.now)} give-ins a week. Facing half the temptations gives about ${formatGiveIns(c.halfTemptations)} (${fewer(c.now, c.halfTemptations)}). Resisting ${EXTRA_RESIST_POINTS} points more gives about ${formatGiveIns(c.moreResistance)}. To match halving by resisting alone, she would need to resist ${formatPercent(resistanceToMatchHalving(inputs.resistedPercent))}% every night.`,
  };
}

export function describeTemptationChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  if (a.perDay === b.perDay && a.resistedPercent === b.resistedPercent) return "Nothing changed.";
  const x = compareTemptations(a);
  const y = compareTemptations(b);
  const parts: string[] = [];
  if (a.perDay !== b.perDay) parts.push(`temptations from ${a.perDay} to ${b.perDay} a day`);
  if (a.resistedPercent !== b.resistedPercent) parts.push(`resistance from ${a.resistedPercent}% to ${b.resistedPercent}%`);
  const moved = `Changing ${parts.join(" and ")}`;
  const direction = y.now < x.now ? "falls" : y.now > x.now ? "rises" : "stays";
  const total = direction === "stays" ? `stays at about ${formatGiveIns(y.now)}` : `${direction} from about ${formatGiveIns(x.now)} to about ${formatGiveIns(y.now)}`;
  let compare: string;
  if (y.now === 0) compare = "With nothing left to give in to, neither change has anything to cut.";
  else if (Math.round(y.halfTemptations) === Math.round(y.moreResistance)) compare = "Here, halving the temptations and resisting 10 points more cut about the same.";
  else if (y.halfTemptations < y.moreResistance) compare = "Halving the temptations still cuts more than resisting 10 points more.";
  else compare = "At this high resistance, 10 points more would cut more than halving the temptations, but resisting this often, night after night, is the hard part.";
  const tieNow = formatPercent(resistanceToMatchHalving(b.resistedPercent));
  return `${moved}: give-ins a week ${total}. ${compare} Matching halving by resisting alone would take ${tieNow}%.`;
}

export const fewerTemptations: SliderSpec = {
  kind: "slider",
  title: "Fewer temptations or more willpower?",
  purpose: "Change how many temptations Maha meets each night and how many she resists, and see how much more resisting it would take to match facing half as many temptations.",
  intro:
    "In this example, Maha counts about 8 moments each night in bed when she feels pulled to open the video app, and she resists about half of them. Give-ins a week = temptations a day x 7 x the share she does not resist. Predict how often she would need to resist, facing all 8, to cut as much as facing half the temptations: about 60% or about 75%?",
  inputs: [
    { id: "perDay", label: "Temptations a day", min: 0, max: 20, step: 1, default: 8, unit: "a day" },
    { id: "resistedPercent", label: "Share resisted", min: 0, max: 90, step: 5, default: 50, unit: "%" },
  ],
  compute: computeTemptations,
  describeChange: describeTemptationChange,
  barsTitle: "Give-ins a week",
  tryThis: [
    "Check your prediction: at the defaults, the third number shows 75%. To match halving the temptations (14 give-ins a week), she would have to resist 6 of every 8 urges, every night. Resisting 60% gives about 22.",
    "Lower the temptations from 8 to 4 a day, as Maha did by turning off night notifications. Give-ins fall from 28 to 14 without any extra willpower.",
    "Raise the share resisted to 80%. Now 10 points more and halving cut the same. Ask yourself how many nights you could resist 8 times out of 10.",
  ],
  limits:
    "This is simple arithmetic on the chapter's example numbers, not a research finding, and real temptations are not all the same size. It assumes the share you resist stays the same when you face fewer temptations. At very high resistance (80% or more), ten more points would cut as much as halving or more, but resisting that often every night is exactly what is hard.",
};
