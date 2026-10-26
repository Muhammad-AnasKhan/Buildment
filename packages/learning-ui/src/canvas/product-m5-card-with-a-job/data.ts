import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecGlyph, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.2: a card is not the problem, a card with no job
// is. Wasel (fictional) shown twice with three cards each. In the first the
// cards hold a word and a claim; in the second each card holds a price a
// student can compare.

function claimCard(glyph: SpecGlyph, title: string, line: string): SpecBlock {
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

function priceCard(title: string, price: string): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 10,
    gap: 2,
    children: [
      { kind: "text", text: title, size: 13.5, weight: 600 },
      { kind: "text", text: price, size: 12.5, tone: "muted" },
    ],
  };
}

const NO_JOB: SpecScreen = {
  alt: "Three cards with an icon tile each: Fast, Secure and Smart. Each holds a short claim and nothing a student can compare.",
  background: "card",
  blocks: [
    { kind: "text", text: "Why choose Wasel?", size: 16, weight: 700 },
    claimCard("bolt", "Fast", "We work quickly for you."),
    claimCard("shield", "Secure", "Your files are in safe hands."),
    claimCard("spark", "Smart", "Made with modern tools."),
  ],
};

const A_JOB: SpecScreen = {
  alt: "Three cards that each hold a price: black and white at 0.50 shekels a page, colour at 2 shekels a page, and binding at 5 shekels.",
  background: "card",
  blocks: [
    { kind: "text", text: "What it costs", size: 16, weight: 700 },
    priceCard("Black and white", "0.50 shekels a page"),
    priceCard("Colour", "2 shekels a page"),
    priceCard("Binding", "5 shekels"),
    { kind: "text", text: "Send before noon and it is ready by 4 pm.", size: 12.5, tone: "muted" },
  ],
};

export const productM5CardWithAJob: CustomCanvasSpec = {
  kind: "custom",
  title: "Cards with and without a job",
  purpose: "Switch between two rows of three cards on Wasel's page: one holds claims with nothing to compare, the other holds three prices a student can compare.",
  limits:
    "A plain list could also show the prices, and cards are one choice among several. The point is not that cards are right, but that a card needs a job. Wasel is a fictional shop.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Cards",
    hint: "Switch between the two sets of cards.",
    versions: [
      { id: "no-job", label: "No job", screen: NO_JOB, verdict: { text: "Cards, nothing to compare", tone: "warn" } },
      { id: "job", label: "A job", screen: A_JOB, verdict: { text: "Cards that hold a price", tone: "good" } },
    ],
  }),
};
