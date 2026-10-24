import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 20.1 beat 2: Wasla's estimate drawn as two chains from one card.
// Model: models/wasla-estimate.ts. Course numbers: models/wasla-numbers.ts.
export const sysdesignM20EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the volume, find the load",
  purpose: "Change the new links a month, the reads per link or the years kept and watch two chains update, from creates and redirects a second to storage, with a ring on the number that drives the design.",
  limits:
    "Wasla is made up and every input is a course assumption. A month is 30 days, the busiest second is fixed at 5 times the average, a link takes 300 bytes, and 1 TB is 1,000 GB. The picture leaves out indexes, copies for safety, backups, growth during the years and the clicks Wasla counts. The 5 TB and 2,500 a second marks that decide the ring are rules of thumb for this picture, not limits of any real machine.",
  component: EstimatePlayCanvas,
};
