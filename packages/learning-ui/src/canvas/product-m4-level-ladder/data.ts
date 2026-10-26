import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.2, beat 1: one printer-booking page that Omar built
// (fictional) at the four levels of the course's scale. Each stop keeps what the
// stop before it has and adds checks you can see: standards that pass, then one
// clear first thing with extras cut, then a named choice. The picture cannot
// show a check with people, so the verdict says it for Best.

const AVERAGE: SpecScreen = {
  alt: "The printer page at Average: a title that says Welcome, two fields with placeholders only, pale grey hint text and a small Submit button.",
  blocks: [
    { kind: "text", text: "Welcome to Lab Print", size: 16, weight: 600 },
    { kind: "text", text: "Fill in the form below", size: 12, tone: "faint" },
    { kind: "field", placeholder: "Printer" },
    { kind: "field", placeholder: "Time" },
    { kind: "button", label: "Submit", size: 11 },
  ],
};

const GOOD: SpecScreen = {
  alt: "The printer page at Good: every field has a label above it, the time field has a hint, the text is readable and one wide button names the action.",
  blocks: [
    { kind: "nav", title: "Book a printer" },
    { kind: "field", label: "Printer", value: "Printer 2" },
    { kind: "field", label: "Time", value: "4 pm to 6 pm", hint: "The lab is open 8 am to 8 pm." },
    { kind: "button", label: "Book a printer", full: true, size: 16 },
  ],
};

const BEST: SpecScreen = {
  alt: "The printer page at Best: the free printer and time is the largest line, the extra text is gone, and one wide button names the time it books.",
  blocks: [
    { kind: "nav", title: "Book a printer" },
    { kind: "text", text: "Printer 2 is free 4 to 6 pm", size: 22, weight: 700 },
    { kind: "field", label: "How many pages?", value: "20" },
    { kind: "button", label: "Book 4 to 6 pm", full: true, size: 16 },
  ],
};

const REMARKABLE: SpecScreen = {
  alt: "The printer page at Remarkable: the number of people ahead in the queue is the largest figure, then the free time, then one wide button.",
  blocks: [
    { kind: "nav", title: "Book a printer" },
    { kind: "stat", value: "2", label: "people ahead of you", tone: "accent" },
    { kind: "text", text: "Printer 2 is free 4 to 6 pm", size: 14, weight: 600 },
    { kind: "field", label: "How many pages?", value: "20" },
    { kind: "button", label: "Book 4 to 6 pm", full: true, size: 16 },
  ],
};

export const productM4LevelLadder: CustomCanvasSpec = {
  kind: "custom",
  title: "One page at four levels",
  purpose: "Drag along four versions of one printer-booking page and see what each level of the scale adds to the one below.",
  limits:
    "A picture shows some checks and not others: it cannot show a check with people or a keyboard. The scale is this course's own. The units are not pixels on your phone. Omar and Lab Print are fictional.",
  component: makeSpecimenLadderCanvas({
    label: "Level on the scale",
    steps: [
      { screen: AVERAGE, verdict: { text: "Works, nothing checked", tone: "accent" }, valueText: "Average" },
      { screen: GOOD, verdict: { text: "Standards pass", tone: "good" }, valueText: "Good" },
      { screen: BEST, verdict: { text: "One thing first, tested", tone: "good" }, valueText: "Best" },
      { screen: REMARKABLE, verdict: { text: "A choice: the queue leads", tone: "good" }, valueText: "Remarkable" },
    ],
    ends: ["lower", "higher"],
    caption: "Level on the scale",
    hint: "Drag across the picture to climb the four levels.",
    start: 0,
  }),
};
