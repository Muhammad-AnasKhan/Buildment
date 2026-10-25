import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.1: the scene. The same generic page, drawn for a
// print shop, a bakery and a gym club (all fictional). Only one word in the
// headline and the two small lines at the bottom change. The look stays put,
// which is the point: the page could sell anything.

function page(word: string, alt: string, price: string, hours: string): SpecScreen {
  const card = (glyph: "bolt" | "shield" | "spark", label: string) => ({
    kind: "box" as const,
    border: true,
    pad: 8,
    gap: 6,
    children: [{ kind: "icon" as const, glyph, tile: true, size: 14 }, { kind: "text" as const, text: label, size: 12, weight: 600 as const }],
  });
  return {
    alt,
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
          { kind: "text", text: `Revolutionize your ${word} experience`, size: 21, weight: 800, tone: "onGlow" },
          { kind: "text", text: "Seamless, powerful and effortless.", size: 13, tone: "onGlow" },
          { kind: "button", label: "Get started", variant: "glow" },
        ],
      },
      { kind: "row", gap: 8, children: [card("bolt", "Fast"), card("shield", "Secure"), card("spark", "Smart")] },
      { kind: "text", text: price, size: 12.5, tone: "muted" },
      { kind: "text", text: hours, size: 12.5, tone: "muted" },
    ],
  };
}

export const productM5Scene: CustomCanvasSpec = {
  kind: "custom",
  title: "One page, three shops",
  purpose: "Switch between the same page drawn for a print shop, a bakery and a gym club, and see that only one word and two small lines change.",
  limits:
    "The bakery and the gym club are invented to show the point. A real tool does not always make this exact page, and a page like this can still be right for a shop that chose it. Wasel is a fictional print shop.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Shop",
    hint: "Switch between the three shops and watch what changes.",
    versions: [
      {
        id: "print",
        label: "Print shop",
        screen: page("printing", "Wasel's order page: a purple glow, an AI badge, a headline about printing, three icon cards, and a price and opening time in small grey text.", "0.50 shekels a page. Ready by 4 pm.", "Open 8 am to 6 pm, near the university gate."),
        verdict: { text: "Wasel, the real page", tone: "accent" },
      },
      {
        id: "bakery",
        label: "Bakery",
        screen: page("baking", "The same page with the word baking in the headline, and a bakery's price and hours in small grey text.", "A loaf is 3 shekels. Fresh at 7 am.", "Open 6 am to 2 pm, near the market."),
        verdict: { text: "Same page, now a bakery", tone: "warn" },
      },
      {
        id: "gym",
        label: "Gym club",
        screen: page("training", "The same page with the word training in the headline, and a gym club's price and hours in small grey text.", "A month is 60 shekels.", "Open 6 am to 10 pm, behind the stadium."),
        verdict: { text: "Same page, now a gym", tone: "warn" },
      },
    ],
  }),
};
