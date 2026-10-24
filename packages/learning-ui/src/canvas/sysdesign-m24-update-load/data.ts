import type { CustomCanvasSpec } from "../registry";
import { UpdateLoadCanvas } from "./UpdateLoadCanvas";

// 24.3 beat 3: the same stream of location reports on disk database nodes or memory nodes.
// Model: models/safar-update-load.ts.
export const sysdesignM24UpdateLoad: CustomCanvasSpec = {
  kind: "custom",
  title: "Move the dials, see the load",
  purpose: "Drag the number of drivers and the seconds between reports, and switch the store between a disk database and a memory map. The same 250,000 reports a second need about 100 disk nodes or about 5 memory nodes, and halving the gap doubles the load.",
  limits:
    "The picture divides the reports a second by a planned load for one node: 2,500 writes a second for a disk database node (the course number from chapter 20.2) and 50,000 updates a second for a memory node (an illustrative number; measure your own). It leaves out replicas, failures, the searches that run on the same nodes, and the network.",
  component: UpdateLoadCanvas,
};
