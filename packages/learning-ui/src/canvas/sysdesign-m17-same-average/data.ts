import type { CustomCanvasSpec } from "../registry";
import { SameAverageCanvas } from "./SameAverageCanvas";

// 17.5 beat 3, "Same average, different users". Model: ./model.ts.
export const sysdesignM17SameAverage: CustomCanvasSpec = {
  kind: "custom",
  title: "Same average, different users",
  purpose: "Two services both average 120 ms. Tap the statistic a dashboard graphs: the average and p50 hide B's two slow users, p99 shows them. Then combine the two services and see that averaging two p99 values gives 480 ms while the real p99 is 810 ms.",
  limits:
    "Each service has only 20 requests (course numbers), so p99 is simply the slowest request; real dashboards use thousands of requests per point. Percentiles use the nearest-rank method from chapter 2.4. Dots that are close in time share a clump: rows only keep them from hiding each other, they do not mean anything.",
  component: SameAverageCanvas,
};
