import type { CustomCanvasSpec } from "../registry";
import type { PhraseSegment } from "../models/phrase-fixer";
import { makePhraseFixerCanvas } from "../primitives/canvas-factories";
import type { PhraseFixerConfig } from "../primitives/phrase-fixer";

// Course 16 (career-brand), module 3, chapter 3.5 beat 1: Control the test, not the calendar.
// "Last month versus this month" has other changes hidden inside it. A test you control keeps the script, the data and the machine the same and changes one thing.
// Phrase fixer. Areej is a fictional fellow; the weak plan is made up.

export const FAIR_TEST_SEGMENTS: PhraseSegment[] = [
  {
    "id": "claim",
    "text": "My cache made the events list faster:",
    "fineWhy": "A clear claim. The test must now back it."
  },
  {
    "id": "months",
    "text": "I compared last month with this month,",
    "weak": {
      "why": "Other things changed between the months.",
      "fix": "I used the same script, data and laptop before and after,"
    }
  },
  {
    "id": "once",
    "text": "ran it once on whatever laptop I had,",
    "weak": {
      "why": "One run on a changing machine proves little.",
      "fix": "ran 50 requests per second for 2 minutes,"
    }
  },
  {
    "id": "felt",
    "text": "and it felt quick.",
    "weak": {
      "why": "A feeling is not a measurement.",
      "fix": "and p95 fell from 820 ms to 95 ms."
    }
  }
];

export const FAIR_TEST_CONFIG: PhraseFixerConfig = {
  segments: FAIR_TEST_SEGMENTS,
  cardLabel: "A weak test plan",
  checkableBefore: 0,
  hint: "Tap each part of the plan that a reader cannot trust.",
  endNote: "Now only the cache changed. Same script, same data, same laptop, a stated load, and a number a reader can check.",
};

export const careerM3FairTestClaim: CustomCanvasSpec = {
  kind: "custom",
  title: "Control the test, not the calendar",
  purpose: "Tap the weak parts of a test plan that compares two months. Each one says why it is weak and gives what Areej actually did. The card then becomes her controlled plan.",
  limits: "The weak plan is made up to show common mistakes. Areej's test ran on a laptop, not production, and her cache can serve a list up to 30 seconds old. Areej and her numbers are fictional and illustrative.",
  component: makePhraseFixerCanvas(FAIR_TEST_CONFIG),
};
