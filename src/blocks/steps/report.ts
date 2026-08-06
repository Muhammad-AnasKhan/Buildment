import type { StepsConfig } from "./schema";

// Stub projector — see docs/06-reports.mdx.
// Steps blocks are static content with no submissions, so the report is minimal.
export function reportSteps(_config: StepsConfig) {
  return {
    metric: "viewed" as const,
  };
}
