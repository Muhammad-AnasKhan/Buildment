import type { ComponentType } from "react";
import { CANVAS_SLUGS, isCanvasSlug, type CanvasSlug } from "../shared/canvas/slugs";
import type { FactorSpec } from "./renderers/factor/types";
import type { SequenceSpec } from "./renderers/sequence/types";
import type { SliderSpec } from "./renderers/slider/types";
import type { StateMachineSpec } from "./renderers/state-machine/types";
import { freshmarketMarkPacked } from "./freshmarket-mark-packed/data";
import { freshmarketOrderStatus } from "./freshmarket-order-status/data";
import { freshmarketCartSplit } from "./freshmarket-cart-split/data";
import { freshmarketStockHolds } from "./freshmarket-stock-holds/data";
import { skillSlotYourTimeTheirTime } from "./skill-slot-your-time-their-time/data";
import { skillSlotBlockClaims } from "./skill-slot-block-claims/data";
import { sufraWindowFillAndCutoff } from "./sufra-window-fill-and-cutoff/data";
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
import { worryOrNextStep } from "./worry-or-next-step/data";
import { aHardWeekTwoReadings } from "./a-hard-week-two-readings/data";
import { actNotIfOnly } from "./act-not-if-only/data";
import { birdsGoOut } from "./birds-go-out/data";
import { interviewPowerPlan } from "./interview-power-plan/data";
import { hijraPlannedSteps } from "./hijra-planned-steps/data";
import { sabrKeepsMoving } from "./sabr-keeps-moving/data";
import { wordsForTheDay } from "./words-for-the-day/data";
import { yusufWaitingWell } from "./yusuf-waiting-well/data";
import { gratitudeThreeWays } from "./gratitude-three-ways/data";
import { twoWingsBalance } from "./two-wings-balance/data";
import { raniaTwoOffers } from "./rania-two-offers/data";
import { raniaAsksTheRightPeople } from "./rania-asks-the-right-people/data";
import { istikharaInOrder } from "./istikhara-in-order/data";
import { sameWorkTwoIntentions } from "./same-work-two-intentions/data";
import { littleAndOften } from "./little-and-often/data";
import { startingAgainSteps } from "./starting-again-steps/data";
import { helpPassesOn } from "./help-passes-on/data";
import { whoToTell } from "./who-to-tell/data";
import { aiMissingContext } from "./ai-missing-context/data";
import { whoMakesTheCall } from "./who-makes-the-call/data";
import { answersOrHints } from "./answers-or-hints/data";
import { bigAppOrUnderstoodApp } from "./big-app-or-understood-app/data";
import { beforeYouPaste } from "./before-you-paste/data";
import { pickAToolForTheJob } from "./pick-a-tool-for-the-job/data";
import { keepWorkInYourFiles } from "./keep-work-in-your-files/data";
import { closeItAndRecall } from "./close-it-and-recall/data";
import { fiveAnglesOnCaching } from "./five-angles-on-caching/data";
import { aiQuizPartner } from "./ai-quiz-partner/data";
import { listenThenRead } from "./listen-then-read/data";
import { notePageLifecycle } from "./note-page-lifecycle/data";
import { dailyLabLoop } from "./daily-lab-loop/data";
import { planALabWithAi } from "./plan-a-lab-with-ai/data";
import { urlShortenerStopAPart } from "./url-shortener-stop-a-part/data";
import { labLogCommitPush } from "./lab-log-commit-push/data";
import { sixMonthHoursSplit } from "./six-month-hours-split/data";
import { weekPlanCheckResources } from "./week-plan-check-resources/data";
import { twoOptionsTradeOff } from "./two-options-trade-off/data";
import { reuseOpenSourceSafely } from "./reuse-open-source-safely/data";
import { commitsToArticle } from "./commits-to-article/data";
import { discloseAiHelp } from "./disclose-ai-help/data";
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
import { prefillDecodeSteps } from "./prefill-decode-steps/data";
import { kvCachePerToken } from "./kv-cache-per-token/data";
import { gpuMemoryBudget } from "./gpu-memory-budget/data";
import { pagedKvAllocation } from "./paged-kv-allocation/data";
import { speculativeDecodingGain } from "./speculative-decoding-gain/data";
import { selfHostOrApi } from "./self-host-or-api/data";
import { admissionControlTokens } from "./admission-control-tokens/data";
import { deploymentFitSteps } from "./deployment-fit-steps/data";
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
import { sysdesignM15AckFirst } from "./sysdesign-m15-ack-first/data";
import { sysdesignM15AckLast } from "./sysdesign-m15-ack-last/data";
import { sysdesignM15BackoffWaits } from "./sysdesign-m15-backoff-waits/data";
import { sysdesignM15DlqParks } from "./sysdesign-m15-dlq-parks/data";
import { sysdesignM15EmailTwice } from "./sysdesign-m15-email-twice/data";
import { sysdesignM15EventVsArrival } from "./sysdesign-m15-event-vs-arrival/data";
import { sysdesignM15FanoutIsolated } from "./sysdesign-m15-fanout-isolated/data";
import { sysdesignM15FanoutOneEvent } from "./sysdesign-m15-fanout-one-event/data";
import { sysdesignM15FullQueue } from "./sysdesign-m15-full-queue/data";
import { sysdesignM15IdlePartition } from "./sysdesign-m15-idle-partition/data";
import { sysdesignM15KeyRoutes } from "./sysdesign-m15-key-routes/data";
import { sysdesignM15LateRule } from "./sysdesign-m15-late-rule/data";
import { sysdesignM15LogOffsets } from "./sysdesign-m15-log-offsets/data";
import { sysdesignM15LogReplay } from "./sysdesign-m15-log-replay/data";
import { sysdesignM15OrderPerKey } from "./sysdesign-m15-order-per-key/data";
import { sysdesignM15PoisonBlocks } from "./sysdesign-m15-poison-blocks/data";
import { sysdesignM15QueueDecouples } from "./sysdesign-m15-queue-decouples/data";
import { sysdesignM15QueueHandout } from "./sysdesign-m15-queue-handout/data";
import { sysdesignM15RetryHerd } from "./sysdesign-m15-retry-herd/data";
import { sysdesignM15RetryJitter } from "./sysdesign-m15-retry-jitter/data";
import { sysdesignM15SignupWaits } from "./sysdesign-m15-signup-waits/data";
import { sysdesignM15SpikeAbsorbed } from "./sysdesign-m15-spike-absorbed/data";
import { sysdesignM15TwoGroups } from "./sysdesign-m15-two-groups/data";
import { sysdesignM15WatermarkAdvances } from "./sysdesign-m15-watermark-advances/data";
import { sysdesignM15BacklogPlay } from "./sysdesign-m15-backlog-play/data";
import { sysdesignM15RebalancePlay } from "./sysdesign-m15-rebalance-play/data";
import { sysdesignM16SlowPicks } from "./sysdesign-m16-slow-picks/data";
import { sysdesignM16CallCanFail } from "./sysdesign-m16-call-can-fail/data";
import { sysdesignM16SharedTable } from "./sysdesign-m16-shared-table/data";
import { sysdesignM16TimeoutFires } from "./sysdesign-m16-timeout-fires/data";
import { sysdesignM16RetryBudget } from "./sysdesign-m16-retry-budget/data";
import { sysdesignM16SharedPool } from "./sysdesign-m16-shared-pool/data";
import { sysdesignM16ShedLoad } from "./sysdesign-m16-shed-load/data";
import { sysdesignM16FallbackCache } from "./sysdesign-m16-fallback-cache/data";
import { sysdesignM16NoHeadroom } from "./sysdesign-m16-no-headroom/data";
import { sysdesignM15RetryReorderPlay } from "./sysdesign-m15-retry-reorder-play/data";
import { sysdesignM19RegionDark } from "./sysdesign-m19-region-dark/data";
import { sysdesignM19SharedDeploy } from "./sysdesign-m19-shared-deploy/data";
import { sysdesignM19CellRollout } from "./sysdesign-m19-cell-rollout/data";
import { sysdesignM19TwoClocks } from "./sysdesign-m19-two-clocks/data";
import { sysdesignM19CopyMistake } from "./sysdesign-m19-copy-mistake/data";
import { sysdesignM19Pitr } from "./sysdesign-m19-pitr/data";
import { sysdesignM19LagLoss } from "./sysdesign-m19-lag-loss/data";
import { sysdesignM19Failback } from "./sysdesign-m19-failback/data";
import { sysdesignM19DnsTimeline } from "./sysdesign-m19-dns-timeline/data";
import { sysdesignM19SurvivorOverload } from "./sysdesign-m19-survivor-overload/data";
import { sysdesignM19GlobalCommit } from "./sysdesign-m19-global-commit/data";
import { sysdesignM19BackupLeaves } from "./sysdesign-m19-backup-leaves/data";
import { sysdesignM20ClickALink } from "./sysdesign-m20-click-a-link/data";
import { sysdesignM20HashSameUrl } from "./sysdesign-m20-hash-same-url/data";
import { sysdesignM20CounterBase62 } from "./sysdesign-m20-counter-base62/data";
import { sysdesignM20RangeAllocator } from "./sysdesign-m20-range-allocator/data";
import { sysdesignM20KeyPool } from "./sysdesign-m20-key-pool/data";
import { sysdesignM20ReadPath } from "./sysdesign-m20-read-path/data";
import { sysdesignM20Redirect301 } from "./sysdesign-m20-redirect-301/data";
import { sysdesignM20Redirect302 } from "./sysdesign-m20-redirect-302/data";
import { sysdesignM20ClickQueue } from "./sysdesign-m20-click-queue/data";
import { sysdesignM20CacheLoss } from "./sysdesign-m20-cache-loss/data";
import { sysdesignM15PartitionKeyPlay } from "./sysdesign-m15-partition-key-play/data";
import { sysdesignM15PoisonPlay } from "./sysdesign-m15-poison-play/data";
import { sysdesignM15WindowShapesPlay } from "./sysdesign-m15-window-shapes-play/data";
import { sysdesignM17BlindOutage } from "./sysdesign-m17-blind-outage/data";
import { sysdesignM17LogLines } from "./sysdesign-m17-log-lines/data";
import { sysdesignM17MetricScrape } from "./sysdesign-m17-metric-scrape/data";
import { sysdesignM17PropagateId } from "./sysdesign-m17-propagate-id/data";
import { sysdesignM17SliRatio } from "./sysdesign-m17-sli-ratio/data";
import { sysdesignM17BudgetSpend } from "./sysdesign-m17-budget-spend/data";
import { sysdesignM17UseQueue } from "./sysdesign-m17-use-queue/data";
import { sysdesignM17RollbackFirst } from "./sysdesign-m17-rollback-first/data";
import { sysdesignM15WatermarkDelayPlay } from "./sysdesign-m15-watermark-delay-play/data";
import { sysdesignM15SlowSubscriberPlay } from "./sysdesign-m15-slow-subscriber-play/data";
import { sysdesignM20EstimatePlay } from "./sysdesign-m20-estimate-play/data";
import { sysdesignM20DesignStepper } from "./sysdesign-m20-design-stepper/data";
import { sysdesignM20CollisionPlay } from "./sysdesign-m20-collision-play/data";
import { sysdesignM20HitRatePlay } from "./sysdesign-m20-hit-rate-play/data";
import { sysdesignM19AddZones } from "./sysdesign-m19-add-zones/data";
import { sysdesignM19Cells } from "./sysdesign-m19-cells/data";
import { sysdesignM19FailureTime } from "./sysdesign-m19-failure-time/data";
import { sysdesignM19FailRegion } from "./sysdesign-m19-fail-region/data";
import { sysdesignM19RouteUsers } from "./sysdesign-m19-route-users/data";
import { sysdesignM19WriteLatency } from "./sysdesign-m19-write-latency/data";
import { sysdesignM16SplitOrNot } from "./sysdesign-m16-split-or-not/data";
import { sysdesignM16OrderPath } from "./sysdesign-m16-order-path/data";
import { sysdesignM16TimeoutLine } from "./sysdesign-m16-timeout-line/data";
import { sysdesignM16RetryStorm } from "./sysdesign-m16-retry-storm/data";
import { sysdesignM16JitterHerd } from "./sysdesign-m16-jitter-herd/data";
import { sysdesignM16BreakerPlay } from "./sysdesign-m16-breaker-play/data";
import { sysdesignM16BulkheadPools } from "./sysdesign-m16-bulkhead-pools/data";
import { sysdesignM16DegradeMenu } from "./sysdesign-m16-degrade-menu/data";
import { sysdesignM22SendAMessage } from "./sysdesign-m22-send-a-message/data";
import { sysdesignM22SendPath } from "./sysdesign-m22-send-path/data";
import { sysdesignM22GroupFanout } from "./sysdesign-m22-group-fanout/data";
import { sysdesignM22RegisterSession } from "./sysdesign-m22-register-session/data";
import { sysdesignM22RouteLookup } from "./sysdesign-m22-route-lookup/data";
import { sysdesignM22DrainGateway } from "./sysdesign-m22-drain-gateway/data";
import { sysdesignM22HalfOpen } from "./sysdesign-m22-half-open/data";
import { sysdesignM22OrderClash } from "./sysdesign-m22-order-clash/data";
import { sysdesignM22RetrySameId } from "./sysdesign-m22-retry-same-id/data";
import { sysdesignM22ThreeTicks } from "./sysdesign-m22-three-ticks/data";
import { sysdesignM22OfflineSync } from "./sysdesign-m22-offline-sync/data";
import { sysdesignM22PresenceBeat } from "./sysdesign-m22-presence-beat/data";
import { sysdesignM22PresenceSubscribe } from "./sysdesign-m22-presence-subscribe/data";
import { sysdesignM22PrefsFilter } from "./sysdesign-m22-prefs-filter/data";
import { sysdesignM22DedupeKey } from "./sysdesign-m22-dedupe-key/data";
import { sysdesignM22RetryBackoff } from "./sysdesign-m22-retry-backoff/data";
import { sysdesignM22CollapseLimit } from "./sysdesign-m22-collapse-limit/data";
import { sysdesignM24RequestARide } from "./sysdesign-m24-request-a-ride/data";
import { sysdesignM24ScanAllRows } from "./sysdesign-m24-scan-all-rows/data";
import { sysdesignM24NineCells } from "./sysdesign-m24-nine-cells/data";
import { sysdesignM24WriteEveryPing } from "./sysdesign-m24-write-every-ping/data";
import { sysdesignM24LatestOnly } from "./sysdesign-m24-latest-only/data";
import { sysdesignM24CrossCellEdge } from "./sysdesign-m24-cross-cell-edge/data";
import { sysdesignM24StadiumNight } from "./sysdesign-m24-stadium-night/data";
import { sysdesignM24IndexRestart } from "./sysdesign-m24-index-restart/data";
import { sysdesignM24OfferOneDriver } from "./sysdesign-m24-offer-one-driver/data";
import { sysdesignM24TwoRidersOneDriver } from "./sysdesign-m24-two-riders-one-driver/data";
import { sysdesignM24ClaimFirst } from "./sysdesign-m24-claim-first/data";
import { sysdesignM24BatchWindow } from "./sysdesign-m24-batch-window/data";
import { sysdesignM21TwoFeeds } from "./sysdesign-m21-two-feeds/data";
import { sysdesignM21OneQueryFeed } from "./sysdesign-m21-one-query-feed/data";
import { sysdesignM21TimelineCache } from "./sysdesign-m21-timeline-cache/data";
import { sysdesignM21PushPost } from "./sysdesign-m21-push-post/data";
import { sysdesignM21PullRead } from "./sysdesign-m21-pull-read/data";
import { sysdesignM21StarPost } from "./sysdesign-m21-star-post/data";
import { sysdesignM21PageCache } from "./sysdesign-m21-page-cache/data";
import { sysdesignM21Reshuffle } from "./sysdesign-m21-reshuffle/data";
import { sysdesignM21RankerSlow } from "./sysdesign-m21-ranker-slow/data";
import { sysdesignM17TraceRequest } from "./sysdesign-m17-trace-request/data";
import { sysdesignM17SloWindow } from "./sysdesign-m17-slo-window/data";
import { sysdesignM17BurnReplay } from "./sysdesign-m17-burn-replay/data";
import { sysdesignM17SameAverage } from "./sysdesign-m17-same-average/data";
import { sysdesignM17IncidentStepper } from "./sysdesign-m17-incident-stepper/data";
import { sysdesignM25DropOpens } from "./sysdesign-m25-drop-opens/data";
import { sysdesignM25HoldLockQueue } from "./sysdesign-m25-hold-lock-queue/data";
import { sysdesignM25HoldAtomic } from "./sysdesign-m25-hold-atomic/data";
import { sysdesignM25LatePayment } from "./sysdesign-m25-late-payment/data";
import { sysdesignM25BalanceNoTrail } from "./sysdesign-m25-balance-no-trail/data";
import { sysdesignM25Reversal } from "./sysdesign-m25-reversal/data";
import { sysdesignM25SameEventTwice } from "./sysdesign-m25-same-event-twice/data";
import { sysdesignM25CentsNotFloats } from "./sysdesign-m25-cents-not-floats/data";
import { sysdesignM25WebhookInbox } from "./sysdesign-m25-webhook-inbox/data";
import { sysdesignM25MissingWebhook } from "./sysdesign-m25-missing-webhook/data";
import { sysdesignM25Reconcile } from "./sysdesign-m25-reconcile/data";
import { sysdesignM25VoidNotRefund } from "./sysdesign-m25-void-not-refund/data";
import { sysdesignM23TypeAndSearch } from "./sysdesign-m23-type-and-search/data";
import { sysdesignM23ScanVsIndex } from "./sysdesign-m23-scan-vs-index/data";
import { sysdesignM23Intersect } from "./sysdesign-m23-intersect/data";
import { sysdesignM23RareWords } from "./sysdesign-m23-rare-words/data";
import { sysdesignM23RefreshLag } from "./sysdesign-m23-refresh-lag/data";
import { sysdesignM23Budget } from "./sysdesign-m23-budget/data";
import { sysdesignM23PrefixCache } from "./sysdesign-m23-prefix-cache/data";
import { sysdesignM23SuggestTimeout } from "./sysdesign-m23-suggest-timeout/data";
import { sysdesignM23TypoFilter } from "./sysdesign-m23-typo-filter/data";
import { sysdesignM23SketchCount } from "./sysdesign-m23-sketch-count/data";
import { sysdesignM21EstimatePlay } from "./sysdesign-m21-estimate-play/data";
import { sysdesignM21ActionMap } from "./sysdesign-m21-action-map/data";
import { sysdesignM21FanoutPlay } from "./sysdesign-m21-fanout-play/data";
import { sysdesignM21RankPlay } from "./sysdesign-m21-rank-play/data";
import { sysdesignM25EstimatePlay } from "./sysdesign-m25-estimate-play/data";
import { sysdesignM25WaitingRoom } from "./sysdesign-m25-waiting-room/data";
import { sysdesignM25PostEntries } from "./sysdesign-m25-post-entries/data";
import { sysdesignM25WebhookOrder } from "./sysdesign-m25-webhook-order/data";
import { sysdesignM22EstimatePlay } from "./sysdesign-m22-estimate-play/data";
import { sysdesignM22DesignStepper } from "./sysdesign-m22-design-stepper/data";
import { sysdesignM22ConnectionsPlay } from "./sysdesign-m22-connections-play/data";
import { sysdesignM22SequencePlay } from "./sysdesign-m22-sequence-play/data";
import { sysdesignM22PresencePlay } from "./sysdesign-m22-presence-play/data";
import { sysdesignM22OutagePlay } from "./sysdesign-m22-outage-play/data";
import { sysdesignM26FollowLinks } from "./sysdesign-m26-follow-links/data";
import { sysdesignM26OnePage } from "./sysdesign-m26-one-page/data";
import { sysdesignM26DnsCache } from "./sysdesign-m26-dns-cache/data";
import { sysdesignM26HostShards } from "./sysdesign-m26-host-shards/data";
import { sysdesignM26WorkerLease } from "./sysdesign-m26-worker-lease/data";
import { sysdesignM26OneQueueHammer } from "./sysdesign-m26-one-queue-hammer/data";
import { sysdesignM26PriorityPick } from "./sysdesign-m26-priority-pick/data";
import { sysdesignM26RobotsCheck } from "./sysdesign-m26-robots-check/data";
import { sysdesignM26UrlNormalize } from "./sysdesign-m26-url-normalize/data";
import { sysdesignM26BloomFalseYes } from "./sysdesign-m26-bloom-false-yes/data";
import { sysdesignM26ContentHash } from "./sysdesign-m26-content-hash/data";
import { sysdesignM26SimhashNear } from "./sysdesign-m26-simhash-near/data";
import { sysdesignM26TrapCalendar } from "./sysdesign-m26-trap-calendar/data";
import { sysdesignM23EstimatePlay } from "./sysdesign-m23-estimate-play/data";
import { sysdesignM23TinyIndex } from "./sysdesign-m23-tiny-index/data";
import { sysdesignM23TrieWalk } from "./sysdesign-m23-trie-walk/data";
import { sysdesignM23BloomSize } from "./sysdesign-m23-bloom-size/data";
import { sysdesignM23HllRegisters } from "./sysdesign-m23-hll-registers/data";
import { sysdesignM24EstimatePlay } from "./sysdesign-m24-estimate-play/data";
import { sysdesignM24GeohashZoom } from "./sysdesign-m24-geohash-zoom/data";
import { sysdesignM24CellEdge } from "./sysdesign-m24-cell-edge/data";
import { sysdesignM24QuadtreeSplit } from "./sysdesign-m24-quadtree-split/data";
import { sysdesignM24UpdateLoad } from "./sysdesign-m24-update-load/data";
import { sysdesignM24BatchMatch } from "./sysdesign-m24-batch-match/data";
import { sysdesignM27PressPlay } from "./sysdesign-m27-press-play/data";
import { sysdesignM27BytesBypass } from "./sysdesign-m27-bytes-bypass/data";
import { sysdesignM27ResumeUpload } from "./sysdesign-m27-resume-upload/data";
import { sysdesignM27JobRetry } from "./sysdesign-m27-job-retry/data";
import { sysdesignM27Segments } from "./sysdesign-m27-segments/data";
import { sysdesignM27AbrSwitch } from "./sysdesign-m27-abr-switch/data";
import { sysdesignM27PopularEdge } from "./sysdesign-m27-popular-edge/data";
import { sysdesignM27LongTail } from "./sysdesign-m27-long-tail/data";
import { sysdesignM27HotRow } from "./sysdesign-m27-hot-row/data";
import { sysdesignM27ShardsSplit } from "./sysdesign-m27-shards-split/data";
import { sysdesignM27MergeTotal } from "./sysdesign-m27-merge-total/data";
import { sysdesignM28SilentBoxes } from "./sysdesign-m28-silent-boxes/data";
import { sysdesignM28TalkThenDraw } from "./sysdesign-m28-talk-then-draw/data";
import { sysdesignM28ClarifyAloud } from "./sysdesign-m28-clarify-aloud/data";
import { sysdesignM28EstimateAloud } from "./sysdesign-m28-estimate-aloud/data";
import { sysdesignM28CloseTheRound } from "./sysdesign-m28-close-the-round/data";
import { sysdesignM28RedoTheMaths } from "./sysdesign-m28-redo-the-maths/data";
import { sysdesignM28PushbackEvidence } from "./sysdesign-m28-pushback-evidence/data";
import { sysdesignM28OwnTheFlaw } from "./sysdesign-m28-own-the-flaw/data";
import { sysdesignM26EstimatePlay } from "./sysdesign-m26-estimate-play/data";
import { sysdesignM26DesignStepper } from "./sysdesign-m26-design-stepper/data";
import { sysdesignM26HostRatePlay } from "./sysdesign-m26-host-rate-play/data";
import { sysdesignM26RecrawlPlay } from "./sysdesign-m26-recrawl-play/data";
import { sysdesignM26BloomPlay } from "./sysdesign-m26-bloom-play/data";
import { sysdesignM28InterviewStepper } from "./sysdesign-m28-interview-stepper/data";
import { sysdesignM28ProbeStepper } from "./sysdesign-m28-probe-stepper/data";
import { sysdesignM28AnswerSorter } from "./sysdesign-m28-answer-sorter/data";
import { sysdesignM27EstimatePlay } from "./sysdesign-m27-estimate-play/data";
import { sysdesignM27DesignStepper } from "./sysdesign-m27-design-stepper/data";
import { sysdesignM27BacklogPlay } from "./sysdesign-m27-backlog-play/data";
import { sysdesignM27SkewPlay } from "./sysdesign-m27-skew-play/data";
import { sysdesignM27ShardsPlay } from "./sysdesign-m27-shards-play/data";
import { sysdesignM18LaptopVsServer } from "./sysdesign-m18-laptop-vs-server/data";
import { sysdesignM18SameImage } from "./sysdesign-m18-same-image/data";
import { sysdesignM18OomKill } from "./sysdesign-m18-oom-kill/data";
import { sysdesignM18CpuThrottle } from "./sysdesign-m18-cpu-throttle/data";
import { sysdesignM18SigtermIgnored } from "./sysdesign-m18-sigterm-ignored/data";
import { sysdesignM18GracefulDrain } from "./sysdesign-m18-graceful-drain/data";
import { sysdesignM18ImagePullWeakLine } from "./sysdesign-m18-image-pull-weak-line/data";
import { sysdesignM18DockerHealth } from "./sysdesign-m18-docker-health/data";
import { sysdesignM18VolumeSurvives } from "./sysdesign-m18-volume-survives/data";
import { sysdesignM18PodReplaced } from "./sysdesign-m18-pod-replaced/data";
import { sysdesignM18ServiceLabels } from "./sysdesign-m18-service-labels/data";
import { sysdesignM18ProbeSplit } from "./sysdesign-m18-probe-split/data";
import { sysdesignM18RollingSurge } from "./sysdesign-m18-rolling-surge/data";
import { sysdesignM18HpaScale } from "./sysdesign-m18-hpa-scale/data";
import { sysdesignM18FailFast } from "./sysdesign-m18-fail-fast/data";
import { sysdesignM18BuildOnce } from "./sysdesign-m18-build-once/data";
import { sysdesignM18SmokeRollback } from "./sysdesign-m18-smoke-rollback/data";
import { sysdesignM18MixedVersions } from "./sysdesign-m18-mixed-versions/data";
import { sysdesignM18BlueGreen } from "./sysdesign-m18-blue-green/data";
import { sysdesignM18CanaryCompare } from "./sysdesign-m18-canary-compare/data";
import { sysdesignM18FlagFlip } from "./sysdesign-m18-flag-flip/data";
import { sysdesignM18ManagedFailover } from "./sysdesign-m18-managed-failover/data";
import { sysdesignM18IsolationLayers } from "./sysdesign-m18-isolation-layers/data";
import { sysdesignM18LayerCache } from "./sysdesign-m18-layer-cache/data";
import { sysdesignM18ClusterPlay } from "./sysdesign-m18-cluster-play/data";
import { sysdesignM18PipelineStep } from "./sysdesign-m18-pipeline-step/data";
import { sysdesignM18CanaryBlast } from "./sysdesign-m18-canary-blast/data";
import { sysdesignM18CloudExplorer } from "./sysdesign-m18-cloud-explorer/data";
import type { SceneSpec } from "./renderers/scene/SceneCanvas";
import { storyOrUsually } from "./story-or-usually/data";
import { myPartTeamPart } from "./my-part-team-part/data";
import { samerDecisionWeights } from "./samer-decision-weights/data";
import { percentFromWhat } from "./percent-from-what/data";
import { findYourNumbers } from "./find-your-numbers/data";
import { howMuchWasYours } from "./how-much-was-yours/data";
import { resumeLineWhyChain } from "./resume-line-why-chain/data";
import { tidyReasonBreaks } from "./tidy-reason-breaks/data";
import { resumeLineAudit } from "./resume-line-audit/data";
import { clarifyTheCase } from "./clarify-the-case/data";
import { caseOptionsWeights } from "./case-options-weights/data";
import { decideAndMeasure } from "./decide-and-measure/data";
import { chooseTechnicalStory } from "./choose-technical-story/data";
import { founderVersionFirst } from "./founder-version-first/data";
import { engineerDepthLadder } from "./engineer-depth-ladder/data";
import { broadToNarrowStrength } from "./broad-to-narrow-strength/data";
import { weaknessAnswerChoice } from "./weakness-answer-choice/data";
import { timeToThink } from "./time-to-think/data";
import { feedbackToNextProject } from "./feedback-to-next-project/data";
import { whyNotThatChoice } from "./why-not-that-choice/data";
import { fiftyTimesTest } from "./fifty-times-test/data";
import { demoTheyCanOpen } from "./demo-they-can-open/data";

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

export type CanvasSpec = SequenceSpec | StateMachineSpec | FactorSpec | SliderSpec | CustomCanvasSpec | SceneSpec;

export const canvasRegistry: Record<CanvasSlug, CanvasSpec> = {
  "weighted-matrix-two-offers": weightedMatrixTwoOffers,
  "freshmarket-order-status": freshmarketOrderStatus,
  "freshmarket-mark-packed": freshmarketMarkPacked,
  "freshmarket-cart-split": freshmarketCartSplit,
  "freshmarket-stock-holds": freshmarketStockHolds,
  "skill-slot-your-time-their-time": skillSlotYourTimeTheirTime,
  "skill-slot-block-claims": skillSlotBlockClaims,
  "sufra-window-fill-and-cutoff": sufraWindowFillAndCutoff,
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
  "worry-or-next-step": worryOrNextStep,
  "a-hard-week-two-readings": aHardWeekTwoReadings,
  "act-not-if-only": actNotIfOnly,
  "birds-go-out": birdsGoOut,
  "interview-power-plan": interviewPowerPlan,
  "hijra-planned-steps": hijraPlannedSteps,
  "sabr-keeps-moving": sabrKeepsMoving,
  "words-for-the-day": wordsForTheDay,
  "yusuf-waiting-well": yusufWaitingWell,
  "gratitude-three-ways": gratitudeThreeWays,
  "two-wings-balance": twoWingsBalance,
  "rania-two-offers": raniaTwoOffers,
  "rania-asks-the-right-people": raniaAsksTheRightPeople,
  "istikhara-in-order": istikharaInOrder,
  "same-work-two-intentions": sameWorkTwoIntentions,
  "little-and-often": littleAndOften,
  "starting-again-steps": startingAgainSteps,
  "help-passes-on": helpPassesOn,
  "who-to-tell": whoToTell,
  "ai-missing-context": aiMissingContext,
  "who-makes-the-call": whoMakesTheCall,
  "answers-or-hints": answersOrHints,
  "big-app-or-understood-app": bigAppOrUnderstoodApp,
  "before-you-paste": beforeYouPaste,
  "pick-a-tool-for-the-job": pickAToolForTheJob,
  "keep-work-in-your-files": keepWorkInYourFiles,
  "close-it-and-recall": closeItAndRecall,
  "five-angles-on-caching": fiveAnglesOnCaching,
  "ai-quiz-partner": aiQuizPartner,
  "listen-then-read": listenThenRead,
  "note-page-lifecycle": notePageLifecycle,
  "daily-lab-loop": dailyLabLoop,
  "plan-a-lab-with-ai": planALabWithAi,
  "url-shortener-stop-a-part": urlShortenerStopAPart,
  "lab-log-commit-push": labLogCommitPush,
  "six-month-hours-split": sixMonthHoursSplit,
  "week-plan-check-resources": weekPlanCheckResources,
  "two-options-trade-off": twoOptionsTradeOff,
  "reuse-open-source-safely": reuseOpenSourceSafely,
  "commits-to-article": commitsToArticle,
  "disclose-ai-help": discloseAiHelp,
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
  "prefill-decode-steps": prefillDecodeSteps,
  "kv-cache-per-token": kvCachePerToken,
  "gpu-memory-budget": gpuMemoryBudget,
  "paged-kv-allocation": pagedKvAllocation,
  "speculative-decoding-gain": speculativeDecodingGain,
  "self-host-or-api": selfHostOrApi,
  "admission-control-tokens": admissionControlTokens,
  "deployment-fit-steps": deploymentFitSteps,
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
  "sysdesign-m15-ack-first": sysdesignM15AckFirst,
  "sysdesign-m15-ack-last": sysdesignM15AckLast,
  "sysdesign-m15-backoff-waits": sysdesignM15BackoffWaits,
  "sysdesign-m15-dlq-parks": sysdesignM15DlqParks,
  "sysdesign-m15-email-twice": sysdesignM15EmailTwice,
  "sysdesign-m15-event-vs-arrival": sysdesignM15EventVsArrival,
  "sysdesign-m15-fanout-isolated": sysdesignM15FanoutIsolated,
  "sysdesign-m15-fanout-one-event": sysdesignM15FanoutOneEvent,
  "sysdesign-m15-full-queue": sysdesignM15FullQueue,
  "sysdesign-m15-idle-partition": sysdesignM15IdlePartition,
  "sysdesign-m15-key-routes": sysdesignM15KeyRoutes,
  "sysdesign-m15-late-rule": sysdesignM15LateRule,
  "sysdesign-m15-log-offsets": sysdesignM15LogOffsets,
  "sysdesign-m15-log-replay": sysdesignM15LogReplay,
  "sysdesign-m15-order-per-key": sysdesignM15OrderPerKey,
  "sysdesign-m15-poison-blocks": sysdesignM15PoisonBlocks,
  "sysdesign-m15-queue-decouples": sysdesignM15QueueDecouples,
  "sysdesign-m15-queue-handout": sysdesignM15QueueHandout,
  "sysdesign-m15-retry-herd": sysdesignM15RetryHerd,
  "sysdesign-m15-retry-jitter": sysdesignM15RetryJitter,
  "sysdesign-m15-signup-waits": sysdesignM15SignupWaits,
  "sysdesign-m15-spike-absorbed": sysdesignM15SpikeAbsorbed,
  "sysdesign-m15-two-groups": sysdesignM15TwoGroups,
  "sysdesign-m15-watermark-advances": sysdesignM15WatermarkAdvances,
  "sysdesign-m15-backlog-play": sysdesignM15BacklogPlay,
  "sysdesign-m15-rebalance-play": sysdesignM15RebalancePlay,
  "sysdesign-m16-slow-picks": sysdesignM16SlowPicks,
  "sysdesign-m16-call-can-fail": sysdesignM16CallCanFail,
  "sysdesign-m16-shared-table": sysdesignM16SharedTable,
  "sysdesign-m16-timeout-fires": sysdesignM16TimeoutFires,
  "sysdesign-m16-retry-budget": sysdesignM16RetryBudget,
  "sysdesign-m16-shared-pool": sysdesignM16SharedPool,
  "sysdesign-m16-shed-load": sysdesignM16ShedLoad,
  "sysdesign-m16-fallback-cache": sysdesignM16FallbackCache,
  "sysdesign-m16-no-headroom": sysdesignM16NoHeadroom,
  "sysdesign-m15-retry-reorder-play": sysdesignM15RetryReorderPlay,
  "sysdesign-m19-region-dark": sysdesignM19RegionDark,
  "sysdesign-m19-shared-deploy": sysdesignM19SharedDeploy,
  "sysdesign-m19-cell-rollout": sysdesignM19CellRollout,
  "sysdesign-m19-two-clocks": sysdesignM19TwoClocks,
  "sysdesign-m19-copy-mistake": sysdesignM19CopyMistake,
  "sysdesign-m19-pitr": sysdesignM19Pitr,
  "sysdesign-m19-lag-loss": sysdesignM19LagLoss,
  "sysdesign-m19-failback": sysdesignM19Failback,
  "sysdesign-m19-dns-timeline": sysdesignM19DnsTimeline,
  "sysdesign-m19-survivor-overload": sysdesignM19SurvivorOverload,
  "sysdesign-m19-global-commit": sysdesignM19GlobalCommit,
  "sysdesign-m19-backup-leaves": sysdesignM19BackupLeaves,
  "sysdesign-m20-click-a-link": sysdesignM20ClickALink,
  "sysdesign-m20-hash-same-url": sysdesignM20HashSameUrl,
  "sysdesign-m20-counter-base62": sysdesignM20CounterBase62,
  "sysdesign-m20-range-allocator": sysdesignM20RangeAllocator,
  "sysdesign-m20-key-pool": sysdesignM20KeyPool,
  "sysdesign-m20-read-path": sysdesignM20ReadPath,
  "sysdesign-m20-redirect-301": sysdesignM20Redirect301,
  "sysdesign-m20-redirect-302": sysdesignM20Redirect302,
  "sysdesign-m20-click-queue": sysdesignM20ClickQueue,
  "sysdesign-m20-cache-loss": sysdesignM20CacheLoss,
  "sysdesign-m15-partition-key-play": sysdesignM15PartitionKeyPlay,
  "sysdesign-m15-poison-play": sysdesignM15PoisonPlay,
  "sysdesign-m15-window-shapes-play": sysdesignM15WindowShapesPlay,
  "sysdesign-m17-blind-outage": sysdesignM17BlindOutage,
  "sysdesign-m17-log-lines": sysdesignM17LogLines,
  "sysdesign-m17-metric-scrape": sysdesignM17MetricScrape,
  "sysdesign-m17-propagate-id": sysdesignM17PropagateId,
  "sysdesign-m17-sli-ratio": sysdesignM17SliRatio,
  "sysdesign-m17-budget-spend": sysdesignM17BudgetSpend,
  "sysdesign-m17-use-queue": sysdesignM17UseQueue,
  "sysdesign-m17-rollback-first": sysdesignM17RollbackFirst,
  "sysdesign-m15-watermark-delay-play": sysdesignM15WatermarkDelayPlay,
  "sysdesign-m15-slow-subscriber-play": sysdesignM15SlowSubscriberPlay,
  "sysdesign-m20-estimate-play": sysdesignM20EstimatePlay,
  "sysdesign-m20-design-stepper": sysdesignM20DesignStepper,
  "sysdesign-m20-collision-play": sysdesignM20CollisionPlay,
  "sysdesign-m20-hit-rate-play": sysdesignM20HitRatePlay,
  "sysdesign-m19-add-zones": sysdesignM19AddZones,
  "sysdesign-m19-cells": sysdesignM19Cells,
  "sysdesign-m19-failure-time": sysdesignM19FailureTime,
  "sysdesign-m19-fail-region": sysdesignM19FailRegion,
  "sysdesign-m19-route-users": sysdesignM19RouteUsers,
  "sysdesign-m19-write-latency": sysdesignM19WriteLatency,
  "sysdesign-m16-split-or-not": sysdesignM16SplitOrNot,
  "sysdesign-m16-order-path": sysdesignM16OrderPath,
  "sysdesign-m16-timeout-line": sysdesignM16TimeoutLine,
  "sysdesign-m16-retry-storm": sysdesignM16RetryStorm,
  "sysdesign-m16-jitter-herd": sysdesignM16JitterHerd,
  "sysdesign-m16-breaker-play": sysdesignM16BreakerPlay,
  "sysdesign-m16-bulkhead-pools": sysdesignM16BulkheadPools,
  "sysdesign-m16-degrade-menu": sysdesignM16DegradeMenu,
  "sysdesign-m22-send-a-message": sysdesignM22SendAMessage,
  "sysdesign-m22-send-path": sysdesignM22SendPath,
  "sysdesign-m22-group-fanout": sysdesignM22GroupFanout,
  "sysdesign-m22-register-session": sysdesignM22RegisterSession,
  "sysdesign-m22-route-lookup": sysdesignM22RouteLookup,
  "sysdesign-m22-drain-gateway": sysdesignM22DrainGateway,
  "sysdesign-m22-half-open": sysdesignM22HalfOpen,
  "sysdesign-m22-order-clash": sysdesignM22OrderClash,
  "sysdesign-m22-retry-same-id": sysdesignM22RetrySameId,
  "sysdesign-m22-three-ticks": sysdesignM22ThreeTicks,
  "sysdesign-m22-offline-sync": sysdesignM22OfflineSync,
  "sysdesign-m22-presence-beat": sysdesignM22PresenceBeat,
  "sysdesign-m22-presence-subscribe": sysdesignM22PresenceSubscribe,
  "sysdesign-m22-prefs-filter": sysdesignM22PrefsFilter,
  "sysdesign-m22-dedupe-key": sysdesignM22DedupeKey,
  "sysdesign-m22-retry-backoff": sysdesignM22RetryBackoff,
  "sysdesign-m22-collapse-limit": sysdesignM22CollapseLimit,
  "sysdesign-m24-request-a-ride": sysdesignM24RequestARide,
  "sysdesign-m24-scan-all-rows": sysdesignM24ScanAllRows,
  "sysdesign-m24-nine-cells": sysdesignM24NineCells,
  "sysdesign-m24-write-every-ping": sysdesignM24WriteEveryPing,
  "sysdesign-m24-latest-only": sysdesignM24LatestOnly,
  "sysdesign-m24-cross-cell-edge": sysdesignM24CrossCellEdge,
  "sysdesign-m24-stadium-night": sysdesignM24StadiumNight,
  "sysdesign-m24-index-restart": sysdesignM24IndexRestart,
  "sysdesign-m24-offer-one-driver": sysdesignM24OfferOneDriver,
  "sysdesign-m24-two-riders-one-driver": sysdesignM24TwoRidersOneDriver,
  "sysdesign-m24-claim-first": sysdesignM24ClaimFirst,
  "sysdesign-m24-batch-window": sysdesignM24BatchWindow,
  "sysdesign-m21-two-feeds": sysdesignM21TwoFeeds,
  "sysdesign-m21-one-query-feed": sysdesignM21OneQueryFeed,
  "sysdesign-m21-timeline-cache": sysdesignM21TimelineCache,
  "sysdesign-m21-push-post": sysdesignM21PushPost,
  "sysdesign-m21-pull-read": sysdesignM21PullRead,
  "sysdesign-m21-star-post": sysdesignM21StarPost,
  "sysdesign-m21-page-cache": sysdesignM21PageCache,
  "sysdesign-m21-reshuffle": sysdesignM21Reshuffle,
  "sysdesign-m21-ranker-slow": sysdesignM21RankerSlow,
  "sysdesign-m17-trace-request": sysdesignM17TraceRequest,
  "sysdesign-m17-slo-window": sysdesignM17SloWindow,
  "sysdesign-m17-burn-replay": sysdesignM17BurnReplay,
  "sysdesign-m17-same-average": sysdesignM17SameAverage,
  "sysdesign-m17-incident-stepper": sysdesignM17IncidentStepper,
  "sysdesign-m25-drop-opens": sysdesignM25DropOpens,
  "sysdesign-m25-hold-lock-queue": sysdesignM25HoldLockQueue,
  "sysdesign-m25-hold-atomic": sysdesignM25HoldAtomic,
  "sysdesign-m25-late-payment": sysdesignM25LatePayment,
  "sysdesign-m25-balance-no-trail": sysdesignM25BalanceNoTrail,
  "sysdesign-m25-reversal": sysdesignM25Reversal,
  "sysdesign-m25-same-event-twice": sysdesignM25SameEventTwice,
  "sysdesign-m25-cents-not-floats": sysdesignM25CentsNotFloats,
  "sysdesign-m25-webhook-inbox": sysdesignM25WebhookInbox,
  "sysdesign-m25-missing-webhook": sysdesignM25MissingWebhook,
  "sysdesign-m25-reconcile": sysdesignM25Reconcile,
  "sysdesign-m25-void-not-refund": sysdesignM25VoidNotRefund,
  "sysdesign-m23-type-and-search": sysdesignM23TypeAndSearch,
  "sysdesign-m23-scan-vs-index": sysdesignM23ScanVsIndex,
  "sysdesign-m23-intersect": sysdesignM23Intersect,
  "sysdesign-m23-rare-words": sysdesignM23RareWords,
  "sysdesign-m23-refresh-lag": sysdesignM23RefreshLag,
  "sysdesign-m23-budget": sysdesignM23Budget,
  "sysdesign-m23-prefix-cache": sysdesignM23PrefixCache,
  "sysdesign-m23-suggest-timeout": sysdesignM23SuggestTimeout,
  "sysdesign-m23-typo-filter": sysdesignM23TypoFilter,
  "sysdesign-m23-sketch-count": sysdesignM23SketchCount,
  "sysdesign-m21-estimate-play": sysdesignM21EstimatePlay,
  "sysdesign-m21-action-map": sysdesignM21ActionMap,
  "sysdesign-m21-fanout-play": sysdesignM21FanoutPlay,
  "sysdesign-m21-rank-play": sysdesignM21RankPlay,
  "sysdesign-m25-estimate-play": sysdesignM25EstimatePlay,
  "sysdesign-m25-waiting-room": sysdesignM25WaitingRoom,
  "sysdesign-m25-post-entries": sysdesignM25PostEntries,
  "sysdesign-m25-webhook-order": sysdesignM25WebhookOrder,
  "sysdesign-m22-estimate-play": sysdesignM22EstimatePlay,
  "sysdesign-m22-design-stepper": sysdesignM22DesignStepper,
  "sysdesign-m22-connections-play": sysdesignM22ConnectionsPlay,
  "sysdesign-m22-sequence-play": sysdesignM22SequencePlay,
  "sysdesign-m22-presence-play": sysdesignM22PresencePlay,
  "sysdesign-m22-outage-play": sysdesignM22OutagePlay,
  "sysdesign-m26-follow-links": sysdesignM26FollowLinks,
  "sysdesign-m26-one-page": sysdesignM26OnePage,
  "sysdesign-m26-dns-cache": sysdesignM26DnsCache,
  "sysdesign-m26-host-shards": sysdesignM26HostShards,
  "sysdesign-m26-worker-lease": sysdesignM26WorkerLease,
  "sysdesign-m26-one-queue-hammer": sysdesignM26OneQueueHammer,
  "sysdesign-m26-priority-pick": sysdesignM26PriorityPick,
  "sysdesign-m26-robots-check": sysdesignM26RobotsCheck,
  "sysdesign-m26-url-normalize": sysdesignM26UrlNormalize,
  "sysdesign-m26-bloom-false-yes": sysdesignM26BloomFalseYes,
  "sysdesign-m26-content-hash": sysdesignM26ContentHash,
  "sysdesign-m26-simhash-near": sysdesignM26SimhashNear,
  "sysdesign-m26-trap-calendar": sysdesignM26TrapCalendar,
  "sysdesign-m23-estimate-play": sysdesignM23EstimatePlay,
  "sysdesign-m23-tiny-index": sysdesignM23TinyIndex,
  "sysdesign-m23-trie-walk": sysdesignM23TrieWalk,
  "sysdesign-m23-bloom-size": sysdesignM23BloomSize,
  "sysdesign-m23-hll-registers": sysdesignM23HllRegisters,
  "sysdesign-m24-estimate-play": sysdesignM24EstimatePlay,
  "sysdesign-m24-geohash-zoom": sysdesignM24GeohashZoom,
  "sysdesign-m24-cell-edge": sysdesignM24CellEdge,
  "sysdesign-m24-quadtree-split": sysdesignM24QuadtreeSplit,
  "sysdesign-m24-update-load": sysdesignM24UpdateLoad,
  "sysdesign-m24-batch-match": sysdesignM24BatchMatch,
  "sysdesign-m27-press-play": sysdesignM27PressPlay,
  "sysdesign-m27-bytes-bypass": sysdesignM27BytesBypass,
  "sysdesign-m27-resume-upload": sysdesignM27ResumeUpload,
  "sysdesign-m27-job-retry": sysdesignM27JobRetry,
  "sysdesign-m27-segments": sysdesignM27Segments,
  "sysdesign-m27-abr-switch": sysdesignM27AbrSwitch,
  "sysdesign-m27-popular-edge": sysdesignM27PopularEdge,
  "sysdesign-m27-long-tail": sysdesignM27LongTail,
  "sysdesign-m27-hot-row": sysdesignM27HotRow,
  "sysdesign-m27-shards-split": sysdesignM27ShardsSplit,
  "sysdesign-m27-merge-total": sysdesignM27MergeTotal,
  "sysdesign-m28-silent-boxes": sysdesignM28SilentBoxes,
  "sysdesign-m28-talk-then-draw": sysdesignM28TalkThenDraw,
  "sysdesign-m28-clarify-aloud": sysdesignM28ClarifyAloud,
  "sysdesign-m28-estimate-aloud": sysdesignM28EstimateAloud,
  "sysdesign-m28-close-the-round": sysdesignM28CloseTheRound,
  "sysdesign-m28-redo-the-maths": sysdesignM28RedoTheMaths,
  "sysdesign-m28-pushback-evidence": sysdesignM28PushbackEvidence,
  "sysdesign-m28-own-the-flaw": sysdesignM28OwnTheFlaw,
  "sysdesign-m26-estimate-play": sysdesignM26EstimatePlay,
  "sysdesign-m26-design-stepper": sysdesignM26DesignStepper,
  "sysdesign-m26-host-rate-play": sysdesignM26HostRatePlay,
  "sysdesign-m26-recrawl-play": sysdesignM26RecrawlPlay,
  "sysdesign-m26-bloom-play": sysdesignM26BloomPlay,
  "sysdesign-m28-interview-stepper": sysdesignM28InterviewStepper,
  "sysdesign-m28-probe-stepper": sysdesignM28ProbeStepper,
  "sysdesign-m28-answer-sorter": sysdesignM28AnswerSorter,
  "sysdesign-m27-estimate-play": sysdesignM27EstimatePlay,
  "sysdesign-m27-design-stepper": sysdesignM27DesignStepper,
  "sysdesign-m27-backlog-play": sysdesignM27BacklogPlay,
  "sysdesign-m27-skew-play": sysdesignM27SkewPlay,
  "sysdesign-m27-shards-play": sysdesignM27ShardsPlay,
  "sysdesign-m18-laptop-vs-server": sysdesignM18LaptopVsServer,
  "sysdesign-m18-same-image": sysdesignM18SameImage,
  "sysdesign-m18-oom-kill": sysdesignM18OomKill,
  "sysdesign-m18-cpu-throttle": sysdesignM18CpuThrottle,
  "sysdesign-m18-sigterm-ignored": sysdesignM18SigtermIgnored,
  "sysdesign-m18-graceful-drain": sysdesignM18GracefulDrain,
  "sysdesign-m18-image-pull-weak-line": sysdesignM18ImagePullWeakLine,
  "sysdesign-m18-docker-health": sysdesignM18DockerHealth,
  "sysdesign-m18-volume-survives": sysdesignM18VolumeSurvives,
  "sysdesign-m18-pod-replaced": sysdesignM18PodReplaced,
  "sysdesign-m18-service-labels": sysdesignM18ServiceLabels,
  "sysdesign-m18-probe-split": sysdesignM18ProbeSplit,
  "sysdesign-m18-rolling-surge": sysdesignM18RollingSurge,
  "sysdesign-m18-hpa-scale": sysdesignM18HpaScale,
  "sysdesign-m18-fail-fast": sysdesignM18FailFast,
  "sysdesign-m18-build-once": sysdesignM18BuildOnce,
  "sysdesign-m18-smoke-rollback": sysdesignM18SmokeRollback,
  "sysdesign-m18-mixed-versions": sysdesignM18MixedVersions,
  "sysdesign-m18-blue-green": sysdesignM18BlueGreen,
  "sysdesign-m18-canary-compare": sysdesignM18CanaryCompare,
  "sysdesign-m18-flag-flip": sysdesignM18FlagFlip,
  "sysdesign-m18-managed-failover": sysdesignM18ManagedFailover,
  "sysdesign-m18-isolation-layers": sysdesignM18IsolationLayers,
  "sysdesign-m18-layer-cache": sysdesignM18LayerCache,
  "sysdesign-m18-cluster-play": sysdesignM18ClusterPlay,
  "sysdesign-m18-pipeline-step": sysdesignM18PipelineStep,
  "sysdesign-m18-canary-blast": sysdesignM18CanaryBlast,
  "sysdesign-m18-cloud-explorer": sysdesignM18CloudExplorer,
  "story-or-usually": storyOrUsually,
  "my-part-team-part": myPartTeamPart,
  "samer-decision-weights": samerDecisionWeights,
  "percent-from-what": percentFromWhat,
  "find-your-numbers": findYourNumbers,
  "how-much-was-yours": howMuchWasYours,
  "resume-line-why-chain": resumeLineWhyChain,
  "tidy-reason-breaks": tidyReasonBreaks,
  "resume-line-audit": resumeLineAudit,
  "clarify-the-case": clarifyTheCase,
  "case-options-weights": caseOptionsWeights,
  "decide-and-measure": decideAndMeasure,
  "choose-technical-story": chooseTechnicalStory,
  "founder-version-first": founderVersionFirst,
  "engineer-depth-ladder": engineerDepthLadder,
  "broad-to-narrow-strength": broadToNarrowStrength,
  "weakness-answer-choice": weaknessAnswerChoice,
  "time-to-think": timeToThink,
  "feedback-to-next-project": feedbackToNextProject,
  "why-not-that-choice": whyNotThatChoice,
  "fifty-times-test": fiftyTimesTest,
  "demo-they-can-open": demoTheyCanOpen,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
