import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.3: the same Halaqa group card (fictional) at its
// normal text size, with the reader's text set to 200 percent and the card
// allowed to grow, and with the text at 200 percent in a header that has a
// fixed height. In the second the words wrap and the page grows taller, but
// nothing is lost. In the third the Join button is cut off.

function card(scale: number, alt: string): SpecScreen {
  return {
    alt,
    blocks: [
      { kind: "text", text: "Statistics 101 revision", size: 20 * scale, weight: 700 },
      { kind: "text", text: "Tomorrow 5 pm, online", size: 16 * scale, tone: "muted" },
      { kind: "button", label: "Join", full: true, size: 16 * scale },
    ],
  };
}

const CUT: SpecScreen = {
  alt: "The same card at 200 percent, but the header has a fixed height. The title and the time fill the header, and the Join button is cut off, so a reader cannot use it.",
  blocks: [
    { kind: "box", fill: "none", border: true, pad: 8, gap: 8, children: [
      { kind: "text", text: "Statistics 101 revision", size: 40, weight: 700 },
      { kind: "text", text: "Tomorrow 5 pm, online", size: 32, tone: "muted" },
    ] },
    { kind: "image", art: "blank", height: 28, caption: "The Join button is cut off here" },
  ],
};

export const productM2TextZoom: CustomCanvasSpec = {
  kind: "custom",
  title: "Text at 200 percent",
  purpose: "Switch between a group card at its normal size and at 200 percent, with and without a fixed height, and check that nothing is lost.",
  limits:
    "A card with three lines is the easy case. A real page needs a check at 200 percent on a real phone, with menus and forms. The drawn units are not pixels. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Text size",
    versions: [
      { id: "normal", label: "100%", screen: card(1, "A group card with the title at 20, the time at 16 and a Join button."), verdict: { text: "The card as designed", tone: "accent" } },
      { id: "zoom", label: "200% grows", screen: card(2, "The same card with every text size doubled. The title wraps onto more lines. The time and the Join button are still there."), verdict: { text: "Bigger, and nothing is lost", tone: "good" } },
      { id: "cut", label: "200% cut", screen: CUT, verdict: { text: "Join is cut off: it fails", tone: "bad" } },
    ],
    hint: "Switch between the three versions of the card.",
    start: "normal",
  }),
};
