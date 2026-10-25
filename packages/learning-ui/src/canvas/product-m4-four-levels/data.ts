import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.2: place nine statements about screens on the
// course's four-level scale. Each card states facts. A card goes at the
// highest level whose checks the facts show are met. Remarkable cards name a
// choice and a reason, so the canvas can check that a reason is stated; whether
// the choice is right for the job is a judgment the learner defends in words.

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
      good: "Nothing says contrast, labels, focus, targets or states were checked.",
      best: "Best needs the Good checks first, and nothing says they were done.",
      remarkable: "No choice with a reason is named, and no check is stated.",
    },
  },
  {
    id: "polished-pale",
    text: "Soft shadows and rounded cards. Hint text is pale grey and fails contrast.",
    answer: "average",
    why: {
      good: "Pale hint text fails the contrast check, so Good is out of reach.",
      best: "Best needs every Good check, and the contrast check already fails.",
      remarkable: "A look with no named choice and a failed check is not Remarkable.",
    },
  },
  {
    id: "blank-error",
    text: "Every Good check passes except the error state, which is a blank page.",
    answer: "average",
    why: {
      good: "Good needs every check, and a blank error state fails the states check.",
      best: "Best builds on Good, and one Good check still fails here.",
      remarkable: "Remarkable builds on Best, and a Good check still fails here.",
    },
  },
  {
    id: "passes-untried",
    text: "Contrast, labels, focus, targets and all three states pass. Nobody has tried it.",
    answer: "good",
    why: {
      average: "Every standard passes, so this is above Average.",
      best: "Best needs a small check with people and fixes made. Nobody has tried it.",
      remarkable: "No choice with a reason is named, and no one has tried it.",
    },
  },
  {
    id: "three-compete",
    text: "Good checks pass. Blurred, three things compete. No one has tried it.",
    answer: "good",
    why: {
      average: "The Good checks pass, so it is above Average.",
      best: "Blurred, three things compete, so the hierarchy check for Best fails.",
      remarkable: "Remarkable builds on Best, and the Best checks fail here.",
    },
  },
  {
    id: "tested-fixed",
    text: "Good checks pass. Spacing is steady, extras are cut and one thing leads. 4 of 5 finished after fixes.",
    answer: "best",
    why: {
      average: "The Good checks pass and more, so it is well above Average.",
      good: "It also leads with one thing and was tested and fixed. That is Best.",
      remarkable: "It names no choice for the job and no reason, so it stops at Best.",
    },
  },
  {
    id: "orange-no-reason",
    text: "Best checks pass. The header is bright orange, and no reason is given.",
    answer: "best",
    why: {
      average: "Every Best check passes, so it is far above Average.",
      good: "It passes the Good and Best checks. Good is the level below.",
      remarkable: "A choice needs a reason a reader can name. 'Bright orange' has none.",
    },
  },
  {
    id: "seats-first",
    text: "Best checks pass. Seats left is the largest text: seats decide the join.",
    answer: "remarkable",
    why: {
      average: "All Best checks pass, so this is far above Average.",
      good: "It passes the Good and Best checks, and it names a choice and a reason.",
      best: "Seats first is a named choice, and 'seats decide the join' is its reason.",
    },
  },
  {
    id: "free-hours-first",
    text: "Best checks pass. Rooms open on today's free hours: students book the same day.",
    answer: "remarkable",
    why: {
      average: "All Best checks pass, so this is far above Average.",
      good: "It passes the Good and Best checks, and it names a choice and a reason.",
      best: "Opening on free hours is a named choice, and 'students book the same day' is its reason.",
    },
  },
];

export const productM4FourLevels: CustomCanvasSpec = {
  kind: "custom",
  title: "Place each screen on the scale",
  purpose: "Sort nine statements about screens into Average, Good, Best and Remarkable, using the checks that each level adds to the one below.",
  limits:
    "The scale is this course's own, not an industry standard. The canvas checks that a Remarkable card states a choice and a reason. It cannot say whether the choice is right for the job: you defend that in words. The screens are made up.",
  component: makeSorterCanvas({
    buckets: LEVEL_BUCKETS,
    cards: LEVEL_CARDS,
    deckLabel: "A screen, in facts",
    prompt: "Which level do these facts show?",
    hint: "Tap the highest level whose checks the facts show are met, or drag the card onto it.",
    endNote: "Each level needs every check below it. A top-level choice needs a reason a reader can name.",
  }),
};
