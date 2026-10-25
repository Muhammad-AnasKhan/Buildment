import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.5: Halaqa's Start a group form (fictional) when
// the Course field is empty. First the only signal is a red tint on the
// field. Then the field also has a red border and a sentence that says what
// to do. Colour can add to a message but cannot be the whole message.

const COLOUR_ONLY: SpecScreen = {
  alt: "The Start a group form. The Course field has a light red fill. No text says what is wrong.",
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "text", text: "Course", size: 13, weight: 600 },
    { kind: "box", fill: "badSoft", pad: 10, border: false, radius: 7, children: [{ kind: "text", text: "Choose a course", size: 13, tone: "muted" }] },
    { kind: "field", label: "When", value: "Tomorrow 5 pm" },
    { kind: "field", label: "Where", value: "Online", hint: "Library, online or cafe" },
    { kind: "field", label: "Seats", value: "4" },
    { kind: "button", label: "Start the group", full: true, size: 14 },
  ],
};

const WITH_WORDS: SpecScreen = {
  alt: "The same form. The Course field has a red border, and a red sentence under it says: Choose a course so people can find your group.",
  blocks: [
    { kind: "nav", title: "Start a group" },
    { kind: "field", label: "Course", placeholder: "Choose a course", error: "Choose a course so people can find your group." },
    { kind: "field", label: "When", value: "Tomorrow 5 pm" },
    { kind: "field", label: "Where", value: "Online", hint: "Library, online or cafe" },
    { kind: "field", label: "Seats", value: "4" },
    { kind: "button", label: "Start the group", full: true, size: 14 },
  ],
};

export const productM2ColourAlone: CustomCanvasSpec = {
  kind: "custom",
  title: "Colour is not the message",
  purpose: "Switch between a form field that shows an error only in colour and the same field with the colour and a sentence, and ask who would miss the message.",
  limits:
    "Words are one way to add to colour, not the only one. The picture cannot show how a person with a colour vision difference sees the first form, so it asks you to imagine it. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Error message",
    versions: [
      { id: "colour", label: "Colour", screen: COLOUR_ONLY, verdict: { text: "Colour is the whole message", tone: "bad" } },
      { id: "words", label: "With words", screen: WITH_WORDS, verdict: { text: "Colour plus words", tone: "good" } },
    ],
    hint: "Switch between the two forms.",
    start: "colour",
  }),
};
