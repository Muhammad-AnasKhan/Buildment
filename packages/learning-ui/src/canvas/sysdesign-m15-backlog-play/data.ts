import type { CustomCanvasSpec } from "../registry";
import { BacklogPlayCanvas } from "./BacklogPlayCanvas";

// 15.2 beat 3, "Drag the burst, watch the line". Model: ./model.ts, which
// reuses the Module 2.5 knee model (models/server-load.ts) for how busy the
// workers are and for the job dots.
export const sysdesignM15BacklogPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the burst, watch the line",
  purpose: "Drag the burst rate and pick the number of workers. While the burst lasts the line grows by arrivals minus capacity; afterwards it shrinks only by the spare capacity. With too few workers it never shrinks, and a queue limit refuses jobs instead.",
  limits:
    "A simple model with no randomness: 150 jobs a second normally, a burst from second 30 to 90, and workers that each finish exactly 40 jobs a second. Real arrivals are random, so lines also form below capacity (chapter 2.5), and real jobs vary in length. Read it for the shape (the line outlives the burst) and not for exact seconds. The 5,000 limit and the 25 ms per job are course numbers. The chart stops at 420 seconds; a longer drain runs off the right edge.",
  component: BacklogPlayCanvas,
};
