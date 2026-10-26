import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.4: sort nine sentences about the three made-up
// room apps (A, B and C from the same-task canvas). A critique names what you
// see, a rule and proof. An opinion is a feeling. A guess claims to know why
// the maker did something. A date is a log habit and does not decide the kind:
// two critiques carry a date and one does not, one opinion and one guess carry
// a date, and four sentences carry none.

export const CRITIQUE_BUCKETS: SortBucket[] = [
  { id: "critique", label: "Critique", sub: "see, rule, proof" },
  { id: "opinion", label: "Opinion", sub: "likes and feelings" },
  { id: "guess", label: "Guess", sub: "a maker's reasons" },
];

export const CRITIQUE_CARDS: SortCard[] = [
  {
    id: "placeholders",
    text: "9 Nov: App A has placeholder-only labels. GOV.UK says keep labels visible.",
    answer: "critique",
    why: {
      opinion: "Rule: an opinion is a feeling. This names a screen fact and a written rule.",
      guess: "Rule: a guess claims the maker's reason. This gives a seen fact and a rule.",
    },
  },
  {
    id: "free-hours",
    text: "App B shows free hours first. The task is to pick a time.",
    answer: "critique",
    why: {
      opinion: "It names a seen fact and the task. The date is a log habit, not the kind.",
      guess: "Rule: a guess names the maker's reason. This names what is seen and needed.",
    },
  },
  {
    id: "map-no-times",
    text: "9 Nov: App C shows a map and no times. The task is to pick a time.",
    answer: "critique",
    why: {
      opinion: "Rule: an opinion names no screen fact. This reports one and checks the task.",
      guess: "Rule: a guess names the maker's reason. This says what the screen shows.",
    },
  },
  {
    id: "professional",
    text: "9 Nov: App B just feels more professional.",
    answer: "opinion",
    why: {
      critique: "Rule: a critique names a screen fact and a rule. A date alone is not one.",
      guess: "Rule: a guess claims the maker's reason. This is a feeling about the look.",
    },
  },
  {
    id: "pop",
    text: "Make the Book button pop more.",
    answer: "opinion",
    why: {
      critique: "Rule: a critique names a problem, a rule and proof. 'Pop' names none.",
      guess: "Rule: a guess claims the maker's reason. This is a wish about the look.",
    },
  },
  {
    id: "love-colours",
    text: "I love the colours in App C.",
    answer: "opinion",
    why: {
      critique: "Rule: a critique says what the colours do for the task. This does not.",
      guess: "Rule: a guess claims the maker's reason. This is a feeling about the look.",
    },
  },
  {
    id: "hides-times",
    text: "App C hides the times so people stay longer.",
    answer: "guess",
    why: {
      critique: "Rule: a critique states only what is seen. The maker's aim is not on screen.",
      opinion: "Rule: an opinion is a feeling. This claims to know the maker's reason.",
    },
  },
  {
    id: "owner-data",
    text: "9 Nov: App A asks five questions because the owner wants data.",
    answer: "guess",
    why: {
      critique: "Rule: a critique states only what is seen. The owner's reason is not on screen.",
      opinion: "Rule: an opinion is a feeling. This claims to know the owner's reason.",
    },
  },
  {
    id: "copied-layout",
    text: "App B copied its layout from a famous app.",
    answer: "guess",
    why: {
      critique: "Rule: a critique states only what is seen. Where a layout came from is not.",
      opinion: "Rule: an opinion is a feeling. This claims a fact about the maker.",
    },
  },
];

export const productM4CritiqueOrOpinion: CustomCanvasSpec = {
  kind: "custom",
  title: "Critique, opinion or guess",
  purpose: "Sort nine sentences about three made-up room apps into critique, opinion and guess, with a short rule after each wrong try.",
  limits:
    "Real sentences mix the three: a good critique can also say how the screen feels. The canvas asks what each sentence mainly does. The apps and the dates are made up.",
  component: makeSorterCanvas({
    buckets: CRITIQUE_BUCKETS,
    cards: CRITIQUE_CARDS,
    deckLabel: "A line from a log",
    prompt: "What kind of sentence is this?",
    hint: "Tap the bucket this sentence belongs in, or drag the card onto it.",
    endNote: "A critique names what you see, the rule and the proof. Likes and guesses have none of them. A date does not change the kind.",
  }),
};
