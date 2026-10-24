import type { CustomCanvasSpec } from "../registry";
import { RegistryPlayCanvas } from "./RegistryPlayCanvas";

// 12.9 ("Service discovery and coordination services"), beat 2 "Register, beat, expire, watch".
// Model: models/registry-lease.ts.
export const sysdesignM12RegistryPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Register, beat, expire, watch",
  purpose: "Three instances renew a lease in a registry. Crash one, lose some beats, and change the lease and the beat interval to see how long a dead instance stays listed and when a healthy one is removed.",
  limits:
    "Three instances with beats that start 0, 1 and 2 seconds apart, and beats that arrive at once or never. The watcher hears of a change 0.01 s after it. A removed healthy instance comes back at its next beat that arrives. One second of the clock runs in 0.4 s of real time. Real registries have network delay, clock drift and many more instances.",
  component: RegistryPlayCanvas,
};
