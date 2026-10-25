import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.4: sort nine sentences from a critique log about
// the three made-up room apps (A, B and C from the same-task canvas). A
// critique names what you see, a rule and proof. An opinion is a feeling. A
// guess claims to know why the maker did something.

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
      opinion: "It names what is on the screen, a rule and the maker's own words.",
      guess: "It does not guess a reason. It gives a dated fact and a written rule.",
    },
  },
  {
    id: "professional",
    text: "App B just feels more professional.",
    answer: "opinion",
    why: {
      critique: "It names nothing on the screen, no rule and no proof.",
      guess: "It says nothing about why the maker did anything. It is a feeling.",
    },
  },
  {
    id: "hides-times",
    text: "App C hides the times so people stay longer.",
    answer: "guess",
    why: {
      critique: "No one can see the maker's aim on the screen. It is a story, not a fact.",
      opinion: "It is not a feeling about the look. It claims to know the maker's reason.",
    },
  },
  {
    id: "free-hours",
    text: "9 Nov: App B shows free hours first. The task is to pick a time.",
    answer: "critique",
    why: {
      opinion: "It points at something on the screen and ties it to the task.",
      guess: "It says what is seen and what the task needs, not the maker's reason.",
    },
  },
  {
    id: "pop",
    text: "Make the Book button pop more.",
    answer: "opinion",
    why: {
      critique: "'Pop' names no problem, rule or proof. Say what the button does badly.",
      guess: "It is a wish about the look, not a claim about the maker's reasons.",
    },
  },
  {
    id: "owner-data",
    text: "App A asks five questions because the owner wants data.",
    answer: "guess",
    why: {
      critique: "'Five fields' can be seen. 'Because the owner wants data' cannot.",
      opinion: "It claims to know the owner's reason. That is a guess, not a taste.",
    },
  },
  {
    id: "map-no-times",
    text: "9 Nov: App C shows a map and no times. The task is to pick a time.",
    answer: "critique",
    why: {
      opinion: "It reports what is on the screen and checks it against the task.",
      guess: "It does not say why the maker did it. It says what the screen shows.",
    },
  },
  {
    id: "love-colours",
    text: "I love the colours in App C.",
    answer: "opinion",
    why: {
      critique: "It does not say what the colours do for the task.",
      guess: "It is a feeling about the look, not a claim about the maker's reasons.",
    },
  },
  {
    id: "copied-layout",
    text: "App B copied its layout from a famous app.",
    answer: "guess",
    why: {
      critique: "Nobody can see that on the screen. It is a story about where it came from.",
      opinion: "It claims a fact about the maker, not a feeling about the look.",
    },
  },
];

export const productM4CritiqueOrOpinion: CustomCanvasSpec = {
  kind: "custom",
  title: "Critique, opinion or guess",
  purpose: "Sort nine sentences about three made-up room apps into critique, opinion and guess, with a short reason after each wrong try.",
  limits:
    "Real sentences mix the three: a good critique can also say how the screen feels. The canvas asks what each sentence mainly does. The apps and the dates are made up.",
  component: makeSorterCanvas({
    buckets: CRITIQUE_BUCKETS,
    cards: CRITIQUE_CARDS,
    deckLabel: "A line from a log",
    prompt: "What kind of sentence is this?",
    hint: "Tap the bucket this sentence belongs in, or drag the card onto it.",
    endNote: "A critique names what you see, the rule and the proof. Likes and guesses have none of them.",
  }),
};
