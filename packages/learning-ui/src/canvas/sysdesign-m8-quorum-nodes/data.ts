import type { CustomCanvasSpec } from "../registry";
import { QuorumNodesCanvas } from "./QuorumNodesCanvas";

// 8.7 beat 2: five nodes hold one key. Tap a write set and confirm it, then tap
// a read set. A read finds the newest write when it includes a node that has it,
// which is certain when R + W is more than 5 [S45, S52]. Model: ./model.ts.
export const sysdesignM8QuorumNodes: CustomCanvasSpec = {
  kind: "custom",
  title: "Write to three of five, read from two",
  purpose: "Tap the nodes that get a write, confirm it, then tap the nodes to read from; see when a read can miss the newest value and when R + W over N makes a miss impossible.",
  limits: "One key, no concurrent writes, strict quorums. A node that is down cannot answer, so a write or read that includes one waits and stalls. Sloppy quorums and concurrent writes need versions and repair (module 13).",
  component: QuorumNodesCanvas,
};
