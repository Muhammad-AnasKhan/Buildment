import type { CustomCanvasSpec } from "../registry";
import { IsolationLabCanvas } from "./IsolationLabCanvas";

// 7.4 "Interleave two transactions, change the level": four fixed stories and
// the outcome at each isolation level, taken from runs on PostgreSQL 18.6
// (2026-10-24). Model: models/isolation.ts.
export const sysdesignM7IsolationLab: CustomCanvasSpec = {
  kind: "custom",
  title: "Interleave two transactions, change the level",
  purpose: "Pick a story and an isolation level, then step two transactions forward one statement at a time and see which anomaly appears, or which error PostgreSQL gives.",
  limits: "Outcomes are PostgreSQL 18.6 behaviour in a two-transaction script. Other databases differ, and so do other timings.",
  component: IsolationLabCanvas,
};
