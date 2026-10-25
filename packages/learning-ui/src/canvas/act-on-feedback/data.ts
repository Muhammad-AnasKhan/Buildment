import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 9.6: Nabil's assistant critiques the README and code
// of Shelf, his school library page (fictional). Each point is a claim to
// sort: fix now, test first, or reject with a reason. Dossier: C56 to C58
// (AI review has limits, assistants lean towards agreeing).

export const FEEDBACK_BUCKETS: SortBucket[] = [
  { id: "fix", label: "Fix now", sub: "true, easy to see" },
  { id: "test", label: "Test first", sub: "could be true" },
  { id: "reject", label: "Reject", sub: "write one reason" },
];

export const FEEDBACK_CARDS: SortCard[] = [
  {
    id: "dates",
    text: "Dates break for loans that start on 31 January. (Not run yet.)",
    answer: "test",
    why: {
      fix: "He has not seen it fail. Do not edit code for a claim you have not tested.",
      reject: "It could be a real bug that hurts users. Run one test with that date first.",
    },
  },
  {
    id: "praise",
    text: "Great work! No changes needed.",
    answer: "reject",
    why: {
      fix: "There is nothing to fix. This is praise, not a point about the work.",
      test: "Praise gives you nothing to test. Ask again for the three weakest points.",
    },
  },
  {
    id: "run-steps",
    text: "The README has no steps for running the page. (Nabil checks: none.)",
    answer: "fix",
    why: {
      test: "He can see it by looking. The README has no run steps, so no test is needed.",
      reject: "It is true, and it helps every visitor. A reason to reject would be hard to write.",
    },
  },
  {
    id: "framework",
    text: "Rewrite the page in a big framework. (The page has 60 lines.)",
    answer: "reject",
    why: {
      fix: "Sixty lines do not need a rewrite. It would cost weeks and fix nothing.",
      test: "A test cannot show a rewrite is right. The goal is a small page, so say no and why.",
    },
  },
  {
    id: "offline",
    text: "The page needs the internet. (Not tried offline yet.)",
    answer: "test",
    why: {
      fix: "He has not tried it offline, so he does not know yet that the point is true.",
      reject: "The README says it works offline, so this matters. Try it with the network off.",
    },
  },
  {
    id: "licence",
    text: "No LICENSE file. (Nabil checks: the repository has none.)",
    answer: "fix",
    why: {
      test: "He opened the file list and saw there is none. Looking was the test.",
      reject: "Without a licence nobody may reuse the code, so the point helps him.",
    },
  },
  {
    id: "faster-sort",
    text: "Use a faster sort for the book list. (It has 40 books.)",
    answer: "reject",
    why: {
      fix: "Forty books sort at once, so there is nothing to fix.",
      test: "He can see it is instant. A measurement adds nothing, so reject it and say why.",
    },
  },
  {
    id: "run-command",
    text: "The run command in the README is wrong. (Not run yet.)",
    answer: "test",
    why: {
      fix: "He has not run it. Run the command first, then change the README if it fails.",
      reject: "A wrong command stops every visitor. Run it before you decide.",
    },
  },
];

export const actOnFeedback: CustomCanvasSpec = {
  kind: "custom",
  title: "Fix, test or reject?",
  purpose: "Sort eight points from an AI critique of Nabil's page into fix now, test first and reject, with a short reason after each wrong try.",
  limits:
    "Real critiques are longer and the line between a quick fix and a test is not always sharp: a point you can check in a minute by looking counts as fix now here. Shelf, Nabil and every point are fictional. Rejecting a point is your decision, and a good reason is part of it.",
  component: makeSorterCanvas({
    buckets: FEEDBACK_BUCKETS,
    cards: FEEDBACK_CARDS,
    deckLabel: "Critique point",
    prompt: "Which bucket does this point go in?",
    hint: "Tap the bucket this point belongs in, or drag the card onto it.",
    endNote: "Fix what you can see is true. Test what might be true. Reject what does not fit your goal, and write one reason.",
  }),
};
