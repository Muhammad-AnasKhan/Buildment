import type { OpenQuestionConfig } from "./schema.js";

// Stub projector — see docs/06-reports.mdx.
export function reportOpenQuestion(_config: OpenQuestionConfig) {
  return {
    metric: "reviewStatus" as const,
  };
}
