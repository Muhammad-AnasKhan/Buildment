import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.2: place nine statements about screens on the
// course's four-level scale. Each card states facts. A card goes at the
// highest level whose checks the facts show are met, and one failed check
// keeps it at the level below. Remarkable cards name a choice and a reason, so
// the canvas checks only that a reason is stated; whether the choice is right
// for the job is a judgment the learner defends in words. Three cards pull the
// surface cue the wrong way: tests that do not repair a failed check, and a
// page with many Best features that nobody has tried.

export const LEVEL_BUCKETS: SortBucket[] = [
  { id: "average", label: "Average", sub: "works, defaults kept" },
  { id: "good", label: "Good", sub: "passes the standards" },
  { id: "best", label: "Best", sub: "clear, tested, fixed" },
  { id: "remarkable", label: "Remarkable", sub: "a named choice" },
];

export const LEVEL_CARDS: SortCard[] = [
  {
    id: "works-defaults",
    text: "It works from start to finish. Every default is unchanged.",
    answer: "average",
    why: {
      good: "Rule: Good needs the standards checked and passed. None is stated here.",
      best: "Rule: Best needs every Good check first. None is stated here.",
      remarkable: "Rule: Remarkable needs a named choice with a reason. None is named.",
    },
  },
  {
    id: "polished-pale",
    text: "Soft shadows and rounded cards. Hint text is pale grey and fails contrast.",
    answer: "average",
    why: {
      good: "Rule: one failed Good check keeps a screen at Average. Contrast fails.",
      best: "Rule: Best needs every Good check, and contrast already fails.",
      remarkable: "Rule: a look is not a choice with a reason, and a check fails.",
    },
  },
  {
    id: "tested-pale",
    text: "4 of 5 people finished after fixes. Hint text is pale grey and fails contrast.",
    answer: "average",
    why: {
      good: "Rule: Good needs every standard to pass. Pale hint text fails contrast.",
      best: "Rule: Best builds on Good. Testing does not repair a failed check.",
      remarkable: "Rule: Remarkable builds on Best, and a Good check still fails.",
    },
  },
  {
    id: "passes-untried",
    text: "Contrast, labels, focus, targets and all three states pass. Nobody has tried it.",
    answer: "good",
    why: {
      average: "Rule: Average means a Good check fails or is unchecked. All pass here.",
      best: "Rule: Best needs a check with people and fixes. Nobody has tried it.",
      remarkable: "Rule: Remarkable needs Best first, and a named choice with a reason.",
    },
  },
  {
    id: "clear-untried",
    text: "Good checks pass. One thing leads, spacing is steady, extras are cut. No one has tried it.",
    answer: "good",
    why: {
      average: "Rule: Average means a Good check fails or is unchecked. All pass here.",
      best: "Rule: Best needs a check with people and fixes. Many Best features are not enough.",
      remarkable: "Rule: Remarkable needs Best first, and a named choice with a reason.",
    },
  },
  {
    id: "tested-fixed",
    text: "Good checks pass. Spacing is steady, extras are cut and one thing leads. 4 of 5 finished after fixes.",
    answer: "best",
    why: {
      average: "Rule: Average means a Good check fails. Every Good check passes here.",
      good: "Rule: Best adds one clear first thing and a tested, fixed check. Both are here.",
      remarkable: "Rule: Remarkable needs a named choice with a reason. None is named.",
    },
  },
  {
    id: "orange-no-reason",
    text: "Best checks pass. The header is bright orange, and no reason is given.",
    answer: "best",
    why: {
      average: "Rule: Average means a Good check fails. Every Best check passes here.",
      good: "Rule: Good is the level below. Every Best check passes here.",
      remarkable: "Rule: a choice needs a reason a reader can name. Orange has none.",
    },
  },
  {
    id: "seats-first",
    text: "Best checks pass. Seats left is the largest text: seats decide the join.",
    answer: "remarkable",
    why: {
      average: "Rule: Remarkable is Best plus a named choice and reason. Both are stated.",
      good: "Rule: Remarkable is Best plus a named choice and reason. Both are stated.",
      best: "Rule: a named choice with a reason is Remarkable. Seats first has one.",
    },
  },
  {
    id: "free-hours-first",
    text: "Best checks pass. Rooms open on today's free hours: students book the same day.",
    answer: "remarkable",
    why: {
      average: "Rule: Remarkable is Best plus a named choice and reason. Both are stated.",
      good: "Rule: Remarkable is Best plus a named choice and reason. Both are stated.",
      best: "Rule: a named choice with a reason is Remarkable. Free hours first has one.",
    },
  },
];

export const productM4FourLevels: CustomCanvasSpec = {
  kind: "custom",
  title: "Place each screen on the scale",
  purpose: "Sort nine statements about screens into Average, Good, Best and Remarkable, using the checks that each level adds to the one below.",
  limits:
    "The scale is this course's own, not an industry standard. The canvas checks only that a reason is stated for a choice. You defend whether it fits the job. The screens are made up.",
  component: makeSorterCanvas({
    buckets: LEVEL_BUCKETS,
    cards: LEVEL_CARDS,
    deckLabel: "A screen, in facts",
    prompt: "Which level do these facts show?",
    hint: "Tap the highest level whose checks the facts show are met, or drag the card onto it.",
    endNote: "Each level needs every check below it. A top-level choice needs a reason a reader can name.",
  }),
};
