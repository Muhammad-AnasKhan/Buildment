import type { CustomCanvasSpec } from "../registry";
import { CachePathCanvas } from "./CachePathCanvas";

// 5.2 "Add up the path". Model: models/cache-path.ts.
export const sysdesignM5CachePath: CustomCanvasSpec = {
  kind: "custom",
  title: "Add up the path from shopper to database",
  purpose: "Drag the hit rate of the edge, the app's memory and Valkey, and watch two numbers: the time added after the edge and the queries a second that reach the database.",
  limits:
    "Matjar is a fictional shop, so the traffic (1,000 page views a second) and the page (5 queries of 0.5 ms) are story numbers. The 160 ms trip and the 0.5 ms Valkey read are course examples; napkin numbers like these can be 2 to 3 times off. The trip from the phone to the edge is left out, because every shopper pays it whether or not a cache hits. Each page is one request, and each layer's hit rate is independent of the others.",
  component: CachePathCanvas,
};
