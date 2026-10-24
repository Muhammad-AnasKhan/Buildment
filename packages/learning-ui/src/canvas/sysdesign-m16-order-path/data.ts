import type { CustomCanvasSpec } from "../registry";
import { OrderPathCanvas } from "./OrderPathCanvas";

// 16.3 beat 3, "Wait for the answer, or send a message". Model: ./model.ts.
export const sysdesignM16OrderPath: CustomCanvasSpec = {
  kind: "custom",
  title: "Wait for the answer, or send a message",
  purpose: "Checkout makes three calls in a row. Tap a call to switch it between waiting for the answer and sending a message, and tap a service to make it fail. Waits add up and can fail the order; a message never delays it but the answer comes later.",
  limits:
    "A made-up order with course numbers: Stock takes 30 ms, Payments 80 ms and Notifications 40 ms, and every service is up 99.9% of the time. Real calls vary in time, calls can run in parallel, and a message needs a queue that can itself fail and may deliver twice. Read it for the direction: waits add time and failures, messages remove them but hide the result.",
  component: OrderPathCanvas,
};
