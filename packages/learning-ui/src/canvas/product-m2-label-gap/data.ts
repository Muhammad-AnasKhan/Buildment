import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.4: Halaqa's Start a group form (fictional), with
// the four fields Course, When, Where and Seats. First every gap is 12, so
// each label floats halfway between two fields. Then each label sits 4 above
// its own field and there is 24 between a field and the next label.
// Proximity tells the reader which label owns which field. Every gap is a
// multiple of 4.

const FIELDS = [
  { label: "Course", value: "Statistics 101 revision" },
  { label: "When", value: "Tomorrow 5 pm" },
  { label: "Where", value: "Online" },
  { label: "Seats", value: "4" },
];

const BUTTON: SpecBlock = { kind: "button", label: "Start the group", full: true, size: 14 };

// Even: a label line and a field line, with the same gap everywhere on the screen.
const EVEN: SpecScreen = {
  alt: "A form with Course, When, Where and Seats fields. Every gap is 12, so each label floats halfway between two fields.",
  gap: 12,
  blocks: [
    { kind: "nav", title: "Start a group" },
    ...FIELDS.flatMap((f): SpecBlock[] => [
      { kind: "text", text: f.label, size: 12, weight: 600 },
      { kind: "field", value: f.value },
    ]),
    BUTTON,
  ],
};

// Grouped: the field draws its own label 4 above it, and the screen gap is 24.
const GROUPED: SpecScreen = {
  alt: "The same form. Each label sits 4 above its own field, and there is 24 between one field and the next label.",
  gap: 24,
  blocks: [{ kind: "nav", title: "Start a group" }, ...FIELDS.map((f): SpecBlock => ({ kind: "field", label: f.label, value: f.value })), BUTTON],
};

export const productM2LabelGap: CustomCanvasSpec = {
  kind: "custom",
  title: "Which label owns which field",
  purpose: "Switch between a form with equal gaps and a form where each label sits close to its own field, and see which one tells you what to type where.",
  limits:
    "Space is one signal among several: a label also lines up with its field and is bold. The gaps are drawn units, not pixels. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Spacing",
    versions: [
      { id: "even", label: "Even", screen: EVEN, verdict: { text: "Labels float between fields", tone: "bad" } },
      { id: "grouped", label: "Grouped", screen: GROUPED, verdict: { text: "A label stays with its field", tone: "good" } },
    ],
    hint: "Switch between the two forms.",
    start: "even",
  }),
};
