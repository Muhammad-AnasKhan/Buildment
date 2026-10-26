import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.3: sort sentences from Wasel's page (a fictional
// print shop) by one rule: swap the product, and see whether the sentence
// still works. The surface cues conflict on purpose: three "any product" cards
// have no hype words, two of them carry digits, and three "only Wasel" cards
// have no digits. The facts on the "Only Wasel" cards are the shop's canon.

export const HUNDRED_BUCKETS: SortBucket[] = [
  { id: "anyone", label: "Any product", sub: "a hundred could say it" },
  { id: "only", label: "Only Wasel", sub: "only this shop can" },
];

export const HUNDRED_CARDS: SortCard[] = [
  {
    id: "revolutionize",
    text: "Revolutionize your printing experience.",
    answer: "anyone",
    why: { only: "Swap 'printing' for 'baking' and it still reads true. Nothing in it can be checked." },
  },
  {
    id: "bw-price",
    text: "Black and white pages are 0.50 shekels each.",
    answer: "only",
    why: { anyone: "A bakery cannot say this. It is Wasel's own price, and a student can check it." },
  },
  {
    id: "save-half",
    text: "Save up to 50% on every order.",
    answer: "anyone",
    why: { only: "It has a number but no price, no base and no condition. Any shop could print it, and nobody can check it." },
  },
  {
    id: "before-noon",
    text: "Send before noon and collect it the same afternoon.",
    answer: "only",
    why: { anyone: "No digit appears, yet it holds a time and a condition that only Wasel keeps." },
  },
  {
    id: "seamless",
    text: "Seamless, powerful and effortless.",
    answer: "anyone",
    why: { only: "Swap the product and it still works. A reader learns nothing." },
  },
  {
    id: "gate",
    text: "Collect it by the university gate on your way to class.",
    answer: "only",
    why: { anyone: "A place and a use that belong to one shop. A plain sentence can pass." },
  },
  {
    id: "five-stars",
    text: "5 stars from our happy customers.",
    answer: "anyone",
    why: { only: "A digit does not make it specific. There is no count, no source and no customer to check." },
  },
  {
    id: "quality",
    text: "Quality prints at great prices.",
    answer: "anyone",
    why: { only: "No hype words, yet any print shop could say it. It holds no price." },
  },
  {
    id: "exam-weeks",
    text: "Busy in exam weeks, so send your file early.",
    answer: "only",
    why: { anyone: "A fact about Wasel's own year, with advice that follows from it." },
  },
];

export const productM5HundredProducts: CustomCanvasSpec = {
  kind: "custom",
  title: "Could a hundred products say it?",
  purpose: "Sort nine sentences for Wasel's page into 'any product' and 'only Wasel'. Swap the product: if the sentence still works, a hundred products could say it.",
  limits:
    "The test is a rule from practice, not a measurement. Some sentences sit in between, and a sentence can pass and still be badly written. Digits do not decide the bucket. Wasel and its sentences are fictional.",
  component: makeSorterCanvas({
    buckets: HUNDRED_BUCKETS,
    cards: HUNDRED_CARDS,
    deckLabel: "Wasel sentence",
    prompt: "Could a hundred products say this?",
    hint: "Tap the bucket this sentence belongs in, or drag the card onto it.",
    endNote: "Swap the product. If the sentence still works, cut it. Keep what only this product can say, with or without a digit.",
  }),
};
