import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.2: what a good error message holds. Halaqa's Start
// a group form (fictional) after a send that failed on a weak connection. The
// vague version says "Something went wrong" at the top and has emptied the
// form. The specific version names the cause, says what to do and keeps
// everything the person typed.

const VAGUE: SpecScreen = {
  alt: "The Start a group form after a failed send. The words Something went wrong sit at the top, every field is empty again, and there is no button to try again.",
  gap: 10,
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "text", text: "Something went wrong", size: 13, weight: 600, tone: "bad" },
    { kind: "field", placeholder: "Course" },
    { kind: "field", placeholder: "When" },
    { kind: "field", placeholder: "Where" },
    { kind: "field", placeholder: "Seats" },
    { kind: "button", label: "Start the group", full: true },
  ],
};

const SPECIFIC: SpecScreen = {
  alt: "The same form after a failed send. A message under the button says the group was not saved because the connection dropped and that everything typed is kept, with a Try again button. All four fields still hold what the person typed.",
  gap: 8,
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "field", label: "Course", value: "Data structures" },
    { kind: "field", label: "When", value: "Tonight 8 pm" },
    { kind: "field", label: "Where", value: "Library room 2" },
    { kind: "field", label: "Seats", value: "3" },
    {
      kind: "box",
      border: "accent",
      pad: 10,
      gap: 8,
      children: [
        { kind: "text", text: "Your group was not saved. The connection dropped. Everything you typed is kept.", size: 12, weight: 600 },
        { kind: "button", label: "Try again", full: true },
      ],
    },
  ],
};

export const productM3ErrorWords: CustomCanvasSpec = {
  kind: "custom",
  title: "What a good error message holds",
  purpose: "Switch between a vague error and a specific one after the same failed send, and count what each gives the person.",
  limits:
    "The four parts come from NN/g's guidance on error messages, which is expert advice and not a controlled test. The wording is for this fictional form. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Message",
    versions: [
      { id: "vague", label: "Vague", screen: VAGUE, verdict: { text: "No cause, no step, input lost", tone: "bad" } },
      { id: "specific", label: "Specific", screen: SPECIFIC, verdict: { text: "Cause, step, input kept", tone: "good" } },
    ],
    hint: "Switch between the two messages and count what each one tells the person.",
    start: "vague",
  }),
};
