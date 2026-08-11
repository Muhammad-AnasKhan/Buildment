import type { PredictConfig } from "./schema";

export function reportPredict(_config: PredictConfig) {
  return {
    metric: "correctRate" as const,
  };
}
