import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.4: the order of the Tab key through Halaqa's Start
// a group form (fictional). A number beside each control is the place where
// keyboard focus lands when the person presses Tab. In order, the numbers
// follow the page. In the broken versions a number jumps, or a control has no
// number because Tab never reaches it. Reading the numbers is the check, so it
// works on a phone with no keyboard.

type Fixed = { label: string; value: string; hint?: string };

const FIELDS: Fixed[] = [
  { label: "Course", value: "Data structures" },
  { label: "When", value: "Tonight 8 pm" },
  { label: "Where", value: "Library room 2" },
  { label: "Seats", value: "3" },
];

/** A numbered control: a pill with the Tab position beside the field. */
function numbered(pill: string, tone: "accent" | "bad", field: Fixed): SpecBlock {
  return {
    kind: "row",
    gap: 8,
    weights: [2, 9],
    children: [
      { kind: "pill", text: pill, tone },
      { kind: "field", label: field.label, value: field.value },
    ],
  };
}

function form(alt: string, order: number[], buttonPill: string, buttonTone: "accent" | "bad", focusOn: number): SpecScreen {
  // order[i] is the Tab number of FIELDS[i]; focusOn is the index of the field that has the ring.
  const rows = FIELDS.map((f, i) => {
    const block = numbered(String(order[i]), "accent", f);
    if (i === focusOn && block.kind === "row") {
      block.children[1] = { kind: "field", label: f.label, value: f.value, focus: true };
    }
    return block;
  });
  return {
    alt,
    gap: 8,
    blocks: [
      { kind: "nav", title: "Start a group" },
      ...rows,
      {
        kind: "row",
        gap: 8,
        weights: [2, 9],
        children: [
          { kind: "pill", text: buttonPill, tone: buttonTone },
          { kind: "button", label: "Start the group", full: true },
        ],
      },
    ],
  };
}

const IN_ORDER = form(
  "Halaqa's Start a group form with a Tab number beside each control: Course 1, When 2, Where 3, Seats 4, and the Start the group button 5. The numbers follow the page from top to bottom.",
  [1, 2, 3, 4],
  "5",
  "accent",
  0
);

const JUMPS = form(
  "The same form where the Tab numbers do not follow the page: Course 1, When 2, Where 4, Seats 3, and the Start the group button 5. Focus reaches Seats before Where.",
  [1, 2, 4, 3],
  "5",
  "accent",
  3
);

const SKIPPED = form(
  "The same form where the Start the group button has no Tab number, shown as none. Course is 1, When 2, Where 3 and Seats 4, but Tab never reaches the button.",
  [1, 2, 3, 4],
  "none",
  "bad",
  3
);

export const productM3TabOrder: CustomCanvasSpec = {
  kind: "custom",
  title: "Tab order through a form",
  purpose: "Switch between three versions of one form and read the Tab numbers to find the order that a keyboard user meets.",
  limits:
    "A real browser decides the order from the page code, and a person cannot see the numbers. They are drawn here so you can check the order by reading. A phone with no keyboard can still check it this way. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Order",
    versions: [
      { id: "order", label: "In order", screen: IN_ORDER, verdict: { text: "Tab order matches the page", tone: "good" } },
      { id: "jumps", label: "Jumps", screen: JUMPS, verdict: { text: "Seats comes before Where", tone: "bad" } },
      { id: "skipped", label: "Skipped", screen: SKIPPED, verdict: { text: "Tab never reaches the button", tone: "bad" } },
    ],
    hint: "Read the numbers from top to bottom. Do they count up in order?",
    start: "order",
  }),
};
