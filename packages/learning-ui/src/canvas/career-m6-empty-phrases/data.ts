import type { CustomCanvasSpec } from "../registry";
import type { PhraseSegment } from "../models/phrase-fixer";
import { makePhraseFixerCanvas } from "../primitives/canvas-factories";
import type { PhraseFixerConfig } from "../primitives/phrase-fixer";

// Course 16 (career-brand), module 6, chapter 6.4 beat 3: tap the empty
// phrases in Waed's AI-written resume summary. Each weak phrase says why it
// is empty and gives a checkable replacement; the rewrite is what is left
// when every empty phrase has one. Waed and the shop are fictional.

export const EMPTY_PHRASE_SEGMENTS: PhraseSegment[] = [
  {
    id: "results-driven",
    text: "Results-driven and passionate operations professional",
    weak: { why: "Says nothing a reader can check.", fix: "Operations coordinator for a five-person online shop" },
  },
  {
    id: "track-record",
    text: "with a proven track record of",
    weak: { why: "No record is shown.", fix: "for 2 years." },
  },
  {
    id: "driving-efficiency",
    text: "driving efficiency",
    weak: { why: "Which work, and how much?", fix: "Cut order packing time from 3 hours to 2 hours a day, from the shop's order sheet," },
  },
  {
    id: "and",
    text: "and",
    fineWhy: "A joining word. It is not what makes this empty.",
  },
  {
    id: "exceptional-outcomes",
    text: "delivering exceptional outcomes in fast-paced environments.",
    weak: { why: "An empty phrase: no outcome is named.", fix: "wrote the returns checklist the team still uses." },
  },
];

export const EMPTY_PHRASES_CONFIG: PhraseFixerConfig = {
  segments: EMPTY_PHRASE_SEGMENTS,
  cardLabel: "Resume summary",
  checkableBefore: 0,
  hint: "Tap each phrase you think a reader cannot check.",
  endNote: "Every empty phrase now holds a fact a reader can ask about: a role, a time, a number with its source, and a thing the team still uses.",
};

export const careerM6EmptyPhrases: CustomCanvasSpec = {
  kind: "custom",
  title: "Tap the empty phrases",
  purpose: "Tap the phrases in Waed's AI-written summary that a reader cannot check; each one says why and offers a checkable fix, and the card becomes the rewrite once all are found.",
  limits:
    "Which phrases count as empty is a judgment, and a word on its own proves nothing: the same words can be fine in another sentence. Every fix here is a fact Waed must be able to back up; an edit pass can remove filler but cannot invent results. Waed and the shop are fictional.",
  component: makePhraseFixerCanvas(EMPTY_PHRASES_CONFIG),
};
