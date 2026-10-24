import type { CustomCanvasSpec } from "../registry";
import { QuadtreeSplitCanvas } from "./QuadtreeSplitCanvas";

// 24.2 beat 5: a quadtree cuts only the crowded box, again and again.
// Model: models/quadtree-split.ts.
export const sysdesignM24QuadtreeSplit: CustomCanvasSpec = {
  kind: "custom",
  title: "Crowded places need smaller boxes",
  purpose: "Drag the size of the stadium crowd and pick how many drivers a box may hold. The quadtree cuts only the crowded box into four, again and again, so quiet places keep big boxes and no box holds thousands. A fixed grid puts the whole crowd in one box.",
  limits:
    "A made-up city of 40 drivers spread evenly, with a stadium crowd spread evenly inside one square that is one sixteenth of the city. A real crowd is not even and drivers move, and a real quadtree is rebuilt as they move. The fixed grid here is one big box, which is the worst case for a grid with boxes the size of the stadium square.",
  component: QuadtreeSplitCanvas,
};
