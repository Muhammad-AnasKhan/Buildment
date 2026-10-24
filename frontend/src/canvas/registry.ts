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
import { sysdesignM10DriftApart } from "./sysdesign-m10-drift-apart/data";
import { sysdesignM10HlcCatchUp } from "./sysdesign-m10-hlc-catch-up/data";
import { sysdesignM10HlcRule } from "./sysdesign-m10-hlc-rule/data";
import { sysdesignM10IdCounter } from "./sysdesign-m10-id-counter/data";
import { sysdesignM10IdRandom } from "./sysdesign-m10-id-random/data";
import { sysdesignM10IdRollback } from "./sysdesign-m10-id-rollback/data";
import { sysdesignM10LamportNoCause } from "./sysdesign-m10-lamport-no-cause/data";
import { sysdesignM10LamportRule } from "./sysdesign-m10-lamport-rule/data";
import { sysdesignM10LamportSort } from "./sysdesign-m10-lamport-sort/data";
import { sysdesignM10LogMerge } from "./sysdesign-m10-log-merge/data";
import { sysdesignM10SyncPullsBack } from "./sysdesign-m10-sync-pulls-back/data";
import { sysdesignM10VectorBuild } from "./sysdesign-m10-vector-build/data";
import { sysdesignM10VectorConcurrent } from "./sysdesign-m10-vector-concurrent/data";
import { sysdesignM10VectorMerge } from "./sysdesign-m10-vector-merge/data";
import { sysdesignM10WallBreaksCause } from "./sysdesign-m10-wall-breaks-cause/data";
import { sysdesignM10WallVsMonotonic } from "./sysdesign-m10-wall-vs-monotonic/data";
import { sysdesignM8AsyncLoss } from "./sysdesign-m8-async-loss/data";
import { sysdesignM8CommentTwice } from "./sysdesign-m8-comment-twice/data";
import { sysdesignM8Detect } from "./sysdesign-m8-detect/data";
import { sysdesignM8FencingToken } from "./sysdesign-m8-fencing-token/data";
import { sysdesignM8LogOrder } from "./sysdesign-m8-log-order/data";
import { sysdesignM8LwwLoses } from "./sysdesign-m8-lww-loses/data";
import { sysdesignM8PromoteLoss } from "./sysdesign-m8-promote-loss/data";
import { sysdesignM8ReadRepair } from "./sysdesign-m8-read-repair/data";
import { sysdesignM8ReadSpread } from "./sysdesign-m8-read-spread/data";
import { sysdesignM8SyncWait } from "./sysdesign-m8-sync-wait/data";
import { sysdesignM8TwoLeaders } from "./sysdesign-m8-two-leaders/data";
import { sysdesignM8WriteMany } from "./sysdesign-m8-write-many/data";
import { sysdesignM8WritePath } from "./sysdesign-m8-write-path/data";
import { sysdesignM9CelebrityKey } from "./sysdesign-m9-celebrity-key/data";
import { sysdesignM9DynamicSplit } from "./sysdesign-m9-dynamic-split/data";
import { sysdesignM9FixedPartitions } from "./sysdesign-m9-fixed-partitions/data";
import { sysdesignM9GlobalIndexLag } from "./sysdesign-m9-global-index-lag/data";
import { sysdesignM9HashSpread } from "./sysdesign-m9-hash-spread/data";
import { sysdesignM9ModNReshuffle } from "./sysdesign-m9-mod-n-reshuffle/data";
import { sysdesignM9OneTable } from "./sysdesign-m9-one-table/data";
import { sysdesignM9RangeHotTail } from "./sysdesign-m9-range-hot-tail/data";
import { sysdesignM9RingAddNode } from "./sysdesign-m9-ring-add-node/data";
import { sysdesignM9RingLookup } from "./sysdesign-m9-ring-lookup/data";
import { sysdesignM9RingNodeFails } from "./sysdesign-m9-ring-node-fails/data";
import { sysdesignM9RingUneven } from "./sysdesign-m9-ring-uneven/data";
import { sysdesignM9SaltedKey } from "./sysdesign-m9-salted-key/data";
import { sysdesignM9ScatterGather } from "./sysdesign-m9-scatter-gather/data";
import { sysdesignM9StaleMap } from "./sysdesign-m9-stale-map/data";
import { sysdesignM6ApiStyleWeigh } from "./sysdesign-m6-api-style-weigh/data";
import { sysdesignM6PagingInsert } from "./sysdesign-m6-paging-insert/data";
import { sysdesignM6RetryKey } from "./sysdesign-m6-retry-key/data";
import { sysdesignM6LimiterBurst } from "./sysdesign-m6-limiter-burst/data";
import { sysdesignM6GatewayJobs } from "./sysdesign-m6-gateway-jobs/data";
import { sysdesignM6RevokeTimeline } from "./sysdesign-m6-revoke-timeline/data";
import { sysdesignM7BloomSkip } from "./sysdesign-m7-bloom-skip/data";
import { sysdesignM7BtreeSplit } from "./sysdesign-m7-btree-split/data";
import { sysdesignM7DirtyRead } from "./sysdesign-m7-dirty-read/data";
import { sysdesignM7FixCas } from "./sysdesign-m7-fix-cas/data";
import { sysdesignM7FixLock } from "./sysdesign-m7-fix-lock/data";
import { sysdesignM7IndexScan } from "./sysdesign-m7-index-scan/data";
import { sysdesignM7LastTicket } from "./sysdesign-m7-last-ticket/data";
import { sysdesignM7LostUpdate } from "./sysdesign-m7-lost-update/data";
import { sysdesignM7LsmWrite } from "./sysdesign-m7-lsm-write/data";
import { sysdesignM7MvccVersions } from "./sysdesign-m7-mvcc-versions/data";
import { sysdesignM7PathCache } from "./sysdesign-m7-path-cache/data";
import { sysdesignM7PathIndex } from "./sysdesign-m7-path-index/data";
import { sysdesignM7PathReplica } from "./sysdesign-m7-path-replica/data";
import { sysdesignM7PathShard } from "./sysdesign-m7-path-shard/data";
import { sysdesignM7StoreJoin } from "./sysdesign-m7-store-join/data";
import { sysdesignM7StoreKeyed } from "./sysdesign-m7-store-keyed/data";
import { sysdesignM7StoreSpecial } from "./sysdesign-m7-store-special/data";
import { sysdesignM7StoreStream } from "./sysdesign-m7-store-stream/data";
import { sysdesignM7TxnCrash } from "./sysdesign-m7-txn-crash/data";
import { sysdesignM7WriteSkew } from "./sysdesign-m7-write-skew/data";
import { sysdesignM10DriftSync } from "./sysdesign-m10-drift-sync/data";
import { sysdesignM10LamportPlay } from "./sysdesign-m10-lamport-play/data";
import { sysdesignM10VectorCompare } from "./sysdesign-m10-vector-compare/data";
import { sysdesignM10HlcSkewed } from "./sysdesign-m10-hlc-skewed/data";
import { sysdesignM10SnowflakeBits } from "./sysdesign-m10-snowflake-bits/data";
import { sysdesignM8LeaderFollowers } from "./sysdesign-m8-leader-followers/data";
import { sysdesignM8ConfirmCount } from "./sysdesign-m8-confirm-count/data";
import { sysdesignM8SplitBrain } from "./sysdesign-m8-split-brain/data";
import { sysdesignM8TwoRegionsEdit } from "./sysdesign-m8-two-regions-edit/data";
import { sysdesignM8QuorumNodes } from "./sysdesign-m8-quorum-nodes/data";
import { sysdesignM9RangeVsHash } from "./sysdesign-m9-range-vs-hash/data";
import { sysdesignM9RingPlay } from "./sysdesign-m9-ring-play/data";
import { sysdesignM9CelebrityPlay } from "./sysdesign-m9-celebrity-play/data";
import { sysdesignM9RebalancePlay } from "./sysdesign-m9-rebalance-play/data";
import { sysdesignM9ScatterPlay } from "./sysdesign-m9-scatter-play/data";
import { sysdesignM7StoreSorter } from "./sysdesign-m7-store-sorter/data";
import { sysdesignM7LsmStepper } from "./sysdesign-m7-lsm-stepper/data";
import { sysdesignM7BloomBits } from "./sysdesign-m7-bloom-bits/data";
import { sysdesignM7IsolationLab } from "./sysdesign-m7-isolation-lab/data";
import { sysdesignM7TwoWriters } from "./sysdesign-m7-two-writers/data";
import { sysdesignM7ScalingPath } from "./sysdesign-m7-scaling-path/data";
import { sysdesignM12ElectionAfterCrash } from "./sysdesign-m12-election-after-crash/data";
import { sysdesignM12GossipRumor } from "./sysdesign-m12-gossip-rumor/data";
import { sysdesignM12LeaseHandover } from "./sysdesign-m12-lease-handover/data";
import { sysdesignM12LogCommit } from "./sysdesign-m12-log-commit/data";
import { sysdesignM12LogOverwritten } from "./sysdesign-m12-log-overwritten/data";
import { sysdesignM12MajoritySurvives } from "./sysdesign-m12-majority-survives/data";
import { sysdesignM12OldLeaderCutOff } from "./sysdesign-m12-old-leader-cut-off/data";
import { sysdesignM12OldLeaderStepsDown } from "./sysdesign-m12-old-leader-steps-down/data";
import { sysdesignM12PausedWakes } from "./sysdesign-m12-paused-wakes/data";
import { sysdesignM12PaxosDuel } from "./sysdesign-m12-paxos-duel/data";
import { sysdesignM12QuorumOverlap } from "./sysdesign-m12-quorum-overlap/data";
import { sysdesignM12RegistryWatch } from "./sysdesign-m12-registry-watch/data";
import { sysdesignM12SlowOrDead } from "./sysdesign-m12-slow-or-dead/data";
import { sysdesignM12SplitVote } from "./sysdesign-m12-split-vote/data";
import { sysdesignM12StaleWrite } from "./sysdesign-m12-stale-write/data";
import { sysdesignM12SwimIndirect } from "./sysdesign-m12-swim-indirect/data";
import { sysdesignM12SwimSuspect } from "./sysdesign-m12-swim-suspect/data";
import { sysdesignM12TwoReaders } from "./sysdesign-m12-two-readers/data";
import { sysdesignM12TwoSchedulers } from "./sysdesign-m12-two-schedulers/data";
import { sysdesignM11BalanceBack } from "./sysdesign-m11-balance-back/data";
import { sysdesignM11CartLost } from "./sysdesign-m11-cart-lost/data";
import { sysdesignM11Eventually } from "./sysdesign-m11-eventually/data";
import { sysdesignM11NoDeadline } from "./sysdesign-m11-no-deadline/data";
import { sysdesignM11OneAtATime } from "./sysdesign-m11-one-at-a-time/data";
import { sysdesignM11OneOperation } from "./sysdesign-m11-one-operation/data";
import { sysdesignM11QuorumNotEnough } from "./sysdesign-m11-quorum-not-enough/data";
import { sysdesignM11ReplyFirst } from "./sysdesign-m11-reply-first/data";
import { sysdesignM11ReplyWaits } from "./sysdesign-m11-reply-waits/data";
import { sysdesignM11StaleReplicaRead } from "./sysdesign-m11-stale-replica-read/data";
import { sysdesignM11TwoDevices } from "./sysdesign-m11-two-devices/data";
import { sysdesignM11TwoOrders } from "./sysdesign-m11-two-orders/data";
import { sysdesignM11UsernameTwice } from "./sysdesign-m11-username-twice/data";
import { sysdesignM12QuorumExplorer } from "./sysdesign-m12-quorum-explorer/data";
import { sysdesignM12FencingPlay } from "./sysdesign-m12-fencing-play/data";
import { sysdesignM13CartAccepts } from "./sysdesign-m13-cart-accepts/data";
import { sysdesignM13CartRefuses } from "./sysdesign-m13-cart-refuses/data";
import { sysdesignM13CartResurrect } from "./sysdesign-m13-cart-resurrect/data";
import { sysdesignM13CounterNaive } from "./sysdesign-m13-counter-naive/data";
import { sysdesignM13CrdtLimit } from "./sysdesign-m13-crdt-limit/data";
import { sysdesignM13DdbConditional } from "./sysdesign-m13-ddb-conditional/data";
import { sysdesignM13DdbReads } from "./sysdesign-m13-ddb-reads/data";
import { sysdesignM13DdbWrite } from "./sysdesign-m13-ddb-write/data";
import { sysdesignM13Gcounter } from "./sysdesign-m13-gcounter/data";
import { sysdesignM13HintLost } from "./sysdesign-m13-hint-lost/data";
import { sysdesignM13HintedHandoff } from "./sysdesign-m13-hinted-handoff/data";
import { sysdesignM13LwwSkewStory } from "./sysdesign-m13-lww-skew-story/data";
import { sysdesignM13LwwWholeItem } from "./sysdesign-m13-lww-whole-item/data";
import { sysdesignM13Orset } from "./sysdesign-m13-orset/data";
import { sysdesignM13Pncounter } from "./sysdesign-m13-pncounter/data";
import { sysdesignM13SiblingContext } from "./sysdesign-m13-sibling-context/data";
import { sysdesignM13StrictFails } from "./sysdesign-m13-strict-fails/data";
import { sysdesignM13WritePath } from "./sysdesign-m13-write-path/data";
import { sysdesignM12TimeoutSlider } from "./sysdesign-m12-timeout-slider/data";
import { sysdesignM12GossipSpread } from "./sysdesign-m12-gossip-spread/data";
import { sysdesignM12PaxosPlay } from "./sysdesign-m12-paxos-play/data";
import { sysdesignM12RegistryPlay } from "./sysdesign-m12-registry-play/data";
import { sysdesignM14TwoPcHappy } from "./sysdesign-m14-2pc-happy/data";
import { sysdesignM14TwoPcStuck } from "./sysdesign-m14-2pc-stuck/data";
import { sysdesignM14AckLost } from "./sysdesign-m14-ack-lost/data";
import { sysdesignM14DedupeForgot } from "./sysdesign-m14-dedupe-forgot/data";
import { sysdesignM14DedupeTxn } from "./sysdesign-m14-dedupe-txn/data";
import { sysdesignM14DualWrite } from "./sysdesign-m14-dual-write/data";
import { sysdesignM14OutboxRelay } from "./sysdesign-m14-outbox-relay/data";
import { sysdesignM14OutboxTwice } from "./sysdesign-m14-outbox-twice/data";
import { sysdesignM14PaidNotReserved } from "./sysdesign-m14-paid-not-reserved/data";
import { sysdesignM14SagaChorus } from "./sysdesign-m14-saga-chorus/data";
import { sysdesignM14SagaNotIsolated } from "./sysdesign-m14-saga-not-isolated/data";
import { sysdesignM14SagaOrchestra } from "./sysdesign-m14-saga-orchestra/data";
import { sysdesignM14SagaSteps } from "./sysdesign-m14-saga-steps/data";
import { sysdesignM11BuildHistory } from "./sysdesign-m11-build-history/data";
import { sysdesignM12RaftElectionPlay } from "./sysdesign-m12-raft-election-play/data";
import { sysdesignM12RaftLogPlay } from "./sysdesign-m12-raft-log-play/data";
import { sysdesignM11OverlapOrNot } from "./sysdesign-m11-overlap-or-not/data";
import { sysdesignM11IsItLinearizable } from "./sysdesign-m11-is-it-linearizable/data";
import { sysdesignM11OneHistoryThreeVerdicts } from "./sysdesign-m11-one-history-three-verdicts/data";
import { sysdesignM14TwoPcCrash } from "./sysdesign-m14-2pc-crash/data";
import { sysdesignM14SagaFail } from "./sysdesign-m14-saga-fail/data";
import { sysdesignM14OutboxCrash } from "./sysdesign-m14-outbox-crash/data";
import { sysdesignM14DedupeFlow } from "./sysdesign-m14-dedupe-flow/data";
import { sysdesignM11SessionReads } from "./sysdesign-m11-session-reads/data";
import { sysdesignM11SessionWrites } from "./sysdesign-m11-session-writes/data";
import { sysdesignM13RingWrite } from "./sysdesign-m13-ring-write/data";
import { sysdesignM13ClusterHeal } from "./sysdesign-m13-cluster-heal/data";
import { sysdesignM13HotPartition } from "./sysdesign-m13-hot-partition/data";
import { sysdesignM13LwwSkew } from "./sysdesign-m13-lww-skew/data";
import { sysdesignM13CartMerge } from "./sysdesign-m13-cart-merge/data";
import { sysdesignM13CrdtPlay } from "./sysdesign-m13-crdt-play/data";
import { sysdesignM11SyncRate } from "./sysdesign-m11-sync-rate/data";
import { sysdesignM11CutTheNetwork } from "./sysdesign-m11-cut-the-network/data";
import { sysdesignM11LatencyOrFresh } from "./sysdesign-m11-latency-or-fresh/data";
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
  "sysdesign-m10-drift-apart": sysdesignM10DriftApart,
  "sysdesign-m10-hlc-catch-up": sysdesignM10HlcCatchUp,
  "sysdesign-m10-hlc-rule": sysdesignM10HlcRule,
  "sysdesign-m10-id-counter": sysdesignM10IdCounter,
  "sysdesign-m10-id-random": sysdesignM10IdRandom,
  "sysdesign-m10-id-rollback": sysdesignM10IdRollback,
  "sysdesign-m10-lamport-no-cause": sysdesignM10LamportNoCause,
  "sysdesign-m10-lamport-rule": sysdesignM10LamportRule,
  "sysdesign-m10-lamport-sort": sysdesignM10LamportSort,
  "sysdesign-m10-log-merge": sysdesignM10LogMerge,
  "sysdesign-m10-sync-pulls-back": sysdesignM10SyncPullsBack,
  "sysdesign-m10-vector-build": sysdesignM10VectorBuild,
  "sysdesign-m10-vector-concurrent": sysdesignM10VectorConcurrent,
  "sysdesign-m10-vector-merge": sysdesignM10VectorMerge,
  "sysdesign-m10-wall-breaks-cause": sysdesignM10WallBreaksCause,
  "sysdesign-m10-wall-vs-monotonic": sysdesignM10WallVsMonotonic,
  "sysdesign-m8-async-loss": sysdesignM8AsyncLoss,
  "sysdesign-m8-comment-twice": sysdesignM8CommentTwice,
  "sysdesign-m8-detect": sysdesignM8Detect,
  "sysdesign-m8-fencing-token": sysdesignM8FencingToken,
  "sysdesign-m8-log-order": sysdesignM8LogOrder,
  "sysdesign-m8-lww-loses": sysdesignM8LwwLoses,
  "sysdesign-m8-promote-loss": sysdesignM8PromoteLoss,
  "sysdesign-m8-read-repair": sysdesignM8ReadRepair,
  "sysdesign-m8-read-spread": sysdesignM8ReadSpread,
  "sysdesign-m8-sync-wait": sysdesignM8SyncWait,
  "sysdesign-m8-two-leaders": sysdesignM8TwoLeaders,
  "sysdesign-m8-write-many": sysdesignM8WriteMany,
  "sysdesign-m8-write-path": sysdesignM8WritePath,
  "sysdesign-m9-celebrity-key": sysdesignM9CelebrityKey,
  "sysdesign-m9-dynamic-split": sysdesignM9DynamicSplit,
  "sysdesign-m9-fixed-partitions": sysdesignM9FixedPartitions,
  "sysdesign-m9-global-index-lag": sysdesignM9GlobalIndexLag,
  "sysdesign-m9-hash-spread": sysdesignM9HashSpread,
  "sysdesign-m9-mod-n-reshuffle": sysdesignM9ModNReshuffle,
  "sysdesign-m9-one-table": sysdesignM9OneTable,
  "sysdesign-m9-range-hot-tail": sysdesignM9RangeHotTail,
  "sysdesign-m9-ring-add-node": sysdesignM9RingAddNode,
  "sysdesign-m9-ring-lookup": sysdesignM9RingLookup,
  "sysdesign-m9-ring-node-fails": sysdesignM9RingNodeFails,
  "sysdesign-m9-ring-uneven": sysdesignM9RingUneven,
  "sysdesign-m9-salted-key": sysdesignM9SaltedKey,
  "sysdesign-m9-scatter-gather": sysdesignM9ScatterGather,
  "sysdesign-m9-stale-map": sysdesignM9StaleMap,
  "sysdesign-m6-api-style-weigh": sysdesignM6ApiStyleWeigh,
  "sysdesign-m6-paging-insert": sysdesignM6PagingInsert,
  "sysdesign-m6-retry-key": sysdesignM6RetryKey,
  "sysdesign-m6-limiter-burst": sysdesignM6LimiterBurst,
  "sysdesign-m6-gateway-jobs": sysdesignM6GatewayJobs,
  "sysdesign-m6-revoke-timeline": sysdesignM6RevokeTimeline,
  "sysdesign-m7-bloom-skip": sysdesignM7BloomSkip,
  "sysdesign-m7-btree-split": sysdesignM7BtreeSplit,
  "sysdesign-m7-dirty-read": sysdesignM7DirtyRead,
  "sysdesign-m7-fix-cas": sysdesignM7FixCas,
  "sysdesign-m7-fix-lock": sysdesignM7FixLock,
  "sysdesign-m7-index-scan": sysdesignM7IndexScan,
  "sysdesign-m7-last-ticket": sysdesignM7LastTicket,
  "sysdesign-m7-lost-update": sysdesignM7LostUpdate,
  "sysdesign-m7-lsm-write": sysdesignM7LsmWrite,
  "sysdesign-m7-mvcc-versions": sysdesignM7MvccVersions,
  "sysdesign-m7-path-cache": sysdesignM7PathCache,
  "sysdesign-m7-path-index": sysdesignM7PathIndex,
  "sysdesign-m7-path-replica": sysdesignM7PathReplica,
  "sysdesign-m7-path-shard": sysdesignM7PathShard,
  "sysdesign-m7-store-join": sysdesignM7StoreJoin,
  "sysdesign-m7-store-keyed": sysdesignM7StoreKeyed,
  "sysdesign-m7-store-special": sysdesignM7StoreSpecial,
  "sysdesign-m7-store-stream": sysdesignM7StoreStream,
  "sysdesign-m7-txn-crash": sysdesignM7TxnCrash,
  "sysdesign-m7-write-skew": sysdesignM7WriteSkew,
  "sysdesign-m10-drift-sync": sysdesignM10DriftSync,
  "sysdesign-m10-lamport-play": sysdesignM10LamportPlay,
  "sysdesign-m10-vector-compare": sysdesignM10VectorCompare,
  "sysdesign-m10-hlc-skewed": sysdesignM10HlcSkewed,
  "sysdesign-m10-snowflake-bits": sysdesignM10SnowflakeBits,
  "sysdesign-m8-leader-followers": sysdesignM8LeaderFollowers,
  "sysdesign-m8-confirm-count": sysdesignM8ConfirmCount,
  "sysdesign-m8-split-brain": sysdesignM8SplitBrain,
  "sysdesign-m8-two-regions-edit": sysdesignM8TwoRegionsEdit,
  "sysdesign-m8-quorum-nodes": sysdesignM8QuorumNodes,
  "sysdesign-m9-range-vs-hash": sysdesignM9RangeVsHash,
  "sysdesign-m9-ring-play": sysdesignM9RingPlay,
  "sysdesign-m9-celebrity-play": sysdesignM9CelebrityPlay,
  "sysdesign-m9-rebalance-play": sysdesignM9RebalancePlay,
  "sysdesign-m9-scatter-play": sysdesignM9ScatterPlay,
  "sysdesign-m7-store-sorter": sysdesignM7StoreSorter,
  "sysdesign-m7-lsm-stepper": sysdesignM7LsmStepper,
  "sysdesign-m7-bloom-bits": sysdesignM7BloomBits,
  "sysdesign-m7-isolation-lab": sysdesignM7IsolationLab,
  "sysdesign-m7-two-writers": sysdesignM7TwoWriters,
  "sysdesign-m7-scaling-path": sysdesignM7ScalingPath,
  "sysdesign-m12-election-after-crash": sysdesignM12ElectionAfterCrash,
  "sysdesign-m12-gossip-rumor": sysdesignM12GossipRumor,
  "sysdesign-m12-lease-handover": sysdesignM12LeaseHandover,
  "sysdesign-m12-log-commit": sysdesignM12LogCommit,
  "sysdesign-m12-log-overwritten": sysdesignM12LogOverwritten,
  "sysdesign-m12-majority-survives": sysdesignM12MajoritySurvives,
  "sysdesign-m12-old-leader-cut-off": sysdesignM12OldLeaderCutOff,
  "sysdesign-m12-old-leader-steps-down": sysdesignM12OldLeaderStepsDown,
  "sysdesign-m12-paused-wakes": sysdesignM12PausedWakes,
  "sysdesign-m12-paxos-duel": sysdesignM12PaxosDuel,
  "sysdesign-m12-quorum-overlap": sysdesignM12QuorumOverlap,
  "sysdesign-m12-registry-watch": sysdesignM12RegistryWatch,
  "sysdesign-m12-slow-or-dead": sysdesignM12SlowOrDead,
  "sysdesign-m12-split-vote": sysdesignM12SplitVote,
  "sysdesign-m12-stale-write": sysdesignM12StaleWrite,
  "sysdesign-m12-swim-indirect": sysdesignM12SwimIndirect,
  "sysdesign-m12-swim-suspect": sysdesignM12SwimSuspect,
  "sysdesign-m12-two-readers": sysdesignM12TwoReaders,
  "sysdesign-m12-two-schedulers": sysdesignM12TwoSchedulers,
  "sysdesign-m11-balance-back": sysdesignM11BalanceBack,
  "sysdesign-m11-cart-lost": sysdesignM11CartLost,
  "sysdesign-m11-eventually": sysdesignM11Eventually,
  "sysdesign-m11-no-deadline": sysdesignM11NoDeadline,
  "sysdesign-m11-one-at-a-time": sysdesignM11OneAtATime,
  "sysdesign-m11-one-operation": sysdesignM11OneOperation,
  "sysdesign-m11-quorum-not-enough": sysdesignM11QuorumNotEnough,
  "sysdesign-m11-reply-first": sysdesignM11ReplyFirst,
  "sysdesign-m11-reply-waits": sysdesignM11ReplyWaits,
  "sysdesign-m11-stale-replica-read": sysdesignM11StaleReplicaRead,
  "sysdesign-m11-two-devices": sysdesignM11TwoDevices,
  "sysdesign-m11-two-orders": sysdesignM11TwoOrders,
  "sysdesign-m11-username-twice": sysdesignM11UsernameTwice,
  "sysdesign-m12-quorum-explorer": sysdesignM12QuorumExplorer,
  "sysdesign-m12-fencing-play": sysdesignM12FencingPlay,
  "sysdesign-m13-cart-accepts": sysdesignM13CartAccepts,
  "sysdesign-m13-cart-refuses": sysdesignM13CartRefuses,
  "sysdesign-m13-cart-resurrect": sysdesignM13CartResurrect,
  "sysdesign-m13-counter-naive": sysdesignM13CounterNaive,
  "sysdesign-m13-crdt-limit": sysdesignM13CrdtLimit,
  "sysdesign-m13-ddb-conditional": sysdesignM13DdbConditional,
  "sysdesign-m13-ddb-reads": sysdesignM13DdbReads,
  "sysdesign-m13-ddb-write": sysdesignM13DdbWrite,
  "sysdesign-m13-gcounter": sysdesignM13Gcounter,
  "sysdesign-m13-hint-lost": sysdesignM13HintLost,
  "sysdesign-m13-hinted-handoff": sysdesignM13HintedHandoff,
  "sysdesign-m13-lww-skew-story": sysdesignM13LwwSkewStory,
  "sysdesign-m13-lww-whole-item": sysdesignM13LwwWholeItem,
  "sysdesign-m13-orset": sysdesignM13Orset,
  "sysdesign-m13-pncounter": sysdesignM13Pncounter,
  "sysdesign-m13-sibling-context": sysdesignM13SiblingContext,
  "sysdesign-m13-strict-fails": sysdesignM13StrictFails,
  "sysdesign-m13-write-path": sysdesignM13WritePath,
  "sysdesign-m12-timeout-slider": sysdesignM12TimeoutSlider,
  "sysdesign-m12-gossip-spread": sysdesignM12GossipSpread,
  "sysdesign-m12-paxos-play": sysdesignM12PaxosPlay,
  "sysdesign-m12-registry-play": sysdesignM12RegistryPlay,
  "sysdesign-m14-2pc-happy": sysdesignM14TwoPcHappy,
  "sysdesign-m14-2pc-stuck": sysdesignM14TwoPcStuck,
  "sysdesign-m14-ack-lost": sysdesignM14AckLost,
  "sysdesign-m14-dedupe-forgot": sysdesignM14DedupeForgot,
  "sysdesign-m14-dedupe-txn": sysdesignM14DedupeTxn,
  "sysdesign-m14-dual-write": sysdesignM14DualWrite,
  "sysdesign-m14-outbox-relay": sysdesignM14OutboxRelay,
  "sysdesign-m14-outbox-twice": sysdesignM14OutboxTwice,
  "sysdesign-m14-paid-not-reserved": sysdesignM14PaidNotReserved,
  "sysdesign-m14-saga-chorus": sysdesignM14SagaChorus,
  "sysdesign-m14-saga-not-isolated": sysdesignM14SagaNotIsolated,
  "sysdesign-m14-saga-orchestra": sysdesignM14SagaOrchestra,
  "sysdesign-m14-saga-steps": sysdesignM14SagaSteps,
  "sysdesign-m11-build-history": sysdesignM11BuildHistory,
  "sysdesign-m12-raft-election-play": sysdesignM12RaftElectionPlay,
  "sysdesign-m12-raft-log-play": sysdesignM12RaftLogPlay,
  "sysdesign-m11-overlap-or-not": sysdesignM11OverlapOrNot,
  "sysdesign-m11-is-it-linearizable": sysdesignM11IsItLinearizable,
  "sysdesign-m11-one-history-three-verdicts": sysdesignM11OneHistoryThreeVerdicts,
  "sysdesign-m14-2pc-crash": sysdesignM14TwoPcCrash,
  "sysdesign-m14-saga-fail": sysdesignM14SagaFail,
  "sysdesign-m14-outbox-crash": sysdesignM14OutboxCrash,
  "sysdesign-m14-dedupe-flow": sysdesignM14DedupeFlow,
  "sysdesign-m11-session-reads": sysdesignM11SessionReads,
  "sysdesign-m11-session-writes": sysdesignM11SessionWrites,
  "sysdesign-m13-ring-write": sysdesignM13RingWrite,
  "sysdesign-m13-cluster-heal": sysdesignM13ClusterHeal,
  "sysdesign-m13-hot-partition": sysdesignM13HotPartition,
  "sysdesign-m13-lww-skew": sysdesignM13LwwSkew,
  "sysdesign-m13-cart-merge": sysdesignM13CartMerge,
  "sysdesign-m13-crdt-play": sysdesignM13CrdtPlay,
  "sysdesign-m11-sync-rate": sysdesignM11SyncRate,
  "sysdesign-m11-cut-the-network": sysdesignM11CutTheNetwork,
  "sysdesign-m11-latency-or-fresh": sysdesignM11LatencyOrFresh,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
