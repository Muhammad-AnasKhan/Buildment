import type { DesignFlow, DesignSpec, DesignStep } from "./design-stepper";
import { ORIGIN_BUDGET_TBIT, PEAK_MACHINES, PEAK_SENT_TBIT, ROW_PLAN, SEND_PLAN_GBIT, VIRAL_VIEWS } from "./lamha-numbers";
import { machinesText } from "./lamha-estimate";

// 27.2 "Step through the design at peak". Lamha's design grows one block at a
// time while the picture shows the number to watch. Pure data for the house
// design stepper (models/design-stepper.ts).
//
//   peak sent                = 12.5 Tbit/s = 12,500 Gbit/s
//   one box                  = 12,500 / 50 = 250 times its plan
//   storage, no CDN          = 12.5 Tbit/s, 12.5 times the 1 Tbit/s budget
//   storage, 95% edge hits   = 12.5 x 0.05 = 0.625 Tbit/s;  70%: 12.5 x 0.30 = 3.75
//   workers at peak          = 15,625 busy machines
//   viral video, 16 shards   = 5,000 / 16 = 312.5 writes a second each (62.5% of 500)

export const HIT_HIGH = 95;
export const HIT_LOW = 70;
export const SHARDS_SHOWN = 16;

export type DesignNumbers = {
  /** One box: times its plan. */
  timesPlan: number;
  /** Storage, Tbit/s, for a hit rate in percent (0 for no CDN). */
  storageTbit: (hitPercent: number) => number;
  /** Times the 1 Tbit/s budget for a given storage load. */
  budgetMultiple: (tbit: number) => number;
  machines: number;
  perShard: number;
  perShardPercent: number;
};

export const designNumbers: DesignNumbers = {
  timesPlan: (PEAK_SENT_TBIT * 1000) / SEND_PLAN_GBIT,
  storageTbit: (hit) => PEAK_SENT_TBIT * (1 - hit / 100),
  budgetMultiple: (tbit) => tbit / ORIGIN_BUDGET_TBIT,
  machines: PEAK_MACHINES,
  perShard: VIRAL_VIEWS / SHARDS_SHOWN,
  perShardPercent: Math.round(((VIRAL_VIEWS / SHARDS_SHOWN) / ROW_PLAN) * 100),
};

/** "0.63 Tbit/s", "3.8 Tbit/s", "12.5 Tbit/s". */
export function tbitText(tbit: number): string {
  if (tbit >= 10) return `${Math.round(tbit * 10) / 10} Tbit/s`;
  if (tbit >= 3) return `${tbit.toFixed(1)} Tbit/s`;
  return `${tbit.toFixed(2)} Tbit/s`;
}

/** "12.5x", "0.63x", "3.75x" with the budget as the unit. */
export const multipleText = (m: number) => `${m >= 10 ? m.toFixed(1) : m.toFixed(2)}x`.replace(/(\.\d)0x$/, "$1x");

const X = [62, 210, 358] as const;
const ROW_A = 100;
const ROW_B = 200;
const ROW_C = 320;
const ROW_D = 410;
/** The shard boxes under the Counter card. */
export const SHARD_BOXES = { centerX: X[2], y: [244, 260] as const, size: 12, gap: 3, perRow: 8, labelY: 281 } as const;

/** Requests that reach the edge: `hits` turn back there, `misses` go on to storage. */
function cdnFlows(hits: number, misses: number): DesignFlow[] {
  const total = hits + misses;
  const out: DesignFlow[] = [];
  for (let i = 0; i < hits; i++) out.push({ path: ["viewers", "cdn"], tone: "good", label: i === 0 ? "hit" : undefined, offset: i / total });
  for (let i = 0; i < misses; i++) out.push({ path: ["viewers", "cdn", "storage"], tone: "warn", label: i === 0 ? "miss" : undefined, offset: (hits + i + 0.5) / total });
  return out;
}

const PAGES: DesignFlow = { path: ["viewers", "api"], tone: "accent", offset: 0.45 };
const UPLOAD: DesignFlow = { path: ["uploader", "raw", "queue", "workers", "video"], tone: "accent", label: "upload", offset: 0.1 };
const COUNT: DesignFlow = { path: ["api", "counter"], tone: "accent", label: "view", offset: 0.6 };

/** The design stepper data for Lamha. */
export function lamhaDesign(): DesignSpec {
  const none = designNumbers.storageTbit(0);
  const high = designNumbers.storageTbit(HIT_HIGH);
  const low = designNumbers.storageTbit(HIT_LOW);
  const hitFlows = cdnFlows(19, 1);
  const lowFlows = cdnFlows(7, 3);

  const steps: DesignStep[] = [
    {
      id: "one-box",
      title: "One box",
      patch: {
        actors: [
          { id: "viewers", label: "Viewers", kind: "user", x: X[0], y: ROW_A },
          { id: "box", label: "One box", kind: "server", x: X[1], y: ROW_A },
        ],
        links: [{ id: "viewers-box", from: "viewers", to: "box" }],
        tags: [{ id: "load", text: "12,500 / 50 Gbit/s", x: X[1], y: 156, tone: "bad" }],
        status: { box: { text: `${designNumbers.timesPlan}x plan`, tone: "bad" } },
        flows: [{ path: ["viewers", "box"], tone: "bad" }],
        mark: { box: "bad" },
      },
      verdict: { text: `One box: ${designNumbers.timesPlan} times its plan`, tone: "bad" },
      says: "One box holds the app and the video files. At peak it must send 12.5 Tbit/s, and a machine is planned at 50 Gbit/s.",
      hint: "Tap Next, or tap any step above.",
    },
    {
      id: "storage",
      title: "Storage",
      patch: {
        actors: [
          { id: "api", label: "API servers", kind: "server", x: X[1], y: ROW_B },
          { id: "storage", label: "Storage", kind: "database", x: X[2], y: ROW_A },
        ],
        remove: ["box", "viewers-box", "load"],
        links: [
          { id: "viewers-api", from: "viewers", to: "api" },
          { id: "viewers-storage", from: "viewers", to: "storage" },
        ],
        tags: [{ id: "budget-none", text: `${multipleText(designNumbers.budgetMultiple(none))} the budget`, x: 346, y: 156, tone: "bad" }],
        status: {
          api: { text: "pages only", tone: "good" },
          storage: { text: tbitText(none), tone: "bad" },
        },
        flows: [{ path: ["viewers", "storage"], tone: "bad" }, PAGES],
        mark: { storage: "bad" },
      },
      verdict: { text: `Storage must send ${tbitText(none)}`, tone: "bad" },
      says: "Video files sit in object storage and stateless API servers handle pages. Storage still sends all 12.5 Tbit/s, against a budget of 1 Tbit/s.",
      hint: "App servers do nothing for the video bytes.",
    },
    {
      id: "cdn",
      title: "CDN",
      patch: {
        actors: [{ id: "cdn", label: "CDN edge", kind: "cdn", x: X[1], y: ROW_A }],
        remove: ["viewers-storage", "budget-none"],
        links: [
          { id: "viewers-cdn", from: "viewers", to: "cdn" },
          { id: "cdn-storage", from: "cdn", to: "storage" },
        ],
        tags: [
          { id: "ends", text: "19 in 20 end here", x: X[1], y: 156, tone: "good" },
          { id: "budget", text: `${multipleText(designNumbers.budgetMultiple(high))} budget`, x: 366, y: 156, tone: "good" },
        ],
        status: {
          cdn: { text: `hit ${HIT_HIGH}%`, tone: "good" },
          storage: { text: tbitText(high), tone: "good" },
        },
        flows: [...hitFlows, PAGES],
        mark: { storage: "good" },
      },
      verdict: { text: `CDN: storage now sends ${tbitText(high)}`, tone: "good" },
      says: "A CDN edge answers 19 plays in 20 from its own copy. Storage sends the other 1 in 20: 0.63 Tbit/s, under the budget.",
      hint: "Tap the CDN card to see a 70% hit rate.",
      action: {
        toggle: true,
        phases: [
          { button: `Hit rate ${HIT_HIGH}%`, target: "cdn" },
          {
            button: `Hit rate ${HIT_LOW}%`,
            target: "cdn",
            patch: {
              tags: [
                { id: "ends", text: "7 in 10 end here", x: X[1], y: 156, tone: "warn" },
                { id: "budget", text: `${multipleText(designNumbers.budgetMultiple(low))} budget`, x: 366, y: 156, tone: "bad" },
              ],
              status: {
                cdn: { text: `hit ${HIT_LOW}%`, tone: "warn" },
                storage: { text: tbitText(low), tone: "bad" },
              },
              flows: [...lowFlows, PAGES],
              mark: { storage: "bad" },
            },
            verdict: { text: `At ${HIT_LOW}% hits storage sends ${tbitText(low)}`, tone: "bad" },
            says: "At a 70% hit rate, 3 plays in 10 reach storage: 3.75 Tbit/s, nearly four times the budget. The hit rate moves the bill most.",
          },
        ],
      },
    },
    {
      id: "queue",
      title: "Queue",
      patch: {
        actors: [
          { id: "uploader", label: "Uploader", kind: "phone", x: X[0], y: ROW_C },
          { id: "raw", label: "Raw storage", kind: "database", x: X[1], y: ROW_C },
          { id: "queue", label: "Queue", kind: "queue", x: X[2], y: ROW_C },
          { id: "workers", label: "Workers", kind: "worker", x: X[2], y: ROW_D },
          { id: "video", label: "Video store", kind: "database", x: X[1], y: ROW_D },
        ],
        remove: ["ends", "budget"],
        links: [
          { id: "uploader-raw", from: "uploader", to: "raw" },
          { id: "raw-queue", from: "raw", to: "queue" },
          { id: "queue-workers", from: "queue", to: "workers" },
          { id: "workers-video", from: "workers", to: "video" },
        ],
        tags: [{ id: "path", text: "upload path", x: 130, y: 262, tone: "accent" }],
        status: {
          cdn: { text: `hit ${HIT_HIGH}%`, tone: "good" },
          storage: { text: tbitText(high), tone: "good" },
          workers: { text: `${machinesText(designNumbers.machines)} peak`, tone: "accent" },
          queue: { text: "jobs wait", tone: "accent" },
        },
        flows: [...hitFlows, PAGES, UPLOAD],
        mark: { workers: "accent" },
      },
      verdict: { text: "Processing runs off the play path", tone: "good" },
      says: "An upload lands in raw storage and a job joins a queue. About 15,600 busy machines at peak make the versions, and no viewer waits for them.",
      hint: "A second dot runs along the upload path.",
    },
    {
      id: "counters",
      title: "Counters",
      patch: {
        actors: [{ id: "counter", label: "Counter", kind: "worker", x: X[2], y: ROW_B }],
        links: [{ id: "api-counter", from: "api", to: "counter" }],
        status: { counter: { text: `${Math.round(designNumbers.perShard)} /s each`, tone: "good" } },
        flows: [...hitFlows, PAGES, UPLOAD, COUNT],
        mark: { counter: "good" },
      },
      verdict: { text: `Counting spreads over ${SHARDS_SHOWN} rows`, tone: "good" },
      says: `A viral video gets 5,000 views a second. Spread over ${SHARDS_SHOWN} shard rows that is ${Math.round(designNumbers.perShard)} writes a second each, ${designNumbers.perShardPercent}% of the 500 plan.`,
      hint: "Each view adds one to a shard row.",
    },
  ];

  return { width: 420, height: 462, steps };
}
