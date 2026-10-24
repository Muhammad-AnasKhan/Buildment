import type { CustomCanvasSpec } from "../registry";
import { WriteLatencyCanvas } from "./WriteLatencyCanvas";

// 19.6 beat 3, "Write latency across regions for each choice". Model: ./model.ts.
export const sysdesignM19WriteLatency: CustomCanvasSpec = {
  kind: "custom",
  title: "Write latency across regions for each choice",
  purpose: "Drag the customer between regions and switch the design. One leader in NA East is fast for nearby users and slow for far ones; a home region per customer is fast everywhere and keeps data in its region; a global database is slower for everyone and keeps every confirmed write.",
  limits: "Steady conditions, one write at a time, round trips from the course latency table. Queueing, busy leaders and loss add to every figure. Copies kept inside the EU are not drawn, because the delay between EU regions is not in the table.",
  component: WriteLatencyCanvas,
};
