import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.3: the same paragraph from a Halaqa group page
// (fictional) at three line heights: 1.0, 1.5 and 2.2 times the text size.

const PARAGRAPH =
  "Bring your notes and past exam questions. We start with linked lists, then move to trees. Each person explains one question to the group. We stop for ten minutes halfway and finish at 10 pm.";

function screen(lineHeight: number, label: string): SpecScreen {
  return {
    alt: `The same paragraph of a study group description with a line height of ${label}.`,
    blocks: [
      { kind: "text", text: "Data structures, exam Thursday", size: 17, weight: 700 },
      { kind: "text", text: PARAGRAPH, size: 15, lineHeight },
    ],
  };
}

export const productM2LineHeight: CustomCanvasSpec = {
  kind: "custom",
  title: "Line height",
  purpose: "Switch between three line heights for the same paragraph and notice how easily your eye finds the start of the next line.",
  limits:
    "One paragraph at one size cannot show every case: the best line height depends on the font and the line length. The verdicts are practice advice, not a measured result. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Line height",
    versions: [
      { id: "tight", label: "Tight", screen: screen(1.0, "1.0"), verdict: { text: "Lines crowd each other", tone: "bad" } },
      { id: "normal", label: "About 1.5", screen: screen(1.5, "1.5"), verdict: { text: "Easy to follow each line", tone: "good" } },
      { id: "loose", label: "Loose", screen: screen(2.2, "2.2"), verdict: { text: "Lines drift apart", tone: "warn" } },
    ],
    hint: "Switch between the three line heights.",
    start: "tight",
  }),
};
