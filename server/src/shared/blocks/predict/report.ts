import type { PredictConfig } from "./schema.js";

export function reportPredict(_config: PredictConfig) {
  return {
    metric: "correctRate" as const,
  };
}
