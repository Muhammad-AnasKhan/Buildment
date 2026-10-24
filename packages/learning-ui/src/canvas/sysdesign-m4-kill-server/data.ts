import type { CustomCanvasSpec } from "../registry";
import { KillServerCanvas } from "./KillServerCanvas";

// 4.3 "Kill a server, count the logouts": 4 app servers and 1,200 logged-in
// students, 300 per server. Model: models/session-loss.ts.
export const sysdesignM4KillServer: CustomCanvasSpec = {
  kind: "custom",
  title: "Kill a server, count the logouts",
  purpose: "Choose where sessions live (server memory, sticky, or a shared store), then tap a server or the store to kill it and count the students logged out.",
  limits:
    "Students are spread evenly, 300 on each server, and one dot stands for ten of them. The balancer is drawn as perfectly fair, and the store is a single box with no copy of its own. Bringing a server back simply restores the picture; in real life its students would have to log in again, and sticky balancers can also lose a pin without a crash. A signed-token design, which keeps no session on the server at all, is not drawn.",
  component: KillServerCanvas,
};
