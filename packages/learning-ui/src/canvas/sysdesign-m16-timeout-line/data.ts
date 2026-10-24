import type { CustomCanvasSpec } from "../registry";
import { TimeoutLineCanvas } from "./TimeoutLineCanvas";

// 16.4 beat 2, "Drag the limit and see the price". Model: ./model.ts.
export const sysdesignM16TimeoutLine: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the limit and see the price",
  purpose: "Drag the timeout limit across 50 calls to Picks. Calls above the line are cut off even though they would have worked. A long limit lets a hanging Picks hold many of Checkout's 50 workers.",
  limits:
    "The latency points (p50 40 ms, p90 80 ms, p99 250 ms, p99.9 900 ms) and the 100 pages a second are course numbers, joined by straight lines on a log scale. The 50 bars are fixed quantiles, so the tail beyond p99 is not drawn; the cut-off share comes from the formula, not from counting bars. Real hangs vary, and retries and queues add more load (the next beats).",
  component: TimeoutLineCanvas,
};
