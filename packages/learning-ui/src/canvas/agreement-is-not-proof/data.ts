import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 5.3: Yara asks two assistants the same question and
// sorts what each pair of answers tells her. Where they differ is where to
// look first. Where they agree on a fact that matters, the primary page still
// decides, because different models often make the same mistake (B15). Where
// they agree on wording, the answer can stand as a draft. The course's method,
// not a research finding; the evidence behind it is B12, B15 and B16.

export const AGREEMENT_BUCKETS: SortBucket[] = [
  { id: "differ", label: "They differ", sub: "look here first" },
  { id: "agree-fact", label: "Agree: a fact", sub: "still read the page" },
  { id: "agree-draft", label: "Agree: wording", sub: "fine as a draft" },
];

export const AGREEMENT_CARDS: SortCard[] = [
  {
    id: "gsoc-who",
    text: "Assistant A: GSoC is for students only. Assistant B: students or open source beginners.",
    answer: "differ",
    why: {
      "agree-fact": "They say different things, so they do not agree.",
      "agree-draft": "Who can join is a rule, not wording, and they differ.",
    },
  },
  {
    id: "october-reward",
    text: "Both assistants say four pull requests in October earn a reward.",
    answer: "agree-fact",
    why: {
      differ: "Both say the same thing, so there is no difference to find.",
      "agree-draft": "A reward rule is a fact. A page can check it.",
    },
  },
  {
    id: "first-line",
    text: "Both suggest almost the same friendly first line for a message to a mentor.",
    answer: "agree-draft",
    why: {
      differ: "The lines match, so there is no difference to look for.",
      "agree-fact": "It is wording. No rules page can say if it is right.",
    },
  },
  {
    id: "email-limit",
    text: "Assistant A: the free plan sends 100 emails a day. Assistant B: 1,000 emails a month.",
    answer: "differ",
    why: {
      "agree-fact": "The two limits are different numbers, so they disagree.",
      "agree-draft": "A limit decides the plan, and the answers disagree.",
    },
  },
  {
    id: "post-title",
    text: "Both propose the same title for a blog post about her first lab.",
    answer: "agree-draft",
    why: {
      differ: "The titles match, so nothing differs to check.",
      "agree-fact": "A title is wording. It is not a rule, price or date.",
    },
  },
  {
    id: "licence",
    text: "Both say a library's licence allows use in a paid product.",
    answer: "agree-fact",
    why: {
      differ: "Both say the same thing, so they do not differ.",
      "agree-draft": "A licence decides what you may do. Read the licence file.",
    },
  },
  {
    id: "install",
    text: "Both give the same three commands to install a tool.",
    answer: "agree-fact",
    why: {
      differ: "The commands match, so there is no difference to find.",
      "agree-draft": "A wrong command can cost an evening. Check the tool's docs.",
    },
  },
  {
    id: "deadline",
    text: "Assistant A: applications close on 1 March. Assistant B: on 1 April.",
    answer: "differ",
    why: {
      "agree-fact": "The two dates are different, so they do not agree.",
      "agree-draft": "A deadline is a fact, and the two answers differ.",
    },
  },
];

export const agreementIsNotProof: CustomCanvasSpec = {
  kind: "custom",
  title: "Sort what two answers tell Yara",
  purpose:
    "Sort eight pairs of assistant answers into three buckets: they differ, so look there first; they agree on a fact, so read the primary page; they agree on wording, so the answer can stand as a draft.",
  limits:
    "Real answers are messier: they often agree on one point and differ on another, and what counts as a fact that matters depends on your stakes. The cards are invented examples. Yara and the assistants' answers are fictional; the rules of the programs they mention were checked on 2026-10-25.",
  component: makeSorterCanvas({
    buckets: AGREEMENT_BUCKETS,
    cards: AGREEMENT_CARDS,
    deckLabel: "Two answers",
    prompt: "What do the two answers tell Yara?",
    hint: "Tap the bucket this pair of answers belongs in, or drag the card onto it.",
    endNote: "Differ: look there first. Agree on a fact: read the page. Agree on wording: it is a draft.",
  }),
};
