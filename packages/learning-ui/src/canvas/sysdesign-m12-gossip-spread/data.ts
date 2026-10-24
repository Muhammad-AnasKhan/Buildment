import type { CustomCanvasSpec } from "../registry";
import { GossipSpreadCanvas } from "./GossipSpreadCanvas";

// 12.8 ("Gossip and failure detection"), beat 2 "Drag the size and the fanout".
// Model: models/gossip-spread.ts.
export const sysdesignM12GossipSpread: CustomCanvasSpec = {
  kind: "custom",
  title: "Gossip: size, fanout and rounds",
  purpose: "Drag the cluster size and the fanout and watch how many rounds a piece of news needs to reach every node, then start a false rumor and watch the correction chase it.",
  limits:
    "The curve is the expected spread when every informed node tells f other nodes picked at random each round, with no lost messages and all rounds in step. Real clusters have uneven timing, and the log N shape is the usual result for this kind of spread. The sample dots show at most 49 nodes, so for a big cluster one dot stands for many. The false rumor assumes the target hears it when half the cluster knows.",
  component: GossipSpreadCanvas,
};
