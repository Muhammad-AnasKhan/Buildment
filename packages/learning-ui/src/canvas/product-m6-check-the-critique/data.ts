import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.3: nine points from AI critiques of Maryam's
// create-group screen in Halaqa (fictional; the points are invented, not
// tool output). Each one needs a check against a rule, a question for a
// person, or nothing at all.
//
// The rule that separates the buckets, stated in every reason:
// - Check a rule: a standard or a taught rule can measure it or show it.
// - Ask a person: it depends on what a student understands or does.
// - Not useful: it names no problem a student has.
// Three cards point the wrong way on the surface: "Errors show only as a red
// border" reads like a description but is a rule; "takes about a minute" and
// "7 out of 10" hold numbers but are not measures of a rule.

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
      person: "Ask a person is for what students understand or do. Light text has a rule, 4.5 to 1: measure it.",
      drop: "Not useful is for points that name no problem. This names one you can test: text colour on its background.",
    },
  },
  {
    id: "small-button",
    text: "The Start the group button is too small for a thumb.",
    answer: "rule",
    why: {
      person: "Ask a person is for what students understand or do. Size has a rule (aim 44 to 48): measure the button.",
      drop: "Not useful is for points that name no problem. This names one a standard tests: target size.",
    },
  },
  {
    id: "red-only",
    text: "Errors show only as a red border.",
    answer: "rule",
    why: {
      person: "Ask a person is for what students understand or do. Colour alone has a rule: trigger an error and look.",
      drop: "Not useful is for points that name no problem. This is a real, checkable one: trigger an error and look.",
    },
  },
  {
    id: "seats-unclear",
    text: "A student may not know what to type in Seats.",
    answer: "person",
    why: {
      rule: "Check a rule is for what a standard can measure. No rule says what a student understands: watch one.",
      drop: "Not useful is for points that name no problem. This names a real doubt: watch a student fill it in.",
    },
  },
  {
    id: "minute-to-fill",
    text: "Filling in the four fields takes students about a minute.",
    answer: "person",
    why: {
      rule: "A number does not make it a rule. No standard sets a time for a form: watch a student with a clock.",
      drop: "Not useful is for points that name no problem. This is a claim you can check by timing a student.",
    },
  },
  {
    id: "too-many-fields",
    text: "Four fields are too many for a quick form.",
    answer: "person",
    why: {
      rule: "Check a rule is for what a standard can measure. No rule limits fields: watch where a student stops.",
      drop: "Not useful is for points that name no problem. This may be right: watch whether a student stops.",
    },
  },
  {
    id: "premium",
    text: "Make it feel more modern and premium.",
    answer: "drop",
    why: {
      rule: "Check a rule needs a rule or a number. This names neither, so there is nothing to measure.",
      person: "Ask a person needs a problem a student has. This names none, so there is nothing to ask.",
    },
  },
  {
    id: "score",
    text: "I give this screen 7 out of 10.",
    answer: "drop",
    why: {
      rule: "Digits do not make a measure. A score names no rule: ask which rule lost the other 3 points.",
      person: "Ask a person needs a problem a student has. A score names none: ask the tool for its reasons.",
    },
  },
  {
    id: "glow-header",
    text: "Add a glowing purple header so it stands out.",
    answer: "drop",
    why: {
      rule: "Check a rule needs a rule or a number. A glow fixes nothing you can measure.",
      person: "Ask a person needs a problem a student has. This names none, so there is nothing to ask.",
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
    endNote: "A rule or number: check it. What a student understands or does: ask. No problem named: drop it.",
  }),
};
