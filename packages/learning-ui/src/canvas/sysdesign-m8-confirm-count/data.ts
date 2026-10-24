import type { CustomCanvasSpec } from "../registry";
import { ConfirmCountCanvas } from "./ConfirmCountCanvas";

// 8.3 beat 3: the leader waits for 0, 1 or 2 followers before it says OK.
// West is 60 ms and EU 80 ms round trip, the disk write 0.3 ms [S3]; 500 writes
// a second is made up. Model: ./model.ts.
export const sysdesignM8ConfirmCount: CustomCanvasSpec = {
  kind: "custom",
  title: "How many followers must confirm?",
  purpose: "Drag the OK marker to wait for none, one or two followers and watch the write time, the copies at OK and the writes at risk; switch off West to see writes stall.",
  limits: "Leaves out disk contention, queueing and jitter. Write rate, copy times and the 500 a second are made up. Only confirmed copies count: a follower may hold the write a little earlier, but the leader cannot rely on it until it hears back.",
  component: ConfirmCountCanvas,
};
