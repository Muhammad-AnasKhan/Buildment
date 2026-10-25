import type { CustomCanvasSpec } from "../registry";
import { DesignStepperCanvas } from "./DesignStepperCanvas";

// 26.2 beat 3: DalilBot's design stepped at peak. Model: models/crawl-design.ts,
// which feeds the house design stepper. Course numbers: models/crawl-numbers.ts.
export const sysdesignM26DesignStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Step through the design at peak",
  purpose: "Five steps take DalilBot's design from one fetcher to many downloads in flight, a DNS cache, a frontier split into shards and page storage, with a pill showing the machines, memory or storage each step needs.",
  limits:
    "DalilBot is made up and its numbers are course assumptions: 772 pages a second, a fetch of 0.5 seconds (0.4 with a DNS cache), 100 downloads in flight on a machine planned at half its limit, a 24 GB Bloom filter and 38,580 link checks a second shared by the shards. The picture leaves out the cost of more nodes, uneven shards (one very big site), machines that fail, robots.txt and the queue between the frontier and the fetchers. The dots only show the direction of the work.",
  component: DesignStepperCanvas,
};
