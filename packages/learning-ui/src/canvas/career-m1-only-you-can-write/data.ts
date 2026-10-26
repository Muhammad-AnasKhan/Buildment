import type { CustomCanvasSpec } from "../registry";
import type { PhraseSegment } from "../models/phrase-fixer";
import { makePhraseFixerCanvas } from "../primitives/canvas-factories";
import type { PhraseFixerConfig } from "../primitives/phrase-fixer";

// Course 16 (career-brand), module 1, chapter 1.4 beat 5: tap the empty
// phrases in Areej's AI-written opening. Each weak phrase says why it is empty
// and gives a fix only she could write; the rewrite is what is left when every
// empty phrase has one. The opening is from her old resume (canon). Every fix
// uses her canon facts only. Areej and her numbers are fictional and
// illustrative.

export const ONLY_YOU_SEGMENTS: PhraseSegment[] = [
  {
    id: "adjectives",
    text: "Highly motivated and passionate",
    weak: { why: "Adjectives. Nobody can check them.", fix: "Final-year software engineering student and" },
  },
  {
    id: "title",
    text: "full-stack developer",
    fineWhy: "A plain job title. A reader knows what it means.",
  },
  {
    id: "leverage",
    text: "seeking to leverage cutting-edge technologies",
    weak: { why: "Which technologies? Seeking is not showing.", fix: "who cut a daily report's p95 from 4.6 s to 0.41 s (14 days before and after)." },
  },
  {
    id: "dynamic",
    text: "in a dynamic environment.",
    weak: { why: "Every workplace says this. No fact in it.", fix: "I measure before and after, and write it down." },
  },
];

export const ONLY_YOU_CONFIG: PhraseFixerConfig = {
  segments: ONLY_YOU_SEGMENTS,
  cardLabel: "Areej's old opening",
  checkableBefore: 0,
  hint: "Tap each phrase you think a reader cannot check.",
  endNote: "Now each phrase holds something a reader can ask about: a degree, a result with its window, a habit. Only Areej could write it.",
};

export const careerM1OnlyYouCanWrite: CustomCanvasSpec = {
  kind: "custom",
  title: "Only you can write this",
  purpose: "Tap the phrases in Areej's AI-written opening that a reader cannot check. Each one says why and gives a fix only she could write. The card then becomes the rewrite.",
  limits:
    "Which phrases count as empty is a judgment, and one word proves nothing: the same words can be fine in another sentence. Every fix is a fact Areej can back up; an edit pass can remove filler but cannot invent results. Areej and her numbers are fictional and illustrative.",
  component: makePhraseFixerCanvas(ONLY_YOU_CONFIG),
};
