import type { CustomCanvasSpec } from "../registry";
import { FanoutPlayCanvas } from "./FanoutPlayCanvas";

// 21.3 beat 5: drag the line between push and pull across five account groups.
// Model: models/fanout-line.ts. Course numbers: models/feed-numbers.ts.
export const sysdesignM21FanoutPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the line between push and pull",
  purpose: "Drag a line across five groups of accounts, from everyday to celebrity, to choose which are pushed into followers' timelines and which are pulled when someone looks, and watch the timeline writes and the share of slow feed opens against their limits.",
  limits:
    "The five groups are a made-up composite shaped like a real social graph, with 100 million accounts, 15 billion follows and about 9.9 million posts a day, and no company's graph is claimed. Writes are counted at 3 times the average against a fleet planned for 150,000 timeline writes a second. Each lookup is slow 1% of the time, independently, so a feed open with n lookups meets a slow one with probability 1 minus 0.99 to the power n. The 20% limit on slow feed opens is a course choice. The picture leaves out the merge cost, caching of the star lists, retries and queues for big accounts.",
  component: FanoutPlayCanvas,
};
