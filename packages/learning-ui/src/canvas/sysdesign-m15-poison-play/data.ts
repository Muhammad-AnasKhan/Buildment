import type { CustomCanvasSpec } from "../registry";
import { PoisonPlayCanvas } from "./PoisonPlayCanvas";

// 15.5 beat 2, "Wait in place, or park it". Model: ./model.ts.
export const sysdesignM15PoisonPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Wait in place, or park it",
  purpose: "One bad message in an ordered line of 1,000. Retry it in place and everything behind it waits for ever; switch on a dead letter queue with a retry limit and the message is parked so the line moves on. A limit that is too low parks a message that was only flaky.",
  limits:
    "One partition handled in order by one consumer. A good message takes 50 ms, a failed try 50 ms, followed by a wait of 1 second: course numbers. The model has a single bad message (number 10) and all 1,000 are already in the line, so the clock counts from the start. The picture tells about a minute of model time in a few seconds: it shows the first 22 messages one by one and the rest as a bar. Real systems add jitter and backoff to the wait (chapter 15.5), and SQS parks a message by counting how often it was received, not how often it failed.",
  component: PoisonPlayCanvas,
};
