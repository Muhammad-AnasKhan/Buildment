import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.5: nine popular design rules, checked against the
// evidence the course's research found. One rule separates the buckets.
// Supported: a standard, a study or written practice backs the rule as it is
// stated. Misread: a real finding is used where it was not tested. Unsupported:
// no test backs the rule as stated (it failed, the evidence is mixed, or its
// author took it back). The surface cues conflict on purpose: digits appear in
// supported, misread and unsupported cards alike.

export const RULE_BUCKETS: SortBucket[] = [
  { id: "supported", label: "Supported", sub: "backed as stated" },
  { id: "misread", label: "Misread", sub: "real, wrong place" },
  { id: "unsupported", label: "Unsupported", sub: "failed or mixed" },
];

export const RULE_CARDS: SortCard[] = [
  {
    id: "contrast",
    text: "Normal text needs a contrast ratio of at least 4.5 to 1.",
    answer: "supported",
    why: {
      misread: "Rule: Misread means a real finding used in the wrong place. This is a standard.",
      unsupported: "Rule: Unsupported has no test behind it. WCAG publishes this one.",
    },
  },
  {
    id: "top-of-page",
    text: "Most viewing time is near the top of a page.",
    answer: "supported",
    why: {
      misread: "Rule: Misread means a real finding used in the wrong place. This card is the finding.",
      unsupported: "Rule: Unsupported has no test. A 2018 study of 120 people backs this.",
    },
  },
  {
    id: "visible-labels",
    text: "A form label should stay visible above its field.",
    answer: "supported",
    why: {
      misread: "Rule: Misread means a real finding used in the wrong place. NN/g and GOV.UK back this.",
      unsupported: "Rule: Unsupported has no backing. Expert advice and written reasons back this.",
    },
  },
  {
    id: "five-users",
    text: "Five users find all the problems.",
    answer: "misread",
    why: {
      supported: "Rule: Supported holds as stated. The card says 'all'; the model says about 85%.",
      unsupported: "Rule: Unsupported has no test. The model is real; the word 'all' is wrong.",
    },
  },
  {
    id: "seven-items",
    text: "A menu should hold seven items, plus or minus two.",
    answer: "misread",
    why: {
      supported: "Rule: Supported holds as stated. Miller wrote about memory span, not menus.",
      unsupported: "Rule: Unsupported was never backed. Miller's finding is real but is about memory.",
    },
  },
  {
    id: "f-pattern",
    text: "Lay out your page to follow the F-pattern.",
    answer: "misread",
    why: {
      supported: "Rule: Supported holds as stated. NN/g calls the F-pattern a failure to avoid.",
      unsupported: "Rule: Unsupported has no test. People do scan this way; copying it is the error.",
    },
  },
  {
    id: "three-clicks",
    text: "Every page must be reachable in three clicks.",
    answer: "unsupported",
    why: {
      supported: "Rule: Supported holds as stated. A test of 44 people and 620 tasks found no link.",
      misread: "Rule: Misread has a real finding at its core. This test itself found no link.",
    },
  },
  {
    id: "golden-ratio",
    text: "The golden ratio makes a design beautiful.",
    answer: "unsupported",
    why: {
      supported: "Rule: Supported holds as stated. The evidence is mixed. It is no universal rule.",
      misread: "Rule: Misread has a real finding at its core. Here the studies disagree.",
    },
  },
  {
    id: "blue-trust",
    text: "Blue makes people trust you.",
    answer: "unsupported",
    why: {
      supported: "Rule: Supported holds as stated. A review found effects depend on context.",
      misread: "Rule: Misread has a real finding at its core. The review calls advice premature.",
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
