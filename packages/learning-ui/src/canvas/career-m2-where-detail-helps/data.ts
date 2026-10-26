import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 16 (career-brand), module 2, chapter 2.4 (spec beat 2): Where the detail helps or distracts
// Data copied from canvas-specs/career-m2-where-detail-helps.md. Characters and numbers are fictional and illustrative.

export const WHERE_DETAIL_HELPS_BUCKETS: SortBucket[] = [
  { id: "helps", label: "Helps", sub: "the reader gains" },
  { id: "neutral", label: "Neutral", sub: "no harm, no help" },
  { id: "distracts", label: "Distracts", sub: "it hides the proof" },
];

export const WHERE_DETAIL_HELPS_CARDS: SortCard[] = [
  {
    id: "about",
    text: "In her About section, one line near the end",
    answer: "helps",
    why: {
      neutral: "About is where a reader looks for the person.",
      distracts: "About is where a human line belongs.",
    },
  },
  {
    id: "bullet",
    text: "Inside a resume bullet about the report fix",
    answer: "distracts",
    why: {
      helps: "A bullet is for proof. The detail hides it.",
      neutral: "It takes room from the number in the bullet.",
    },
  },
  {
    id: "comment",
    text: "A short example in a comment on a post about averages",
    answer: "helps",
    why: {
      neutral: "It makes her point with a true example.",
      distracts: "It is on topic and adds one thing.",
    },
  },
  {
    id: "ta",
    text: "One friendly line to her former teaching assistant",
    answer: "neutral",
    why: {
      helps: "He knows her. It adds warmth, not new proof.",
      distracts: "It does no harm in a friendly first message.",
    },
  },
  {
    id: "summary",
    text: "In the two-line resume summary",
    answer: "distracts",
    why: {
      helps: "Two lines are for role and proof.",
      neutral: "Those two lines are the most valuable on the page.",
    },
  },
  {
    id: "stranger",
    text: "As the opening of a message to a stranger founder",
    answer: "distracts",
    why: {
      helps: "A stranger needs your ask, not your hobby.",
      neutral: "It uses their first seconds on the wrong thing.",
    },
  },
  {
    id: "featured",
    text: "A photo of the notebook in LinkedIn Featured",
    answer: "neutral",
    why: {
      helps: "Featured is for proof of work.",
      distracts: "It does no harm, but it adds no proof.",
    },
  },
  {
    id: "case-intro",
    text: "In the intro of the slow report case study",
    answer: "distracts",
    why: {
      helps: "The reader came for the report fix.",
      neutral: "It delays the problem and the numbers.",
    },
  },
];

export const careerM2WhereDetailHelps: CustomCanvasSpec = {
  kind: "custom",
  title: "Where the detail helps or distracts",
  purpose: "Sort eight places where Areej could mention her football notebook into 'helps', 'neutral' and 'distracts', with a short reason after each wrong try.",
  limits: "Where a detail helps depends on the reader. These are course judgments, not research. Areej is a fictional fellow and uses the notebook line once on each page, never as a slogan.",
  component: makeSorterCanvas({
    buckets: WHERE_DETAIL_HELPS_BUCKETS,
    cards: WHERE_DETAIL_HELPS_CARDS,
    deckLabel: "Place for the detail",
    prompt: "What does the detail do here?",
    hint: "Tap the bucket this place belongs in, or drag the card onto it.",
    endNote: "A true human detail belongs where a reader looks for the person. Where the reader looks for proof, it gets in the way.",
  }),
};
