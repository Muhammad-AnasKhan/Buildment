import type { CustomCanvasSpec } from "../registry";
import { BatchMatchCanvas } from "./BatchMatchCanvas";

// 24.4 beat 5: two riders and two drivers on a road; one by one against together.
// Model: models/batch-match.ts.
export const sysdesignM24BatchMatch: CustomCanvasSpec = {
  kind: "custom",
  title: "Match together, not one by one",
  purpose: "Drag Driver 1 along a road and switch between matching rider A first and matching both riders together. With Driver 1 at 0.4 km, one by one costs 1.9 km of pickups and together costs 1.1 km.",
  limits:
    "Two riders and two drivers on a straight line, with a speed of 30 km/h for the minutes. Real roads are not straight lines, drivers keep moving, and a window of hundreds or thousands of riders needs a proper assignment method rather than checking every pairing. The cars in the picture drive faster than 30 km/h so that the loop stays short.",
  component: BatchMatchCanvas,
};
