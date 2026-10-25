import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.3: sort sentences from Wasel's page (a fictional
// print shop) by one test: could a hundred products say this? The facts on the
// "Only Wasel" cards are the shop's canon; the other cards are the kind of
// line an AI tool writes when the prompt leaves gaps.

export const HUNDRED_BUCKETS: SortBucket[] = [
  { id: "anyone", label: "Any product", sub: "a hundred could say it" },
  { id: "only", label: "Only Wasel", sub: "only this shop can" },
];

export const HUNDRED_CARDS: SortCard[] = [
  {
    id: "revolutionize",
    text: "Revolutionize your printing experience.",
    answer: "anyone",
    why: { only: "Swap 'printing' for 'baking' and it still works." },
  },
  {
    id: "bw-price",
    text: "Black and white pages are 0.50 shekels each.",
    answer: "only",
    why: { anyone: "A bakery cannot say this. It is Wasel's own price." },
  },
  {
    id: "seamless",
    text: "Seamless, powerful and effortless.",
    answer: "anyone",
    why: { only: "Any app, shop or gym could use these words." },
  },
  {
    id: "before-noon",
    text: "Send before noon. It is ready by 4 pm.",
    answer: "only",
    why: { anyone: "A time and a condition that only Wasel can promise." },
  },
  {
    id: "quality",
    text: "Quality prints at great prices.",
    answer: "anyone",
    why: { only: "No hype words, yet any print shop could say it." },
  },
  {
    id: "hours",
    text: "Open 8 am to 6 pm, near the university gate.",
    answer: "only",
    why: { anyone: "A place and hours are facts about one shop." },
  },
  {
    id: "trusted",
    text: "Your trusted partner for every printing need.",
    answer: "anyone",
    why: { only: "Any shop can say it. A reader cannot test it." },
  },
  {
    id: "exam-weeks",
    text: "Exam weeks: 30 to 40 orders a day. Send early.",
    answer: "only",
    why: { anyone: "A number only Wasel knows, with advice to use." },
  },
];

export const productM5HundredProducts: CustomCanvasSpec = {
  kind: "custom",
  title: "Could a hundred products say it?",
  purpose: "Sort eight sentences from Wasel's page into 'any product' and 'only Wasel', with a short reason after each wrong try.",
  limits:
    "The test is a rule of thumb, not a measurement. Some sentences sit in between, and a sentence can pass and still be badly written. Wasel and its sentences are fictional.",
  component: makeSorterCanvas({
    buckets: HUNDRED_BUCKETS,
    cards: HUNDRED_CARDS,
    deckLabel: "Wasel sentence",
    prompt: "Could a hundred products say this?",
    hint: "Tap the bucket this sentence belongs in, or drag the card onto it.",
    endNote: "If you can swap the product and the sentence still works, cut it. Keep what only this product can say.",
  }),
};
