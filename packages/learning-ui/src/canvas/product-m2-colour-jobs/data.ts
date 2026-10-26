import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.5: Halaqa's group page (fictional) with a colour
// on every part, and with one accent colour kept for the main action. Colour
// needs a job: when each part has its own colour, no colour means anything.

const MANY: SpecScreen = {
  alt: "A group page where the status pills are green, amber, red and blue, a red button sits beside the blue Join button, and no colour stands for one thing.",
  blocks: [
    { kind: "text", text: "Data structures, exam Thursday", size: 18, weight: 700 },
    {
      kind: "pills",
      items: [
        { text: "Open", tone: "good" },
        { text: "2 seats left", tone: "warn" },
        { text: "Exam Thursday", tone: "bad" },
        { text: "Library", tone: "accent" },
      ],
    },
    { kind: "text", text: "Tonight 8 pm, library room 2", size: 14, tone: "muted" },
    { kind: "row", gap: 8, children: [{ kind: "button", label: "Join", full: true, size: 14 }, { kind: "button", label: "Report", variant: "danger", full: true, size: 14 }] },
    { kind: "button", label: "Share", variant: "secondary", full: true, size: 14 },
  ],
};

const ONE: SpecScreen = {
  alt: "The same page with one accent colour. Only the Join button is filled with it. The status is written in grey words and the other actions are outlined or plain.",
  blocks: [
    { kind: "text", text: "Data structures, exam Thursday", size: 18, weight: 700 },
    { kind: "pills", items: [{ text: "Open" }, { text: "2 seats left" }, { text: "Library" }] },
    { kind: "text", text: "Tonight 8 pm, library room 2", size: 14, tone: "muted" },
    { kind: "button", label: "Join this group", full: true, size: 14 },
    { kind: "button", label: "Share", variant: "secondary", full: true, size: 14 },
    { kind: "button", label: "Report a problem", variant: "ghost", size: 13 },
  ],
};

export const productM2ColourJobs: CustomCanvasSpec = {
  kind: "custom",
  title: "One accent colour",
  purpose: "Switch between a group page with a colour on every part and the same page with one accent colour kept for the main action.",
  limits:
    "One accent is a good start, not a law: a product can have a second colour with a clear job, such as red for a destructive action. The colours here are the reader's theme colours. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Colour use",
    versions: [
      { id: "many", label: "Many", screen: MANY, verdict: { text: "Every part has a colour", tone: "bad" } },
      { id: "one", label: "One accent", screen: ONE, verdict: { text: "Colour means: act here", tone: "good" } },
    ],
    hint: "Switch between the two pages.",
    start: "many",
  }),
};
