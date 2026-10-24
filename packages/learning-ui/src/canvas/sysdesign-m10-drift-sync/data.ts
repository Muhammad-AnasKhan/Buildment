import type { CustomCanvasSpec } from "../registry";
import { DriftSyncCanvas } from "./DriftSyncCanvas";

// 10.2 ("Physical clocks lie"), beat 4 "Drag the drift and the sync interval".
// Model: models/drift-sync.ts.
export const sysdesignM10DriftSync: CustomCanvasSpec = {
  kind: "custom",
  title: "Drift and sync interval",
  purpose: "Drag the drift of two clocks and how often they sync, and watch the gap between them climb and drop, and when two writes 1 ms apart get stamped in the wrong order.",
  limits:
    "One clock runs fast and the other slow by the same drift, and both are exactly right at each sync. Real syncs leave up to about 1 ms of error behind, which this picture leaves out. The two writes are always 1 ms apart.",
  component: DriftSyncCanvas,
};
