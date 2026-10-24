import type { CustomCanvasSpec } from "../registry";
import { SplitBrainCanvas } from "./SplitBrainCanvas";

// 8.5 beat 3: cut the link but leave A running. After a timeout B is promoted
// with epoch 2 and A does not know. Both write to one Database; with fencing on
// it keeps the highest epoch seen and refuses lower ones. Model: ./model.ts.
export const sysdesignM8SplitBrain: CustomCanvasSpec = {
  kind: "custom",
  title: "Cut the link: two leaders",
  purpose: "Cut the network between the leader and the others, watch a second leader appear and both histories grow, then turn fencing on and see the old leader's write refused.",
  limits: "One database, three nodes, a made-up timeout. Real systems elect with a majority vote, and every storage node must check the epoch.",
  component: SplitBrainCanvas,
};
