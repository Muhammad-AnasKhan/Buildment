import type { ComponentType } from "react";
import { CANVAS_SLUGS, isCanvasSlug, type CanvasSlug } from "@/shared/canvas/slugs";
import type { FactorSpec } from "./renderers/factor/types";
import type { SequenceSpec } from "./renderers/sequence/types";
import type { SliderSpec } from "./renderers/slider/types";
import type { StateMachineSpec } from "./renderers/state-machine/types";
import { freshmarketMarkPacked } from "./freshmarket-mark-packed/data";
import { freshmarketOrderStatus } from "./freshmarket-order-status/data";
import { freshmarketCartSplit } from "./freshmarket-cart-split/data";
import { freshmarketStockHolds } from "./freshmarket-stock-holds/data";
import { weightedMatrixTwoOffers } from "./weighted-matrix-two-offers/data";
import { ticketlineSeatHoldRace } from "./ticketline-seat-hold-race/data";
import { ragHybridRerank } from "./rag-hybrid-rerank/data";
import { retrievalMetricsAtK } from "./retrieval-metrics-at-k/data";
import { agentReactLoop } from "./agent-react-loop/data";
import { langgraphReducerMerge } from "./langgraph-reducer-merge/data";
import { llmTokenCost } from "./llm-token-cost/data";
import { samplingTemperature } from "./sampling-temperature/data";
import { ragTwoPaths } from "./rag-two-paths/data";
import { chunkSizeOverlap } from "./chunk-size-overlap/data";
import { adaptiveRoutingCost } from "./adaptive-routing-cost/data";
import { judgePositionBias } from "./judge-position-bias/data";
import { workflowOrAgent } from "./workflow-or-agent/data";
import { hitlInterruptResume } from "./hitl-interrupt-resume/data";
import { mcpToolCall } from "./mcp-tool-call/data";
import { indirectInjectionTrace } from "./indirect-injection-trace/data";
import { asyncConcurrencyLimit } from "./async-concurrency-limit/data";
import { retryBackoffJitter } from "./retry-backoff-jitter/data";
import { traceSampling } from "./trace-sampling/data";
import { serverlessVsClusterCost } from "./serverless-vs-cluster-cost/data";
import { freelanceJobFlowchart } from "./freelance-job-flowchart/data";
import { jobApplicationStatus } from "./job-application-status/data";
import { checkTheAiAnswer } from "./check-the-ai-answer/data";
import { sysdesignTruetimeCommitWait } from "./sysdesign-truetime-commit-wait/data";
import { sysdesignReplicaLag } from "./sysdesign-replica-lag/data";

// The closed set of canvases a chapter can embed, keyed by the slugs in
// server/src/shared/canvas/slugs.ts. Each entry is data for one of the four
// renderers or a reviewed custom component. MDX names a slug, never code.
// A new interaction model can own its UI without being squeezed into one of
// the three reusable renderer shapes.
export type CustomCanvasSpec = {
  kind: "custom";
  title: string;
  purpose: string;
  limits: string;
  component: ComponentType<{ title: string; purpose: string; limits: string }>;
};

export type CanvasSpec = SequenceSpec | StateMachineSpec | FactorSpec | SliderSpec | CustomCanvasSpec;

export const canvasRegistry: Record<CanvasSlug, CanvasSpec> = {
  "weighted-matrix-two-offers": weightedMatrixTwoOffers,
  "freshmarket-order-status": freshmarketOrderStatus,
  "freshmarket-mark-packed": freshmarketMarkPacked,
  "freshmarket-cart-split": freshmarketCartSplit,
  "freshmarket-stock-holds": freshmarketStockHolds,
  "ticketline-seat-hold-race": ticketlineSeatHoldRace,
  "rag-hybrid-rerank": ragHybridRerank,
  "retrieval-metrics-at-k": retrievalMetricsAtK,
  "agent-react-loop": agentReactLoop,
  "langgraph-reducer-merge": langgraphReducerMerge,
  "llm-token-cost": llmTokenCost,
  "sampling-temperature": samplingTemperature,
  "rag-two-paths": ragTwoPaths,
  "chunk-size-overlap": chunkSizeOverlap,
  "adaptive-routing-cost": adaptiveRoutingCost,
  "judge-position-bias": judgePositionBias,
  "workflow-or-agent": workflowOrAgent,
  "hitl-interrupt-resume": hitlInterruptResume,
  "mcp-tool-call": mcpToolCall,
  "indirect-injection-trace": indirectInjectionTrace,
  "async-concurrency-limit": asyncConcurrencyLimit,
  "retry-backoff-jitter": retryBackoffJitter,
  "trace-sampling": traceSampling,
  "serverless-vs-cluster-cost": serverlessVsClusterCost,
  "freelance-job-flowchart": freelanceJobFlowchart,
  "job-application-status": jobApplicationStatus,
  "check-the-ai-answer": checkTheAiAnswer,
  "sysdesign-truetime-commit-wait": sysdesignTruetimeCommitWait,
  "sysdesign-replica-lag": sysdesignReplicaLag,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
