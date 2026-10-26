import type { CustomCanvasSpec } from "../registry";
import type { PhraseSegment } from "../models/phrase-fixer";
import { makePhraseFixerCanvas } from "../primitives/canvas-factories";
import type { PhraseFixerConfig } from "../primitives/phrase-fixer";

// Course 16 (career-brand), module 9, chapter 9.2 beat 2: tap the three phrases in part of an early
// draft of Areej's answer that the interviewer flagged (vague ownership, unsupported number, jargon).
// Each says why and gives a fix that uses only a fact already in her ledger or case study.
// Areej is a fictional fellow.

export const TAP_THE_FLAG_SEGMENTS: PhraseSegment[] = [
  {
    id: "we",
    text: "We deployed it",
    weak: { why: "Vague ownership. Who did which part?", fix: "my lead deployed it after my migration passed review" },
  },
  {
    id: "ninety",
    text: "and it got about 90 percent faster,",
    weak: { why: "Unsupported number. No window or source.", fix: "and the report p95 (95 of 100 requests finish within it) fell from 4.6 s to 0.41 s (14 days, team dashboard)," },
  },
  {
    id: "jargon",
    text: "using a composite index.",
    weak: { why: "Jargon, with no explanation yet.", fix: "using a composite index (explained in my case study)." },
  },
];

export const TAP_THE_FLAG_CONFIG: PhraseFixerConfig = {
  segments: TAP_THE_FLAG_SEGMENTS,
  cardLabel: "Part of Areej's answer",
  checkableBefore: 0,
  hint: "Tap each phrase the interviewer flagged.",
  endNote: "Each flag pointed at her own words and had a fix: her part named, the number sourced, the term explained.",
};

export const careerM9TapTheFlag: CustomCanvasSpec = {
  kind: "custom",
  title: "Tap a flag, see your words",
  purpose: "Tap the three phrases in part of Areej's answer that the interviewer flagged: vague ownership, an unsupported number and jargon. Each says why and gives the fix. The card then becomes her corrected answer.",
  limits:
    "A feedback tool can be wrong, and the platform keeps a flag only when its quote really appears in your answers. The five flags from gate 1.6 are vague ownership, unsupported number, pseudo-story, invented reason risk and jargon without explanation; this card shows three.",
  component: makePhraseFixerCanvas(TAP_THE_FLAG_CONFIG),
};
