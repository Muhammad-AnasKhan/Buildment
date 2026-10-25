import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.5: nine lines Maryam could write down about
// Halaqa (fictional) after a check, sorted into a signal of success, a signal
// of failure, and a count that grows anyway. The rule: a signal is something
// you watched people do toward the goal or away from it; a count is a total
// that grows with the number of visitors and does not show who tried. Four
// cards are written so that the numbers point to the wrong bucket.

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
      failure: "These four reached the goal. A failure signal shows people who missed it.",
      count: "A count does not show who tried. This is a share of people you watched, so it is a signal.",
    },
  },
  {
    id: "page-views",
    text: "1,000 page views this month.",
    answer: "count",
    why: {
      success: "A signal is something you watched a person do toward the goal. A page view is not a join.",
      failure: "A failure signal is a person you watched give up. This only counts visits.",
    },
  },
  {
    id: "gave-up",
    text: "3 of 5 gave up on the search screen.",
    answer: "failure",
    why: {
      success: "Giving up is the opposite of the goal, so it is not a success signal.",
      count: "A count grows by itself. This is a share of people you watched, and it shows where they stopped.",
    },
  },
  {
    id: "no-digits",
    text: "Every classmate Maryam watched joined a group without help.",
    answer: "success",
    why: {
      failure: "Joining is the goal, so this shows success. A failure signal shows people who missed it.",
      count: "It has no digits, but Maryam watched each person do it. A count is a total nobody watched.",
    },
  },
  {
    id: "four-joined",
    text: "4 people joined a group this month.",
    answer: "count",
    why: {
      success: "It does not say how many tried. 4 of 5 and 4 of 400 look the same here, and nobody was watched.",
      failure: "It shows nobody missing the goal. It is a raw count, and it grows with the number of visitors.",
    },
  },
  {
    id: "back-twice",
    text: "2 of 5 pressed Back twice and closed the app.",
    answer: "failure",
    why: {
      success: "Pressing Back and leaving means the goal was missed, so it is not a success signal.",
      count: "You saw it happen to people you watched, so it is a failure signal, not a count.",
    },
  },
  {
    id: "sign-ups",
    text: "More sign-ups than last month.",
    answer: "count",
    why: {
      success: "A sign-up is not a joined group, and nobody was watched.",
      failure: "It shows nobody failing. A total grows with the number of visitors and tells you nothing about who tried.",
    },
  },
  {
    id: "asked-where",
    text: "Two classmates asked where the Join button was.",
    answer: "failure",
    why: {
      success: "They could not find the button, so they did not reach the goal on their own.",
      count: "You watched two people get stuck at a screen. A count is a total that nobody watched.",
    },
  },
  {
    id: "two-minutes",
    text: "The first group was joined in about 2 minutes.",
    answer: "success",
    why: {
      failure: "It shows a student reaching the goal, and how long it took.",
      count: "You watched it happen, and it has a time. A count is a total that nobody watched.",
    },
  },
];

export const productM1SignalOrCount: CustomCanvasSpec = {
  kind: "custom",
  title: "Signal or count?",
  purpose: "Sort nine lines Maryam could write down about Halaqa into a success signal, a failure signal or a count that grows anyway. Each wrong try shows the rule.",
  limits:
    "A count is not useless: it can show that people arrive. It just cannot tell you whether the goal was met. Halaqa and its numbers are a fictional case, and five people are too few to prove anything.",
  component: makeSorterCanvas({
    buckets: SIGNAL_BUCKETS,
    cards: SIGNAL_CARDS,
    deckLabel: "Halaqa check",
    prompt: "Signal, failure or count?",
    hint: "Tap the bucket this line belongs in, or drag the card onto it.",
    endNote: "A signal is something you watched people do toward the goal or away from it. A count is a total that grows with the number of visitors and does not show who tried.",
  }),
};
