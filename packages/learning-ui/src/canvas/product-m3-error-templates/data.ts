import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.3: error words follow a pattern. Three fields of
// Halaqa (fictional), each with an error written from one of the GOV.UK
// Design System templates: something missing, something wrong, something too
// long. Every message names the field and says the fix, and sits right under
// its field.

function screen(alt: string, nav: string, field: { label: string; value: string; error: string; hint?: string }): SpecScreen {
  return {
    alt,
    blocks: [
      { kind: "nav", title: nav },
      { kind: "field", ...field },
      { kind: "button", label: "Start the group", full: true },
    ],
  };
}

export const productM3ErrorTemplates: CustomCanvasSpec = {
  kind: "custom",
  title: "Error words follow a pattern",
  purpose: "Switch between three errors written from three templates and see that each one names the field and says the fix.",
  limits:
    "The templates come from one design system's guidance on error messages. They are a good start, not the only way to write one. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Template",
    versions: [
      {
        id: "missing",
        label: "Missing",
        screen: screen("The Course field is empty and shows the error Enter a course.", "Start a group", { label: "Course", value: "", error: "Enter a course." }),
        verdict: { text: "Enter [what it is]", tone: "good" },
      },
      {
        id: "wrong",
        label: "Wrong",
        screen: screen("The Seats field holds 0 and shows the error Seats must be 1 or more.", "Start a group", { label: "Seats", value: "0", error: "Seats must be 1 or more." }),
        verdict: { text: "[What it is] must be [rule]", tone: "good" },
      },
      {
        id: "long",
        label: "Too long",
        screen: screen(
          "The Course field holds a very long name and shows the error Course must be 20 characters or less.",
          "Start a group",
          { label: "Course", value: "Data structures and algorithms", error: "Course must be 20 characters or less." }
        ),
        verdict: { text: "Must be [n] characters or less", tone: "good" },
      },
    ],
    hint: "Switch between the three templates and read each message.",
    start: "missing",
  }),
};
