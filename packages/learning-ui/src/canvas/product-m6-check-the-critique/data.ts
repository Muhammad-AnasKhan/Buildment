import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.3: nine points from AI critiques of Maryam's
// create-group screen in Halaqa (fictional; the points are invented, not
// tool output). Each one needs a check against a rule, a question for a
// person, or nothing at all.

export const CRITIQUE_BUCKETS: SortBucket[] = [
  { id: "rule", label: "Check a rule", sub: "measure it" },
  { id: "person", label: "Ask a person", sub: "watch them" },
  { id: "drop", label: "Not useful", sub: "nothing to check" },
];

export const CRITIQUE_CARDS: SortCard[] = [
  {
    id: "hint-text",
    text: "The grey hint text is too light to read.",
    answer: "rule",
    why: {
      person: "A contrast ratio settles this. Measure the two colours first.",
      drop: "It names a real thing to test: the text colour on its background.",
    },
  },
  {
    id: "small-button",
    text: "The Create button is too small for a thumb.",
    answer: "rule",
    why: {
      person: "Size is a number. Measure the button in CSS pixels first.",
      drop: "It can be tested against the target size rule.",
    },
  },
  {
    id: "red-only",
    text: "Errors show only as a red border.",
    answer: "rule",
    why: {
      person: "The rule is known: colour must not be the only signal. Look.",
      drop: "It is a real, checkable problem. Trigger an error and look.",
    },
  },
  {
    id: "seats-unclear",
    text: "A student may not know what to type in Seats.",
    answer: "person",
    why: {
      rule: "No rule or number says what a student understands. Watch one.",
      drop: "It names a real doubt. Watch a student fill the field in.",
    },
  },
  {
    id: "time-list",
    text: "Students may prefer to pick a time from a list.",
    answer: "person",
    why: {
      rule: "No standard says list or free text. Ask or watch a student.",
      drop: "It is a real question that two classmates can answer.",
    },
  },
  {
    id: "too-many-fields",
    text: "Four fields are too many for a quick form.",
    answer: "person",
    why: {
      rule: "No rule gives a limit. Only a student shows where they stop.",
      drop: "It may be right. Watch whether a student stops at a field.",
    },
  },
  {
    id: "premium",
    text: "Make it feel more modern and premium.",
    answer: "drop",
    why: {
      rule: "No rule or number is named, so there is nothing to measure.",
      person: "It names no problem a student has, so there is nothing to ask.",
    },
  },
  {
    id: "score",
    text: "I give this screen 7 out of 10.",
    answer: "drop",
    why: {
      rule: "A score names no rule. Ask which rule lost the other 3 points.",
      person: "A score is not a problem a student has. Ask for the reasons.",
    },
  },
  {
    id: "glow-header",
    text: "Add a glowing purple header so it stands out.",
    answer: "drop",
    why: {
      rule: "No rule is named. The glow fixes no problem you can measure.",
      person: "No problem is named, so there is nothing to ask a student.",
    },
  },
];

export const productM6CheckTheCritique: CustomCanvasSpec = {
  kind: "custom",
  title: "Check the critique",
  purpose: "Sort nine points from AI critiques of Maryam's create-group screen into: check a rule, ask a person, or not useful, with a short reason after each wrong try.",
  limits:
    "Real critiques mix kinds in one sentence, and some points need both a rule and a person. The nine points are invented for this lesson, not output from a real tool. Halaqa is a fictional app.",
  component: makeSorterCanvas({
    buckets: CRITIQUE_BUCKETS,
    cards: CRITIQUE_CARDS,
    deckLabel: "AI critique point",
    prompt: "What does this point need?",
    hint: "Tap the bucket this card belongs in, or drag the card onto it.",
    endNote: "A rule or number: check it. What a person does or knows: ask. No problem named: drop it.",
  }),
};
