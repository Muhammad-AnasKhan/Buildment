import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.2: sort nine lines about Maryam's Halaqa
// (fictional) into what went wrong, a thing to build, and a guess about what
// people would do. The rule for each bucket is stated in every reason, and
// four cards are written so that the first word points to the wrong bucket.

export const PROBLEM_BUCKETS: SortBucket[] = [
  { id: "problem", label: "Problem", sub: "it happened to someone" },
  { id: "feature", label: "Feature", sub: "a thing to build" },
  { id: "guess", label: "Guess", sub: "what people would do" },
];

export const PROBLEM_CARDS: SortCard[] = [
  {
    id: "voice",
    text: "Add voice rooms.",
    answer: "feature",
    why: {
      problem: "A problem already happened to a person. This names a thing to build and shows nobody stuck.",
      guess: "A guess says what people would do. This is a fix someone already chose.",
    },
  },
  {
    id: "four-of-five",
    text: "4 of 5 classmates Maryam asked found no group in time.",
    answer: "problem",
    why: {
      feature: "A feature names a thing to build. This says what happened to people, and Maryam asked them.",
      guess: "A guess says what people would do. This already happened, and it was checked with 5 people.",
    },
  },
  {
    id: "no-streaks",
    text: "Halaqa has no streaks yet.",
    answer: "feature",
    why: {
      problem: "It sounds like a fault, but nobody is stuck. A problem happened to a person at a time.",
      guess: "A guess says what people would do. This names a thing the app lacks, which is a feature.",
    },
  },
  {
    id: "adel-said",
    text: "Adel said he would use polls every day.",
    answer: "guess",
    why: {
      problem: "A problem already happened. This says what Adel would do later, and a yes costs nothing.",
      feature: "A feature names a thing to build. This predicts what a person would do with it.",
    },
  },
  {
    id: "rawan-add",
    text: "Rawan tried to add her course and found no group.",
    answer: "problem",
    why: {
      feature: "It has the word add, but it tells what happened to Rawan. A feature only names a thing to build.",
      guess: "A guess says what people would do. This already happened to Rawan.",
    },
  },
  {
    id: "pay-guess",
    text: "Students would pay for AI summaries of notes.",
    answer: "guess",
    why: {
      problem: "A problem already happened. Nobody had a bad moment here, and this says what students would do.",
      feature: "A feature names a thing to build. This predicts a choice students would make.",
    },
  },
  {
    id: "adel",
    text: "Adel could not tell how to join an online group.",
    answer: "problem",
    why: {
      feature: "A feature names a thing to build. This is a person stuck at a time, and no fix is chosen.",
      guess: "A guess says what people would do. This is not a prediction: it already happened to Adel.",
    },
  },
  {
    id: "dark",
    text: "Add dark mode.",
    answer: "feature",
    why: {
      problem: "A problem already happened to a person. This names a thing to build and does not say who was stuck.",
      guess: "A guess says what people would do. This is a fix someone chose.",
    },
  },
  {
    id: "rank-guess",
    text: "Everyone wants to see a score for each group.",
    answer: "guess",
    why: {
      problem: "A problem already happened to someone. This claims what everyone wants, and nobody was asked.",
      feature: "A feature names a thing to build. This claims what people want, which is a guess.",
    },
  },
];

export const productM1ProblemOrFeature: CustomCanvasSpec = {
  kind: "custom",
  title: "Problem, feature or guess?",
  purpose: "Sort nine lines about Halaqa into a problem, a feature or a guess, with the rule for the bucket in the reason after each wrong try.",
  limits:
    "Real requests mix the three: one sentence can name a feature and hide a guess. Halaqa, Adel and Rawan are fictional, and a real problem still needs checking with the people it happened to.",
  component: makeSorterCanvas({
    buckets: PROBLEM_BUCKETS,
    cards: PROBLEM_CARDS,
    deckLabel: "Halaqa line",
    prompt: "Problem, feature or guess?",
    hint: "Tap the bucket this line belongs in, or drag the card onto it.",
    endNote: "A problem already happened to a person. A feature names a thing to build. A guess says what people would do.",
  }),
};
