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
import { sysdesignM4BlastRadius } from "./sysdesign-m4-blast-radius/data";
import { sysdesignM4DeepCheck } from "./sysdesign-m4-deep-check/data";
import { sysdesignM4Flapping } from "./sysdesign-m4-flapping/data";
import { sysdesignM4HealthCheck } from "./sysdesign-m4-health-check/data";
import { sysdesignM4L4Connection } from "./sysdesign-m4-l4-connection/data";
import { sysdesignM4L7Request } from "./sysdesign-m4-l7-request/data";
import { sysdesignM4LeastBusy } from "./sysdesign-m4-least-busy/data";
import { sysdesignM4NPlusOne } from "./sysdesign-m4-n-plus-one/data";
import { sysdesignM4OneBigServer } from "./sysdesign-m4-one-big-server/data";
import { sysdesignM4RoundRobinBlind } from "./sysdesign-m4-round-robin-blind/data";
import { sysdesignM4ScaleFormula } from "./sysdesign-m4-scale-formula/data";
import { sysdesignM4ScaleLag } from "./sysdesign-m4-scale-lag/data";
import { sysdesignM4ScaleUpCeiling } from "./sysdesign-m4-scale-up-ceiling/data";
import { sysdesignM4SessionLost } from "./sysdesign-m4-session-lost/data";
import { sysdesignM4SessionStore } from "./sysdesign-m4-session-store/data";
import { sysdesignM4StickyPin } from "./sysdesign-m4-sticky-pin/data";
import { sysdesignM4TwoChoices } from "./sysdesign-m4-two-choices/data";
import { sysdesignM3Anycast } from "./sysdesign-m3-anycast/data";
import { sysdesignM3DnsCache } from "./sysdesign-m3-dns-cache/data";
import { sysdesignM3DnsEmpty } from "./sysdesign-m3-dns-empty/data";
import { sysdesignM3DnsLookup } from "./sysdesign-m3-dns-lookup/data";
import { sysdesignM3EventLoop } from "./sysdesign-m3-event-loop/data";
import { sysdesignM3H2Stall } from "./sysdesign-m3-h2-stall/data";
import { sysdesignM3H3Streams } from "./sysdesign-m3-h3-streams/data";
import { sysdesignM3Http1OneAtATime } from "./sysdesign-m3-http1-one-at-a-time/data";
import { sysdesignM3Http2Streams } from "./sysdesign-m3-http2-streams/data";
import { sysdesignM3KeepAlive } from "./sysdesign-m3-keep-alive/data";
import { sysdesignM3LongPolling } from "./sysdesign-m3-long-polling/data";
import { sysdesignM3OpenALink } from "./sysdesign-m3-open-a-link/data";
import { sysdesignM3Polling } from "./sysdesign-m3-polling/data";
import { sysdesignM3PortDoor } from "./sysdesign-m3-port-door/data";
import { sysdesignM3QuicHandshake } from "./sysdesign-m3-quic-handshake/data";
import { sysdesignM3QuicMigration } from "./sysdesign-m3-quic-migration/data";
import { sysdesignM3Sse } from "./sysdesign-m3-sse/data";
import { sysdesignM3TcpHandshake } from "./sysdesign-m3-tcp-handshake/data";
import { sysdesignM3ThreadPool } from "./sysdesign-m3-thread-pool/data";
import { sysdesignM3TlsHandshake } from "./sysdesign-m3-tls-handshake/data";
import { sysdesignM3Websocket } from "./sysdesign-m3-websocket/data";
import { sysdesignM5AsideRead } from "./sysdesign-m5-aside-read/data";
import { sysdesignM5CacheControl } from "./sysdesign-m5-cache-control/data";
import { sysdesignM5Coalesce } from "./sysdesign-m5-coalesce/data";
import { sysdesignM5DeleteOnWrite } from "./sysdesign-m5-delete-on-write/data";
import { sysdesignM5DeleteWindow } from "./sysdesign-m5-delete-window/data";
import { sysdesignM5EdgeHit } from "./sysdesign-m5-edge-hit/data";
import { sysdesignM5ExpiryLineup } from "./sysdesign-m5-expiry-lineup/data";
import { sysdesignM5Herd } from "./sysdesign-m5-herd/data";
import { sysdesignM5HotNode } from "./sysdesign-m5-hot-node/data";
import { sysdesignM5LruEvict } from "./sysdesign-m5-lru-evict/data";
import { sysdesignM5NextDoor } from "./sysdesign-m5-next-door/data";
import { sysdesignM5OriginShield } from "./sysdesign-m5-origin-shield/data";
import { sysdesignM5Revalidate } from "./sysdesign-m5-revalidate/data";
import { sysdesignM5SaleExpiry } from "./sysdesign-m5-sale-expiry/data";
import { sysdesignM5ScanFlush } from "./sysdesign-m5-scan-flush/data";
import { sysdesignM5SignedUrl } from "./sysdesign-m5-signed-url/data";
import { sysdesignM5StaleSetRace } from "./sysdesign-m5-stale-set-race/data";
import { sysdesignM5Swr } from "./sysdesign-m5-swr/data";
import { sysdesignM5TtlStale } from "./sysdesign-m5-ttl-stale/data";
import { sysdesignM5VersionedFile } from "./sysdesign-m5-versioned-file/data";
import { sysdesignM5VersionedKeys } from "./sysdesign-m5-versioned-keys/data";
import { sysdesignM5WorkingSet } from "./sysdesign-m5-working-set/data";
import { sysdesignM5WriteBackCrash } from "./sysdesign-m5-write-back-crash/data";
import { sysdesignM5WriteThrough } from "./sysdesign-m5-write-through/data";
import { sysdesignM6CursorPage } from "./sysdesign-m6-cursor-page/data";
import { sysdesignM6DoubleCharge } from "./sysdesign-m6-double-charge/data";
import { sysdesignM6FixedWindowEdge } from "./sysdesign-m6-fixed-window-edge/data";
import { sysdesignM6GatewayRoute } from "./sysdesign-m6-gateway-route/data";
import { sysdesignM6GraphqlOneTrip } from "./sysdesign-m6-graphql-one-trip/data";
import { sysdesignM6GrpcCall } from "./sysdesign-m6-grpc-call/data";
import { sysdesignM6JwtVerify } from "./sysdesign-m6-jwt-verify/data";
import { sysdesignM6KeyRace } from "./sysdesign-m6-key-race/data";
import { sysdesignM6KeyReplay } from "./sysdesign-m6-key-replay/data";
import { sysdesignM6LeakyBucket } from "./sysdesign-m6-leaky-bucket/data";
import { sysdesignM6Limit429 } from "./sysdesign-m6-limit-429/data";
import { sysdesignM6NoGateway } from "./sysdesign-m6-no-gateway/data";
import { sysdesignM6OffsetRepeat } from "./sysdesign-m6-offset-repeat/data";
import { sysdesignM6OwnershipCheck } from "./sysdesign-m6-ownership-check/data";
import { sysdesignM6RestRoundTrips } from "./sysdesign-m6-rest-round-trips/data";
import { sysdesignM6ServiceIdentity } from "./sysdesign-m6-service-identity/data";
import { sysdesignM6SessionLookup } from "./sysdesign-m6-session-lookup/data";
import { sysdesignM6SlidingCounter } from "./sysdesign-m6-sliding-counter/data";
import { sysdesignM6TimeoutUnknown } from "./sysdesign-m6-timeout-unknown/data";
import { sysdesignM6TokenBucket } from "./sysdesign-m6-token-bucket/data";
import { sysdesignM4InstancePicker } from "./sysdesign-m4-instance-picker/data";
import { sysdesignM4KillServer } from "./sysdesign-m4-kill-server/data";
import { sysdesignM4FailoverPlay } from "./sysdesign-m4-failover-play/data";
import { sysdesignM4AlgorithmRace } from "./sysdesign-m4-algorithm-race/data";
import { sysdesignM4SpikePlay } from "./sysdesign-m4-spike-play/data";
import { sysdesignM3HandshakeCost } from "./sysdesign-m3-handshake-cost/data";
import { sysdesignM3TtlSpread } from "./sysdesign-m3-ttl-spread/data";
import { sysdesignM3LossToggle } from "./sysdesign-m3-loss-toggle/data";
import { sysdesignM3ChatFourWays } from "./sysdesign-m3-chat-four-ways/data";
import { sysdesignM3BlockingCall } from "./sysdesign-m3-blocking-call/data";
import { sysdesignM5CachePath } from "./sysdesign-m5-cache-path/data";
import { sysdesignM5PatternStepper } from "./sysdesign-m5-pattern-stepper/data";
import { sysdesignM5HitRateCurve } from "./sysdesign-m5-hit-rate-curve/data";
import { sysdesignM5StaleRace } from "./sysdesign-m5-stale-race/data";
import { sysdesignM5StampedeToggles } from "./sysdesign-m5-stampede-toggles/data";
import { sysdesignM5CdnOriginLoad } from "./sysdesign-m5-cdn-origin-load/data";
import { sysdesignM6ApiStyleWeigh } from "./sysdesign-m6-api-style-weigh/data";
import { sysdesignM6PagingInsert } from "./sysdesign-m6-paging-insert/data";
import { sysdesignM6RetryKey } from "./sysdesign-m6-retry-key/data";
import { sysdesignM6LimiterBurst } from "./sysdesign-m6-limiter-burst/data";
import { sysdesignM6GatewayJobs } from "./sysdesign-m6-gateway-jobs/data";
import { sysdesignM6RevokeTimeline } from "./sysdesign-m6-revoke-timeline/data";
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
  "sysdesign-m4-blast-radius": sysdesignM4BlastRadius,
  "sysdesign-m4-deep-check": sysdesignM4DeepCheck,
  "sysdesign-m4-flapping": sysdesignM4Flapping,
  "sysdesign-m4-health-check": sysdesignM4HealthCheck,
  "sysdesign-m4-l4-connection": sysdesignM4L4Connection,
  "sysdesign-m4-l7-request": sysdesignM4L7Request,
  "sysdesign-m4-least-busy": sysdesignM4LeastBusy,
  "sysdesign-m4-n-plus-one": sysdesignM4NPlusOne,
  "sysdesign-m4-one-big-server": sysdesignM4OneBigServer,
  "sysdesign-m4-round-robin-blind": sysdesignM4RoundRobinBlind,
  "sysdesign-m4-scale-formula": sysdesignM4ScaleFormula,
  "sysdesign-m4-scale-lag": sysdesignM4ScaleLag,
  "sysdesign-m4-scale-up-ceiling": sysdesignM4ScaleUpCeiling,
  "sysdesign-m4-session-lost": sysdesignM4SessionLost,
  "sysdesign-m4-session-store": sysdesignM4SessionStore,
  "sysdesign-m4-sticky-pin": sysdesignM4StickyPin,
  "sysdesign-m4-two-choices": sysdesignM4TwoChoices,
  "sysdesign-m3-anycast": sysdesignM3Anycast,
  "sysdesign-m3-dns-cache": sysdesignM3DnsCache,
  "sysdesign-m3-dns-empty": sysdesignM3DnsEmpty,
  "sysdesign-m3-dns-lookup": sysdesignM3DnsLookup,
  "sysdesign-m3-event-loop": sysdesignM3EventLoop,
  "sysdesign-m3-h2-stall": sysdesignM3H2Stall,
  "sysdesign-m3-h3-streams": sysdesignM3H3Streams,
  "sysdesign-m3-http1-one-at-a-time": sysdesignM3Http1OneAtATime,
  "sysdesign-m3-http2-streams": sysdesignM3Http2Streams,
  "sysdesign-m3-keep-alive": sysdesignM3KeepAlive,
  "sysdesign-m3-long-polling": sysdesignM3LongPolling,
  "sysdesign-m3-open-a-link": sysdesignM3OpenALink,
  "sysdesign-m3-polling": sysdesignM3Polling,
  "sysdesign-m3-port-door": sysdesignM3PortDoor,
  "sysdesign-m3-quic-handshake": sysdesignM3QuicHandshake,
  "sysdesign-m3-quic-migration": sysdesignM3QuicMigration,
  "sysdesign-m3-sse": sysdesignM3Sse,
  "sysdesign-m3-tcp-handshake": sysdesignM3TcpHandshake,
  "sysdesign-m3-thread-pool": sysdesignM3ThreadPool,
  "sysdesign-m3-tls-handshake": sysdesignM3TlsHandshake,
  "sysdesign-m3-websocket": sysdesignM3Websocket,
  "sysdesign-m5-aside-read": sysdesignM5AsideRead,
  "sysdesign-m5-cache-control": sysdesignM5CacheControl,
  "sysdesign-m5-coalesce": sysdesignM5Coalesce,
  "sysdesign-m5-delete-on-write": sysdesignM5DeleteOnWrite,
  "sysdesign-m5-delete-window": sysdesignM5DeleteWindow,
  "sysdesign-m5-edge-hit": sysdesignM5EdgeHit,
  "sysdesign-m5-expiry-lineup": sysdesignM5ExpiryLineup,
  "sysdesign-m5-herd": sysdesignM5Herd,
  "sysdesign-m5-hot-node": sysdesignM5HotNode,
  "sysdesign-m5-lru-evict": sysdesignM5LruEvict,
  "sysdesign-m5-next-door": sysdesignM5NextDoor,
  "sysdesign-m5-origin-shield": sysdesignM5OriginShield,
  "sysdesign-m5-revalidate": sysdesignM5Revalidate,
  "sysdesign-m5-sale-expiry": sysdesignM5SaleExpiry,
  "sysdesign-m5-scan-flush": sysdesignM5ScanFlush,
  "sysdesign-m5-signed-url": sysdesignM5SignedUrl,
  "sysdesign-m5-stale-set-race": sysdesignM5StaleSetRace,
  "sysdesign-m5-swr": sysdesignM5Swr,
  "sysdesign-m5-ttl-stale": sysdesignM5TtlStale,
  "sysdesign-m5-versioned-file": sysdesignM5VersionedFile,
  "sysdesign-m5-versioned-keys": sysdesignM5VersionedKeys,
  "sysdesign-m5-working-set": sysdesignM5WorkingSet,
  "sysdesign-m5-write-back-crash": sysdesignM5WriteBackCrash,
  "sysdesign-m5-write-through": sysdesignM5WriteThrough,
  "sysdesign-m6-cursor-page": sysdesignM6CursorPage,
  "sysdesign-m6-double-charge": sysdesignM6DoubleCharge,
  "sysdesign-m6-fixed-window-edge": sysdesignM6FixedWindowEdge,
  "sysdesign-m6-gateway-route": sysdesignM6GatewayRoute,
  "sysdesign-m6-graphql-one-trip": sysdesignM6GraphqlOneTrip,
  "sysdesign-m6-grpc-call": sysdesignM6GrpcCall,
  "sysdesign-m6-jwt-verify": sysdesignM6JwtVerify,
  "sysdesign-m6-key-race": sysdesignM6KeyRace,
  "sysdesign-m6-key-replay": sysdesignM6KeyReplay,
  "sysdesign-m6-leaky-bucket": sysdesignM6LeakyBucket,
  "sysdesign-m6-limit-429": sysdesignM6Limit429,
  "sysdesign-m6-no-gateway": sysdesignM6NoGateway,
  "sysdesign-m6-offset-repeat": sysdesignM6OffsetRepeat,
  "sysdesign-m6-ownership-check": sysdesignM6OwnershipCheck,
  "sysdesign-m6-rest-round-trips": sysdesignM6RestRoundTrips,
  "sysdesign-m6-service-identity": sysdesignM6ServiceIdentity,
  "sysdesign-m6-session-lookup": sysdesignM6SessionLookup,
  "sysdesign-m6-sliding-counter": sysdesignM6SlidingCounter,
  "sysdesign-m6-timeout-unknown": sysdesignM6TimeoutUnknown,
  "sysdesign-m6-token-bucket": sysdesignM6TokenBucket,
  "sysdesign-m4-instance-picker": sysdesignM4InstancePicker,
  "sysdesign-m4-kill-server": sysdesignM4KillServer,
  "sysdesign-m4-failover-play": sysdesignM4FailoverPlay,
  "sysdesign-m4-algorithm-race": sysdesignM4AlgorithmRace,
  "sysdesign-m4-spike-play": sysdesignM4SpikePlay,
  "sysdesign-m3-handshake-cost": sysdesignM3HandshakeCost,
  "sysdesign-m3-ttl-spread": sysdesignM3TtlSpread,
  "sysdesign-m3-loss-toggle": sysdesignM3LossToggle,
  "sysdesign-m3-chat-four-ways": sysdesignM3ChatFourWays,
  "sysdesign-m3-blocking-call": sysdesignM3BlockingCall,
  "sysdesign-m5-cache-path": sysdesignM5CachePath,
  "sysdesign-m5-pattern-stepper": sysdesignM5PatternStepper,
  "sysdesign-m5-hit-rate-curve": sysdesignM5HitRateCurve,
  "sysdesign-m5-stale-race": sysdesignM5StaleRace,
  "sysdesign-m5-stampede-toggles": sysdesignM5StampedeToggles,
  "sysdesign-m5-cdn-origin-load": sysdesignM5CdnOriginLoad,
  "sysdesign-m6-api-style-weigh": sysdesignM6ApiStyleWeigh,
  "sysdesign-m6-paging-insert": sysdesignM6PagingInsert,
  "sysdesign-m6-retry-key": sysdesignM6RetryKey,
  "sysdesign-m6-limiter-burst": sysdesignM6LimiterBurst,
  "sysdesign-m6-gateway-jobs": sysdesignM6GatewayJobs,
  "sysdesign-m6-revoke-timeline": sysdesignM6RevokeTimeline,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
