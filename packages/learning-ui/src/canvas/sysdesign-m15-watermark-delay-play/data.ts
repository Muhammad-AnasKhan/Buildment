import type { CustomCanvasSpec } from "../registry";
import { WatermarkDelayPlayCanvas } from "./WatermarkDelayPlayCanvas";

// 15.6 beat 4, "Drag the delay: fast or complete". Model: ./model.ts.
export const sysdesignM15WatermarkDelayPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the delay: fast or complete",
  purpose: "Drag the watermark delay. A short delay closes windows soon but drops late events; a long delay keeps more events but every result comes later. Switch on allowed lateness and the dropped events become late corrections.",
  limits:
    "Forty made-up events in two tumbling windows of 60 s, with fixed arrival times, so the counts are exact for this example only: real lateness is random. The watermark is the newest event time seen minus the delay, as in the code exercise of chapter 15.8; real engines also have idle sources and several streams to combine. The delay is how far behind every result runs, which is the cost of waiting. The dots are placed by event time (across) and by how late they arrived (up).",
  component: WatermarkDelayPlayCanvas,
};
