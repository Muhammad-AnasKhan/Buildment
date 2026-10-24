import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 26.1 beat 2: DalilBot's estimate drawn as two chains from one card.
// Model: models/crawl-estimate.ts. Course numbers: models/crawl-numbers.ts.
export const sysdesignM26EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the volume, find the load",
  purpose: "Change the pages a month, the page size or the wait between requests to one site and watch two chains update, from pages a second to sites busy at once, data coming in and storage, with a ring on the number that drives the design.",
  limits:
    "DalilBot is made up and every input is a course assumption. A month is 30 days, a fetch takes 0.5 seconds, a page has 50 links, pages are stored compressed 4 to 1, and 1 KB is 1,000 bytes. The picture leaves out the busiest second being busier than the average, robots.txt fetches, repeat visits to the same page and copies for safety. The 5,000 Mbit/s, 100 sites and 20 TB marks that decide the ring are rules of thumb for this picture, not limits of any real machine.",
  component: EstimatePlayCanvas,
};
