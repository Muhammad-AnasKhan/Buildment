import type { CustomCanvasSpec } from "../registry";
import { WebhookOrderCanvas } from "./WebhookOrderCanvas";

// 25.4 beat 3: pick the arrival order of three payment events. Model: models/webhook-order.ts.
export const sysdesignM25WebhookOrder: CustomCanvasSpec = {
  kind: "custom",
  title: "Duplicate, late, out of order",
  purpose: "A payment really went authorized, captured, refunded, but the events can arrive in any order and one can arrive twice. Pick the order and compare a rule that takes the last event with a rule that only moves forward.",
  limits:
    "Three events and four states only: no failed or voided payments, no retries over time, and no partial refunds. The picture assumes every event arrives at least once and that the arrival order is the only thing that varies. Providers differ in how they order and repeat webhooks, and the course assumes they promise no order. A real payment also checks the provider's current status by asking the provider, which this picture does not draw.",
  component: WebhookOrderCanvas,
};
