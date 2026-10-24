import type { CustomCanvasSpec } from "../registry";
import { RetryKeyCanvas } from "./RetryKeyCanvas";

// 6.4 beat 4: one purchase with challenge 5 part 4's settings. The app waits
// 250 ms per try, retries after 50 ms (200 ms after a 409), at most 4 tries.
// The provider takes the dragged time for every try that reaches it. Model:
// models/retry-key.ts.
export const sysdesignM6RetryKey: CustomCanvasSpec = {
  kind: "custom",
  title: "Retry with and without a key",
  purpose: "Drag how slow the provider is and pick how the API treats keys, then count how many times the card is charged.",
  limits:
    "One purchase, instant servers, and a provider that takes the same time on every try. Challenge 5 runs 60 purchases with real HTTP and timers: 180, 93 and 60 charges in one run. The timeouts and waits are challenge 5's settings, not a rule.",
  component: RetryKeyCanvas,
};
