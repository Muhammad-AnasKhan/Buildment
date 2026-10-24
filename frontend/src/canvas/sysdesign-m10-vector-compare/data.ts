import type { CustomCanvasSpec } from "../registry";
import { VectorCompareCanvas } from "./VectorCompareCanvas";

// 10.4 ("Vector clocks"), beat 3 "Pick two events and compare".
// Model: models/vector-compare.ts.
export const sysdesignM10VectorCompare: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick two events and compare",
  purpose: "Tap two of nine events and compare their vector clocks slot by slot to see which came first, or whether they are concurrent.",
  limits:
    "Nine events on three nodes, with a fixed run. Real systems have many more nodes and vectors that grow with them. The glowing chain follows the shortest path of message and same-node steps.",
  component: VectorCompareCanvas,
};
