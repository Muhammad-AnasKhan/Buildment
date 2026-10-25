import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.3: a placeholder is gone once the person types.
// The same three-field form (Halaqa, fictional) empty, typed with placeholder
// labels, and typed with labels above.

const EMPTY: SpecScreen = {
  alt: "A Start a group form with three empty fields whose placeholders read Course, Day and time, and Seats.",
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "field", placeholder: "Course" },
    { kind: "field", placeholder: "Day and time" },
    { kind: "field", placeholder: "Seats" },
  ],
};

const TYPED: SpecScreen = {
  alt: "The same form after typing: the fields now show Data structures, Tonight 8 pm and 3, and nothing says what the last field is for.",
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "field", value: "Data structures" },
    { kind: "field", value: "Tonight 8 pm" },
    { kind: "field", value: "3" },
  ],
};

const LABELLED: SpecScreen = {
  alt: "The same typed form with a visible label above each field: Course, Day and time, and Seats.",
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "field", label: "Course", value: "Data structures" },
    { kind: "field", label: "Day and time", value: "Tonight 8 pm" },
    { kind: "field", label: "Seats", value: "3" },
  ],
};

export const productM3LabelVanish: CustomCanvasSpec = {
  kind: "custom",
  title: "A placeholder is gone when you type",
  purpose: "Switch between an empty form, the same form after typing with placeholder labels, and the same form with labels above the fields.",
  limits:
    "The reasons not to use a placeholder as a label come from NN/g, GOV.UK and contrast rules. WCAG does not mention placeholders. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Form",
    versions: [
      { id: "empty", label: "Empty", screen: EMPTY, verdict: { text: "Placeholders look like labels", tone: "warn" } },
      { id: "typed", label: "Typed", screen: TYPED, verdict: { text: "Typed: what was the 3 for?", tone: "bad" } },
      { id: "label", label: "With label", screen: LABELLED, verdict: { text: "Labels stay visible", tone: "good" } },
    ],
    hint: "Switch from the empty form to the typed one, then to the labelled one.",
    start: "empty",
  }),
};
