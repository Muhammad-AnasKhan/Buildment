import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.3: when to check a field. One field, Course code
// (two letters and three digits, such as CS201), at three moments: while the
// person is still typing, after the person leaves the field, and as soon as
// the person has fixed it. Halaqa is fictional.

function screen(alt: string, field: { value: string; error?: string; hint?: string; focus?: boolean }): SpecScreen {
  return {
    alt,
    blocks: [
      { kind: "nav", title: "Start a group" },
      { kind: "field", label: "Course code", ...field },
      { kind: "button", label: "Start the group", full: true },
    ],
  };
}

export const productM3WhenToCheck: CustomCanvasSpec = {
  kind: "custom",
  title: "When to check a field",
  purpose: "Step through one field at three moments: still typing, after leaving the field, and after the fix.",
  limits:
    "The timing comes from one research firm's usability testing, which does not give a participant count. Checking when the person leaves the field does not replace checking on submit. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Moment",
    versions: [
      {
        id: "typing",
        label: "Typing",
        screen: screen("The Course code field holds CS2 with focus still in it, and already shows the error Enter a course code like CS201.", {
          value: "CS2",
          focus: true,
          error: "Enter a course code like CS201.",
        }),
        verdict: { text: "Too early: still typing", tone: "bad" },
      },
      {
        id: "left",
        label: "Left field",
        screen: screen("The person has left the Course code field, which holds CS2, and the error says Course code needs 3 digits, like CS201.", {
          value: "CS2",
          error: "Course code needs 3 digits, like CS201.",
        }),
        verdict: { text: "Checked once, after leaving", tone: "good" },
      },
      {
        id: "fixed",
        label: "Fixed",
        screen: screen("The person is back in the field, which now holds CS201, and the error is gone.", {
          value: "CS201",
          focus: true,
          hint: "Two letters and three digits.",
        }),
        verdict: { text: "Error clears as soon as fixed", tone: "good" },
      },
    ],
    hint: "Switch from typing to leaving the field to the fix.",
    start: "typing",
  }),
};
