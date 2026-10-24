import type { CustomCanvasSpec } from "../registry";
import { RebalancePlayCanvas } from "./RebalancePlayCanvas";

// 9.5 beat 3: going from four nodes to five. The scheme decides how much data
// moves (80% for hash mod N, 20% for fixed partitions); while it moves, a
// client with the old map asks the wrong node. Model: ./model.ts.
export const sysdesignM9RebalancePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Moving data while requests keep coming",
  purpose: "Pick a placement scheme and drag a four-to-five node move forward in time: see how much data must move, and how many requests go to the wrong node while clients still hold the old map.",
  limits:
    "Suq's numbers are made up: 1.8 TB of data, 5,000 requests a second spread evenly over the keys, and a copy speed of 100 MB a second. Fixed partitions move 20% (13 of 64 partitions, rounded). The wrong-node count assumes every client still holds the old map; real clients learn the new map one by one, and a real move copies one partition at a time with the safe order of steps described in the text.",
  component: RebalancePlayCanvas,
};
