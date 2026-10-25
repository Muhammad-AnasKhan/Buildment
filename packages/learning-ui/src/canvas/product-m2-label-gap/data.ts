import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.4: Halaqa's create-group form (fictional) with
// equal gaps everywhere, and with each label close to its own field and far
// from the field above. Proximity tells the reader which label owns which field.

function pair(label: string, value: string, inner: number): SpecBlock {
  return {
    kind: "box",
    fill: "none",
    pad: 0,
    gap: inner,
    children: [
      { kind: "text", text: label, size: 13, weight: 600 },
      { kind: "field", value },
    ],
  };
}

function form(alt: string, inner: number, between: number): SpecScreen {
  return {
    alt,
    gap: between,
    blocks: [
      { kind: "nav", title: "Create a group" },
      pair("Course", "Statistics 101", inner),
      pair("Place", "Library room 2", inner),
      { kind: "button", label: "Create group", full: true, size: 14 },
    ],
  };
}

export const productM2LabelGap: CustomCanvasSpec = {
  kind: "custom",
  title: "Which label owns which field",
  purpose: "Switch between a form with equal gaps and a form where each label sits close to its own field, and see which one tells you what to type where.",
  limits:
    "Space is one signal among several: a label also lines up with its field and is bold. The gaps are drawn units, not pixels. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Spacing",
    versions: [
      { id: "even", label: "Even", screen: form("A form with Course and Place fields. Every gap is 14, so each label floats halfway between two fields.", 14, 14), verdict: { text: "Labels float between fields", tone: "bad" } },
      { id: "grouped", label: "Grouped", screen: form("The same form. Each label sits 4 above its own field, and there is 22 between one field and the next label.", 4, 22), verdict: { text: "A label stays with its field", tone: "good" } },
    ],
    hint: "Switch between the two forms.",
    start: "even",
  }),
};
