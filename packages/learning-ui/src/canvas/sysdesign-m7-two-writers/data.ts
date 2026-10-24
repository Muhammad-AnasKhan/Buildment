import type { CustomCanvasSpec } from "../registry";
import { TwoWritersCanvas } from "./TwoWritersCanvas";

// 7.5 "Two writers, one row": nothing, a row lock or a version check, with a
// think time between each writer's read and write. Times are made up.
// Model: models/two-writers.ts.
export const sysdesignM7TwoWriters: CustomCanvasSpec = {
  kind: "custom",
  title: "Two writers, one row",
  purpose: "Two writers update one row. Choose nothing, a row lock or a version check, drag the think time, and watch lost updates, retries and the finish time.",
  limits: "Two writers only, and made-up times. With many writers, retries grow fast: challenge 6 measures it on PostgreSQL.",
  component: TwoWritersCanvas,
};
