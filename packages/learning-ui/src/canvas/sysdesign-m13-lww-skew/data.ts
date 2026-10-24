import type { CustomCanvasSpec } from "../registry";
import { LwwSkewCanvas } from "./LwwSkewCanvas";

// 13.5 beat 3, Drag the skew and count wrong winners. Model: ./model.ts.
export const sysdesignM13LwwSkew: CustomCanvasSpec = {
  kind: "custom",
  title: "Clock skew and last write wins",
  purpose: "Drag the clock skew and the gap between two writes, and count out of 20 pairs how many times last write wins keeps the wrong write. Switch to Concurrent and one write is lost whatever the clocks say.",
  limits:
    "Two nodes and two writes. Skew is the gap between two clocks right now; real clocks change as they drift and as they are synced (chapter 10.2). The 20 pairs are an illustration, not a measurement.",
  component: LwwSkewCanvas,
};
