import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 10.4: sort eight posts and tricks that a fellow like Alaa
// can meet into three kinds: useful and real, fake activity (bought, traded or
// automated), and invented claims. The rules come from LinkedIn's community
// policies and User Agreement, YouTube's fake engagement policy and GitHub's
// acceptable use rules (dossier C63 to C65); the stars card follows the 2025
// study of suspected fake stars (C66); the small-audience card follows the
// song-market experiment (C60). All people and numbers are fictional.

export const USEFUL_OR_BAIT_BUCKETS: SortBucket[] = [
  { id: "useful", label: "Useful, real", sub: "earns attention" },
  { id: "fake", label: "Fake activity", sub: "bought or traded" },
  { id: "invented", label: "Invented claim", sub: "false numbers" },
];

export const USEFUL_OR_BAIT_CARDS: SortCard[] = [
  {
    id: "bug-fix-post",
    text: "A post that shows one bug you fixed, with the commit link and what surprised you.",
    answer: "useful",
    why: {
      fake: "Nothing here is bought, traded or automated.",
      invented: "Every fact can be checked in the linked commit.",
    },
  },
  {
    id: "like-group",
    text: "Six fellows agree to like and share each other's posts in the first hour.",
    answer: "fake",
    why: {
      useful: "The likes are agreed in advance, so they tell you nothing.",
      invented: "The counts are real. They were arranged by agreement.",
    },
  },
  {
    id: "bought-stars",
    text: "You pay a seller for 300 stars on your repository.",
    answer: "fake",
    why: {
      useful: "A bought star shows no one found the repository useful.",
      invented: "The stars exist, but they were bought, not earned.",
    },
  },
  {
    id: "auto-comment",
    text: "A tool writes 'Great post!' under 100 strangers' posts for you each day.",
    answer: "fake",
    why: {
      useful: "A comment nobody wrote or read helps no one.",
      invented: "Nothing is false. A bot, not a person, is commenting.",
    },
  },
  {
    id: "small-audience",
    text: "A careful write-up of a real week that only nine people read.",
    answer: "useful",
    why: {
      fake: "Nine real readers is a small count, not a fake one.",
      invented: "Nothing is made up. A low count is not a false claim.",
    },
  },
  {
    id: "users-claim",
    text: "A post says 'my app has 2,000 users' when twelve people tried it.",
    answer: "invented",
    why: {
      useful: "A post is only useful if its facts are true.",
      fake: "Nobody bought anything. The number is simply false.",
    },
  },
  {
    id: "used-tool",
    text: "A short screen recording of a tool that a classmate now uses every week.",
    answer: "useful",
    why: {
      fake: "A real person uses it. Nothing is bought or traded.",
      invented: "The classmate can confirm it, so it is not invented.",
    },
  },
  {
    id: "offers-claim",
    text: "A headline says 'ten job offers in a week' when you had none.",
    answer: "invented",
    why: {
      useful: "It gets attention, but a false headline helps no reader.",
      fake: "No likes were bought. The claim itself is false.",
    },
  },
];

export const usefulOrBait: CustomCanvasSpec = {
  kind: "custom",
  title: "Useful, fake or invented?",
  purpose: "Sort eight posts and tricks into useful and real, fake activity, or invented claim, with a short reason after each wrong try.",
  limits:
    "Real cases are less tidy: a post can be useful and also break a rule, and honest posts can stay at a low reach for no clear reason. The cards are fictional examples built from the platform rules in the chapter.",
  component: makeSorterCanvas({
    buckets: USEFUL_OR_BAIT_BUCKETS,
    cards: USEFUL_OR_BAIT_CARDS,
    deckLabel: "Post or trick",
    prompt: "Which bucket does this card go in?",
    hint: "Tap the bucket this card belongs in, or drag the card onto it.",
    endNote: "Real help earns honest attention, even a little. Bought, traded or invented numbers break rules and fade.",
  }),
};
