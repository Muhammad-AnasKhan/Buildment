import type { CustomCanvasSpec } from "../registry";
import { ScalingPathCanvas } from "./ScalingPathCanvas";

// 7.6 "Grow the traffic, add the right step": made-up load arithmetic for an
// index, a cache, read replicas, partitions, a bigger machine and a search
// index. Illustrative, not a benchmark. Model: models/db-scaling.ts.
export const sysdesignM7ScalingPath: CustomCanvasSpec = {
  kind: "custom",
  title: "Grow the traffic, add the right step",
  purpose: "Drag the traffic up, see which database part is full, and add the step that takes load off that part. A step that does not touch the full part leaves it full.",
  limits: "All numbers are made up to show the reasoning, not a benchmark. Real databases differ, and real traffic is not 90% reads all day.",
  component: ScalingPathCanvas,
};
