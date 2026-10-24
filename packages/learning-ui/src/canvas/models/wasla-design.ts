import type { DesignFlow, DesignSpec, DesignStep } from "./design-stepper";
import { APP_PLAN, NODE_PLAN, PEAK_CREATES, PEAK_REDIRECTS } from "./wasla-numbers";
import { withCommas } from "./picture-controls";

// 20.2 "Step through the design at peak". Wasla's design grows one block at a
// time while the picture shows how many times its plan the database carries.
// Pure data for the house design stepper (models/design-stepper.ts).
//
//   peak load           = 100,000 redirects + 1,000 creates = 101,000 a second
//   app servers         = ceil(100,000 / 5,000) = 20
//   database, no cache  = 101,000 a second          (40.4 times its plan of 2,500)
//   database, 90% hits  = 100,000 x 0.10 + 1,000 = 11,000   (4.4 times)
//   per partition       = 11,000 / k, against a plan of 2,500

export const PARTITION_CHOICES: readonly number[] = [3, 5, 8];
export const PARTITIONS_DEFAULT = 5;
export const HIT_SHARE = 0.9;

export const PEAK_OPERATIONS = PEAK_REDIRECTS + PEAK_CREATES;
export const APP_SERVERS = Math.ceil(PEAK_REDIRECTS / APP_PLAN);
export const CACHED_OPERATIONS = Math.round(PEAK_REDIRECTS * (1 - HIT_SHARE)) + PEAK_CREATES;

export type DesignNumbers = {
  /** Database operations a second, before any split. */
  operations: number;
  /** Times its plan, for the one database (steps 1 to 3). */
  timesPlan: number;
  /** Each partition's operations a second (step 4 and 5). */
  perPartition: number;
  /** Each partition's share of its plan, in whole percent. */
  partitionPercent: number;
};

/** The database's numbers at a step (1 to 5) with k partitions. */
export function designNumbers(step: number, k: number): DesignNumbers {
  const operations = step <= 2 ? PEAK_OPERATIONS : CACHED_OPERATIONS;
  const perPartition = operations / Math.max(1, k);
  return {
    operations,
    timesPlan: operations / NODE_PLAN,
    perPartition,
    partitionPercent: Math.round((perPartition / NODE_PLAN) * 100),
  };
}

/** "40x its plan" for 40.4, "4.4x its plan" for 4.4. */
export function timesPlanText(times: number): string {
  return `${times >= 10 ? Math.round(times) : (Math.round(times * 10) / 10).toFixed(1)}x its plan`;
}

const X = [70, 205, 340] as const;
const ROW_A = 100;
const ROW_B = 212;

const HIT_FLOWS: DesignFlow[] = Array.from({ length: 9 }, (_, i) => ({
  path: ["browsers", "apps", "cache"],
  label: i === 0 ? "hit" : undefined,
  tone: "good" as const,
  offset: i / 9,
}));
const MISS_FLOW: DesignFlow = { path: ["browsers", "apps", "cache", "db"], label: "miss", tone: "warn", offset: 0.05 };
const CLICK_FLOW: DesignFlow = { path: ["apps", "queue", "counter"], label: "click", tone: "accent", offset: 0.5 };

/** The design stepper data for Wasla with k partitions chosen in step 4. */
export function waslaDesign(k: number = PARTITIONS_DEFAULT): DesignSpec {
  const n4 = designNumbers(4, k);
  const partitionTone = n4.partitionPercent > 100 ? ("bad" as const) : ("good" as const);
  const partitionPill = { text: `${n4.partitionPercent}% of plan`, tone: partitionTone };
  const each = withCommas(Math.round(n4.perPartition));

  const steps: DesignStep[] = [
    {
      id: "one-box",
      title: "One box",
      patch: {
        actors: [
          { id: "browsers", label: "Browsers", kind: "user", x: X[0], y: ROW_A },
          { id: "apps", label: "One box", kind: "server", x: X[1], y: ROW_A },
        ],
        links: [{ id: "browsers-apps", from: "browsers", to: "apps" }],
        tags: [{ id: "load", text: "peak: 101,000 /s", x: 100, y: 156, tone: "accent" }],
        status: { apps: { text: timesPlanText(designNumbers(1, k).timesPlan), tone: "bad" } },
        flows: [{ path: ["browsers", "apps"], tone: "bad" }],
        mark: { apps: "bad" },
      },
      verdict: { text: "Database at 40 times its plan", tone: "bad" },
      says: "One box holds the app and the database. At peak it gets 101,000 operations a second against a plan of 2,500.",
      hint: "Tap Next, or tap any step above.",
    },
    {
      id: "app-servers",
      title: "App servers",
      patch: {
        actors: [
          { id: "apps", label: "Apps", kind: "server", x: X[1], y: ROW_A },
          { id: "db", label: "Database", kind: "database", x: X[2], y: ROW_B },
        ],
        links: [{ id: "apps-db", from: "apps", to: "db" }],
        status: {
          apps: { text: `${APP_SERVERS} servers`, tone: "good" },
          db: { text: timesPlanText(designNumbers(2, k).timesPlan), tone: "bad" },
        },
        flows: [{ path: ["browsers", "apps", "db"], tone: "bad" }],
        mark: { db: "bad" },
      },
      verdict: { text: "Apps cope, database still 40x over", tone: "bad" },
      says: "20 app servers share the 100,000 redirects, 5,000 each. The database still gets all 101,000.",
      hint: "More servers do nothing for the database.",
    },
    {
      id: "cache",
      title: "Cache",
      patch: {
        actors: [{ id: "cache", label: "Cache", kind: "cache", x: X[2], y: ROW_A }],
        links: [
          { id: "apps-cache", from: "apps", to: "cache" },
          { id: "cache-db", from: "cache", to: "db" },
        ],
        remove: ["apps-db"],
        tags: [{ id: "nine", text: "9 in 10 end here", x: 340, y: 156, tone: "good" }],
        status: {
          cache: { text: "hit 90%", tone: "good" },
          db: { text: timesPlanText(designNumbers(3, k).timesPlan), tone: "warn" },
        },
        flows: [...HIT_FLOWS, MISS_FLOW],
        mark: { db: "warn" },
      },
      verdict: { text: "Cache: database now 4.4 times plan", tone: "warn" },
      says: "The cache answers 9 in 10 redirects. The database gets 10,000 misses plus 1,000 creates: 11,000 a second.",
      hint: "Nine in ten requests turn back at the cache.",
    },
    {
      id: "partitions",
      title: "Partitions",
      patch: {
        status: { db: partitionPill },
        mark: { db: partitionTone },
      },
      verdict: { text: `${k} partitions: each at ${n4.partitionPercent}% of plan`, tone: partitionTone },
      says: `A hash of the code picks the partition. 11,000 / ${k} = ${each} operations a second each, against a plan of 2,500.`,
      hint: "Tap 3, 5 or 8 partitions in the picture.",
    },
    {
      id: "counting",
      title: "Counting",
      patch: {
        actors: [
          { id: "queue", label: "Queue", kind: "queue", x: X[1], y: ROW_B },
          { id: "counter", label: "Counter", kind: "worker", x: X[0], y: ROW_B },
        ],
        links: [
          { id: "apps-queue", from: "apps", to: "queue" },
          { id: "queue-counter", from: "queue", to: "counter" },
        ],
        tags: [{ id: "off", text: "off the redirect path", x: 137, y: 268, tone: "accent" }],
        status: {
          queue: { text: "clicks wait", tone: "accent" },
          counter: { text: "adds them up", tone: "accent" },
        },
        flows: [...HIT_FLOWS, MISS_FLOW, CLICK_FLOW],
        mark: { queue: "accent", counter: "accent" },
      },
      verdict: { text: "Counting leaves the redirect path", tone: "good" },
      says: "Each click goes to a queue and a counter, not to the database. The database load is unchanged and a hit is still one trip.",
      hint: "A second dot leaves the app for the queue.",
    },
  ];

  return { width: 420, height: 330, steps };
}

/** Positions the canvas needs to draw the partitions under the database card. */
export const PARTITION_ROW = { centerX: X[2], y: 262, size: 14, gap: 4 } as const;
export const CHOICE_ROW_Y = 298;
