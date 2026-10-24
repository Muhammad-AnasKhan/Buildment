import type { CustomCanvasSpec } from "../registry";
import { JitterHerdCanvas } from "./JitterHerdCanvas";

// 16.4 beat 5, "A herd needs jitter". Model: ./model.ts.
export const sysdesignM16JitterHerd: CustomCanvasSpec = {
  kind: "custom",
  title: "A herd needs jitter",
  purpose: "1,000 clients fail together at second 0 and the server can serve 100 calls a second. With backoff but no jitter they retry in lockstep waves. With jitter each client waits a random time, the retries spread out, and every client is served with fewer calls.",
  limits:
    "A toy model: 1,000 clients, a server that serves 100 calls in each one-second slot and rejects the rest at once, and a backoff of 1, 2, 4 and 8 seconds capped at 16. Jitter is drawn as expected values (an even share over each possible wait), not as random dice, so the same setting always gives the same picture. The strip shows the first 20 seconds; the counter in the verdict covers 40. Real clients also differ in when they start. The 243 times example from the sources is a different effect (amplification through layers).",
  component: JitterHerdCanvas,
};
