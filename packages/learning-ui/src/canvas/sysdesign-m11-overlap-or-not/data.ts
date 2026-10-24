import type { CustomCanvasSpec } from "../registry";
import { OverlapOrNotCanvas } from "./OverlapOrNotCanvas";

// 11.2 beat 3 "Overlap means either answer is fine". Rules: models/overlap-or-not.ts
// and models/history.ts (mayReturn). The picture: primitives/history-view.tsx.
export const sysdesignM11OverlapOrNot: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the read across the write",
  purpose: "Drag Ben's read along the timeline. Before the write only 0 is possible, after it only 1, and in between either answer is fine.",
  limits: "One write and one read. With more reads, the order between the reads matters too (chapter 11.3).",
  component: OverlapOrNotCanvas,
};
