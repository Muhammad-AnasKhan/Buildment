import type { CustomCanvasSpec } from "../registry";
import { BuildHistoryCanvas } from "./BuildHistoryCanvas";

// 11.2 beat 1 "A history is a list of bars". Rules: models/history.ts and
// models/history-build.ts. The picture: primitives/history-view.tsx.
export const sysdesignM11BuildHistory: CustomCanvasSpec = {
  kind: "custom",
  title: "Build a history of bars",
  purpose: "Tap a lane to add a bar for a read or a write, and see which pairs of bars overlap and what each read may return.",
  limits: "Times are made up. A history lists what clients saw. It says nothing about copies or networks.",
  component: BuildHistoryCanvas,
};
