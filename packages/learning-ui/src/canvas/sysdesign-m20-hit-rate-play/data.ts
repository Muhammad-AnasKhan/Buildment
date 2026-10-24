import type { CustomCanvasSpec } from "../registry";
import { HitRatePlayCanvas } from "./HitRatePlayCanvas";

// 20.4 beat 2: the hit rate against average time, p99 and database nodes.
// Model: models/wasla-read-path.ts. Course numbers: models/wasla-numbers.ts.
export const sysdesignM20HitRatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the hit rate, watch the database",
  purpose: "Drag the cache hit rate from 0 to 99 percent and watch the average time slide, p99 jump only at 99, and the database load and node count follow the misses.",
  limits:
    "Course numbers, not measurements: a hit costs 0.55 ms and a miss 3.05 ms at the redirect service, the peak is 100,000 redirects and 1,000 creates a second, and one database node is planned for 2,500 operations a second. The picture assumes every miss is one database read and every request is equally likely to hit. It leaves out network time to the phone, cache memory cost, a cold start, popular codes that miss more often and the price of more nodes.",
  component: HitRatePlayCanvas,
};
