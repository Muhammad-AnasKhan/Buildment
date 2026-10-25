import type { CustomCanvasSpec } from "../registry";
import type { StackBlock } from "../models/budget-stack";
import { makeBudgetStackCanvas } from "../primitives/canvas-factories";
import type { BudgetStackConfig } from "../primitives/budget-stack";

// Course 16 (career-brand), module 6, chapter 6.5 beat 4: Pick a posting, watch the order change.

export const POSTING_BLOCKS: StackBlock[] = [
  {
    "id": "summary",
    "label": "Summary: a full-stack developer who measures",
    "cost": 2,
    "kind": "context",
    "note": "Her general summary line."
  },
  {
    "id": "invoice",
    "label": "Invoice script: about 3 hours a week saved",
    "cost": 3,
    "kind": "context",
    "note": "True, but not what this posting asks for."
  },
  {
    "id": "key",
    "label": "Replaced a leaked key; push protection on",
    "cost": 3,
    "kind": "context",
    "note": "True, and good for another posting."
  },
  {
    "id": "volunteer",
    "label": "Volunteer: club sign-up form and migration",
    "cost": 3,
    "kind": "context",
    "note": "True, but it sits above Campus Board today."
  },
  {
    "id": "report",
    "label": "Cut a report's p95 from 4.6 s to 0.41 s",
    "cost": 3,
    "kind": "proof",
    "note": "Matches a posting that asks for PostgreSQL speed."
  },
  {
    "id": "campus",
    "label": "Campus Board load test: p95 820 to 95 ms",
    "cost": 3,
    "kind": "proof",
    "note": "A second proof of measured speed work."
  }
];

export const POSTING_CONFIG: BudgetStackConfig = {
  blocks: POSTING_BLOCKS,
  budget: 10,
  unit: "lines",
  budgetLabel: "First screen (illustrative)",
  goal: 2,
  hint: "Tap a block, then move it up or down. Or drag it.",
};

export const careerM6PickAPosting: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick a posting, watch the order change",
  purpose: "Areej's untailored resume fills its first screen with the summary, the invoice script, the key fix and the club form. The posting asks for database speed work. The learner moves the report bullet and the load-test bullet up so the reader sees them.",
  limits: "The 10 lines and the size of each block are illustrative. A block counts as seen when the first screen covers at least half of it. Every block is a real ledger row; none is dropped, they only move. Areej is a fictional fellow.",
  component: makeBudgetStackCanvas(POSTING_CONFIG),
};
