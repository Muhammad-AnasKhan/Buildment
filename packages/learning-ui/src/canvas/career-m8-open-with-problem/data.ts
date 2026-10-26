import type { CustomCanvasSpec } from "../registry";
import type { StackBlock } from "../models/budget-stack";
import { makeBudgetStackCanvas } from "../primitives/canvas-factories";
import type { BudgetStackConfig } from "../primitives/budget-stack";

// Course 16 (career-brand), 8.2 beat 3: Areej's post paragraphs; the learner moves the problem and the result above the history. Lines and sizes are illustrative.
// Fictional people only. No dashes.

export const OPEN_WITH_PROBLEM_BLOCKS: StackBlock[] = [
  {
    id: "history",
    label: "How the project began",
    cost: 4,
    kind: "filler",
    note: "Real, but the reader did not ask yet."
  },
  {
    id: "thanks",
    label: "Thanks to everyone who helped",
    cost: 2,
    kind: "filler",
    note: "Kind. It can go at the end."
  },
  {
    id: "setup",
    label: "The test set-up in detail",
    cost: 4,
    kind: "context",
    note: "Needed, but after the reader cares."
  },
  {
    id: "problem",
    label: "The problem: a slow events list",
    cost: 3,
    kind: "proof",
    note: "The reader's question starts here."
  },
  {
    id: "result",
    label: "The result: p95 820 ms to 95 ms",
    cost: 3,
    kind: "proof",
    note: "p95 is the time that 95 of every 100 requests finish within."
  },
  {
    id: "tradeoff",
    label: "The trade-off: lists up to 30 s old",
    cost: 3,
    kind: "context",
    note: "The honest cost of the cache."
  }
];

export const OPEN_WITH_PROBLEM_CONFIG: BudgetStackConfig = {
  blocks: OPEN_WITH_PROBLEM_BLOCKS,
  budget: 10,
  unit: "lines",
  budgetLabel: "A busy reader (example)",
  goal: 2,
  hint: "Tap a paragraph, then move it up or down. Or drag it.",
};

export const careerM8OpenWithProblem: CustomCanvasSpec = {
  kind: "custom",
  title: "Start where the reader's question is",
  purpose: "Six paragraphs of Areej's post are in an order that opens with the history and the thanks. A busy reader runs out of room before the problem and the result. The learner moves them to the top.",
  limits: "The 10 lines and the length of each paragraph are illustrative. Real readers differ and no study gives an ideal opening length. A paragraph counts as read when the room covers at least half of it.",
  component: makeBudgetStackCanvas(OPEN_WITH_PROBLEM_CONFIG),
};
