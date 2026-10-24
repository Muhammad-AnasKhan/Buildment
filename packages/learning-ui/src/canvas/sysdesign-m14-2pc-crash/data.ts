import type { CustomCanvasSpec } from "../registry";
import { TwoPcCrashCanvas } from "./TwoPcCrashCanvas";

// 14.2 beat "Crash the coordinator at each step". Model: models/two-pc-crash.ts.
// Orders waiting = 2 a second x downtime, while a database is prepared.
export const sysdesignM14TwoPcCrash: CustomCanvasSpec = {
  kind: "custom",
  title: "Crash the coordinator at each step",
  purpose: "Pick the point where the coordinator crashes and how long it stays down, and watch the two databases, their locks and the queue of waiting orders.",
  limits:
    "An illustrative 2 orders a second, and every order needs rows in both databases, so waiting orders grow by 2 each second a database stays prepared. Real queues depend on how many orders touch the same rows. The picture shows one coordinator and two databases, with no timeouts and no recovery log shown; a real system also has a restart that reads the log. At most 60 order dots are drawn, and the number beside them is the real count.",
  component: TwoPcCrashCanvas,
};
