import type { CustomCanvasSpec } from "../registry";
import { IsItLinearizableCanvas } from "./IsItLinearizableCanvas";

// 11.3 beat 1 "Find one point inside every bar". Rules: models/linearizable-play.ts
// and models/history.ts (the linearizable checker). The picture: primitives/history-view.tsx.
export const sysdesignM11IsItLinearizable: CustomCanvasSpec = {
  kind: "custom",
  title: "Is this history linearizable?",
  purpose: "Tap a read to change what it returned. When one order fits every bar, a dot appears inside each bar; when none does, the pair that cannot fit is ringed.",
  limits: "One register and one write. Real checkers search many keys and thousands of operations. You write one in chapter 11.8.",
  component: IsItLinearizableCanvas,
};
