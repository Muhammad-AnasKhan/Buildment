import type { CustomCanvasSpec } from "../registry";
import { ShardsPlayCanvas } from "./ShardsPlayCanvas";

// 27.5 beat 3: the views of one video spread over shard rows.
// Model: models/lamha-shards.ts. Course numbers: models/lamha-numbers.ts.
export const sysdesignM27ShardsPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the views, count the shards",
  purpose: "Drag the views a second for one video and the number of shards and watch each shard box fill toward the 1,000 writes a second a row can take, with the fewest shards that fit the plan marked and the cost of a full read written under the row.",
  limits:
    "The views are spread evenly over the shards, a simplification: with a random choice the busiest shard in a second is a little above the average. A row takes at most 1,000 write units a second [S40] and is planned at half, 500; both are course numbers for this picture. The picture leaves out bursts inside a second, a shard that is slower than the others, the merge job that adds the shards up and the cost of storing more rows.",
  component: ShardsPlayCanvas,
};
