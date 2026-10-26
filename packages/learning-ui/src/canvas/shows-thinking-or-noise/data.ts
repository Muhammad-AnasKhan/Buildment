import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 8.3 "Build more to show": sort eight pieces of public
// work by whether a reader can check how the builder thinks. The rule is the
// course's own reading of B78 (public work as evidence others can check) and
// B80; the cards are made-up examples, not real people or projects.

export const THINKING_BUCKETS: SortBucket[] = [
  { id: "thinking", label: "Shows thinking", sub: "a reader can check" },
  { id: "noise", label: "Noise", sub: "more, not clearer" },
];

export const THINKING_CARDS: SortCard[] = [
  {
    id: "forty-clones",
    text: "Forty tutorial clones, each with the tutorial's own README.",
    answer: "noise",
    why: {
      thinking: "Nothing in it is your choice, so a reader has no decision to check.",
    },
  },
  {
    id: "weekly-series",
    text: "A weekly lab series: eight entries, and one failed test explained.",
    answer: "thinking",
    why: {
      noise: "It shows how you work over weeks, including a failure you explained.",
    },
  },
  {
    id: "clone-with-changes",
    text: "A tutorial clone whose README lists 3 changes you made and why.",
    answer: "thinking",
    why: {
      noise: "A clone, but its README gives choices and reasons to check.",
    },
  },
  {
    id: "empty-fork",
    text: "A fork of a popular project with no changes.",
    answer: "noise",
    why: {
      thinking: "Nothing here is yours yet. An unchanged fork shows no work to check.",
    },
  },
  {
    id: "small-tool",
    text: "A small tool that 3 classmates use, with a README of 2 trade-offs.",
    answer: "thinking",
    why: {
      noise: "Real users and written trade-offs are two things a reader can check.",
    },
  },
  {
    id: "script-commits",
    text: "300 commits made in one night by a script, to fill the graph.",
    answer: "noise",
    why: {
      thinking: "A script shows no decision, and faking activity is dishonest.",
    },
  },
  {
    id: "bug-write-up",
    text: "A write-up of a bug that took 2 days: the cause, the fix, the next check.",
    answer: "thinking",
    why: {
      noise: "An explained failure shows how you reason, and readers can check it.",
    },
  },
  {
    id: "ai-weekend-app",
    text: "A big app an AI built in a weekend. The README says only: built with AI.",
    answer: "noise",
    why: {
      thinking: "It shows a tool ran. Nothing says what you chose or can explain.",
    },
  },
];


export const showsThinkingOrNoise: CustomCanvasSpec = {
  kind: "custom",
  title: "Shows thinking or noise?",
  purpose: "Sort eight pieces of public work into 'shows thinking' (a reader can check how you decide) and 'noise' (more of it, no clearer), with a short reason after each wrong try.",
  limits:
    "The eight cards are made-up examples and the buckets are this course's judgement, not a study. One 2021 survey and one program's own statement say public work gives evidence others can check; no source found says which kinds employers prefer. Real work often sits between the two buckets.",
  component: makeSorterCanvas({
    buckets: THINKING_BUCKETS,
    cards: THINKING_CARDS,
    deckLabel: "Public work",
    prompt: "Does this show how you think?",
    hint: "Tap the bucket this piece of work belongs in, or drag the card onto it.",
    endNote: "If a reader can check a choice, a reason or a failure, it shows thinking. Volume alone does not.",
  }),
};
