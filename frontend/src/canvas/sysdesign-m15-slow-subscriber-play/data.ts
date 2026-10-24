import type { CustomCanvasSpec } from "../registry";
import { SlowSubscriberPlayCanvas } from "./SlowSubscriberPlayCanvas";

// 15.7 beat 2, "One slow subscriber, two designs". Model: ./model.ts.
export const sysdesignM15SlowSubscriberPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "One slow subscriber, two designs",
  purpose: "Drag Receipts' speed down. When the order service calls every subscriber in turn, one slow subscriber slows every order. With a queue for each subscriber, orders stay fast and only the slow subscriber's queue grows.",
  limits:
    "A steady 20 orders a second, no randomness, and fixed times: Email and Stats need 33.3 ms per event, Receipts needs 1,000 divided by its speed, the order service has a pool of 5 workers and writing an event to a queue takes 5 ms. All course numbers. The counts show the state after 10 minutes of that steady load, worked out by the formulas, not by a run. Real subscribers vary in speed, and real queues add a small delay and a cost of their own.",
  component: SlowSubscriberPlayCanvas,
};
