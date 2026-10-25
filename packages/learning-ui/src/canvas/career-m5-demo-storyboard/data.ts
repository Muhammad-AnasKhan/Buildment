import type { CustomCanvasSpec } from "../registry";
import type { StackBlock } from "../models/budget-stack";
import { makeBudgetStackCanvas } from "../primitives/canvas-factories";
import type { BudgetStackConfig } from "../primitives/budget-stack";

// Course 16 (career-brand), module 5, chapter 5.4 beat 2: Cut the filler, keep the core.
// Six storyboard frames against a 90 second demo; reorder so the three core frames fit. The 60 to 120 second range is course method.

export const DEMO_STORYBOARD_BLOCKS: StackBlock[] = [
  {
    id: "logo",
    label: "Logo intro",
    cost: 10,
    kind: "filler",
    note: "Nothing to see yet."
  },
  {
    id: "signup",
    label: "Sign-up",
    cost: 20,
    kind: "filler",
    note: "The reader does not need to see this."
  },
  {
    id: "tour",
    label: "Tour of the settings",
    cost: 25,
    kind: "filler",
    note: "A tour of menus proves little."
  },
  {
    id: "warning",
    label: "The low-stock warning",
    cost: 15,
    kind: "proof",
    note: "The payoff. It should come first."
  },
  {
    id: "sale",
    label: "Recording a sale",
    cost: 20,
    kind: "proof",
    note: "The core flow, with the stock going down."
  },
  {
    id: "invoice",
    label: "The invoice export",
    cost: 15,
    kind: "proof",
    note: "What the shop owner gets at the end."
  }
];

export const DEMO_STORYBOARD_CONFIG: BudgetStackConfig = {
  blocks: DEMO_STORYBOARD_BLOCKS,
  budget: 90,
  unit: "s",
  budgetLabel: "Demo length (course rule)",
  goal: 3,
  hint: "Tap a frame, then move it up or down. Or drag it.",
};

export const careerM5DemoStoryboard: CustomCanvasSpec = {
  kind: "custom",
  title: "Cut the filler, keep the core",
  purpose: "Six storyboard frames for Raqim Stock's demo have a running time. The first 90 seconds are kept, the rest is cut. The learner moves the three core frames up so the warning, the sale and the invoice all make the cut.",
  limits: "The frame lengths and the 90 seconds are illustrative. The 60 to 120 second range is a course rule, not a research finding. A frame counts as kept when the demo covers at least half of it. Areej is a fictional fellow.",
  component: makeBudgetStackCanvas(DEMO_STORYBOARD_CONFIG),
};
