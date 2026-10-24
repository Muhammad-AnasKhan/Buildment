import type { CustomCanvasSpec } from "../registry";
import { BandOverlapCanvas } from "./BandOverlapCanvas";

export const sysdesignBandOverlap: CustomCanvasSpec = {
  kind: "custom",
  title: "If the bands overlap, nobody knows the order",
  purpose: "Drag B's write; while its band overlaps A's, the clocks cannot prove which write came first.",
  limits: "Both clocks have the same epsilon, 4 ms. Real servers each have their own epsilon, and it changes between clock syncs.",
  component: BandOverlapCanvas,
};
