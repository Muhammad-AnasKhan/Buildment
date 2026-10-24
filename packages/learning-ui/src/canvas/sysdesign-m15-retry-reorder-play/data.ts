import type { CustomCanvasSpec } from "../registry";
import { RetryReorderPlayCanvas } from "./RetryReorderPlayCanvas";

// 15.4 beat 3, "A retry can swap two events". Model: ./model.ts.
export const sysdesignM15RetryReorderPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "A retry can swap two events",
  purpose: "Make the first send fail and watch the retry land after the second update, so the log holds them in the wrong order. Then send one at a time, or number the updates, and the order holds.",
  limits:
    "One producer, one key and one partition. A write takes 5 ms, an ack another 5 ms and the producer's timeout is 50 ms: course numbers, chosen so the picture is readable. The dots fly one message after another so you can follow them; the axis carries the real times. Real brokers have more settings (Kafka's idempotent producer, for example, detects duplicates with sequence numbers), and what they promise about order with several sends in flight depends on the version, so check the documentation.",
  component: RetryReorderPlayCanvas,
};
