// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { PredictConfig } from "./schema";

export function reportPredict(_config: PredictConfig) {
  return {
    metric: "correctRate" as const,
  };
}
