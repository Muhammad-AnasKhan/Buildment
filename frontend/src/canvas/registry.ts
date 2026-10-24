import type { ComponentType } from "react";
import { CANVAS_SLUGS, isCanvasSlug, type CanvasSlug } from "@/shared/canvas/slugs";
import type { FactorSpec } from "./renderers/factor/types";
import type { SequenceSpec } from "./renderers/sequence/types";
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
import { sysdesignTwoClocks } from "./sysdesign-two-clocks/data";
import { sysdesignClockBand } from "./sysdesign-clock-band/data";
import { sysdesignBandOverlap } from "./sysdesign-band-overlap/data";
import { sysdesignTruetimeBug } from "./sysdesign-truetime-bug/data";
import { sysdesignCommitWait } from "./sysdesign-commit-wait/data";
import { sysdesignCommentFlicker } from "./sysdesign-comment-flicker/data";
import { sysdesignReplicaBehind } from "./sysdesign-replica-behind/data";
import { sysdesignReadRouting } from "./sysdesign-read-routing/data";
import { sysdesignPositionToken } from "./sysdesign-position-token/data";
import { sysdesignM1ComputeBlocks } from "./sysdesign-m1-compute-blocks/data";
import { sysdesignM1Constraints } from "./sysdesign-m1-constraints/data";
import { sysdesignM1DataBlocks } from "./sysdesign-m1-data-blocks/data";
import { sysdesignM1DrivingNumber } from "./sysdesign-m1-driving-number/data";
import { sysdesignM1EdgeBlocks } from "./sysdesign-m1-edge-blocks/data";
import { sysdesignM1FrontDoor } from "./sysdesign-m1-front-door/data";
import { sysdesignM1FunctionalReqs } from "./sysdesign-m1-functional-reqs/data";
import { sysdesignM1LaunchDay } from "./sysdesign-m1-launch-day/data";
import { sysdesignM1PasteClarify } from "./sysdesign-m1-paste-clarify/data";
import { sysdesignM1PasteEstimate } from "./sysdesign-m1-paste-estimate/data";
import { sysdesignM1PasteFailover } from "./sysdesign-m1-paste-failover/data";
import { sysdesignM1PasteIds } from "./sysdesign-m1-paste-ids/data";
import { sysdesignM1PasteNoCache } from "./sysdesign-m1-paste-no-cache/data";
import { sysdesignM1QualityReqs } from "./sysdesign-m1-quality-reqs/data";
import { sysdesignM2AcrossTheWorld } from "./sysdesign-m2-across-the-world/data";
import { sysdesignM2AverageHides } from "./sysdesign-m2-average-hides/data";
import { sysdesignM2BurstsWait } from "./sysdesign-m2-bursts-wait/data";
import { sysdesignM2CacheVsMemory } from "./sysdesign-m2-cache-vs-memory/data";
import { sysdesignM2ChainFails } from "./sysdesign-m2-chain-fails/data";
import { sysdesignM2ChattyPage } from "./sysdesign-m2-chatty-page/data";
import { sysdesignM2DiskFills } from "./sysdesign-m2-disk-fills/data";
import { sysdesignM2FanOutOdds } from "./sysdesign-m2-fan-out-odds/data";
import { sysdesignM2FanOutTail } from "./sysdesign-m2-fan-out-tail/data";
import { sysdesignM2HedgedRequest } from "./sysdesign-m2-hedged-request/data";
import { sysdesignM2LittlesLaw } from "./sysdesign-m2-littles-law/data";
import { sysdesignM2PeakHour } from "./sysdesign-m2-peak-hour/data";
import { sysdesignM2QueueGrows } from "./sysdesign-m2-queue-grows/data";
import { sysdesignM2RegionRoundTrip } from "./sysdesign-m2-region-round-trip/data";
import { sysdesignM2SharedPower } from "./sysdesign-m2-shared-power/data";
import { sysdesignM2SsdRead } from "./sysdesign-m2-ssd-read/data";
import { sysdesignM2StoragePilesUp } from "./sysdesign-m2-storage-piles-up/data";
import { sysdesignM2TwoCopies } from "./sysdesign-m2-two-copies/data";
import { sysdesignM2UtilisationKnee } from "./sysdesign-m2-utilisation-knee/data";
import { sysdesignM1RequirementSorter } from "./sysdesign-m1-requirement-sorter/data";
import { sysdesignM1BlockMap } from "./sysdesign-m1-block-map/data";
import { sysdesignM2KneePlay } from "./sysdesign-m2-knee-play/data";
import { sysdesignM2FanOutPlay } from "./sysdesign-m2-fan-out-play/data";
import { sysdesignM1DesignLoop } from "./sysdesign-m1-design-loop/data";
import { sysdesignM2LatencyLadder } from "./sysdesign-m2-latency-ladder/data";
import { sysdesignM2Estimator } from "./sysdesign-m2-estimator/data";
import { sysdesignM2AvailabilityBuilder } from "./sysdesign-m2-availability-builder/data";
import { sysdesignM1LaunchDayIllustrated } from "./sysdesign-m1-launch-day-illustrated/data";
import type { SceneSpec } from "./renderers/scene/SceneCanvas";

// The closed set of canvases a chapter can embed, keyed by the slugs in
// server/src/shared/canvas/slugs.ts. Each entry is data for one of the three
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

export type CanvasSpec = SequenceSpec | StateMachineSpec | FactorSpec | CustomCanvasSpec | SceneSpec;

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
  "sysdesign-two-clocks": sysdesignTwoClocks,
  "sysdesign-clock-band": sysdesignClockBand,
  "sysdesign-band-overlap": sysdesignBandOverlap,
  "sysdesign-truetime-bug": sysdesignTruetimeBug,
  "sysdesign-commit-wait": sysdesignCommitWait,
  "sysdesign-comment-flicker": sysdesignCommentFlicker,
  "sysdesign-replica-behind": sysdesignReplicaBehind,
  "sysdesign-read-routing": sysdesignReadRouting,
  "sysdesign-position-token": sysdesignPositionToken,
  "sysdesign-m1-compute-blocks": sysdesignM1ComputeBlocks,
  "sysdesign-m1-constraints": sysdesignM1Constraints,
  "sysdesign-m1-data-blocks": sysdesignM1DataBlocks,
  "sysdesign-m1-driving-number": sysdesignM1DrivingNumber,
  "sysdesign-m1-edge-blocks": sysdesignM1EdgeBlocks,
  "sysdesign-m1-front-door": sysdesignM1FrontDoor,
  "sysdesign-m1-functional-reqs": sysdesignM1FunctionalReqs,
  "sysdesign-m1-launch-day": sysdesignM1LaunchDay,
  "sysdesign-m1-paste-clarify": sysdesignM1PasteClarify,
  "sysdesign-m1-paste-estimate": sysdesignM1PasteEstimate,
  "sysdesign-m1-paste-failover": sysdesignM1PasteFailover,
  "sysdesign-m1-paste-ids": sysdesignM1PasteIds,
  "sysdesign-m1-paste-no-cache": sysdesignM1PasteNoCache,
  "sysdesign-m1-quality-reqs": sysdesignM1QualityReqs,
  "sysdesign-m2-across-the-world": sysdesignM2AcrossTheWorld,
  "sysdesign-m2-average-hides": sysdesignM2AverageHides,
  "sysdesign-m2-bursts-wait": sysdesignM2BurstsWait,
  "sysdesign-m2-cache-vs-memory": sysdesignM2CacheVsMemory,
  "sysdesign-m2-chain-fails": sysdesignM2ChainFails,
  "sysdesign-m2-chatty-page": sysdesignM2ChattyPage,
  "sysdesign-m2-disk-fills": sysdesignM2DiskFills,
  "sysdesign-m2-fan-out-odds": sysdesignM2FanOutOdds,
  "sysdesign-m2-fan-out-tail": sysdesignM2FanOutTail,
  "sysdesign-m2-hedged-request": sysdesignM2HedgedRequest,
  "sysdesign-m2-littles-law": sysdesignM2LittlesLaw,
  "sysdesign-m2-peak-hour": sysdesignM2PeakHour,
  "sysdesign-m2-queue-grows": sysdesignM2QueueGrows,
  "sysdesign-m2-region-round-trip": sysdesignM2RegionRoundTrip,
  "sysdesign-m2-shared-power": sysdesignM2SharedPower,
  "sysdesign-m2-ssd-read": sysdesignM2SsdRead,
  "sysdesign-m2-storage-piles-up": sysdesignM2StoragePilesUp,
  "sysdesign-m2-two-copies": sysdesignM2TwoCopies,
  "sysdesign-m2-utilisation-knee": sysdesignM2UtilisationKnee,
  "sysdesign-m1-requirement-sorter": sysdesignM1RequirementSorter,
  "sysdesign-m1-block-map": sysdesignM1BlockMap,
  "sysdesign-m2-knee-play": sysdesignM2KneePlay,
  "sysdesign-m2-fan-out-play": sysdesignM2FanOutPlay,
  "sysdesign-m1-design-loop": sysdesignM1DesignLoop,
  "sysdesign-m2-latency-ladder": sysdesignM2LatencyLadder,
  "sysdesign-m2-estimator": sysdesignM2Estimator,
  "sysdesign-m2-availability-builder": sysdesignM2AvailabilityBuilder,
  "sysdesign-m1-launch-day-illustrated": sysdesignM1LaunchDayIllustrated,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
