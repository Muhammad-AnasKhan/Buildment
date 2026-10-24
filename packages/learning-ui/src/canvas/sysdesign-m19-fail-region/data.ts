import type { CustomCanvasSpec } from "../registry";
import { FailRegionCanvas } from "./FailRegionCanvas";

// 19.4 beat 2, "Fail a region, compare the four". Model: ./model.ts.
export const sysdesignM19FailRegion: CustomCanvasSpec = {
  kind: "custom",
  title: "Fail a region, compare the four",
  purpose: "Pick a plan on the ladder, from backup and restore to active-active, then tap Region A to fail it. Downtime and lost writes fall and cost rises down the ladder; active-active removes the failover step and adds write conflicts.",
  limits: "Made-up step durations, write rate and costs. The order of the rungs comes from the AWS guide; the numbers do not.",
  component: FailRegionCanvas,
};
