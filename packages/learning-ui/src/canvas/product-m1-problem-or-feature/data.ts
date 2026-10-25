import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.2: sort nine lines about Maryam's Halaqa
// (fictional) into what went wrong, a thing to build, and a guess about what
// people would want. Every card comes from the chapter's own cases.

export const PROBLEM_BUCKETS: SortBucket[] = [
  { id: "problem", label: "Problem", sub: "what went wrong" },
  { id: "feature", label: "Feature", sub: "a thing to build" },
  { id: "guess", label: "Guess", sub: "what people would do" },
];

export const PROBLEM_CARDS: SortCard[] = [
  {
    id: "voice",
    text: "Add voice rooms.",
    answer: "feature",
    why: {
      problem: "It names a thing to build. It says nothing about what went wrong.",
      guess: "It is not a belief about people. It is a fix someone already chose.",
    },
  },
  {
    id: "no-group",
    text: "Nobody finds a group before the exam.",
    answer: "problem",
    why: {
      feature: "No thing to build is named. It says what goes wrong.",
      guess: "It says what goes wrong, not what people would want. You still check it.",
    },
  },
  {
    id: "streak-guess",
    text: "Students will study more if they see a streak.",
    answer: "guess",
    why: {
      problem: "Nothing went wrong here. It predicts what students would do.",
      feature: "It predicts what students would do. A feature card only names a thing to build.",
    },
  },
  {
    id: "adel",
    text: "Adel could not tell how to join an online group.",
    answer: "problem",
    why: {
      feature: "No thing to build is named. A person got stuck at a time.",
      guess: "It is not a prediction. It already happened to Adel.",
    },
  },
  {
    id: "leaderboard",
    text: "Add a leaderboard.",
    answer: "feature",
    why: {
      problem: "It names a thing to build, and no one got stuck.",
      guess: "It is a fix someone chose. It is not a belief about people.",
    },
  },
  {
    id: "pay-guess",
    text: "Students would pay for AI summaries of notes.",
    answer: "guess",
    why: {
      problem: "No one had a bad moment. It predicts what students would do.",
      feature: "It predicts a choice students would make. It does not just name a thing to build.",
    },
  },
  {
    id: "rawan",
    text: "Rawan searched for her course and found no group.",
    answer: "problem",
    why: {
      feature: "No thing to build is named. It is what happened to Rawan.",
      guess: "It is not a prediction. Rawan already searched and found nothing.",
    },
  },
  {
    id: "dark",
    text: "Add dark mode.",
    answer: "feature",
    why: {
      problem: "It names a thing to build. It does not say who was stuck.",
      guess: "It is a fix someone chose, not a belief about what people want.",
    },
  },
  {
    id: "rank-guess",
    text: "Everyone wants to see a score for each group.",
    answer: "guess",
    why: {
      problem: "No one is stuck here. It claims what everyone wants.",
      feature: "It claims what everyone wants. It does not just name a thing to build.",
    },
  },
];

export const productM1ProblemOrFeature: CustomCanvasSpec = {
  kind: "custom",
  title: "Problem, feature or guess?",
  purpose: "Sort nine lines about Halaqa into a problem, a feature or a guess, with a short reason after each wrong try.",
  limits:
    "Real requests mix the three: one sentence can name a feature and hide a guess. Halaqa, Adel and Rawan are fictional, and a real problem still needs checking with the people it happened to.",
  component: makeSorterCanvas({
    buckets: PROBLEM_BUCKETS,
    cards: PROBLEM_CARDS,
    deckLabel: "Halaqa line",
    prompt: "Problem, feature or guess?",
    hint: "Tap the bucket this line belongs in, or drag the card onto it.",
    endNote: "A problem says what went wrong. A feature names a thing to build. A guess says what people would do.",
  }),
};
