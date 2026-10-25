import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.3: the same Halaqa group card (fictional) at its
// normal text size and with the reader's text set to 200 percent. The words
// wrap onto more lines and the page grows taller, but nothing is lost and the
// Join button is still there.

function screen(scale: number, alt: string): SpecScreen {
  return {
    alt,
    blocks: [
      { kind: "text", text: "Statistics 101", size: 20 * scale, weight: 700 },
      { kind: "text", text: "Tomorrow 5 pm", size: 16 * scale, tone: "muted" },
      { kind: "button", label: "Join", full: true, size: 16 * scale },
    ],
  };
}

export const productM2TextZoom: CustomCanvasSpec = {
  kind: "custom",
  title: "Text at 200 percent",
  purpose: "Switch between a group card at its normal text size and the same card with the reader's text set to 200 percent, and check that nothing is lost.",
  limits:
    "A card with three lines is the easy case. A real page needs a check at 200 percent on a real phone, with menus and forms. The drawn units are not pixels. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Text size",
    versions: [
      { id: "normal", label: "100%", screen: screen(1, "A group card with the title at 20, the time at 16 and a Join button."), verdict: { text: "The card as designed", tone: "accent" } },
      { id: "zoom", label: "200%", screen: screen(2, "The same card with every text size doubled. The title wraps onto two lines. The time and the Join button are still there."), verdict: { text: "Bigger, and nothing is lost", tone: "good" } },
    ],
    hint: "Switch between the two sizes.",
    start: "normal",
  }),
};
