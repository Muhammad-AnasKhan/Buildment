import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 27.1 beat 2: Lamha's estimate drawn as three chains.
// Model: models/lamha-estimate.ts. Course numbers: models/lamha-numbers.ts.
export const sysdesignM27EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the views, find the load",
  purpose: "Change the views a day, the minutes watched or the uploads a day and watch three chains update, from views a second to video sent at peak, storage a year and busy transcoding machines, with a ring on the number that drives the design.",
  limits:
    "Lamha is made up and every input is a course assumption: an average of 2 Mbit/s sent to a viewer, a busiest second of 3 times the average, 739 MB stored for each video (the source plus five versions) and 15 worker-minutes to make them. Bit rates and the ladder are listed as source needed in the chapter. The picture leaves out copies for safety, growth during the year, viewers who leave early, live video and the cost of a CDN. The 1 Tbit/s, 10 PB and 1,000 machine marks that decide the ring are rules of thumb for this picture.",
  component: EstimatePlayCanvas,
};
