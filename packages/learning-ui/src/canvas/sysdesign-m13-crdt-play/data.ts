import type { CustomCanvasSpec } from "../registry";
import { CrdtPlayCanvas } from "./CrdtPlayCanvas";

// 13.7 beat 5, Merge in any order, three set types. Model: ./model.ts.
export const sysdesignM13CrdtPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Merge three replicas in any order",
  purpose: "Tap one replica and then another to merge it in, in any order, for a plain set, remove by name and an OR-Set. All three agree in the end; only the OR-Set ends in the cart people meant.",
  limits:
    "Three replicas and three changes. State-based merges only (each replica sends its whole state). Real OR-Sets keep one tag per add, so their state grows (chapter 13.8).",
  component: CrdtPlayCanvas,
};
