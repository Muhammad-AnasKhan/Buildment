import type { CustomCanvasSpec } from "../registry";
import { ConnectionsPlayCanvas } from "./ConnectionsPlayCanvas";

// 22.3 beat 3: restart a few gateways and spread the return. Model: models/gateway-restart.ts.
// Course numbers: models/dardasha-numbers.ts.
export const sysdesignM22ConnectionsPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Restart a few gateways, spread the return",
  purpose: "Tap how many of the 60 gateways restart at once and drag how long their phones spread the return. The chart shows phones arriving each second against what the other gateways accept, and the lines each healthy gateway ends with.",
  limits:
    "Dardasha is made up and so are its numbers: 60 gateways, 50,000 lines in the plan and 100,000 at most for each, and 500 new connections a second for each. The model has no randomness: phones arrive evenly over the spread, and phones that are refused are not drawn retrying. A real fleet also has CPU and bandwidth limits, phones that catch up on messages after they connect, and a balancer that does not spread them perfectly. Read it for the shape (a few at a time, spread out, is absorbed) and not for exact seconds.",
  component: ConnectionsPlayCanvas,
};
