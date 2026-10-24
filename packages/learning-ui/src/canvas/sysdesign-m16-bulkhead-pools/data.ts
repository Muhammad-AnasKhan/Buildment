import type { CustomCanvasSpec } from "../registry";
import { BulkheadPoolsCanvas } from "./BulkheadPoolsCanvas";

// 16.5 beat 4, "Drag the wall between the pools". Model: ./model.ts.
export const sysdesignM16BulkheadPools: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the wall between the pools",
  purpose: "Checkout has 50 workers shared by payments and the home page. When Picks is slow, the home page holds every worker for 3 seconds and payments starves. Drag a wall to give payments its own pool, and see what the home page pays for it.",
  limits:
    "A fluid model with course numbers: payments is 20 requests a second at 0.1 s each, the home page is 80 a second, and Picks makes a home request take 3 s instead of 0.1 s. Workers busy equal the rate times the time held (Little's law, chapter 2.5). Real requests vary in length, wait in queues and time out. The challenge measures the same effect with its own run: 41% of payments with a shared pool and 100% with a wall.",
  component: BulkheadPoolsCanvas,
};
