import type { CustomCanvasSpec } from "../registry";
import { HostRatePlayCanvas } from "./HostRatePlayCanvas";

// 26.3 beat 3: the crawl speed is the smaller of two limits. Model:
// models/crawl-host-rate.ts. Course numbers: models/crawl-numbers.ts.
export const sysdesignM26HostRatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Sites in play set the speed",
  purpose: "Drag the number of sites with work waiting and the wait between requests to one site. The speed is the smaller of sites divided by the wait and the download slots divided by the fetch time, and a card shows how long one big site takes.",
  limits:
    "DalilBot is made up. The picture assumes every site with work waiting always has a page ready, exactly one request a wait for each site, 800 download slots and a fetch of 0.4 seconds, so the slots allow 2,000 pages a second. It leaves out sites that answer slowly or refuse, robots.txt delays longer than the default, the time to fetch robots.txt itself and the cost of keeping the sites' queues. At most 24 site icons are drawn: the number beside the title gives the true count, and the dots show the pace of one site, not the total.",
  component: HostRatePlayCanvas,
};
