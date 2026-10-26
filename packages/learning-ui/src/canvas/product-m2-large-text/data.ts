import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.5: one grey, #858585, on a white page (3.69 to 1,
// from contrastRatio() in models/ui-specimen.ts), used for the same sentence
// at three sizes. At 14 regular it is normal text and needs 4.5 to 1, so it
// fails. At 24 regular it is large text, and at 19 bold it is large text too
// (18 point, or 14 point bold), and both need only 3 to 1, so they pass.
// The page uses background "paper" and literal colours so the ratio is true
// in both themes.

function screen(size: number, weight: 400 | 700, alt: string): SpecScreen {
  return {
    alt,
    background: "paper",
    blocks: [
      { kind: "text", text: "Court hours", size: 15, weight: 700, color: "#111111" },
      { kind: "text", text: "Open Thursday and Friday until 6 pm", size, weight, color: "#858585" },
    ],
  };
}

export const productM2LargeText: CustomCanvasSpec = {
  kind: "custom",
  title: "The same grey at three sizes",
  purpose: "Switch between one grey sentence at three sizes and see that the bar depends on the size: 4.5 to 1 for normal text, 3 to 1 for large text.",
  limits:
    "The sizes are drawn units, close to CSS pixels, so the large-text line is approximate. Large text means at least 18 point, about 24 CSS pixels, or 14 point bold, about 18.7 pixels. The page is white and the grey is exact. Passing a ratio does not make a design good.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Text size",
    versions: [
      { id: "small", label: "14 plain", screen: screen(14, 400, "A white card with the heading Court hours and the sentence Open Thursday and Friday until 6 pm in grey #858585, size 14, regular."), verdict: { text: "3.69:1 needs 4.5: fails", tone: "bad" } },
      { id: "large", label: "24 plain", screen: screen(24, 400, "The same sentence in the same grey, size 24, regular. It counts as large text."), verdict: { text: "3.69:1 needs 3: passes", tone: "good" } },
      { id: "bold", label: "19 bold", screen: screen(19, 700, "The same sentence in the same grey, size 19, bold. It counts as large bold text."), verdict: { text: "Large and bold: passes 3", tone: "good" } },
    ],
    hint: "Switch between the three sizes of the same grey.",
    start: "small",
  }),
};
