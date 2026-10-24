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
import { fiveWhysChain } from "./five-whys-chain/data";
import { laptopChargingDetective } from "./laptop-charging-detective/data";
import { afterIsNotBecauseTimeline } from "./after-is-not-because-timeline/data";
import { andThenWhatChain } from "./and-then-what-chain/data";
import { bakeryBottleneckMoves } from "./bakery-bottleneck-moves/data";
import { baselThirdFactorSplit } from "./basel-third-factor-split/data";
import { comparisonGroupVideoTest } from "./comparison-group-video-test/data";
import { driftBackToNormal } from "./drift-back-to-normal/data";
import { fishboneCheckEvidence } from "./fishbone-check-evidence/data";
import { halvingBookingChain } from "./halving-booking-chain/data";
import { hudaCausesAddUp } from "./huda-causes-add-up/data";
import { hudaOrderDropChain } from "./huda-order-drop-chain/data";
import { hudaReviewLoop } from "./huda-review-loop/data";
import { isAndIsNotFridge } from "./is-and-is-not-fridge/data";
import { oneChangePriceWeeks } from "./one-change-price-weeks/data";
import { orderPileStockFlow } from "./order-pile-stock-flow/data";
import { pilotWithAStopRule } from "./pilot-with-a-stop-rule/data";
import { reviewWithoutBlameSteps } from "./review-without-blame-steps/data";
import { stopEarlyBannerTest } from "./stop-early-banner-test/data";
import { symptomFixLoop } from "./symptom-fix-loop/data";
import { targetLooksGood } from "./target-looks-good/data";
import { weakStrongFixes } from "./weak-strong-fixes/data";
import { whoGotTheSurvey } from "./who-got-the-survey/data";
import { ramiDecideOrCue } from "./rami-decide-or-cue/data";
import { habitLoopRepeats } from "./habit-loop-repeats/data";
import { habitStrengthCurve } from "./habit-strength-curve/data";
import { motivationWaveHabitSize } from "./motivation-wave-habit-size/data";
import { ifThenMoment } from "./if-then-moment/data";
import { chooseAnAnchor } from "./choose-an-anchor/data";
import { thirtyDayReview } from "./thirty-day-review/data";
import { khaledEveningCues } from "./khaled-evening-cues/data";
import { stepsToStart } from "./steps-to-start/data";
import { powerCutBackupPlan } from "./power-cut-backup-plan/data";
import { fewerTemptations } from "./fewer-temptations/data";
import { mahaNightLoop } from "./maha-night-loop/data";
import { phoneOutOfTheBedroom } from "./phone-out-of-the-bedroom/data";
import { trackerWeekNotes } from "./tracker-week-notes/data";
import { streakOrDoneCount } from "./streak-or-done-count/data";
import { slipOrGiveUp } from "./slip-or-give-up/data";
import { whichHabitFirst } from "./which-habit-first/data";
import { dinaStudyBlock } from "./dina-study-block/data";
import { prayerTimeAnchors } from "./prayer-time-anchors/data";

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
  "five-whys-chain": fiveWhysChain,
  "laptop-charging-detective": laptopChargingDetective,
  "after-is-not-because-timeline": afterIsNotBecauseTimeline,
  "and-then-what-chain": andThenWhatChain,
  "bakery-bottleneck-moves": bakeryBottleneckMoves,
  "basel-third-factor-split": baselThirdFactorSplit,
  "comparison-group-video-test": comparisonGroupVideoTest,
  "drift-back-to-normal": driftBackToNormal,
  "fishbone-check-evidence": fishboneCheckEvidence,
  "halving-booking-chain": halvingBookingChain,
  "huda-causes-add-up": hudaCausesAddUp,
  "huda-order-drop-chain": hudaOrderDropChain,
  "huda-review-loop": hudaReviewLoop,
  "is-and-is-not-fridge": isAndIsNotFridge,
  "one-change-price-weeks": oneChangePriceWeeks,
  "order-pile-stock-flow": orderPileStockFlow,
  "pilot-with-a-stop-rule": pilotWithAStopRule,
  "review-without-blame-steps": reviewWithoutBlameSteps,
  "stop-early-banner-test": stopEarlyBannerTest,
  "symptom-fix-loop": symptomFixLoop,
  "target-looks-good": targetLooksGood,
  "weak-strong-fixes": weakStrongFixes,
  "who-got-the-survey": whoGotTheSurvey,
  "rami-decide-or-cue": ramiDecideOrCue,
  "habit-loop-repeats": habitLoopRepeats,
  "habit-strength-curve": habitStrengthCurve,
  "motivation-wave-habit-size": motivationWaveHabitSize,
  "if-then-moment": ifThenMoment,
  "choose-an-anchor": chooseAnAnchor,
  "thirty-day-review": thirtyDayReview,
  "khaled-evening-cues": khaledEveningCues,
  "steps-to-start": stepsToStart,
  "power-cut-backup-plan": powerCutBackupPlan,
  "fewer-temptations": fewerTemptations,
  "maha-night-loop": mahaNightLoop,
  "phone-out-of-the-bedroom": phoneOutOfTheBedroom,
  "tracker-week-notes": trackerWeekNotes,
  "streak-or-done-count": streakOrDoneCount,
  "slip-or-give-up": slipOrGiveUp,
  "which-habit-first": whichHabitFirst,
  "dina-study-block": dinaStudyBlock,
  "prayer-time-anchors": prayerTimeAnchors,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
