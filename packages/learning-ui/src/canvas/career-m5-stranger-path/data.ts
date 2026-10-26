import type { CustomCanvasSpec } from "../registry";
import type { StackBlock } from "../models/budget-stack";
import { makeBudgetStackCanvas } from "../primitives/canvas-factories";
import type { BudgetStackConfig } from "../primitives/budget-stack";

// Course 16 (career-brand), module 5, chapter 5.2 beat 3: The stranger's path to a first screen.
// Reorder a stranger's path so a page that needs nothing comes before the sleeping demo and the sign-up. The unit is taps, not seconds.

export const STRANGER_PATH_BLOCKS: StackBlock[] = [
  {
    id: "asleep",
    label: "Demo link opens a sleeping app",
    cost: 2,
    kind: "filler",
    note: "A free plan can take about a minute to wake."
  },
  {
    id: "signup",
    label: "Sign-up form",
    cost: 2,
    kind: "filler",
    note: "Many strangers will not make an account."
  },
  {
    id: "confirm",
    label: "Email confirmation step",
    cost: 2,
    kind: "filler",
    note: "One more door to leave by."
  },
  {
    id: "case",
    label: "Case study page, no login",
    cost: 1,
    kind: "proof",
    note: "Opens on a phone and shows the result."
  },
  {
    id: "shot",
    label: "Screenshot of the core flow",
    cost: 1,
    kind: "proof",
    note: "A picture works while the demo sleeps."
  },
  {
    id: "demo-login",
    label: "Demo login: one button",
    cost: 1,
    kind: "context",
    note: "A ready login with fake data."
  }
];

export const STRANGER_PATH_CONFIG: BudgetStackConfig = {
  blocks: STRANGER_PATH_BLOCKS,
  budget: 3,
  unit: "taps",
  budgetLabel: "Stranger's patience (example)",
  goal: 2,
  hint: "Tap a block, then move it up or down. Or drag it.",
};

export const careerM5StrangerPath: CustomCanvasSpec = {
  kind: "custom",
  title: "The stranger's path to a first screen",
  purpose: "A stranger follows a link and spends a few taps of patience. A sleeping demo and a sign-up use them all. The learner moves the case study page and a screenshot to the front so a useful screen comes first.",
  limits: "The three taps and the cost of each step are illustrative, not measured. Real strangers differ and no study gives a fixed patience. A step counts as reached when the budget covers at least half of it. Free plans sleep and change; check the plan page the week you publish (checked 2026-10).",
  component: makeBudgetStackCanvas(STRANGER_PATH_CONFIG),
};
