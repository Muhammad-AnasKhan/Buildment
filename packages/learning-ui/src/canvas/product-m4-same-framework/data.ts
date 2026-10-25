import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.3, beat 1: two booking pages built on the same
// framework with no changes (fictional). Rand's lists library group rooms and
// Omar's lists lab printers. The type, spacing, colour and generic words are the
// same, so the two pages read as one product.

function item(name: string, detail: string, free: boolean): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 10,
    gap: 6,
    children: [
      { kind: "text", text: name, size: 14, weight: 600 },
      { kind: "pill", text: free ? "Free" : "Taken", tone: "accent" },
      { kind: "text", text: detail, size: 13 },
      { kind: "button", label: "Book", variant: "primary", size: 12 },
    ],
  };
}

export const RAND_PAGE: SpecScreen = {
  alt: "Rand's room page on framework defaults: the title Welcome to Library Booking, three accent pills, and two room boxes that each have an accent status pill and an accent Book button.",
  blocks: [
    { kind: "text", text: "Welcome to Library Booking", size: 16, weight: 600 },
    { kind: "pills", items: [{ text: "Quiet", tone: "accent" }, { text: "Group", tone: "accent" }, { text: "Online", tone: "accent" }] },
    item("Room 1", "Seats 6", true),
    item("Room 2", "Seats 4", false),
  ],
};

export const OMAR_PAGE: SpecScreen = {
  alt: "Omar's printer page on the same framework defaults: the title Welcome to Lab Printing, three accent pills, and two printer boxes that each have an accent status pill and an accent Book button.",
  blocks: [
    { kind: "text", text: "Welcome to Lab Printing", size: 16, weight: 600 },
    { kind: "pills", items: [{ text: "Black", tone: "accent" }, { text: "Colour", tone: "accent" }, { text: "Large", tone: "accent" }] },
    item("Printer 1", "Queue 2", true),
    item("Printer 2", "Queue 5", false),
  ],
};

export const productM4SameFramework: CustomCanvasSpec = {
  kind: "custom",
  title: "Two pages, one framework",
  purpose: "Switch between two booking pages built on the same framework with no changes, and see that they look like one product.",
  limits:
    "Two pages are an example, not a measurement. That unchanged defaults look alike is this course's own observation. The units are not pixels on your phone. Rand and Omar are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Page",
    versions: [
      { id: "rand", label: "Rand's", screen: RAND_PAGE, verdict: { text: "Rooms, framework defaults", tone: "accent" } },
      { id: "omar", label: "Omar's", screen: OMAR_PAGE, verdict: { text: "Printers, the same defaults", tone: "accent" } },
    ],
    hint: "Switch between the two pages and look for what is different.",
    start: "rand",
  }),
};
