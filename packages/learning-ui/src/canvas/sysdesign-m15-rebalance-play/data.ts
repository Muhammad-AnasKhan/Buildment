import type { CustomCanvasSpec } from "../registry";
import { RebalancePlayCanvas } from "./RebalancePlayCanvas";

// 15.3 beat 3, "Add a consumer, watch the partitions move". Model: ./model.ts.
export const sysdesignM15RebalancePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Add a consumer, watch the partitions move",
  purpose: "Pick how many consumers are in the group. Each partition goes to exactly one consumer, so the group's top speed rises in steps and consumers beyond the six partitions sit idle.",
  limits:
    "Six partitions with one sixth of the load each, round-robin assignment, and a consumer that does 100 events a second whatever it holds. Real assignors can choose differently (Kafka has several), and real partitions are rarely equal. The 450 events a second offered and the 1 second pause are course numbers; a real rebalance takes as long as the group needs to agree.",
  component: RebalancePlayCanvas,
};
