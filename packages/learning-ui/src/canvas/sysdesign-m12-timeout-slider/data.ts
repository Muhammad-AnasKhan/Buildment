import type { CustomCanvasSpec } from "../registry";
import { TimeoutSliderCanvas } from "./TimeoutSliderCanvas";

// 12.2 ("Why agreement is hard"), beat 2 "Drag the timeout, watch the price".
// Model: models/failure-timeout.ts.
export const sysdesignM12TimeoutSlider: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the failure timeout",
  purpose: "Drag the failure timeout and watch false alarms an hour and the time to notice a real crash trade against each other.",
  limits:
    "A node sends a beat every 1,000 ms and each beat takes 10 ms plus a random extra with a mean of 30 ms. Real networks have bursts, pauses and lost beats, which this picture leaves out, so read the shape (a steep fall, then flat) and not the exact counts. The 40 bars are one fixed random run and start at 850 ms; the two big numbers come from the formula, not from the bars.",
  component: TimeoutSliderCanvas,
};
