import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.3: labels and errors are copy too. A pre-order form
// for Ehab's bakery (fictional) twice: the default words a tool writes, and
// words that say what happens and what to do. Not a Wasel screen, so the 5.5
// practice on Wasel's order form is not solved here.

const DEFAULT_WORDS: SpecScreen = {
  alt: "A bakery pre-order form with the title Get started, a pickup time of 9 pm marked wrong with the message Invalid input, and a button that says Submit.",
  background: "card",
  blocks: [
    { kind: "text", text: "Get started", size: 17, weight: 700 },
    { kind: "field", label: "Loaves", value: "2" },
    { kind: "field", label: "Pickup time", value: "9 pm", error: "Invalid input" },
    { kind: "button", label: "Submit", full: true },
  ],
};

const SPECIFIC_WORDS: SpecScreen = {
  alt: "The same form with the title Reserve your loaves, the message Choose a time from 6 am to 2 pm under the pickup time, and a Reserve my loaves button.",
  background: "card",
  blocks: [
    { kind: "text", text: "Reserve your loaves", size: 17, weight: 700 },
    { kind: "field", label: "Loaves", value: "2" },
    { kind: "field", label: "Pickup time", value: "9 pm", error: "Choose a time from 6 am to 2 pm." },
    { kind: "button", label: "Reserve my loaves", full: true },
  ],
};

export const productM5LabelsErrors: CustomCanvasSpec = {
  kind: "custom",
  title: "Labels and errors are copy too",
  purpose: "Switch between a bakery pre-order form with the default words a tool writes and the same form with words that say what happens and what to do.",
  limits:
    "Only the words change here. Where an error sits and when it shows are the topic of module 3. The bakery and its hours are invented for this picture.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Words",
    hint: "Switch between the two sets of words on the same form.",
    versions: [
      { id: "default", label: "Default", screen: DEFAULT_WORDS, verdict: { text: "Says nothing about the order", tone: "bad" } },
      { id: "specific", label: "Specific", screen: SPECIFIC_WORDS, verdict: { text: "Says what to do next", tone: "good" } },
    ],
  }),
};
