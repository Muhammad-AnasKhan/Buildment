import type { CustomCanvasSpec } from "../registry";
import { LimiterBurstCanvas } from "./LimiterBurstCanvas";

// 6.5 beat 6: five limiters, each 5 a minute. Burst A is 5 requests at 0:59;
// burst B is 5 requests at a time the learner drags from 0:59 to 1:59.
// Model: models/limiter-burst.ts.
export const sysdesignM6LimiterBurst: CustomCanvasSpec = {
  kind: "custom",
  title: "Same burst, five limiters",
  purpose: "Send one burst pattern through five limiters at once and drag the second burst across the minute boundary to see which ones let 10 through.",
  limits:
    "5 a minute is a made-up limit. The counter's estimate assumes last minute's requests were spread evenly; challenge 5 shows a bunched pattern where it slips. The leaky bucket's waits are rounded to 12 seconds a place and drawn shorter than they are.",
  component: LimiterBurstCanvas,
};
