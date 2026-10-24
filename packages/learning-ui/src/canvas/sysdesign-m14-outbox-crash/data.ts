import type { CustomCanvasSpec } from "../registry";
import { OutboxCrashCanvas } from "./OutboxCrashCanvas";

// 14.4 beat "Crash between the two writes". Model: models/outbox-crash.ts.
export const sysdesignM14OutboxCrash: CustomCanvasSpec = {
  kind: "custom",
  title: "Crash between the two writes",
  purpose: "Pick how an order is saved and announced, and where the crash falls, then count the events that reach the broker and whether the order exists.",
  limits:
    "One order and one crash at a time. The outbox case assumes the relay runs again after the crash and finds the unsent row; the 'after publish' case shows the relay publishing a second time because it never marked the row sent. Real relays poll or read the database log, and real brokers may drop or reorder messages. The 500-order run in challenge 13 is the measured version: 64 events missing for the dual write, 0 missing and 103 repeats for the outbox.",
  component: OutboxCrashCanvas,
};
