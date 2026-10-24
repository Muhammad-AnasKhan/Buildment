import type { CustomCanvasSpec } from "../registry";
import { HotPartitionCanvas } from "./HotPartitionCanvas";

// 13.4 beat 5, A hot partition stays capped. Model: ./model.ts.
export const sysdesignM13HotPartition: CustomCanvasSpec = {
  kind: "custom",
  title: "A hot partition stays capped",
  purpose: "Drag the hot key's writes per second. Without adaptive capacity its partition is held to an even share and the rest is rejected; with it, the partition can borrow spare capacity up to its own ceiling, and no further.",
  limits:
    "Made-up table: 2,000 write units shared evenly by four partitions, and 200 writes a second on each of the other three. Real tables, and the way spare throughput is lent out, are described in the DynamoDB documentation. The 1,000 writes per second ceiling is the published design limit.",
  component: HotPartitionCanvas,
};
