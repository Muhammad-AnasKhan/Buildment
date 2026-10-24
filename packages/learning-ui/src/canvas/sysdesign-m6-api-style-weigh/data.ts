import type { CustomCanvasSpec } from "../registry";
import { ApiStyleWeighCanvas } from "./ApiStyleWeighCanvas";

// 6.2 beat 4: weigh five needs for one API and see REST, GraphQL and gRPC
// totals. Weighted sum, total = sum of (weight x score); scores are course
// judgments. Model: models/api-style-weigh.ts.
export const sysdesignM6ApiStyleWeigh: CustomCanvasSpec = {
  kind: "custom",
  title: "Weigh what matters, see who wins",
  purpose: "Tap how much each need matters for one API and watch the totals for REST, GraphQL and gRPC change.",
  limits: "Scores are course judgments, from 1 to 5, not measurements. Real choices also weigh what your team already runs, and a company can use more than one style.",
  component: ApiStyleWeighCanvas,
};
