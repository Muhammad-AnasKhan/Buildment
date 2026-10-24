import type { CustomCanvasSpec } from "../registry";
import { SplitOrNotCanvas } from "./SplitOrNotCanvas";

// 16.2 beat 5, "Weigh team, releases and clarity". Model: ./model.ts.
export const sysdesignM16SplitOrNot: CustomCanvasSpec = {
  kind: "custom",
  title: "Weigh team, releases and clarity",
  purpose: "Drag the team size, the releases that waited for another team last month, and how clear the boundaries are. Points add up to a recommendation: stay one monolith, build a modular monolith, or split the parts that hurt.",
  limits:
    "A rule of thumb made for the course, not a law: three factors, each turned into points, with fixed cut-offs. Real choices also depend on one part that needs ten times the machines, a different security rule, or a different team and language. Fowler's 'Monolith First' is the only source behind it. Unclear boundaries cap the answer at a modular monolith.",
  component: SplitOrNotCanvas,
};
