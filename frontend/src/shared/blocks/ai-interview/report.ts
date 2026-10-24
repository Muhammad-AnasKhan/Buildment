// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { AiInterviewConfig } from "./schema";

/** Report shape for the block. Config only; the rubric never appears here. */
export function reportAiInterview(config: AiInterviewConfig) {
  return {
    type: "AI_INTERVIEW",
    title: config.title,
    summary: "",
    details: [] as unknown[],
    metric: "completion" as const,
    focus: config.focus,
    maxTurns: config.maxTurns,
    whyDepth: config.whyDepth,
  };
}
