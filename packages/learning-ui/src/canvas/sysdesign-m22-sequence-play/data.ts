import type { CustomCanvasSpec } from "../registry";
import { SequencePlayCanvas } from "./SequencePlayCanvas";

// 22.4 beat 2: one counter per conversation sets the order. Model: models/dardasha-order.ts.
export const sysdesignM22SequencePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "One counter per conversation sets the order",
  purpose: "Tap Send for Dana and Omar, drag the delay on the slow path to Sami, and switch the phones between sorting by arrival and sorting by the number the chat service gave each message. By arrival the phones can disagree; by number they never do, at the price of a short hold.",
  limits:
    "Dana, Omar, Layla and Sami are made up, and so are the delays: each sender is 30 ms from the service, which is 40 ms from Layla, and Omar's or Dana's second message follows 100 ms after the first. The model has no randomness and only one slow path, and it numbers messages with one counter that never fails. It leaves out lost messages, a phone that asks the service for a missing number, several chat servers and groups of more than two writers.",
  component: SequencePlayCanvas,
};
