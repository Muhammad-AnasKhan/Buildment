import type { CustomCanvasSpec } from "../registry";
import { FailoverPlayCanvas } from "./FailoverPlayCanvas";

// 4.4 "Fail a backend, watch the load shift": 180 requests a second over 3
// servers that each finish 100 a second; a server is removed after 3 failed
// health checks. The settings are examples. Model: models/failover.ts.
export const sysdesignM4FailoverPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Fail a backend, watch the load shift",
  purpose: "Tap a server to fail it. It keeps its share until the health checks remove it; then the survivors carry its load.",
  limits:
    "The interval and the three failed checks are example settings, not any product's defaults. Time is sped up four times so the 10 second setting does not take half a minute. A dead server is shown as failing every request it is sent, and the failed count adds up exactly with no retries (real balancers and clients often retry on another server). The removal time is interval times three from the moment the server dies, which ignores where in the cycle the first check falls. Bringing a server back is instant here; real balancers wait for passing checks first. When no server is left, the balancer is drawn failing open and every request fails.",
  component: FailoverPlayCanvas,
};
