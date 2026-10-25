import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 24.1 beat 2: Safar's estimate drawn as chains from the drivers and the riders.
// Model: models/safar-estimate.ts.
export const sysdesignM24EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the crowd, find the load",
  purpose: "Change the drivers online, the seconds between reports or the riders with the app open and watch the chains update, from location reports and searches to bandwidth and the places held in memory, with a ring on the number that drives the design.",
  limits:
    "Safar is made up and every input is a course assumption. A report is 50 bytes, the latest place of a driver is 100 bytes, a rider's map refreshes every 5 seconds, there are 10 million rides a day and the busiest second is 5 times the average. The picture leaves out replies, headers, retries, growth and the drivers who are online but not moving. The 25,000 and 10,000 a second marks that decide the ring are rules of thumb for this picture, not limits of any real machine.",
  component: EstimatePlayCanvas,
};
