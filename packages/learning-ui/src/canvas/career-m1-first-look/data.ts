import type { CustomCanvasSpec } from "../registry";
import type { StackBlock } from "../models/budget-stack";
import { makeBudgetStackCanvas } from "../primitives/canvas-factories";
import type { BudgetStackConfig } from "../primitives/budget-stack";

// Course 16 (career-brand), module 1, chapter 1.2 beat 3: Bashar's resume as
// a reader sees it on a phone. A quick first look runs out before the proof;
// moving the two proof blocks up lets the reader see them. The 12 seconds and
// the block costs are illustrative, not measured. Bashar is fictional.

export const FIRST_LOOK_BLOCKS: StackBlock[] = [
  { id: "objective", label: "Objective: hard-working developer seeking growth", cost: 4, kind: "filler" },
  { id: "skills", label: "Skills: 24 tools in a list", cost: 5, kind: "context" },
  { id: "education", label: "Education", cost: 3, kind: "context" },
  { id: "order-api", label: "Order API: p95 from 1.9 s to 0.4 s", cost: 4, kind: "proof" },
  { id: "demo", label: "Live demo and case study link", cost: 3, kind: "proof" },
  { id: "hobbies", label: "Hobbies", cost: 2, kind: "filler" },
];

export const FIRST_LOOK_CONFIG: BudgetStackConfig = {
  blocks: FIRST_LOOK_BLOCKS,
  budget: 12,
  unit: "s",
  budgetLabel: "A quick first look (illustrative)",
  goal: 2,
  hint: "Tap a block, then move it up or down. Or drag it.",
};

export const careerM1FirstLook: CustomCanvasSpec = {
  kind: "custom",
  title: "Your first screen decides what they see",
  purpose: "A quick first look spends its time top to bottom on Bashar's resume; the learner moves blocks so the two proof blocks are seen before the time runs out.",
  limits:
    "The 12 seconds and the cost of each block are illustrative. Real readers differ, some read every line and some skip around, and no study gives a fixed number of seconds. A block counts as seen here when the time covers at least half of it. Bashar is fictional.",
  component: makeBudgetStackCanvas(FIRST_LOOK_CONFIG),
};
