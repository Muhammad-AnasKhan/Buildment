import type { CustomCanvasSpec } from "../registry";
import type { PhraseSegment } from "../models/phrase-fixer";
import { makePhraseFixerCanvas } from "../primitives/canvas-factories";
import type { PhraseFixerConfig } from "../primitives/phrase-fixer";

// Course 16 (career-brand), module 4, chapter 4.4 beat 2: tap the weak parts of an over-large plan sentence; each fix is Areej's choice from the canon.
// Fictional people; the picture is a story, not data.

export const SCOPE_SEGMENTS: PhraseSegment[] = [
  { id: "build", text: "I will build", fineWhy: "A plain start. What follows must fit." },
  {
    id: "scope",
    text: "a full stock system for many shops with a mobile app",
    weak: {
      why: "Far too much for 30 hours.",
      fix: "one flow for one shop (record a sale, stock goes down, a warning appears)",
    },
  },
  {
    id: "time",
    text: "in my spare time,",
    weak: { why: "How much time? Set the box first.", fix: "in 6 weeks at about 5 hours a week (30 hours)," },
  },
  {
    id: "better",
    text: "and it will make the shop much better.",
    weak: {
      why: "Better how? Nothing to measure.",
      fix: "and I will count stockouts per month against the 5 in August and September.",
    },
  },
];

export const SCOPE_SENTENCE_CONFIG: PhraseFixerConfig = {
  segments: SCOPE_SEGMENTS,
  cardLabel: "A project plan sentence",
  checkableBefore: 0,
  hint: "Tap each part that does not fit a time box or cannot be checked.",
  endNote: "Now the plan names one flow, one time box and one number. Features that do not fit the box are out of scope, not forgotten.",
};

export const careerM4ScopeSentence: CustomCanvasSpec = {
  kind: "custom",
  title: "Set the appetite, watch scope fall",
  purpose: "Tap the weak parts of an over-large project plan. Each says why it does not fit 30 hours and gives what Areej chose: one flow for one shop, a stated time box, and a number to move.",
  limits: "The plan is illustrative. The baseline of 5 stockouts comes from the owner's notebook and the plan only promises to count, not to improve. A real plan needs more than one sentence.",
  component: makePhraseFixerCanvas(SCOPE_SENTENCE_CONFIG),
};
