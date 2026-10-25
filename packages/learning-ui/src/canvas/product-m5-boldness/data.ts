import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.4: spend your boldness in one place. The same five
// facts about Wasel (a fictional print shop) twice: every line large and heavy,
// and one line large. Each has a blurred twin, as when you squint (the squint
// test from chapter 2.2): with everything bold, no first thing survives.

const ALL_BOLD: SpecScreen = {
  alt: "Four lines of the same large, heavy type: send your file now, 0.50 shekels a page, ready by 4 pm, open 8 am to 6 pm, then a large Upload a file button.",
  background: "card",
  blocks: [
    { kind: "text", text: "Send your file now", size: 22, weight: 800 },
    { kind: "text", text: "0.50 shekels a page", size: 22, weight: 800 },
    { kind: "text", text: "Ready by 4 pm", size: 22, weight: 800 },
    { kind: "text", text: "Open 8 am to 6 pm", size: 22, weight: 800 },
    { kind: "button", label: "Upload a file", full: true, size: 20 },
  ],
};

const ONE_BOLD: SpecScreen = {
  alt: "The time 4 pm set very large with Ready by above it, a short line to send your file now, the price and the opening hours in small type, and an Upload a file button.",
  background: "card",
  blocks: [
    { kind: "text", text: "Send your file now", size: 15, weight: 600 },
    { kind: "text", text: "Ready by", size: 13, tone: "muted" },
    { kind: "text", text: "4 pm", size: 48, weight: 800, tone: "accent" },
    { kind: "text", text: "0.50 shekels a page", size: 13, tone: "muted" },
    { kind: "text", text: "Open 8 am to 6 pm", size: 13, tone: "muted" },
    { kind: "button", label: "Upload a file", full: true },
  ],
};

export const productM5Boldness: CustomCanvasSpec = {
  kind: "custom",
  title: "Bold everywhere or in one place",
  purpose: "Compare a Wasel screen where every line is large and heavy with one where only the time is large, and squint at each by switching to its blurred twin.",
  limits:
    "A blur is a quick check, not proof. It shows what stands out first in a picture; it does not show whether the right thing stands out for the person using it. Wasel is a fictional shop.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    hint: "Switch between the versions, and between each one and its blurred twin.",
    versions: [
      { id: "all", label: "All bold", screen: ALL_BOLD, verdict: { text: "Nothing comes first", tone: "bad" } },
      { id: "all-blur", label: "Blur A", screen: ALL_BOLD, blur: true, verdict: { text: "Blurred: no first thing", tone: "bad" } },
      { id: "one", label: "One bold", screen: ONE_BOLD, verdict: { text: "4 pm comes first", tone: "good" } },
      { id: "one-blur", label: "Blur B", screen: ONE_BOLD, blur: true, verdict: { text: "Blurred: 4 pm remains", tone: "good" } },
    ],
  }),
};
