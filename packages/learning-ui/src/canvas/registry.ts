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
import { netM1PacketDns } from "./net-m1-packet-dns/data";
import { netM1PacketEcho } from "./net-m1-packet-echo/data";
import { netM1PacketOwnLines } from "./net-m1-packet-own-lines/data";
import { netM1PacketChange } from "./net-m1-packet-change/data";
import { netM1PacketJobs } from "./net-m1-packet-jobs/data";
import { netM1PacketWrap } from "./net-m1-packet-wrap/data";
import { netM1PacketUnwrap } from "./net-m1-packet-unwrap/data";
import { netM1ReplaySetupChecker } from "./net-m1-replay-setup-checker/data";
import { netM1ReplayOwnNumbers } from "./net-m1-replay-own-numbers/data";
import { netM1ReplayVirtualCable } from "./net-m1-replay-virtual-cable/data";
import { netM1SceneBroadcastMac } from "./net-m1-scene-broadcast-mac/data";
import { netM2ByteBits } from "./net-m2-byte-bits/data";
import { netM2AddressBits } from "./net-m2-address-bits/data";
import { netM2AddressDrill } from "./net-m2-address-drill/data";
import { netM2SceneFreePool } from "./net-m2-scene-free-pool/data";
import { netM2AllocateClass } from "./net-m2-allocate-class/data";
import { netM2AllocateCidr } from "./net-m2-allocate-cidr/data";
import { netM2Prefix } from "./net-m2-prefix/data";
import { netM2CidrDrill } from "./net-m2-cidr-drill/data";
import { netM2SceneSameAddress } from "./net-m2-scene-same-address/data";
import { netM2Classify } from "./net-m2-classify/data";
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
import { actOnFeedback } from "./act-on-feedback/data";
import { adoptAToolLoopSources } from "./adopt-a-tool-loop-sources/data";
import { adoptAToolLoop } from "./adopt-a-tool-loop/data";
import { agreementIsNotProofLeftOut } from "./agreement-is-not-proof-left-out/data";
import { agreementIsNotProofTwo } from "./agreement-is-not-proof-two/data";
import { agreementIsNotProof } from "./agreement-is-not-proof/data";
import { cacheChoiceContext } from "./cache-choice-context/data";
import { claimTypeSorterDevin } from "./claim-type-sorter-devin/data";
import { claimTypeSorter } from "./claim-type-sorter/data";
import { detectorMyths } from "./detector-myths/data";
import { dumpOrStory } from "./dump-or-story/data";
import { fastAnswerLostWeek } from "./fast-answer-lost-week/data";
import { fastestDatabaseDepends } from "./fastest-database-depends/data";
import { fearVersusDataGains } from "./fear-versus-data-gains/data";
import { fearVersusData } from "./fear-versus-data/data";
import { firstOrResearchedAnswerClaims } from "./first-or-researched-answer-claims/data";
import { firstOrResearchedAnswerDates } from "./first-or-researched-answer-dates/data";
import { firstOrResearchedAnswer } from "./first-or-researched-answer/data";
import { growLaithFortyRepos } from "./grow-laith-forty-repos/data";
import { humansReminderMistake } from "./humans-reminder-mistake/data";
import { leastAccessPicker } from "./least-access-picker/data";
import { likelyNextWordAgrees } from "./likely-next-word-agrees/data";
import { likelyNextWord } from "./likely-next-word/data";
import { metricsStoreContext } from "./metrics-store-context/data";
import { outboxOrNot } from "./outbox-or-not/data";
import { ownTheIncidentCodeFreeze } from "./own-the-incident-code-freeze/data";
import { ownTheIncident } from "./own-the-incident/data";
import { pickAVisualTool } from "./pick-a-visual-tool/data";
import { shortLessonLoop } from "./short-lesson-loop/data";
import { showsThinkingOrNoise } from "./shows-thinking-or-noise/data";
import { toolbeltHiddenInstruction } from "./toolbelt-hidden-instruction/data";
import { toolbeltOneLineReadme } from "./toolbelt-one-line-readme/data";
import { trustOrErode } from "./trust-or-erode/data";
import { twoTeamsSameAnswer } from "./two-teams-same-answer/data";
import { useAiOrNotLoginCode } from "./use-ai-or-not-login-code/data";
import { useAiOrNotQuickYes } from "./use-ai-or-not-quick-yes/data";
import { useAiOrNot } from "./use-ai-or-not/data";
import { usefulOrBait } from "./useful-or-bait/data";
import { voiceUseCheck } from "./voice-use-check/data";
import { whichTeamProjectFits } from "./which-team-project-fits/data";
import { whoLeadsThisCallLateDate } from "./who-leads-this-call-late-date/data";
import { whoLeadsThisCallLayouts } from "./who-leads-this-call-layouts/data";
import { whoLeadsThisCallQuery } from "./who-leads-this-call-query/data";
import { whoLeadsThisCall } from "./who-leads-this-call/data";
import { whoTheSmallerTeamKeeps } from "./who-the-smaller-team-keeps/data";
import { whoLeadsThisCallSurvey } from "./who-leads-this-call-survey/data";
import { careerM6EmptyPhrases } from "./career-m6-empty-phrases/data";
import { careerM1FirstLook } from "./career-m1-first-look/data";
import { careerM3ClaimCard } from "./career-m3-claim-card/data";
import { careerM1BadgesOrProject } from "./career-m1-badges-or-project/data";
import { careerM1CheckableOrClaim } from "./career-m1-checkable-or-claim/data";
import { careerM1DetectorFlag } from "./career-m1-detector-flag/data";
import { careerM1ErrorsCleaned } from "./career-m1-errors-cleaned/data";
import { careerM1FoundersPhone } from "./career-m1-founders-phone/data";
import { careerM1GenericOrTailored } from "./career-m1-generic-or-tailored/data";
import { careerM1GuessTheWriter } from "./career-m1-guess-the-writer/data";
import { careerM1HandbookCards } from "./career-m1-handbook-cards/data";
import { careerM1KitBiasNote } from "./career-m1-kit-bias-note/data";
import { careerM1OneLink } from "./career-m1-one-link/data";
import { careerM1OnlyYouCanWrite } from "./career-m1-only-you-can-write/data";
import { careerM1PileAndDay } from "./career-m1-pile-and-day/data";
import { careerM1SixtySent } from "./career-m1-sixty-sent/data";
import { careerM1SmoothLetters } from "./career-m1-smooth-letters/data";
import { careerM1TenSecondTest } from "./career-m1-ten-second-test/data";
import { careerM2BestAtWhat } from "./career-m2-best-at-what/data";
import { careerM2ClaimsUnderPillars } from "./career-m2-claims-under-pillars/data";
import { careerM2FootballNotebook } from "./career-m2-football-notebook/data";
import { careerM2FoundVsTeam } from "./career-m2-found-vs-team/data";
import { careerM2LabelsFade } from "./career-m2-labels-fade/data";
import { careerM2OneLineOpens } from "./career-m2-one-line-opens/data";
import { careerM2RoleCard } from "./career-m2-role-card/data";
import { careerM2SkillsNotAdjectives } from "./career-m2-skills-not-adjectives/data";
import { careerM2TenOrThree } from "./career-m2-ten-or-three/data";
import { careerM2ThreeAsks } from "./career-m2-three-asks/data";
import { careerM2ThreeReplies } from "./career-m2-three-replies/data";
import { careerM2VolunteerFull } from "./career-m2-volunteer-full/data";
import { careerM2WhereDetailHelps } from "./career-m2-where-detail-helps/data";
import { careerM3AskFirst } from "./career-m3-ask-first/data";
import { careerM3EmptyClaimCard } from "./career-m3-empty-claim-card/data";
import { careerM3FairTestClaim } from "./career-m3-fair-test-claim/data";
import { careerM3FiveRuns } from "./career-m3-five-runs/data";
import { careerM3K6FairTest } from "./career-m3-k6-fair-test/data";
import { careerM3LeakedKey } from "./career-m3-leaked-key/data";
import { careerM3MatchWorkToProof } from "./career-m3-match-work-to-proof/data";
import { careerM3NotMeasured } from "./career-m3-not-measured/data";
import { careerM3PercentNeedsStart } from "./career-m3-percent-needs-start/data";
import { careerM3PercentileLine } from "./career-m3-percentile-line/data";
import { careerM3PercentilesDontAverage } from "./career-m3-percentiles-dont-average/data";
import { careerM3PhoneExport } from "./career-m3-phone-export/data";
import { careerM3PlanPair } from "./career-m3-plan-pair/data";
import { careerM3SameWeek } from "./career-m3-same-week/data";
import { careerM3SeventyOfWhat } from "./career-m3-seventy-of-what/data";
import { careerM3SixQuestions } from "./career-m3-six-questions/data";
import { careerM3TimeSavedNet } from "./career-m3-time-saved-net/data";
import { careerM3TimingSheet } from "./career-m3-timing-sheet/data";
import { careerM3WhatElseChanged } from "./career-m3-what-else-changed/data";
import { careerM3WindowChanges } from "./career-m3-window-changes/data";
import { careerM4BusSchedule } from "./career-m4-bus-schedule/data";
import { careerM4FirstRealUser } from "./career-m4-first-real-user/data";
import { careerM4FixedBox } from "./career-m4-fixed-box/data";
import { careerM4MatchingQuestion } from "./career-m4-matching-question/data";
import { careerM4PileOfApps } from "./career-m4-pile-of-apps/data";
import { careerM4ProjectPage } from "./career-m4-project-page/data";
import { careerM4RideAppWeekend } from "./career-m4-ride-app-weekend/data";
import { careerM4RunTheFilter } from "./career-m4-run-the-filter/data";
import { careerM4ScopeSentence } from "./career-m4-scope-sentence/data";
import { careerM4SpeedVsUnderstanding } from "./career-m4-speed-vs-understanding/data";
import { careerM4StudiesDisagree } from "./career-m4-studies-disagree/data";
import { careerM5Captions } from "./career-m5-captions/data";
import { careerM5CaseFromRow } from "./career-m5-case-from-row/data";
import { careerM5DemoAsleep } from "./career-m5-demo-asleep/data";
import { careerM5DemoLogin } from "./career-m5-demo-login/data";
import { careerM5DemoStoryboard } from "./career-m5-demo-storyboard/data";
import { careerM5ExtraSteps } from "./career-m5-extra-steps/data";
import { careerM5GoogleConsent } from "./career-m5-google-consent/data";
import { careerM5LinkNobodyOpens } from "./career-m5-link-nobody-opens/data";
import { careerM5LinksInSixMonths } from "./career-m5-links-in-six-months/data";
import { careerM5NoHosting } from "./career-m5-no-hosting/data";
import { careerM5RedactedChart } from "./career-m5-redacted-chart/data";
import { careerM5RemoveAControl } from "./career-m5-remove-a-control/data";
import { careerM5SameBox } from "./career-m5-same-box/data";
import { careerM5ScreenshotFirst } from "./career-m5-screenshot-first/data";
import { careerM5ShowTheHardPart } from "./career-m5-show-the-hard-part/data";
import { careerM5SleepThenSignup } from "./career-m5-sleep-then-signup/data";
import { careerM5StartWithResult } from "./career-m5-start-with-result/data";
import { careerM5StrangerPath } from "./career-m5-stranger-path/data";
import { careerM6AdjectivesOrFact } from "./career-m6-adjectives-or-fact/data";
import { careerM6BuildABullet } from "./career-m6-build-a-bullet/data";
import { careerM6CopiedWords } from "./career-m6-copied-words/data";
import { careerM6DutyVsBullet } from "./career-m6-duty-vs-bullet/data";
import { careerM6FilingCabinet } from "./career-m6-filing-cabinet/data";
import { careerM6HumaniserNo } from "./career-m6-humaniser-no/data";
import { careerM6LinesAnyones } from "./career-m6-lines-anyones/data";
import { careerM6MissingTracker } from "./career-m6-missing-tracker/data";
import { careerM6NoNumberBullet } from "./career-m6-no-number-bullet/data";
import { careerM6OldBulletMarked } from "./career-m6-old-bullet-marked/data";
import { careerM6PasteTest } from "./career-m6-paste-test/data";
import { careerM6PickAPosting } from "./career-m6-pick-a-posting/data";
import { careerM6PlainFile } from "./career-m6-plain-file/data";
import { careerM6TailoringReorder } from "./career-m6-tailoring-reorder/data";
import { careerM6TestLinks } from "./career-m6-test-links/data";
import { careerM7CommentEdit } from "./career-m7-comment-edit/data";
import { careerM7DifferentFeeds } from "./career-m7-different-feeds/data";
import { careerM7EightWeekLog } from "./career-m7-eight-week-log/data";
import { careerM7ExperienceEntry } from "./career-m7-experience-entry/data";
import { careerM7FolkloreCards } from "./career-m7-folklore-cards/data";
import { careerM7FortyNotes } from "./career-m7-forty-notes/data";
import { careerM7FreeAccount } from "./career-m7-free-account/data";
import { careerM7HeadlineParts } from "./career-m7-headline-parts/data";
import { careerM7HeadlineTravels } from "./career-m7-headline-travels/data";
import { careerM7LikeGroup } from "./career-m7-like-group/data";
import { careerM7MoreYes } from "./career-m7-more-yes/data";
import { careerM7RulesForbid } from "./career-m7-rules-forbid/data";
import { careerM7SpendTheNotes } from "./career-m7-spend-the-notes/data";
import { careerM8CanonicalFields } from "./career-m8-canonical-fields/data";
import { careerM8ChannelVersions } from "./career-m8-channel-versions/data";
import { careerM8FirstPublishedLine } from "./career-m8-first-published-line/data";
import { careerM8OpenWithProblem } from "./career-m8-open-with-problem/data";
import { careerM8PlainWords } from "./career-m8-plain-words/data";
import { careerM8PostGone } from "./career-m8-post-gone/data";
import { careerM8SayItBack } from "./career-m8-say-it-back/data";
import { careerM8SearchPicksOne } from "./career-m8-search-picks-one/data";
import { careerM8SmallAndAlive } from "./career-m8-small-and-alive/data";
import { careerM8SpecificsOrTemplate } from "./career-m8-specifics-or-template/data";
import { careerM8SwapGeneric } from "./career-m8-swap-generic/data";
import { careerM8TemplateSite } from "./career-m8-template-site/data";
import { careerM8VisitorJudges } from "./career-m8-visitor-judges/data";
import { careerM9KeepTheTerm } from "./career-m9-keep-the-term/data";
import { careerM9LedgerRowShown } from "./career-m9-ledger-row-shown/data";
import { careerM9LinePicked } from "./career-m9-line-picked/data";
import { careerM9OneChange } from "./career-m9-one-change/data";
import { careerM9TapTheFlag } from "./career-m9-tap-the-flag/data";
import { productM2SpacingGroups } from "./product-m2-spacing-groups/data";
import { productM5SpotTheSlop } from "./product-m5-spot-the-slop/data";
import { productM1ProblemOrFeature } from "./product-m1-problem-or-feature/data";
import { productM1Scene } from "./product-m1-scene/data";
import { productM1ScopeHammer } from "./product-m1-scope-hammer/data";
import { productM1SignalOrCount } from "./product-m1-signal-or-count/data";
import { productM1TheCheaperFix } from "./product-m1-the-cheaper-fix/data";
import { productM1TwoJobs } from "./product-m1-two-jobs/data";
import { productM2ColourAlone } from "./product-m2-colour-alone/data";
import { productM2ColourJobs } from "./product-m2-colour-jobs/data";
import { productM2ContrastLadder } from "./product-m2-contrast-ladder/data";
import { productM2LabelGap } from "./product-m2-label-gap/data";
import { productM2LineHeight } from "./product-m2-line-height/data";
import { productM2Scene } from "./product-m2-scene/data";
import { productM2SquintGroups } from "./product-m2-squint-groups/data";
import { productM2SquintTest } from "./product-m2-squint-test/data";
import { productM2TextZoom } from "./product-m2-text-zoom/data";
import { productM2ThreeSizes } from "./product-m2-three-sizes/data";
import { productM2TypeLadder } from "./product-m2-type-ladder/data";
import { productM3FirstRun } from "./product-m3-first-run/data";
import { productM3FormSpot } from "./product-m3-form-spot/data";
import { productM3FourStates } from "./product-m3-four-states/data";
import { productM3LabelVanish } from "./product-m3-label-vanish/data";
import { productM3MotionWithAJob } from "./product-m3-motion-with-a-job/data";
import { productM3Scene } from "./product-m3-scene/data";
import { productM3TapTargets } from "./product-m3-tap-targets/data";
import { productM3WaitLadder } from "./product-m3-wait-ladder/data";
import { productM3WhenToCheck } from "./product-m3-when-to-check/data";
import { productM4CritiqueOrOpinion } from "./product-m4-critique-or-opinion/data";
import { productM4DefaultOrChoice } from "./product-m4-default-or-choice/data";
import { productM4FourLevels } from "./product-m4-four-levels/data";
import { productM4PolishOrPass } from "./product-m4-polish-or-pass/data";
import { productM4RuleOrMyth } from "./product-m4-rule-or-myth/data";
import { productM4SameTask } from "./product-m4-same-task/data";
import { productM4Scene } from "./product-m4-scene/data";
import { productM5Boldness } from "./product-m5-boldness/data";
import { productM5CardWithAJob } from "./product-m5-card-with-a-job/data";
import { productM5HundredProducts } from "./product-m5-hundred-products/data";
import { productM5PointOfView } from "./product-m5-point-of-view/data";
import { productM5Scene } from "./product-m5-scene/data";
import { productM6CheckTheCritique } from "./product-m6-check-the-critique/data";
import { productM6Scene } from "./product-m6-scene/data";
import { productM6VagueOrBriefed } from "./product-m6-vague-or-briefed/data";
import { productM7DemoStoryboard } from "./product-m7-demo-storyboard/data";
import { productM7OneClickAccess } from "./product-m7-one-click-access/data";
import { productM7Scene } from "./product-m7-scene/data";
import { productM7SkimAfter } from "./product-m7-skim-after/data";
import { productM7SkimBefore } from "./product-m7-skim-before/data";
import { productM1CountOrShare } from "./product-m1-count-or-share/data";
import { productM1FirstCheck } from "./product-m1-first-check/data";
import { productM1JobOrNot } from "./product-m1-job-or-not/data";
import { productM1LastTime } from "./product-m1-last-time/data";
import { productM1SayNo } from "./product-m1-say-no/data";
import { productM2ArabicSize } from "./product-m2-arabic-size/data";
import { productM2FrontLoad } from "./product-m2-front-load/data";
import { productM2LargeText } from "./product-m2-large-text/data";
import { productM2OneStep } from "./product-m2-one-step/data";
import { productM2Signals } from "./product-m2-signals/data";
import { productM2WaselBefore } from "./product-m2-wasel-before/data";
import { productM3ErrorTemplates } from "./product-m3-error-templates/data";
import { productM3ErrorWords } from "./product-m3-error-words/data";
import { productM3HelpInPlace } from "./product-m3-help-in-place/data";
import { productM3MotionSorter } from "./product-m3-motion-sorter/data";
import { productM3ReducedMotion } from "./product-m3-reduced-motion/data";
import { productM3RtlCard } from "./product-m3-rtl-card/data";
import { productM3TabOrder } from "./product-m3-tab-order/data";
import { productM4FiveTesters } from "./product-m4-five-testers/data";
import { productM4LevelLadder } from "./product-m4-level-ladder/data";
import { productM4SameFramework } from "./product-m4-same-framework/data";
import { productM5AskedOrder } from "./product-m5-asked-order/data";
import { productM5BigNumber } from "./product-m5-big-number/data";
import { productM5FourFixes } from "./product-m5-four-fixes/data";
import { productM5LabelsErrors } from "./product-m5-labels-errors/data";
import { productM5SwapADefault } from "./product-m5-swap-a-default/data";
import { productM6BriefParts } from "./product-m6-brief-parts/data";
import { productM6OneTable } from "./product-m6-one-table/data";
import { productM6OrderSwap } from "./product-m6-order-swap/data";
import { productM6SaidOrBuilt } from "./product-m6-said-or-built/data";
import { productM6VerdictOrQuestions } from "./product-m6-verdict-or-questions/data";
import { productM7MutedFrame } from "./product-m7-muted-frame/data";
import { productM7PageOrder } from "./product-m7-page-order/data";
import { productM7WhereLinksGo } from "./product-m7-where-links-go/data";
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
import { netM3ArpExchange } from "./net-m3-arp-exchange/data";
import { netM3Broadcast } from "./net-m3-broadcast/data";
import { netM3MaskAnd } from "./net-m3-mask-and/data";
import { netM3MaskBits } from "./net-m3-mask-bits/data";
import { netM3MaskDrill } from "./net-m3-mask-drill/data";
import { netM3OverlapLine } from "./net-m3-overlap-line/data";
import { netM3OverlapNest } from "./net-m3-overlap-nest/data";
import { netM3SplitBoundary } from "./net-m3-split-boundary/data";
import { netM3SplitDrill } from "./net-m3-split-drill/data";
import { netM3SplitPlace } from "./net-m3-split-place/data";
import { netM3SplitSize } from "./net-m3-split-size/data";
import { netM3WideMask } from "./net-m3-wide-mask/data";
import { netM4RouteLongest } from "./net-m4-route-longest/data";
import { netM9V6Drill } from "./net-m9-v6-drill/data";
import { netM9V6Expand } from "./net-m9-v6-expand/data";
import { netM9V6Invalid } from "./net-m9-v6-invalid/data";
import { netM9V6Shorten } from "./net-m9-v6-shorten/data";
import { netM3ArpNoOwner } from "./net-m3-arp-no-owner/data";
import { netM3ArpTable } from "./net-m3-arp-table/data";
import { netM3FlatBroadcast } from "./net-m3-flat-broadcast/data";
import { netM3ReplayWrongMask } from "./net-m3-replay-wrong-mask/data";
import { netM3SceneFlatSchool } from "./net-m3-scene-flat-school/data";
import { netM3SceneLateOverlap } from "./net-m3-scene-late-overlap/data";
import { netM3SceneNeedMac } from "./net-m3-scene-need-mac/data";
import { netM3SplitBroadcast } from "./net-m3-split-broadcast/data";
import { netM3SplitFilter } from "./net-m3-split-filter/data";
import { netM3SwitchLearning } from "./net-m3-switch-learning/data";
import { netM4MacLocal } from "./net-m4-mac-local/data";
import { netM4MacPerHop } from "./net-m4-mac-per-hop/data";
import { netM4MacRemote } from "./net-m4-mac-remote/data";
import { netM4ReplayRouter } from "./net-m4-replay-router/data";
import { netM4RouteDefault } from "./net-m4-route-default/data";
import { netM4RouteGet } from "./net-m4-route-get/data";
import { netM4RouteMatches } from "./net-m4-route-matches/data";
import { netM4RouteMetric } from "./net-m4-route-metric/data";
import { netM4RouteReorder } from "./net-m4-route-reorder/data";
import { netM4RouteTable } from "./net-m4-route-table/data";
import { netM4SilentRouter } from "./net-m4-silent-router/data";
import { netM4TimeExceeded } from "./net-m4-time-exceeded/data";
import { netM4TracerouteProbes } from "./net-m4-traceroute-probes/data";
import { netM4TtlCountdown } from "./net-m4-ttl-countdown/data";
import { netM5FiveNumbers } from "./net-m5-five-numbers/data";
import { netM5LaptopAddress } from "./net-m5-laptop-address/data";
import { netM5ListenAll } from "./net-m5-listen-all/data";
import { netM5ListenLoopback } from "./net-m5-listen-loopback/data";
import { netM5MatchReplies } from "./net-m5-match-replies/data";
import { netM5PhoneLocalhost } from "./net-m5-phone-localhost/data";
import { netM5ReplayConversation } from "./net-m5-replay-conversation/data";
import { netM5SceneLateAudio } from "./net-m5-scene-late-audio/data";
import { netM5SceneLossyLink } from "./net-m5-scene-lossy-link/data";
import { netM5SceneTwoTabs } from "./net-m5-scene-two-tabs/data";
import { netM5SocketsPorts } from "./net-m5-sockets-ports/data";
import { netM5SortResend } from "./net-m5-sort-resend/data";
import { netM5SortTcpUdp } from "./net-m5-sort-tcp-udp/data";
import { netM5TcpLossAck } from "./net-m5-tcp-loss-ack/data";
import { netM5TcpLossResend } from "./net-m5-tcp-loss-resend/data";
import { netM5TcpLossTimeline } from "./net-m5-tcp-loss-timeline/data";
import { netM5UdpLossTimeline } from "./net-m5-udp-loss-timeline/data";
import { netM6CgnatLayers } from "./net-m6-cgnat-layers/data";
import { netM6Conntrack } from "./net-m6-conntrack/data";
import { netM6FilterRule } from "./net-m6-filter-rule/data";
import { netM6ForwardRule } from "./net-m6-forward-rule/data";
import { netM6HomeRouterFirstLook } from "./net-m6-home-router-first-look/data";
import { netM6InboundUnsolicited } from "./net-m6-inbound-unsolicited/data";
import { netM6NatClash } from "./net-m6-nat-clash/data";
import { netM6NatIdleExpire } from "./net-m6-nat-idle-expire/data";
import { netM6NatKeepalive } from "./net-m6-nat-keepalive/data";
import { netM6NatRewrite } from "./net-m6-nat-rewrite/data";
import { netM6NatTableFills } from "./net-m6-nat-table-fills/data";
import { netM6ReplayForwardGuest } from "./net-m6-replay-forward-guest/data";
import { netM6ReplayMasquerade } from "./net-m6-replay-masquerade/data";
import { netM6RouteLeak } from "./net-m6-route-leak/data";
import { netM6SceneQuietChat } from "./net-m6-scene-quiet-chat/data";
import { netM7DhcpFourMessages } from "./net-m7-dhcp-four-messages/data";
import { netM7DhcpPool } from "./net-m7-dhcp-pool/data";
import { netM7DnsEmptyCache } from "./net-m7-dns-empty-cache/data";
import { netM7DnsWarmCache } from "./net-m7-dns-warm-cache/data";
import { netM7ReplayChallenge5 } from "./net-m7-replay-challenge-5/data";
import { netM7SceneFacebookMissing } from "./net-m7-scene-facebook-missing/data";
import { netM7SceneNoAddress } from "./net-m7-scene-no-address/data";
import { netM7SortWhoAnswers } from "./net-m7-sort-who-answers/data";
import { netM7TtlOneResolver } from "./net-m7-ttl-one-resolver/data";
import { netM7TtlThreeResolvers } from "./net-m7-ttl-three-resolvers/data";
import { netM8JourneyDns } from "./net-m8-journey-dns/data";
import { netM8JourneyFirstByte } from "./net-m8-journey-first-byte/data";
import { netM8JourneyGateway } from "./net-m8-journey-gateway/data";
import { netM8JourneyLeaseArp } from "./net-m8-journey-lease-arp/data";
import { netM8JourneyNatHop } from "./net-m8-journey-nat-hop/data";
import { netM8JourneyReply } from "./net-m8-journey-reply/data";
import { netM8ReplayCapstone1 } from "./net-m8-replay-capstone-1/data";
import { netM8ReplayCapstone2 } from "./net-m8-replay-capstone-2/data";
import { netM8ReplayCapstone3 } from "./net-m8-replay-capstone-3/data";
import { netM8ReplayCapstone4 } from "./net-m8-replay-capstone-4/data";
import { netM9Ipv6Addresses } from "./net-m9-ipv6-addresses/data";
import { netM9Ipv6Filter } from "./net-m9-ipv6-filter/data";
import { netM9Ipv6VsNat } from "./net-m9-ipv6-vs-nat/data";

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
  "act-on-feedback": actOnFeedback,
  "adopt-a-tool-loop-sources": adoptAToolLoopSources,
  "adopt-a-tool-loop": adoptAToolLoop,
  "agreement-is-not-proof-left-out": agreementIsNotProofLeftOut,
  "agreement-is-not-proof-two": agreementIsNotProofTwo,
  "agreement-is-not-proof": agreementIsNotProof,
  "cache-choice-context": cacheChoiceContext,
  "claim-type-sorter-devin": claimTypeSorterDevin,
  "claim-type-sorter": claimTypeSorter,
  "detector-myths": detectorMyths,
  "dump-or-story": dumpOrStory,
  "fast-answer-lost-week": fastAnswerLostWeek,
  "fastest-database-depends": fastestDatabaseDepends,
  "fear-versus-data-gains": fearVersusDataGains,
  "fear-versus-data": fearVersusData,
  "first-or-researched-answer-claims": firstOrResearchedAnswerClaims,
  "first-or-researched-answer-dates": firstOrResearchedAnswerDates,
  "first-or-researched-answer": firstOrResearchedAnswer,
  "grow-laith-forty-repos": growLaithFortyRepos,
  "humans-reminder-mistake": humansReminderMistake,
  "least-access-picker": leastAccessPicker,
  "likely-next-word-agrees": likelyNextWordAgrees,
  "likely-next-word": likelyNextWord,
  "metrics-store-context": metricsStoreContext,
  "outbox-or-not": outboxOrNot,
  "own-the-incident-code-freeze": ownTheIncidentCodeFreeze,
  "own-the-incident": ownTheIncident,
  "pick-a-visual-tool": pickAVisualTool,
  "short-lesson-loop": shortLessonLoop,
  "shows-thinking-or-noise": showsThinkingOrNoise,
  "toolbelt-hidden-instruction": toolbeltHiddenInstruction,
  "toolbelt-one-line-readme": toolbeltOneLineReadme,
  "trust-or-erode": trustOrErode,
  "two-teams-same-answer": twoTeamsSameAnswer,
  "use-ai-or-not-login-code": useAiOrNotLoginCode,
  "use-ai-or-not-quick-yes": useAiOrNotQuickYes,
  "use-ai-or-not": useAiOrNot,
  "useful-or-bait": usefulOrBait,
  "voice-use-check": voiceUseCheck,
  "which-team-project-fits": whichTeamProjectFits,
  "who-leads-this-call-late-date": whoLeadsThisCallLateDate,
  "who-leads-this-call-layouts": whoLeadsThisCallLayouts,
  "who-leads-this-call-query": whoLeadsThisCallQuery,
  "who-leads-this-call": whoLeadsThisCall,
  "who-the-smaller-team-keeps": whoTheSmallerTeamKeeps,
  "who-leads-this-call-survey": whoLeadsThisCallSurvey,
  "career-m6-empty-phrases": careerM6EmptyPhrases,
  "career-m1-first-look": careerM1FirstLook,
  "career-m3-claim-card": careerM3ClaimCard,
  "career-m1-badges-or-project": careerM1BadgesOrProject,
  "career-m1-checkable-or-claim": careerM1CheckableOrClaim,
  "career-m1-detector-flag": careerM1DetectorFlag,
  "career-m1-errors-cleaned": careerM1ErrorsCleaned,
  "career-m1-founders-phone": careerM1FoundersPhone,
  "career-m1-generic-or-tailored": careerM1GenericOrTailored,
  "career-m1-guess-the-writer": careerM1GuessTheWriter,
  "career-m1-handbook-cards": careerM1HandbookCards,
  "career-m1-kit-bias-note": careerM1KitBiasNote,
  "career-m1-one-link": careerM1OneLink,
  "career-m1-only-you-can-write": careerM1OnlyYouCanWrite,
  "career-m1-pile-and-day": careerM1PileAndDay,
  "career-m1-sixty-sent": careerM1SixtySent,
  "career-m1-smooth-letters": careerM1SmoothLetters,
  "career-m1-ten-second-test": careerM1TenSecondTest,
  "career-m2-best-at-what": careerM2BestAtWhat,
  "career-m2-claims-under-pillars": careerM2ClaimsUnderPillars,
  "career-m2-football-notebook": careerM2FootballNotebook,
  "career-m2-found-vs-team": careerM2FoundVsTeam,
  "career-m2-labels-fade": careerM2LabelsFade,
  "career-m2-one-line-opens": careerM2OneLineOpens,
  "career-m2-role-card": careerM2RoleCard,
  "career-m2-skills-not-adjectives": careerM2SkillsNotAdjectives,
  "career-m2-ten-or-three": careerM2TenOrThree,
  "career-m2-three-asks": careerM2ThreeAsks,
  "career-m2-three-replies": careerM2ThreeReplies,
  "career-m2-volunteer-full": careerM2VolunteerFull,
  "career-m2-where-detail-helps": careerM2WhereDetailHelps,
  "career-m3-ask-first": careerM3AskFirst,
  "career-m3-empty-claim-card": careerM3EmptyClaimCard,
  "career-m3-fair-test-claim": careerM3FairTestClaim,
  "career-m3-five-runs": careerM3FiveRuns,
  "career-m3-k6-fair-test": careerM3K6FairTest,
  "career-m3-leaked-key": careerM3LeakedKey,
  "career-m3-match-work-to-proof": careerM3MatchWorkToProof,
  "career-m3-not-measured": careerM3NotMeasured,
  "career-m3-percent-needs-start": careerM3PercentNeedsStart,
  "career-m3-percentile-line": careerM3PercentileLine,
  "career-m3-percentiles-dont-average": careerM3PercentilesDontAverage,
  "career-m3-phone-export": careerM3PhoneExport,
  "career-m3-plan-pair": careerM3PlanPair,
  "career-m3-same-week": careerM3SameWeek,
  "career-m3-seventy-of-what": careerM3SeventyOfWhat,
  "career-m3-six-questions": careerM3SixQuestions,
  "career-m3-time-saved-net": careerM3TimeSavedNet,
  "career-m3-timing-sheet": careerM3TimingSheet,
  "career-m3-what-else-changed": careerM3WhatElseChanged,
  "career-m3-window-changes": careerM3WindowChanges,
  "career-m4-bus-schedule": careerM4BusSchedule,
  "career-m4-first-real-user": careerM4FirstRealUser,
  "career-m4-fixed-box": careerM4FixedBox,
  "career-m4-matching-question": careerM4MatchingQuestion,
  "career-m4-pile-of-apps": careerM4PileOfApps,
  "career-m4-project-page": careerM4ProjectPage,
  "career-m4-ride-app-weekend": careerM4RideAppWeekend,
  "career-m4-run-the-filter": careerM4RunTheFilter,
  "career-m4-scope-sentence": careerM4ScopeSentence,
  "career-m4-speed-vs-understanding": careerM4SpeedVsUnderstanding,
  "career-m4-studies-disagree": careerM4StudiesDisagree,
  "career-m5-captions": careerM5Captions,
  "career-m5-case-from-row": careerM5CaseFromRow,
  "career-m5-demo-asleep": careerM5DemoAsleep,
  "career-m5-demo-login": careerM5DemoLogin,
  "career-m5-demo-storyboard": careerM5DemoStoryboard,
  "career-m5-extra-steps": careerM5ExtraSteps,
  "career-m5-google-consent": careerM5GoogleConsent,
  "career-m5-link-nobody-opens": careerM5LinkNobodyOpens,
  "career-m5-links-in-six-months": careerM5LinksInSixMonths,
  "career-m5-no-hosting": careerM5NoHosting,
  "career-m5-redacted-chart": careerM5RedactedChart,
  "career-m5-remove-a-control": careerM5RemoveAControl,
  "career-m5-same-box": careerM5SameBox,
  "career-m5-screenshot-first": careerM5ScreenshotFirst,
  "career-m5-show-the-hard-part": careerM5ShowTheHardPart,
  "career-m5-sleep-then-signup": careerM5SleepThenSignup,
  "career-m5-start-with-result": careerM5StartWithResult,
  "career-m5-stranger-path": careerM5StrangerPath,
  "career-m6-adjectives-or-fact": careerM6AdjectivesOrFact,
  "career-m6-build-a-bullet": careerM6BuildABullet,
  "career-m6-copied-words": careerM6CopiedWords,
  "career-m6-duty-vs-bullet": careerM6DutyVsBullet,
  "career-m6-filing-cabinet": careerM6FilingCabinet,
  "career-m6-humaniser-no": careerM6HumaniserNo,
  "career-m6-lines-anyones": careerM6LinesAnyones,
  "career-m6-missing-tracker": careerM6MissingTracker,
  "career-m6-no-number-bullet": careerM6NoNumberBullet,
  "career-m6-old-bullet-marked": careerM6OldBulletMarked,
  "career-m6-paste-test": careerM6PasteTest,
  "career-m6-pick-a-posting": careerM6PickAPosting,
  "career-m6-plain-file": careerM6PlainFile,
  "career-m6-tailoring-reorder": careerM6TailoringReorder,
  "career-m6-test-links": careerM6TestLinks,
  "career-m7-comment-edit": careerM7CommentEdit,
  "career-m7-different-feeds": careerM7DifferentFeeds,
  "career-m7-eight-week-log": careerM7EightWeekLog,
  "career-m7-experience-entry": careerM7ExperienceEntry,
  "career-m7-folklore-cards": careerM7FolkloreCards,
  "career-m7-forty-notes": careerM7FortyNotes,
  "career-m7-free-account": careerM7FreeAccount,
  "career-m7-headline-parts": careerM7HeadlineParts,
  "career-m7-headline-travels": careerM7HeadlineTravels,
  "career-m7-like-group": careerM7LikeGroup,
  "career-m7-more-yes": careerM7MoreYes,
  "career-m7-rules-forbid": careerM7RulesForbid,
  "career-m7-spend-the-notes": careerM7SpendTheNotes,
  "career-m8-canonical-fields": careerM8CanonicalFields,
  "career-m8-channel-versions": careerM8ChannelVersions,
  "career-m8-first-published-line": careerM8FirstPublishedLine,
  "career-m8-open-with-problem": careerM8OpenWithProblem,
  "career-m8-plain-words": careerM8PlainWords,
  "career-m8-post-gone": careerM8PostGone,
  "career-m8-say-it-back": careerM8SayItBack,
  "career-m8-search-picks-one": careerM8SearchPicksOne,
  "career-m8-small-and-alive": careerM8SmallAndAlive,
  "career-m8-specifics-or-template": careerM8SpecificsOrTemplate,
  "career-m8-swap-generic": careerM8SwapGeneric,
  "career-m8-template-site": careerM8TemplateSite,
  "career-m8-visitor-judges": careerM8VisitorJudges,
  "career-m9-keep-the-term": careerM9KeepTheTerm,
  "career-m9-ledger-row-shown": careerM9LedgerRowShown,
  "career-m9-line-picked": careerM9LinePicked,
  "career-m9-one-change": careerM9OneChange,
  "career-m9-tap-the-flag": careerM9TapTheFlag,
  "product-m2-spacing-groups": productM2SpacingGroups,
  "product-m5-spot-the-slop": productM5SpotTheSlop,
  "product-m1-problem-or-feature": productM1ProblemOrFeature,
  "product-m1-scene": productM1Scene,
  "product-m1-scope-hammer": productM1ScopeHammer,
  "product-m1-signal-or-count": productM1SignalOrCount,
  "product-m1-the-cheaper-fix": productM1TheCheaperFix,
  "product-m1-two-jobs": productM1TwoJobs,
  "product-m2-colour-alone": productM2ColourAlone,
  "product-m2-colour-jobs": productM2ColourJobs,
  "product-m2-contrast-ladder": productM2ContrastLadder,
  "product-m2-label-gap": productM2LabelGap,
  "product-m2-line-height": productM2LineHeight,
  "product-m2-scene": productM2Scene,
  "product-m2-squint-groups": productM2SquintGroups,
  "product-m2-squint-test": productM2SquintTest,
  "product-m2-text-zoom": productM2TextZoom,
  "product-m2-three-sizes": productM2ThreeSizes,
  "product-m2-type-ladder": productM2TypeLadder,
  "product-m3-first-run": productM3FirstRun,
  "product-m3-form-spot": productM3FormSpot,
  "product-m3-four-states": productM3FourStates,
  "product-m3-label-vanish": productM3LabelVanish,
  "product-m3-motion-with-a-job": productM3MotionWithAJob,
  "product-m3-scene": productM3Scene,
  "product-m3-tap-targets": productM3TapTargets,
  "product-m3-wait-ladder": productM3WaitLadder,
  "product-m3-when-to-check": productM3WhenToCheck,
  "product-m4-critique-or-opinion": productM4CritiqueOrOpinion,
  "product-m4-default-or-choice": productM4DefaultOrChoice,
  "product-m4-four-levels": productM4FourLevels,
  "product-m4-polish-or-pass": productM4PolishOrPass,
  "product-m4-rule-or-myth": productM4RuleOrMyth,
  "product-m4-same-task": productM4SameTask,
  "product-m4-scene": productM4Scene,
  "product-m5-boldness": productM5Boldness,
  "product-m5-card-with-a-job": productM5CardWithAJob,
  "product-m5-hundred-products": productM5HundredProducts,
  "product-m5-point-of-view": productM5PointOfView,
  "product-m5-scene": productM5Scene,
  "product-m6-check-the-critique": productM6CheckTheCritique,
  "product-m6-scene": productM6Scene,
  "product-m6-vague-or-briefed": productM6VagueOrBriefed,
  "product-m7-demo-storyboard": productM7DemoStoryboard,
  "product-m7-one-click-access": productM7OneClickAccess,
  "product-m7-scene": productM7Scene,
  "product-m7-skim-after": productM7SkimAfter,
  "product-m7-skim-before": productM7SkimBefore,
  "product-m1-count-or-share": productM1CountOrShare,
  "product-m1-first-check": productM1FirstCheck,
  "product-m1-job-or-not": productM1JobOrNot,
  "product-m1-last-time": productM1LastTime,
  "product-m1-say-no": productM1SayNo,
  "product-m2-arabic-size": productM2ArabicSize,
  "product-m2-front-load": productM2FrontLoad,
  "product-m2-large-text": productM2LargeText,
  "product-m2-one-step": productM2OneStep,
  "product-m2-signals": productM2Signals,
  "product-m2-wasel-before": productM2WaselBefore,
  "product-m3-error-templates": productM3ErrorTemplates,
  "product-m3-error-words": productM3ErrorWords,
  "product-m3-help-in-place": productM3HelpInPlace,
  "product-m3-motion-sorter": productM3MotionSorter,
  "product-m3-reduced-motion": productM3ReducedMotion,
  "product-m3-rtl-card": productM3RtlCard,
  "product-m3-tab-order": productM3TabOrder,
  "product-m4-five-testers": productM4FiveTesters,
  "product-m4-level-ladder": productM4LevelLadder,
  "product-m4-same-framework": productM4SameFramework,
  "product-m5-asked-order": productM5AskedOrder,
  "product-m5-big-number": productM5BigNumber,
  "product-m5-four-fixes": productM5FourFixes,
  "product-m5-labels-errors": productM5LabelsErrors,
  "product-m5-swap-a-default": productM5SwapADefault,
  "product-m6-brief-parts": productM6BriefParts,
  "product-m6-one-table": productM6OneTable,
  "product-m6-order-swap": productM6OrderSwap,
  "product-m6-said-or-built": productM6SaidOrBuilt,
  "product-m6-verdict-or-questions": productM6VerdictOrQuestions,
  "product-m7-muted-frame": productM7MutedFrame,
  "product-m7-page-order": productM7PageOrder,
  "product-m7-where-links-go": productM7WhereLinksGo,
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
  "net-m1-packet-dns": netM1PacketDns,
  "net-m1-packet-echo": netM1PacketEcho,
  "net-m1-packet-own-lines": netM1PacketOwnLines,
  "net-m1-packet-change": netM1PacketChange,
  "net-m1-packet-jobs": netM1PacketJobs,
  "net-m1-packet-wrap": netM1PacketWrap,
  "net-m1-packet-unwrap": netM1PacketUnwrap,
  "net-m1-replay-setup-checker": netM1ReplaySetupChecker,
  "net-m1-replay-own-numbers": netM1ReplayOwnNumbers,
  "net-m1-replay-virtual-cable": netM1ReplayVirtualCable,
  "net-m1-scene-broadcast-mac": netM1SceneBroadcastMac,
  "net-m2-byte-bits": netM2ByteBits,
  "net-m2-address-bits": netM2AddressBits,
  "net-m2-address-drill": netM2AddressDrill,
  "net-m2-scene-free-pool": netM2SceneFreePool,
  "net-m2-allocate-class": netM2AllocateClass,
  "net-m2-allocate-cidr": netM2AllocateCidr,
  "net-m2-prefix": netM2Prefix,
  "net-m2-cidr-drill": netM2CidrDrill,
  "net-m2-scene-same-address": netM2SceneSameAddress,
  "net-m2-classify": netM2Classify,
  "net-m3-arp-exchange": netM3ArpExchange,
  "net-m3-broadcast": netM3Broadcast,
  "net-m3-mask-and": netM3MaskAnd,
  "net-m3-mask-bits": netM3MaskBits,
  "net-m3-mask-drill": netM3MaskDrill,
  "net-m3-overlap-line": netM3OverlapLine,
  "net-m3-overlap-nest": netM3OverlapNest,
  "net-m3-split-boundary": netM3SplitBoundary,
  "net-m3-split-drill": netM3SplitDrill,
  "net-m3-split-place": netM3SplitPlace,
  "net-m3-split-size": netM3SplitSize,
  "net-m3-wide-mask": netM3WideMask,
  "net-m4-route-longest": netM4RouteLongest,
  "net-m9-v6-drill": netM9V6Drill,
  "net-m9-v6-expand": netM9V6Expand,
  "net-m9-v6-invalid": netM9V6Invalid,
  "net-m9-v6-shorten": netM9V6Shorten,
  "net-m3-arp-no-owner": netM3ArpNoOwner,
  "net-m3-arp-table": netM3ArpTable,
  "net-m3-flat-broadcast": netM3FlatBroadcast,
  "net-m3-replay-wrong-mask": netM3ReplayWrongMask,
  "net-m3-scene-flat-school": netM3SceneFlatSchool,
  "net-m3-scene-late-overlap": netM3SceneLateOverlap,
  "net-m3-scene-need-mac": netM3SceneNeedMac,
  "net-m3-split-broadcast": netM3SplitBroadcast,
  "net-m3-split-filter": netM3SplitFilter,
  "net-m3-switch-learning": netM3SwitchLearning,
  "net-m4-mac-local": netM4MacLocal,
  "net-m4-mac-per-hop": netM4MacPerHop,
  "net-m4-mac-remote": netM4MacRemote,
  "net-m4-replay-router": netM4ReplayRouter,
  "net-m4-route-default": netM4RouteDefault,
  "net-m4-route-get": netM4RouteGet,
  "net-m4-route-matches": netM4RouteMatches,
  "net-m4-route-metric": netM4RouteMetric,
  "net-m4-route-reorder": netM4RouteReorder,
  "net-m4-route-table": netM4RouteTable,
  "net-m4-silent-router": netM4SilentRouter,
  "net-m4-time-exceeded": netM4TimeExceeded,
  "net-m4-traceroute-probes": netM4TracerouteProbes,
  "net-m4-ttl-countdown": netM4TtlCountdown,
  "net-m5-five-numbers": netM5FiveNumbers,
  "net-m5-laptop-address": netM5LaptopAddress,
  "net-m5-listen-all": netM5ListenAll,
  "net-m5-listen-loopback": netM5ListenLoopback,
  "net-m5-match-replies": netM5MatchReplies,
  "net-m5-phone-localhost": netM5PhoneLocalhost,
  "net-m5-replay-conversation": netM5ReplayConversation,
  "net-m5-scene-late-audio": netM5SceneLateAudio,
  "net-m5-scene-lossy-link": netM5SceneLossyLink,
  "net-m5-scene-two-tabs": netM5SceneTwoTabs,
  "net-m5-sockets-ports": netM5SocketsPorts,
  "net-m5-sort-resend": netM5SortResend,
  "net-m5-sort-tcp-udp": netM5SortTcpUdp,
  "net-m5-tcp-loss-ack": netM5TcpLossAck,
  "net-m5-tcp-loss-resend": netM5TcpLossResend,
  "net-m5-tcp-loss-timeline": netM5TcpLossTimeline,
  "net-m5-udp-loss-timeline": netM5UdpLossTimeline,
  "net-m6-cgnat-layers": netM6CgnatLayers,
  "net-m6-conntrack": netM6Conntrack,
  "net-m6-filter-rule": netM6FilterRule,
  "net-m6-forward-rule": netM6ForwardRule,
  "net-m6-home-router-first-look": netM6HomeRouterFirstLook,
  "net-m6-inbound-unsolicited": netM6InboundUnsolicited,
  "net-m6-nat-clash": netM6NatClash,
  "net-m6-nat-idle-expire": netM6NatIdleExpire,
  "net-m6-nat-keepalive": netM6NatKeepalive,
  "net-m6-nat-rewrite": netM6NatRewrite,
  "net-m6-nat-table-fills": netM6NatTableFills,
  "net-m6-replay-forward-guest": netM6ReplayForwardGuest,
  "net-m6-replay-masquerade": netM6ReplayMasquerade,
  "net-m6-route-leak": netM6RouteLeak,
  "net-m6-scene-quiet-chat": netM6SceneQuietChat,
  "net-m7-dhcp-four-messages": netM7DhcpFourMessages,
  "net-m7-dhcp-pool": netM7DhcpPool,
  "net-m7-dns-empty-cache": netM7DnsEmptyCache,
  "net-m7-dns-warm-cache": netM7DnsWarmCache,
  "net-m7-replay-challenge-5": netM7ReplayChallenge5,
  "net-m7-scene-facebook-missing": netM7SceneFacebookMissing,
  "net-m7-scene-no-address": netM7SceneNoAddress,
  "net-m7-sort-who-answers": netM7SortWhoAnswers,
  "net-m7-ttl-one-resolver": netM7TtlOneResolver,
  "net-m7-ttl-three-resolvers": netM7TtlThreeResolvers,
  "net-m8-journey-dns": netM8JourneyDns,
  "net-m8-journey-first-byte": netM8JourneyFirstByte,
  "net-m8-journey-gateway": netM8JourneyGateway,
  "net-m8-journey-lease-arp": netM8JourneyLeaseArp,
  "net-m8-journey-nat-hop": netM8JourneyNatHop,
  "net-m8-journey-reply": netM8JourneyReply,
  "net-m8-replay-capstone-1": netM8ReplayCapstone1,
  "net-m8-replay-capstone-2": netM8ReplayCapstone2,
  "net-m8-replay-capstone-3": netM8ReplayCapstone3,
  "net-m8-replay-capstone-4": netM8ReplayCapstone4,
  "net-m9-ipv6-addresses": netM9Ipv6Addresses,
  "net-m9-ipv6-filter": netM9Ipv6Filter,
  "net-m9-ipv6-vs-nat": netM9Ipv6VsNat,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
