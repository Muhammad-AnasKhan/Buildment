import type { CustomCanvasSpec } from "../registry";
import type { PhraseSegment } from "../models/phrase-fixer";
import { makePhraseFixerCanvas } from "../primitives/canvas-factories";
import type { PhraseFixerConfig } from "../primitives/phrase-fixer";

// Course 16 (career-brand), module 6, chapter 6.4 beat 3: Tap the empty phrases.

export const EMPTY_PHRASE_SEGMENTS: PhraseSegment[] = [
  {
    "id": "dynamic",
    "text": "Dynamic, results-driven professional",
    "weak": {
      "why": "Adjectives. Nobody can check them.",
      "fix": "Operations coordinator on an NGO's logistics team"
    }
  },
  {
    "id": "synergies",
    "text": "who leverages cross-functional synergies.",
    "weak": {
      "why": "Which work? There is nothing to check.",
      "fix": "who built a shared tracker: missed confirmations fell from 90 to 18 over three months (team tracker); a daily check also began."
    }
  },
  {
    "id": "responsible",
    "text": "Responsible for coordinating shipments.",
    "weak": {
      "why": "A duty. It says the job, not what changed.",
      "fix": "Source: the team's tracker."
    }
  }
];

export const EMPTY_PHRASES_CONFIG: PhraseFixerConfig = {
  segments: EMPTY_PHRASE_SEGMENTS,
  cardLabel: "Waed's AI-written summary",
  checkableBefore: 0,
  hint: "Tap each phrase you think a reader cannot check.",
  endNote: "Every empty phrase now holds something a reader can ask about: a role, a result with its window, and where the numbers came from.",
};

export const careerM6EmptyPhrases: CustomCanvasSpec = {
  kind: "custom",
  title: "Tap the empty phrases",
  purpose: "Tap the phrases in Waed's AI-written summary and duty line that a reader cannot check; each one says why and offers a checkable fix, and the card becomes the rewrite once all are found.",
  limits: "Which phrases count as empty is a judgment, and a word on its own proves nothing: the same words can be fine in another sentence. Every fix is a fact Waed must be able to back up; an edit pass can remove filler but cannot invent results. Her numbers are illustrative.",
  component: makePhraseFixerCanvas(EMPTY_PHRASES_CONFIG),
};
