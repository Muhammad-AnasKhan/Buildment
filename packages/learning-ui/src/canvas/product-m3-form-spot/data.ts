import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenSpotCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.3: Halaqa's "Start a group" form (fictional) as
// first built, with four problems to find. Two parts are fine. Once all four
// are found, the learner can switch to the fixed form: visible labels above
// the fields, a hint, an error in words next to its field, and a button that
// says what happens.

const BEFORE: SpecScreen = {
  alt: "Halaqa's Start a group form with the words Invalid input at the top, two fields whose labels are placeholders, a field with a red border and no words, and a small Submit button.",
  blocks: [
    { kind: "nav", id: "title", title: "Start a group" },
    { kind: "text", id: "invalid", text: "Invalid input", size: 12.5, weight: 600, tone: "bad" },
    {
      kind: "box",
      id: "labels",
      fill: "none",
      pad: 0,
      gap: 10,
      children: [
        { kind: "field", placeholder: "Course" },
        { kind: "field", placeholder: "Day and time" },
      ],
    },
    // The single space gives the field a red border with no message under it.
    { kind: "field", id: "border", value: "0", error: " " },
    { kind: "button", id: "tiny", label: "Submit", size: 11 },
    { kind: "text", id: "note", text: "Your group is shown to students in your course.", size: 12, tone: "muted" },
  ],
};

const AFTER: SpecScreen = {
  alt: "The fixed Start a group form: a visible label above each field, a hint under two of them, the error Seats must be 1 or more written under the Seats field, and a button that says Start the group.",
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "field", label: "Course", value: "Data structures", hint: "The course your group will revise." },
    { kind: "field", label: "Day and time", value: "Tonight 8 pm", hint: "For example, tomorrow 5 pm." },
    { kind: "field", label: "Seats", value: "0", error: "Seats must be 1 or more. Others need room to join." },
    { kind: "button", label: "Start the group", full: true },
  ],
};

export const productM3FormSpot: CustomCanvasSpec = {
  kind: "custom",
  title: "Spot the form problems",
  purpose: "Tap the four parts of Halaqa's Start a group form that make people give up, then compare the fixed form.",
  limits:
    "No single choice decides whether people finish a form. Labels, hints and errors help most together, and only a check with real people shows which problems matter for your form. Halaqa is a fictional app.",
  component: makeSpecimenSpotCanvas({
    screen: BEFORE,
    targets: [
      { id: "invalid", label: "Message says nothing", why: "It does not say which field, or what to change." },
      { id: "labels", label: "Placeholder as label", why: "The words vanish once you type, so you cannot check what a field was for." },
      { id: "border", label: "Red border only", why: "A colour alone does not say what is wrong or how to fix it. This field also has no label." },
      { id: "tiny", label: "Small, vague button", why: "Submit does not say what happens. The target is also small for a thumb." },
    ],
    fine: {
      title: "A clear title that says what the screen is for. Keep it.",
      note: "This line tells people what happens next. Keep it.",
    },
    hint: "Tap each part that makes people give up on this form.",
    startVerdict: "Find the 4 problems",
    doneVerdict: "All 4 found",
    after: { label: "Fixed form", screen: AFTER, verdict: "Labels, words, a clear button" },
  }),
};
