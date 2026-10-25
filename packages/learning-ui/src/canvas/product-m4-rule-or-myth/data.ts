import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.5: nine popular design rules, checked against the
// evidence the course's research found. Supported rules have a standard, a
// study or a documented practice behind them. A misread rule has a true core
// that is used in the wrong place or with the wrong meaning. An unsupported
// rule failed its test, has mixed evidence, or was dropped by its own source.

export const RULE_BUCKETS: SortBucket[] = [
  { id: "supported", label: "Supported", sub: "evidence backs it" },
  { id: "misread", label: "Misread", sub: "true core, wrong use" },
  { id: "unsupported", label: "Unsupported", sub: "test failed or mixed" },
];

export const RULE_CARDS: SortCard[] = [
  {
    id: "contrast",
    text: "Normal text needs a contrast ratio of at least 4.5 to 1.",
    answer: "supported",
    why: {
      misread: "This is the WCAG AA standard as written. Nothing is stretched.",
      unsupported: "It is a published standard, not a popular guess.",
    },
  },
  {
    id: "top-of-page",
    text: "Most viewing time is near the top of a page.",
    answer: "supported",
    why: {
      misread: "The card states the finding itself: 57% of viewing time in the first screen.",
      unsupported: "A 2018 study of 120 people backs it. It is evidence, not a guess.",
    },
  },
  {
    id: "visible-labels",
    text: "A form label should stay visible above its field.",
    answer: "supported",
    why: {
      misread: "NN/g and GOV.UK both give reasons: a placeholder vanishes when you type.",
      unsupported: "Expert guidance and a maker's written reasons back it.",
    },
  },
  {
    id: "five-users",
    text: "Five users find all the problems.",
    answer: "misread",
    why: {
      supported: "The model says about 85% of one group's problems per round, not all.",
      unsupported: "The model is real. The claim 'all' and the missing rounds are wrong.",
    },
  },
  {
    id: "seven-items",
    text: "A menu should hold seven items, plus or minus two.",
    answer: "misread",
    why: {
      supported: "Miller wrote about memory span, not about menus.",
      unsupported: "Miller's finding is real. It is used where it was never tested.",
    },
  },
  {
    id: "f-pattern",
    text: "Lay out your page to follow the F-pattern.",
    answer: "misread",
    why: {
      supported: "NN/g calls the F-pattern a failure to avoid, not a layout to copy.",
      unsupported: "People do scan this way. The advice to copy it is what is wrong.",
    },
  },
  {
    id: "three-clicks",
    text: "Every page must be reachable in three clicks.",
    answer: "unsupported",
    why: {
      supported: "A test with 44 people and 620 tasks found no link to click count.",
      misread: "There is no true core to misuse. The test itself did not support it.",
    },
  },
  {
    id: "golden-ratio",
    text: "The golden ratio makes a design beautiful.",
    answer: "unsupported",
    why: {
      supported: "The evidence is mixed, and the author says it is no universal rule.",
      misread: "The studies themselves disagree, so the rule has no firm core.",
    },
  },
  {
    id: "blue-trust",
    text: "Blue makes people trust you.",
    answer: "unsupported",
    why: {
      supported: "A review found effects depend on context and called advice premature.",
      misread: "The research on colour is young, so a general rule is not backed.",
    },
  },
];

export const productM4RuleOrMyth: CustomCanvasSpec = {
  kind: "custom",
  title: "Check nine popular rules",
  purpose: "Sort nine popular design rules into supported, misread and unsupported, using what the evidence says about each one.",
  limits:
    "Evidence changes, and some of it is thin or old. The labels describe what the sources opened for this course say, checked 2026-10-25. Unsupported does not mean the opposite is true.",
  component: makeSorterCanvas({
    buckets: RULE_BUCKETS,
    cards: RULE_CARDS,
    deckLabel: "A popular rule",
    prompt: "What does the evidence say?",
    hint: "Tap the bucket this rule belongs in, or drag the card onto it.",
    endNote: "Ask what was tested, with whom, and whether it fits your case. Then repeat the rule, qualify it or drop it.",
  }),
};
