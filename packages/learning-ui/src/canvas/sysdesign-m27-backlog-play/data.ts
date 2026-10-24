import type { CustomCanvasSpec } from "../registry";
import { BacklogPlayCanvas } from "./BacklogPlayCanvas";

// 27.3 beat 5, "Drag the uploads, watch the backlog". Model: models/lamha-backlog.ts,
// which reuses the Module 2.5 knee model (models/server-load.ts) for how busy the
// machines are and for the dots. Course numbers: models/lamha-numbers.ts.
export const sysdesignM27BacklogPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the uploads, watch the backlog",
  purpose: "Drag the uploads a second for the busy hour and pick the number of transcode machines. In the busy hour the line grows by uploads minus capacity; afterwards it shrinks only by the spare capacity, and the wait at the end of the busy hour is the backlog divided by the capacity.",
  limits:
    "A simple model with no randomness: the busy hour runs at the rate you pick, the next two hours at the average of 5.8 uploads a second, and every video is one job of 15 worker-minutes, so a machine finishes a video every 900 seconds. Real uploads are random and videos vary in length, so lines also form below capacity (chapter 2.5). The picture leaves out fleets that scale with the line, cheaper machines that may be taken away, a limit on the line and a priority for short videos. The 10 minute target is the promise of chapter 27.1. A fleet of 15,625 machines matches the 17.4 peak almost exactly and is not on the rail, so the 16,000 stop stands for it.",
  component: BacklogPlayCanvas,
};
