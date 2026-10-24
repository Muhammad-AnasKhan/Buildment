import type { CustomCanvasSpec } from "../registry";
import { TrueTimeCanvas } from "./TrueTimeCanvas";

export const sysdesignTruetimeCommitWait: CustomCanvasSpec = {
  kind: "custom",
  title: "TrueTime: when a timestamp is a range",
  purpose: "Change the clock uncertainty and the gap between two commits to see when timestamps get the order wrong, and what commit wait costs to fix it.",
  limits:
    "Each server's clock error is fixed for the whole run and stays inside epsilon, and the worst case puts each clock 90% of epsilon off in opposite directions. Real errors change over time, and real epsilon grows between clock syncs and shrinks after each one. Network time between Alice and the servers is left out, and so are locks, replication and Paxos, which real Spanner also uses. The model shows why commit wait works, not how fast a real database is.",
  component: TrueTimeCanvas,
};
