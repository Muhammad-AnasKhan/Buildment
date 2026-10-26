import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.2: swapping one default for another is not a
// choice. Wasel's top section (a fictional print shop) three ways: the purple
// glow as built; the glow replaced by a quiet page with a serif font and the
// same words; and a version where every part has a reason for this shop.

const GLOW: SpecScreen = {
  alt: "Wasel's top section as built: a purple glow, an AI badge, the headline Revolutionize your printing experience and a Get started button.",
  background: "card",
  blocks: [
    {
      kind: "box",
      fill: "glow",
      radius: 14,
      pad: 16,
      gap: 10,
      children: [
        { kind: "pill", text: "AI-powered", tone: "accent" },
        { kind: "text", text: "Revolutionize your printing experience", size: 21, weight: 800, tone: "onGlow" },
        { kind: "text", text: "Seamless, powerful and effortless.", size: 13, tone: "onGlow" },
        { kind: "button", label: "Get started", variant: "glow" },
      ],
    },
  ],
};

const SWAP: SpecScreen = {
  alt: "The glow is gone. A quiet page with a serif headline still reads Revolutionize your printing experience, with the same subline and a Get started button.",
  background: "muted",
  blocks: [
    { kind: "text", text: "Revolutionize your printing experience", size: 22, weight: 700, font: "serif" },
    { kind: "text", text: "Seamless, powerful and effortless.", size: 13, font: "serif" },
    { kind: "button", label: "Get started", variant: "secondary" },
  ],
};

const CHOSEN: SpecScreen = {
  alt: "Every part has a reason for this shop: the shop's name, a headline that says what happens and by when, and an Upload a file button.",
  background: "card",
  blocks: [
    { kind: "text", text: "WASEL PRINT AND COPY", size: 11, weight: 700, tone: "muted" },
    { kind: "text", text: "Send your file before noon. Pick it up printed by 4 pm.", size: 22, weight: 700, font: "serif" },
    { kind: "button", label: "Upload a file", full: true },
  ],
};

export const productM5SwapADefault: CustomCanvasSpec = {
  kind: "custom",
  title: "Swapping a default is not a choice",
  purpose: "Compare Wasel's top section as built, the same words on a quiet serif page, and a version where every part has a reason for this shop.",
  limits:
    "The middle page is a drawing of one possible swap. A quiet page with a serif font can be a good choice when someone can say why it suits the shop. Here nobody did, and the words did not change. Wasel is a fictional shop.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    hint: "Switch between the three versions and read the headline each time.",
    versions: [
      { id: "glow", label: "Glow", screen: GLOW, verdict: { text: "A default nobody chose", tone: "bad" } },
      { id: "swap", label: "Swapped", screen: SWAP, verdict: { text: "Another default, same words", tone: "warn" } },
      { id: "chosen", label: "Chosen", screen: CHOSEN, verdict: { text: "Says what Wasel does", tone: "good" } },
    ],
  }),
};
