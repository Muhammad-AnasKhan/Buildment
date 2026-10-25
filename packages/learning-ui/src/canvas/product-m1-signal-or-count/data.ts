import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.5: eight lines Maryam could write down about
// Halaqa (fictional) after a check, sorted into a signal of success, a signal
// of failure, and a count that grows anyway.

export const SIGNAL_BUCKETS: SortBucket[] = [
  { id: "success", label: "Success signal", sub: "you watch it work" },
  { id: "failure", label: "Failure signal", sub: "you watch it fail" },
  { id: "count", label: "Count only", sub: "grows anyway" },
];

export const SIGNAL_CARDS: SortCard[] = [
  {
    id: "four-of-five",
    text: "4 of 5 classmates joined a group in their first visit.",
    answer: "success",
    why: {
      failure: "These four reached the goal. It shows success, not failure.",
      count: "It is a share of people you watched, so it tells you how many of those who tried succeeded.",
    },
  },
  {
    id: "page-views",
    text: "1,000 page views this month.",
    answer: "count",
    why: {
      success: "A page view does not show that anyone joined a group.",
      failure: "It shows nobody failing. It only counts visits.",
    },
  },
  {
    id: "gave-up",
    text: "3 of 5 gave up on the search screen.",
    answer: "failure",
    why: {
      success: "Giving up is the opposite of the goal.",
      count: "You watched it happen in a small group. It is not a count that grows by itself.",
    },
  },
  {
    id: "two-minutes",
    text: "The first group was joined in about 2 minutes.",
    answer: "success",
    why: {
      failure: "It shows a student reaching the goal, and how long it took.",
      count: "You watched it happen, and it has a time. It is not a count that grows anyway.",
    },
  },
  {
    id: "four-joined",
    text: "4 people joined a group this month.",
    answer: "count",
    why: {
      success: "It does not say how many tried. 4 of 5 and 4 of 400 look the same here.",
      failure: "It shows nobody failing. It is a raw count.",
    },
  },
  {
    id: "back-twice",
    text: "2 of 5 pressed Back twice and closed the app.",
    answer: "failure",
    why: {
      success: "Pressing Back and leaving means the goal was missed.",
      count: "You saw it happen, so it is a failure signal, not a count.",
    },
  },
  {
    id: "sign-ups",
    text: "More sign-ups than last month.",
    answer: "count",
    why: {
      success: "A sign-up is not a joined group.",
      failure: "It shows nothing going wrong. Counts grow with the number of visitors.",
    },
  },
  {
    id: "messages",
    text: "12 chat messages were sent today.",
    answer: "count",
    why: {
      success: "Messages do not show that anyone joined a group.",
      failure: "It shows nobody failing. It only counts messages.",
    },
  },
];

export const productM1SignalOrCount: CustomCanvasSpec = {
  kind: "custom",
  title: "Signal or count?",
  purpose: "Sort eight lines Maryam could write down about Halaqa into a success signal, a failure signal or a count that grows anyway, with a short reason after each wrong try.",
  limits:
    "A count is not useless: it can show that people arrive. It just cannot tell you whether the goal was met. Halaqa and its numbers are a fictional case, and five people are too few to prove anything.",
  component: makeSorterCanvas({
    buckets: SIGNAL_BUCKETS,
    cards: SIGNAL_CARDS,
    deckLabel: "Halaqa check",
    prompt: "Signal, failure or count?",
    hint: "Tap the bucket this line belongs in, or drag the card onto it.",
    endNote: "A signal is something you watch a person do. A ratio shows how many tried. A count can grow while the goal is missed.",
  }),
};
