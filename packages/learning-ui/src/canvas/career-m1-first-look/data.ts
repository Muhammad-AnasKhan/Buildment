import type { CustomCanvasSpec } from "../registry";
import type { StackBlock } from "../models/budget-stack";
import { makeBudgetStackCanvas } from "../primitives/canvas-factories";
import type { BudgetStackConfig } from "../primitives/budget-stack";

// Course 16 (career-brand), module 1, chapter 1.2 beat 3: Bashar's resume as
// a phone shows it. The first screen runs out before the proof; moving the two
// proof blocks up lets the reader see them. The unit is lines of a phone
// screen, not seconds. The 10 lines and the block sizes are illustrative.
// Bashar is a fictional fellow. No number is added to the import line.

export const FIRST_LOOK_BLOCKS: StackBlock[] = [
  { id: "name", label: "Name and contact line", cost: 2, kind: "context" },
  { id: "objective", label: "Objective paragraph, AI-written", cost: 5, kind: "filler", note: "A paragraph about being motivated." },
  { id: "skills", label: "Skills: 28 technologies in a block", cost: 5, kind: "context", note: "Twenty-eight names, no order." },
  { id: "duties", label: "Responsible for backend services", cost: 2, kind: "filler", note: "A duty, not a result." },
  { id: "import", label: "Moved the nightly import into a queue; it stopped timing out", cost: 3, kind: "proof", note: "His best work. Today it sits on page 2." },
  { id: "link", label: "One labelled link to the import code", cost: 1, kind: "proof", note: "One link that says what the reader will see." },
];

export const FIRST_LOOK_CONFIG: BudgetStackConfig = {
  blocks: FIRST_LOOK_BLOCKS,
  budget: 10,
  unit: "lines",
  budgetLabel: "First screen (illustrative)",
  goal: 2,
  hint: "Tap a block, then move it up or down. Or drag it.",
};

export const careerM1FirstLook: CustomCanvasSpec = {
  kind: "custom",
  title: "Your first screen decides what they see",
  purpose: "Bashar's resume as a phone shows it. A first screen runs out before the proof; the learner moves the two proof blocks up so the reader sees them.",
  limits:
    "The 10 lines and the size of each block are illustrative. Real readers differ: some read every line, some skip around, and no study gives a fixed time. A block counts as seen here when the first screen covers at least half of it. Bashar is a fictional fellow.",
  component: makeBudgetStackCanvas(FIRST_LOOK_CONFIG),
};
