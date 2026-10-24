import type { CustomCanvasSpec } from "../registry";
import { RingPlayCanvas } from "./RingPlayCanvas";

// 9.3 beat 4: a hash ring with virtual nodes. Drag the points dial and the
// key, add or remove a node, and watch the keys move. Model: ./model.ts.
export const sysdesignM9RingPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Virtual nodes: many small points per node",
  purpose: "Drag the points per node from 1 to 200 and watch the ring's load even out, then add or remove a node and watch which keys move.",
  limits:
    "The figures come from the course's own simulation: 10,000 keys named order:0 to order:9999, nodes named node-a to node-h, and the hash from chapter 9.7. With only 10,000 keys the numbers are noisier than the 100,000 key figures in the chapter, so one point per node can look lucky or unlucky. The dots round the ring are 1 key in 56, drawn so you can see them move; the percentages count all 10,000. A real ring has no node names this tidy and holds millions of keys.",
  component: RingPlayCanvas,
};
