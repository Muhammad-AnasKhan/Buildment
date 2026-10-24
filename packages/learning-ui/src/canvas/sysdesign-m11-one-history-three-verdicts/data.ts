import type { CustomCanvasSpec } from "../registry";
import { ThreeVerdictsCanvas } from "./ThreeVerdictsCanvas";

// 11.4 beat 1 "One history, three verdicts". Rules and presets: models/three-verdicts.ts
// and the three checkers in models/history.ts. The picture: primitives/history-view.tsx.
export const sysdesignM11OneHistoryThreeVerdicts: CustomCanvasSpec = {
  kind: "custom",
  title: "One history, three verdicts",
  purpose: "Pick a history, tap a read to change its value, and read whether linearizable, sequential and causal each allow it.",
  limits: "Times and values are made up. The causal check uses 'program order plus reads-from', the usual textbook relation.",
  component: ThreeVerdictsCanvas,
};
