import type { AiInterviewConfig } from "./schema.js";

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
