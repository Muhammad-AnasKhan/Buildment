import type { CustomCanvasSpec } from "../registry";
import type { PhraseSegment } from "../models/phrase-fixer";
import { makePhraseFixerCanvas } from "../primitives/canvas-factories";
import type { PhraseFixerConfig } from "../primitives/phrase-fixer";

// Course 16 (career-brand), module 7, chapter 7.3 beat 4: tap the parts of a
// draft comment that add nothing. The question already adds something and
// stays. The fixes use Areej's own work (the index bullet: p95 from 4.6 s to
// 0.41 s, 14 days before and after). LinkedIn
// suggests building reputation by reacting and commenting and asks members
// to respond authentically (checked 2026-10).

export const COMMENT_SEGMENTS: PhraseSegment[] = [
  {
    id: "great",
    text: "Great post! Thanks for sharing.",
    weak: {
      why: "Adds nothing. Anyone could write it.",
      fix: "On the index point: a composite index cut a report's p95 from 4.6 s to 0.41 s for me (14 days before and after).",
    },
  },
  { id: "question", text: "Did you test on data of the same size?", fineWhy: "A question that shows you read the post." },
  {
    id: "pitch",
    text: "Check out my services!",
    weak: { why: "A pitch, not a contribution.", fix: "Happy to share the query plan if useful." },
  },
];

export const COMMENT_EDIT_CONFIG: PhraseFixerConfig = {
  segments: COMMENT_SEGMENTS,
  cardLabel: "A draft comment",
  checkableBefore: 0,
  hint: "Tap each part that adds nothing for the author or the readers.",
  endNote:
    "Now the comment adds a small true example, keeps a question that shows she read the post, and offers help instead of a pitch.",
};

export const careerM7CommentEdit: CustomCanvasSpec = {
  kind: "custom",
  title: "A comment that adds one thing",
  purpose:
    "Tap the parts of a draft comment that add nothing: a generic thanks and a pitch. Each says why and gives what Areej would write. The card then becomes her comment.",
  limits:
    "This is a course method with LinkedIn's own advice behind it, not a promise of replies. A comment must be written by you; never use a tool that comments for you, which the rules forbid. Checked 2026-10.",
  component: makePhraseFixerCanvas(COMMENT_EDIT_CONFIG),
};
