import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Learn and Build with AI course, chapter 5.2 "Why strong projects still take
// months". Yara's planning numbers for her link shortener project: 12 areas to
// learn and build, about 8 hours to learn an area well and about 4 hours to
// build it with AI help, and 4 weeks in a month. They are her plan's own
// estimates, not a measured rule. See spec.md.

export const AREAS_NEEDED = 12;
export const LEARN_HOURS_PER_AREA = 8;
export const BUILD_HOURS_PER_AREA = 4;
export const WEEKS_PER_MONTH = 4;

export type ProjectHours = {
  hoursPerWeek: number;
  months: number;
  /** Share of the hours spent learning, 0 to 100. */
  learningShare: number;
  totalHours: number;
  learningHours: number;
  buildingHours: number;
  /** Areas the learning hours cover, at 8 hours an area. */
  areasLearned: number;
  /** Areas the building hours cover, at 4 hours an area. */
  areasBuilt: number;
  /** Areas both learned and built, at most 12. */
  areasReady: number;
  /** What runs out first, or "none" when all 12 areas fit. */
  limit: "learning" | "building" | "both" | "none";
};

function count(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function projectHours(values: SliderValues): ProjectHours {
  const hoursPerWeek = count(values.hours, 8);
  const months = count(values.months, 6);
  const learningShare = Math.min(100, count(values.share, 60));
  const totalHours = hoursPerWeek * months * WEEKS_PER_MONTH;
  const learningHours = (totalHours * learningShare) / 100;
  const buildingHours = totalHours - learningHours;
  // A small epsilon keeps 96.00000000000001 hours from becoming 11 areas.
  const areasLearned = Math.floor(learningHours / LEARN_HOURS_PER_AREA + 1e-9);
  const areasBuilt = Math.floor(buildingHours / BUILD_HOURS_PER_AREA + 1e-9);
  const areasReady = Math.min(areasLearned, areasBuilt, AREAS_NEEDED);
  let limit: ProjectHours["limit"] = "none";
  if (areasReady < AREAS_NEEDED) {
    if (areasLearned === areasBuilt) limit = "both";
    else limit = areasLearned < areasBuilt ? "learning" : "building";
  }
  return { hoursPerWeek, months, learningShare, totalHours, learningHours, buildingHours, areasLearned, areasBuilt, areasReady, limit };
}

export const hoursText = (value: number) => `${Math.round(value).toLocaleString("en-US")} hours`;
const monthsText = (value: number) => `${value} ${value === 1 ? "month" : "months"}`;

const LEARNING_NEEDED = AREAS_NEEDED * LEARN_HOURS_PER_AREA;
const BUILDING_NEEDED = AREAS_NEEDED * BUILD_HOURS_PER_AREA;

function limitText(r: ProjectHours): string {
  if (r.limit === "learning") return "learning time runs out first";
  if (r.limit === "building") return "building time runs out first";
  if (r.limit === "both") return "learning and building time run out together";
  return "every area has the time it needs";
}

function computeProjectHours(values: SliderValues): SliderResult {
  const r = projectHours(values);
  return {
    stats: [
      { label: "Total hours", value: hoursText(r.totalHours), detail: `${r.hoursPerWeek} a week for ${r.months * WEEKS_PER_MONTH} weeks` },
      { label: "Areas ready", value: `${r.areasReady} of ${AREAS_NEEDED}`, detail: "learned and built" },
      { label: "What limits you", value: r.limit === "none" ? "Nothing" : r.limit === "both" ? "Both" : r.limit === "learning" ? "Learning" : "Building", detail: limitText(r) },
    ],
    bars: [
      { label: "Learning hours you have", value: r.learningHours, display: hoursText(r.learningHours), tone: r.learningHours + 1e-9 >= LEARNING_NEEDED ? "good" : "warn" },
      { label: "Learning needed for 12 areas", value: LEARNING_NEEDED, display: hoursText(LEARNING_NEEDED) },
      { label: "Building hours you have", value: r.buildingHours, display: hoursText(r.buildingHours), tone: r.buildingHours + 1e-9 >= BUILDING_NEEDED ? "good" : "warn" },
      { label: "Building needed for 12 areas", value: BUILDING_NEEDED, display: hoursText(BUILDING_NEEDED) },
    ],
    summary: `${r.hoursPerWeek} hours a week for ${monthsText(r.months)} gives ${hoursText(r.totalHours)}: ${hoursText(r.learningHours)} of learning and ${hoursText(r.buildingHours)} of building. ${r.areasReady} of the ${AREAS_NEEDED} areas are ready, and ${limitText(r)}.`,
  };
}

/** "What changed": which input moved, what it did to the hours, and how many areas are now ready. */
export function describeProjectHoursChange(before: SliderValues, after: SliderValues): string {
  const a = projectHours(before);
  const b = projectHours(after);
  const changed = [a.hoursPerWeek !== b.hoursPerWeek, a.months !== b.months, a.learningShare !== b.learningShare].filter(Boolean).length;
  if (changed === 0) return "Nothing changed: the plan has the same hours, so the same areas are ready.";
  const result = `Now ${b.areasReady} of the ${AREAS_NEEDED} areas are ready, and ${limitText(b)}.`;
  if (changed > 1) return `The total went from ${hoursText(a.totalHours)} to ${hoursText(b.totalHours)}. ${result}`;
  if (a.months !== b.months) {
    return `Going from ${monthsText(a.months)} to ${monthsText(b.months)} changed the total from ${hoursText(a.totalHours)} to ${hoursText(b.totalHours)}. ${result}`;
  }
  if (a.hoursPerWeek !== b.hoursPerWeek) {
    return `Going from ${a.hoursPerWeek} to ${b.hoursPerWeek} hours a week changed the total from ${hoursText(a.totalHours)} to ${hoursText(b.totalHours)}. ${result}`;
  }
  const moved = Math.abs(b.learningHours - a.learningHours);
  const direction = b.learningShare > a.learningShare ? "from building to learning" : "from learning to building";
  return `Moving the learning share from ${a.learningShare}% to ${b.learningShare}% moved ${hoursText(moved)} ${direction}. ${result}`;
}

export const sixMonthHoursSplit: SliderSpec = {
  kind: "slider",
  title: "How many areas fit in your plan?",
  purpose: "Change the weeks, the hours and the share of time you spend learning, and see how many of Yara's 12 project areas you can both learn and build.",
  intro:
    "Yara's project needs 12 areas, such as an API, a database, caching and tests. Her plan says each area takes about 8 hours to learn well and about 4 hours to build with AI help. These are her own planning numbers. She has about 8 hours a week. Before you move anything, predict: if she squeezed the project into one month, how many areas would be ready?",
  inputs: [
    { id: "hours", label: "Hours a week", min: 2, max: 20, step: 1, default: 8, unit: "hours" },
    { id: "months", label: "Months", min: 1, max: 12, step: 1, default: 6, unit: "months" },
    { id: "share", label: "Share spent learning", min: 20, max: 80, step: 10, default: 60, unit: "%" },
  ],
  compute: computeProjectHours,
  describeChange: describeProjectHoursChange,
  barsTitle: "Hours you have and hours the 12 areas need",
  tryThis: [
    "Set months to 1. The total drops from 192 to 32 hours, and only 2 of the 12 areas are ready: learning time runs out first.",
    "Back at 6 months, set the learning share to 20%. Building gets 154 hours, far more than it needs, but only 4 areas are ready.",
    "Now set the learning share to 80%. Learning has plenty, building gets 38 hours, and 9 areas are ready: a big share for learning, not all of it.",
  ],
  limits:
    "The hours per area are Yara's own planning numbers, not a measured rule; your areas will need more or less. Real weeks are uneven, with power cuts, exams and work. The model treats every area as the same size, and it ignores review, rest and the time to write about your work.",
};
