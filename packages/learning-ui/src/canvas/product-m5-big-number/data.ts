import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.4: a bold choice has a reason. Two big figures on
// Wasel's page (a fictional print shop) with the same shape: a large figure
// and a small label. One is decoration, because no student decides anything
// from it. The other answers the student's worry about the deadline.

const COUNT: SpecScreen = {
  alt: "A big figure, 30 to 40, with a small label saying orders a day in exam weeks, above an Upload a file button.",
  background: "card",
  blocks: [
    { kind: "text", text: "30 to 40", size: 40, weight: 800, tone: "accent" },
    { kind: "text", text: "orders a day in exam weeks", size: 13, tone: "muted" },
    { kind: "button", label: "Upload a file", full: true },
  ],
};

const TIME: SpecScreen = {
  alt: "A big time, 4 pm, with Ready by above it and the line if you send your file before noon below it, then an Upload a file button.",
  background: "card",
  blocks: [
    { kind: "text", text: "Ready by", size: 13, tone: "muted" },
    { kind: "text", text: "4 pm", size: 40, weight: 800, tone: "accent" },
    { kind: "text", text: "if you send your file before noon.", size: 13, tone: "muted" },
    { kind: "button", label: "Upload a file", full: true },
  ],
};

export const productM5BigNumber: CustomCanvasSpec = {
  kind: "custom",
  title: "Two big figures, one reason",
  purpose: "Switch between two big figures on Wasel's page that have the same shape: one is decoration, the other answers the student's worry about the deadline.",
  limits:
    "The shape is the same, and only the reason differs. A reason is not proof: check with a few students what they noticed first. Wasel and its numbers are the case's own and fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Figure",
    hint: "Switch between the two figures and ask what a student decides from each.",
    versions: [
      { id: "count", label: "30 to 40", screen: COUNT, verdict: { text: "No student decides from it", tone: "warn" } },
      { id: "time", label: "4 pm", screen: TIME, verdict: { text: "It answers the deadline worry", tone: "good" } },
    ],
  }),
};
