import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.6: Wasel's landing page as Karam's AI tool built it
// (a fictional print and copy shop), and the same page squinted. The page is
// drawn with the sizes and colours in the chapter's table: a glow block with
// a pill, a 26 bold headline, a line at 14 and a button at 13; three equal
// cards at 14 bold in #333333; and, last, the prices, the 4 pm promise and
// the opening hours at 11 in #999999 (2.85 to 1 on white). The page is on
// "paper" (white in both themes) so the literal grey keeps its true ratio.

const PAGE: SpecScreen = {
  alt: "Wasel's landing page as built. A purple glow block holds an AI-powered pill, the headline Revolutionize your printing experience, a line about seamless and powerful, and a glowing Get started button. Three equal cards say Fast, Secure and Smart. At the bottom, in small pale grey text, are the prices, the 4 pm promise and the opening hours.",
  background: "paper",
  gap: 8,
  blocks: [
    {
      kind: "box",
      fill: "glow",
      radius: 14,
      pad: 16,
      gap: 8,
      children: [
        { kind: "pill", text: "AI-powered", tone: "accent" },
        { kind: "text", text: "Revolutionize your printing experience", size: 26, weight: 700, tone: "onGlow" },
        { kind: "text", text: "Seamless, powerful and effortless.", size: 14, tone: "onGlow" },
        { kind: "button", label: "Get started", variant: "glow", size: 13 },
      ],
    },
    {
      kind: "row",
      gap: 8,
      children: [
        { kind: "box", fill: "none", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "bolt", tile: true, size: 14 }, { kind: "text", text: "Fast", size: 14, weight: 700, color: "#333333" }] },
        { kind: "box", fill: "none", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "shield", tile: true, size: 14 }, { kind: "text", text: "Secure", size: 14, weight: 700, color: "#333333" }] },
        { kind: "box", fill: "none", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "spark", tile: true, size: 14 }, { kind: "text", text: "Smart", size: 14, weight: 700, color: "#333333" }] },
      ],
    },
    {
      kind: "text",
      text: "Black and white 0.50 shekels a page, colour 2 shekels, binding 5 shekels. Orders sent before noon are ready by 4 pm. Open 8 am to 6 pm.",
      size: 11,
      lineHeight: 1.1,
      color: "#999999",
    },
  ],
};

export const productM2WaselBefore: CustomCanvasSpec = {
  kind: "custom",
  title: "Wasel's landing page, before",
  purpose: "Switch between Wasel's landing page as it was built and the same page squinted, and see what comes first and what the squint hides.",
  limits:
    "A blur shows size, weight and contrast, not meaning. The colours of the glow and the pill come from the reader's theme, so the chapter's table, not the picture, is the source for those ratios. Wasel is a fictional shop.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    versions: [
      { id: "built", label: "As built", screen: PAGE, verdict: { text: "The glow first, facts last", tone: "bad" } },
      { id: "squint", label: "Squint", screen: PAGE, blur: true, verdict: { text: "The facts do not survive", tone: "bad" } },
    ],
    hint: "Switch between the page and its squint.",
    start: "built",
  }),
};
