import type { CustomCanvasSpec } from "../registry";
import { CellEdgeCanvas } from "./CellEdgeCanvas";

// 24.2 beat 3: a driver 30 m away can sit in another box.
// Model: models/cell-edge.ts.
export const sysdesignM24CellEdge: CustomCanvasSpec = {
  kind: "custom",
  title: "Close drivers can have different codes",
  purpose: "Drag the rider on a map of geohash boxes. A driver 30 m away can sit across a box edge, so reading only the rider's box misses nearby drivers. Change the letters, the radius and how many rings of boxes are read, and see the cost.",
  limits:
    "Five drivers at fixed places and a made-up density of 100 drivers in every square kilometre. Box sizes are measured at the equator, where the 0 degree meridian and the equator are box edges at every letter count; boxes are narrower away from the equator. The drivers to measure are the boxes read times 100 a square kilometre, not a count of the five drivers shown. Near the poles and the 180 degree line the neighbour rules change.",
  component: CellEdgeCanvas,
};
