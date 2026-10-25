import type { CustomCanvasSpec } from "../registry";
import { DedupeFlowCanvas } from "./DedupeFlowCanvas";

// 14.5 beat "Count the copies, with and without a table". Model: models/dedupe-flow.ts.
// 100 messages; a = chance an ack is lost, c = chance of a crash between the work and the record.
// No dedupe: 100 / (1 - a). Separate table: 100 / (1 - c). Same transaction: 100.
export const sysdesignM14DedupeFlow: CustomCanvasSpec = {
  kind: "custom",
  title: "Count the copies, with and without a table",
  purpose: "Pick how a consumer protects itself and drag how often an ack is lost, and count the effects against the 100 expected.",
  limits:
    "Expected values for 100 messages, rounded to whole numbers; a real run varies around them (the challenge 13 run of 300 messages landed within about 10 of the formula). One effect per message, one consumer, and a lost ack and a crash in the gap are treated as separate events. The number of copies drawn is a simple estimate: lost acks bring a message again, and so does a crash in the gap. Real brokers add timeouts, ordering and batches.",
  component: DedupeFlowCanvas,
};
