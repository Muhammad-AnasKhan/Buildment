import type { CustomCanvasSpec } from "../registry";
import { QuorumExplorerCanvas } from "./QuorumExplorerCanvas";

// 12.3 ("Quorums"), beat 2 "Move N, W and R, find the gaps".
// Model: models/quorum-explorer.ts.
export const sysdesignM12QuorumExplorer: CustomCanvasSpec = {
  kind: "custom",
  title: "Move N, W and R, find the gaps",
  purpose: "Set the number of copies, how many a write waits for and how many a read asks, and see whether a read must meet a write.",
  limits:
    "Made-up response times (10 ms for the fastest copy up to 500 ms for the ninth). The rings show the worst case for overlap: the write group is the W fastest copies and the read group the R slowest, not the copies a real read waits for. Copies fail only by being tapped, one at a time, and a write or read that reaches the needed number of copies always succeeds.",
  component: QuorumExplorerCanvas,
};
