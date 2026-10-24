import type { CustomCanvasSpec } from "../registry";
import { RetryStormCanvas } from "./RetryStormCanvas";

// 16.4 beat 4, "Retries can keep a system down". Model: ./model.ts.
export const sysdesignM16RetryStorm: CustomCanvasSpec = {
  kind: "custom",
  title: "Retries can keep a system down",
  purpose: "A 5 second blip cuts the server from 100 to 30 requests a second. Drag the number of retries and pick a retry rule. With retries at once, or with backoff and jitter, the load stays above capacity and the system never comes back. A retry budget lets it recover.",
  limits:
    "A toy model made to show the shape: one server that does 100 requests a second, 80 original requests a second, clients that give up after 1 second, and a server that still works on a request whose client has left. It uses expected values with no randomness, so each setting always gives the same picture. Real systems usually recover more easily, but the direction is the same (a metastable failure). Backoff here waits 0.5 s doubling, spread over 10 equal parts.",
  component: RetryStormCanvas,
};
