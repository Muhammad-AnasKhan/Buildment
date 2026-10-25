import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenSpotCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.2: spot the generic AI-made look on Wasel, a print
// and copy shop's order page (fictional). Five parts carry the look; three
// parts carry real content and are fine. Once all five are found, the learner
// can switch to a version that leads with the real content.

const SLOP: SpecScreen = {
  alt: "Wasel's landing page in the generic look: a purple glow behind the headline, an AI badge, three icon cards and a glowing button.",
  background: "card",
  blocks: [
    {
      kind: "box",
      id: "glow",
      fill: "glow",
      radius: 14,
      pad: 16,
      gap: 10,
      children: [
        { kind: "pill", id: "badge", text: "AI-powered", tone: "accent" },
        { kind: "text", id: "hype", text: "Revolutionize your printing experience", size: 21, weight: 800, tone: "onGlow" },
        { kind: "text", text: "Seamless, powerful and effortless.", size: 13, tone: "onGlow" },
        { kind: "button", id: "cta", label: "Get started", variant: "glow" },
      ],
    },
    {
      kind: "row",
      id: "tiles",
      gap: 8,
      children: [
        { kind: "box", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "bolt", tile: true, size: 14 }, { kind: "text", text: "Fast", size: 12, weight: 600 }] },
        { kind: "box", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "shield", tile: true, size: 14 }, { kind: "text", text: "Secure", size: 12, weight: 600 }] },
        { kind: "box", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "spark", tile: true, size: 14 }, { kind: "text", text: "Smart", size: 12, weight: 600 }] },
      ],
    },
    { kind: "text", id: "price", text: "0.50 shekels a page. Ready by 4 pm.", size: 12.5, tone: "muted" },
    { kind: "text", id: "hours", text: "Open 8 am to 6 pm, near the university gate.", size: 12.5, tone: "muted" },
  ],
};

const EDITORIAL: SpecScreen = {
  alt: "Wasel's page rebuilt around real content: a plain headline that says what happens, the price list as the picture, opening hours and one clear button.",
  blocks: [
    { kind: "text", text: "WASEL PRINT AND COPY", size: 11, weight: 700, tone: "muted" },
    { kind: "text", text: "Send your file now. Pick it up printed by 4 pm.", size: 22, weight: 700, font: "serif" },
    { kind: "image", art: "receipt", height: 78, caption: "Black and white 0.50 shekels a page. Colour 2 shekels. Binding 5." },
    { kind: "button", label: "Upload a file", full: true },
    { kind: "text", text: "Open 8 am to 6 pm, near the university gate.", size: 12.5, tone: "muted" },
  ],
};

export const productM5SpotTheSlop: CustomCanvasSpec = {
  kind: "custom",
  title: "Spot the generic look",
  purpose: "Tap the five parts of Wasel's page that carry the generic AI-made look, then compare a version that leads with the shop's real content.",
  limits:
    "No single part makes a page generic: a gradient or an icon can be right when it has a job. The look comes from many default parts used together with nothing specific to say. Wasel is a fictional shop.",
  component: makeSpecimenSpotCanvas({
    screen: SLOP,
    targets: [
      { id: "glow", label: "Purple glow", why: "It fills space with colour that says nothing about printing." },
      { id: "badge", label: "AI badge", why: "A customer wants pages printed, not a label about how the site was made." },
      { id: "hype", label: "Hype headline", why: "It could sit on any product. It never says what Wasel does." },
      { id: "tiles", label: "Icon cards", why: "Fast, Secure, Smart: three claims with no proof, in three identical boxes." },
      { id: "cta", label: "Vague button", why: "Get started where? The real first step is to upload a file." },
    ],
    fine: {
      price: "This is real content: a price and a time. It should move up, not go away.",
      hours: "Opening hours and a place are facts a customer needs. Keep them.",
    },
    hint: "Tap each part that makes the page look generic.",
    startVerdict: "Find the 5 generic parts",
    doneVerdict: "All 5 found",
    after: { label: "Real content", screen: EDITORIAL, verdict: "It says what Wasel does" },
  }),
};
