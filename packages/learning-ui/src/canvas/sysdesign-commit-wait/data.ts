import type { CustomCanvasSpec } from "../registry";
import { CommitWaitCanvas } from "./CommitWaitCanvas";

export const sysdesignCommitWait: CustomCanvasSpec = {
  kind: "custom",
  title: "Commit wait: server A waits out its doubt before saying done",
  purpose: "Server A waits about 2 times epsilon before saying done, so anything Alice does next gets a later timestamp.",
  limits: "The wait is drawn as exactly 2 times epsilon; real Spanner waits until TT.after(s) is true, which is the same within a tiny margin, and overlaps the wait with replication so users do not pay all of it on top. Clock errors are the worst case inside epsilon, and time is slowed down.",
  component: CommitWaitCanvas,
};
