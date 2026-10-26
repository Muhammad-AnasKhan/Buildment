import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecGlyph, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.4: three first screens for Wasel (a fictional
// print shop). A card grid with claims, the same shop with its real content
// as the picture, and the same content with one bold choice: the 4 pm promise
// set large because the customer's worry is missing tomorrow's deadline.

function claim(glyph: SpecGlyph, title: string, line: string): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 10,
    gap: 10,
    children: [
      {
        kind: "row",
        gap: 10,
        weights: [1, 4],
        children: [
          { kind: "icon", glyph, tile: true, size: 14 },
          {
            kind: "box",
            fill: "none",
            pad: 0,
            gap: 2,
            children: [
              { kind: "text", text: title, size: 13.5, weight: 600 },
              { kind: "text", text: line, size: 12, tone: "muted" },
            ],
          },
        ],
      },
    ],
  };
}

const PRICES = "Black and white 0.50 shekels a page. Colour 2 shekels. Binding 5.";
const HOURS = "Open 8 am to 6 pm, near the university gate.";

const CARD_GRID: SpecScreen = {
  alt: "A first screen with a friendly headline, three cards with icon tiles that make claims about speed, safety and price, and a Get started button. No price and no time appear.",
  background: "card",
  blocks: [
    { kind: "text", text: "Print smarter with Wasel", size: 22, weight: 700 },
    { kind: "text", text: "A modern way to order your prints.", size: 13, tone: "muted" },
    claim("bolt", "Fast printing", "Quick and reliable."),
    claim("shield", "Secure files", "Safe and private."),
    claim("spark", "Smart pricing", "Great value for you."),
    { kind: "button", label: "Get started", full: true },
  ],
};

const REAL_CONTENT: SpecScreen = {
  alt: "A first screen whose headline says what happens, a picture of the price list, an Upload a file button and the opening hours. The headline already carries the before-noon rule.",
  background: "card",
  blocks: [
    { kind: "text", text: "Send your file before noon. Pick it up printed by 4 pm.", size: 22, weight: 700, font: "serif" },
    { kind: "image", art: "receipt", height: 78, caption: PRICES },
    { kind: "button", label: "Upload a file", full: true },
    { kind: "text", text: HOURS, size: 12.5, tone: "muted" },
  ],
};

const ONE_BOLD: SpecScreen = {
  alt: "A first screen where the time 4 pm is set very large, with a line about sending before noon. The price list, an Upload a file button and the opening hours follow.",
  background: "card",
  blocks: [
    { kind: "text", text: "Ready by", size: 13, tone: "muted" },
    { kind: "text", text: "4 pm", size: 48, weight: 800, tone: "accent" },
    { kind: "text", text: "if you send your file before noon.", size: 15, weight: 600 },
    { kind: "image", art: "receipt", height: 60, caption: PRICES },
    { kind: "button", label: "Upload a file", full: true },
    { kind: "text", text: HOURS, size: 12.5, tone: "muted" },
  ],
};

export const productM5PointOfView: CustomCanvasSpec = {
  kind: "custom",
  title: "Three first screens for Wasel",
  purpose: "Switch between three first screens for Wasel: a card grid with claims, the same shop with its real content as the picture, and the same content with one bold choice.",
  limits:
    "These are three drawings, not a test. Whether the bold choice works is checked by asking a few students what they noticed first. A big number with a small label can be a default too, if it is only there to look like a dashboard. Wasel is a fictional shop.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "First screen",
    hint: "Switch between the three first screens.",
    versions: [
      { id: "cards", label: "Card grid", screen: CARD_GRID, verdict: { text: "Three cards say nothing", tone: "bad" } },
      { id: "content", label: "Content", screen: REAL_CONTENT, verdict: { text: "The price list is the picture", tone: "good" } },
      { id: "bold", label: "One bold", screen: ONE_BOLD, verdict: { text: "One bold thing, with a reason", tone: "good" } },
    ],
  }),
};
