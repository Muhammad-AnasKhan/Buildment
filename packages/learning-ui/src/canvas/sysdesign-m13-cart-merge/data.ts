import type { CustomCanvasSpec } from "../registry";
import { CartMergeCanvas } from "./CartMergeCanvas";

// 13.6 beat 3, Try four merge rules on one conflict. Model: ./model.ts.
export const sysdesignM13CartMerge: CustomCanvasSpec = {
  kind: "custom",
  title: "Four merge rules on one cart conflict",
  purpose: "Pick a merge rule and see the cart it makes when Hana removes milk while Dina adds tea, or adds milk again. Last write wins, union and remove by name each fail one case; tagged adds get both right.",
  limits:
    "A cart of three items and two edits. Real merge rules also need clocks, tags and context (chapters 13.6 and 13.7). The stamps 10 and 12 are made up.",
  component: CartMergeCanvas,
};
