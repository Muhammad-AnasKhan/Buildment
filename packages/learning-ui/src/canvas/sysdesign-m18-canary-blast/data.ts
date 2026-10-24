import type { CustomCanvasSpec } from "../registry";
import { CanaryBlastCanvas } from "./CanaryBlastCanvas";

// 18.6 beat 4, "Play: the share and the error rate". Model: ./model.ts.
export const sysdesignM18CanaryBlast: CustomCanvasSpec = {
  kind: "custom",
  title: "How far a bad canary reaches before the alert",
  purpose: "Drag the canary's share of traffic and the bug's error rate. A bigger share finds the bug sooner but puts more users on it. A rare bug hides for a long time, and the whole-service dashboard hides it in the average.",
  limits: "The traffic (3,000 requests a minute), the stable version's 0.2% error rate and the alert threshold (30 failed requests) are made up. Real alerts also compare the canary with the stable version, wait for a minimum number of requests, and look at latency as well as errors. The only number taken from a source is the shape: a 20% error rate on a 5% canary shows as about 1% overall (Google SRE Workbook).",
  component: CanaryBlastCanvas,
};
