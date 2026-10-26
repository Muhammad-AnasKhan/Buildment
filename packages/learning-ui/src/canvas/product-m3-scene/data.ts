import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.1 (set the scene): Bashar opens Halaqa in the
// library on weak data and sees a screen with a title and nothing else. The
// same moment is shown twice: as he saw it, and with one line of words. Halaqa
// and Bashar are fictional.

const BLANK: SpecScreen = {
  alt: "Halaqa's study groups screen with a title and nothing below it.",
  blocks: [{ kind: "nav", title: "Study groups" }, { kind: "space", height: 200 }],
};

const WITH_WORDS: SpecScreen = {
  alt: "The same screen with a spinner, the words Finding groups, and a line saying the connection is slow and groups can take about 12 seconds.",
  blocks: [
    { kind: "nav", title: "Study groups" },
    { kind: "spinner", label: "Finding groups..." },
    { kind: "text", text: "Your connection is slow. Groups can take about 12 seconds to appear.", size: 12.5, tone: "muted" },
    { kind: "space", height: 120 },
  ],
};

export const productM3Scene: CustomCanvasSpec = {
  kind: "custom",
  title: "Bashar's blank screen",
  purpose: "Switch between what Bashar saw on a slow connection in the library and the same moment with one line that says what is happening.",
  limits:
    "A real slow load can have many causes, and one line of words does not make the wait shorter. It only tells the person what is going on. Halaqa and Bashar are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "What Bashar sees",
    versions: [
      { id: "blank", label: "Blank", screen: BLANK, verdict: { text: "Blank. What is happening?", tone: "bad" } },
      { id: "words", label: "With words", screen: WITH_WORDS, verdict: { text: "It says what is happening", tone: "good" } },
    ],
    hint: "Switch between the two screens.",
  }),
};
