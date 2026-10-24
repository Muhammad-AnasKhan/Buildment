import type { DesignFlow, DesignSpec, DesignStep } from "./design-stepper";
import { withCommas } from "./picture-controls";
import {
  COMPRESSION,
  FETCH_SECONDS,
  FETCH_SECONDS_CACHED,
  LINKS_PER_PAGE,
  SLOTS_PER_MACHINE,
  TARGET_PER_SECOND,
} from "./crawl-numbers";

// 26.2 "Step through the design at peak". DalilBot's design grows one block at
// a time. Pure data for the house design stepper (models/design-stepper.ts).
//
//   target             = 2 billion pages a month = 771.6 pages a second
//   one fetcher        = 1 / 0.5 s = 2 pages a second (386 times too slow)
//   many in flight     = 100 / 0.5 = 200 at most, planned at half: 100; 8 machines
//   with a DNS cache   = 100 / 0.4 = 250 at most, planned at half: 125; 7 machines
//   shards (k)         = a 24 GB Bloom filter and 38,580 link checks a second, divided by k
//   storage            = 771.6 pages a second x 25 KB compressed = 19.3 MB/s; 50 TB a month

export const SHARD_CHOICES: readonly number[] = [4, 8, 16];
export const SHARDS_DEFAULT = 8;
/** The seen set as a Bloom filter for 20 billion URLs at 1% error (chapter 26.4). */
export const FILTER_GB = 24;

export const SINGLE_RATE = 1 / FETCH_SECONDS;
export const TIMES_TOO_SLOW = Math.round(TARGET_PER_SECOND / SINGLE_RATE);
export const PLAN_RATE = (SLOTS_PER_MACHINE / FETCH_SECONDS) / 2;
export const PLAN_RATE_CACHED = (SLOTS_PER_MACHINE / FETCH_SECONDS_CACHED) / 2;
export const MACHINES = Math.ceil(TARGET_PER_SECOND / PLAN_RATE);
export const MACHINES_CACHED = Math.ceil(TARGET_PER_SECOND / PLAN_RATE_CACHED);
export const LINK_CHECKS = TARGET_PER_SECOND * LINKS_PER_PAGE;
export const COMPRESSED_KB = 100 / COMPRESSION;
export const WRITE_MB_PER_SECOND = (TARGET_PER_SECOND * COMPRESSED_KB) / 1000;
export const STORED_TB_A_MONTH = 50;

export type ShardNumbers = { gb: number; checks: number };

/** Each shard's memory and link checks a second when the frontier is split k ways. */
export function shardNumbers(k: number): ShardNumbers {
  const n = Math.max(1, k);
  return { gb: FILTER_GB / n, checks: LINK_CHECKS / n };
}

/** "6 GB", "3 GB", "1.5 GB". */
export const gbText = (gb: number) => `${Number(gb.toFixed(1))} GB`;
/** "9,645" for the card. */
export const checksText = (checks: number) => withCommas(checks);
/** "9,600" for the verdict: rounded to the nearest hundred. */
export const checksRounded = (checks: number) => withCommas(Math.round(checks / 100) * 100);

/** The 38-character verdict for step 4. */
export function shardVerdict(k: number): { text: string; tone: "warn" | "good" } {
  const n = shardNumbers(k);
  if (k === 16) return { text: `16 shards: ${gbText(n.gb)} and ${checksRounded(n.checks)} each`, tone: "good" };
  return { text: `${k} shards: ${gbText(n.gb)} and ${checksRounded(n.checks)} checks each`, tone: k <= 4 ? "warn" : "good" };
}

const A = 92;
const B = 216;
const X = [70, 205, 340] as const;

const THROUGH: DesignFlow[] = [
  { path: ["frontier", "fetch", "web"], tone: "accent", offset: 0 },
  { path: ["frontier", "fetch", "web"], tone: "accent", offset: 0.33 },
  { path: ["frontier", "fetch", "web"], tone: "accent", offset: 0.66 },
];
const LOOKUP: DesignFlow = { path: ["fetch", "dns"], label: "lookup", tone: "warn", offset: 0.2 };
const HITS: DesignFlow[] = Array.from({ length: 4 }, (_, i) => ({ path: ["fetch", "cache"], label: i === 0 ? "hit" : undefined, tone: "good" as const, offset: i / 4 }));
const MISS: DesignFlow = { path: ["fetch", "cache", "dns"], label: "miss", tone: "warn", offset: 0.1 };
const SAVE: DesignFlow = { path: ["fetch", "store"], label: "page", tone: "accent", offset: 0.45 };

/** The design stepper data for DalilBot with k frontier shards chosen in step 4. */
export function crawlDesign(k: number = SHARDS_DEFAULT): DesignSpec {
  const n = shardNumbers(k);
  const shardTone = k <= 4 ? ("warn" as const) : ("good" as const);

  const steps: DesignStep[] = [
    {
      id: "one-fetcher",
      title: "One fetcher",
      patch: {
        actors: [
          { id: "frontier", label: "Frontier", kind: "queue", x: X[0], y: A },
          { id: "fetch", label: "One fetcher", kind: "worker", x: X[1], y: A },
          { id: "web", label: "Web", kind: "cdn", x: X[2], y: A },
        ],
        links: [
          { id: "frontier-fetch", from: "frontier", to: "fetch" },
          { id: "fetch-web", from: "fetch", to: "web" },
        ],
        tags: [{ id: "need", text: "needs 772 pages/s", x: 205, y: 152, tone: "accent" }],
        status: { fetch: { text: `${SINGLE_RATE} pages/s`, tone: "bad" } },
        flows: [{ path: ["frontier", "fetch", "web"], tone: "bad" }],
        mark: { fetch: "bad" },
      },
      verdict: { text: `One fetcher: ${TIMES_TOO_SLOW} times too slow`, tone: "bad" },
      says: "One fetcher waits for each page to finish, 0.5 seconds. That is 2 pages a second against a need of 772.",
      hint: "Tap Next, or tap any step above.",
    },
    {
      id: "in-flight",
      title: "Many in flight",
      patch: {
        actors: [
          { id: "fetch", label: "Fetchers", kind: "worker", x: X[1], y: A },
          { id: "dns", label: "DNS lookup", kind: "router", x: X[2], y: B },
        ],
        links: [{ id: "fetch-dns", from: "fetch", to: "dns" }],
        tags: [{ id: "need", text: `${PLAN_RATE} pages/s each`, x: 205, y: 152, tone: "accent" }],
        status: {
          fetch: { text: `${MACHINES} machines`, tone: "good" },
          dns: { text: "100 ms each", tone: "warn" },
        },
        flows: [...THROUGH, LOOKUP],
        mark: { fetch: "good" },
      },
      verdict: { text: `${MACHINES} machines carry 772 pages a second`, tone: "good" },
      says: "Each machine keeps 100 downloads in flight, so it can finish 200 pages a second and is planned at half, 100. 772 / 100 rounds up to 8 machines.",
      hint: "Each machine is planned at half its limit.",
    },
    {
      id: "dns-cache",
      title: "DNS cache",
      patch: {
        actors: [
          { id: "fetch", label: "Fetchers", kind: "worker", x: X[1], y: A },
          { id: "cache", label: "DNS cache", kind: "cache", x: X[1], y: B },
        ],
        links: [
          { id: "fetch-cache", from: "fetch", to: "cache" },
          { id: "cache-dns", from: "cache", to: "dns" },
        ],
        remove: ["fetch-dns"],
        tags: [{ id: "need", text: `${PLAN_RATE_CACHED} pages/s each`, x: 205, y: 152, tone: "accent" }],
        status: {
          fetch: { text: `${MACHINES_CACHED} machines`, tone: "good" },
          cache: { text: "0.5 ms", tone: "good" },
        },
        flows: [...THROUGH, ...HITS, MISS],
        mark: { fetch: "good", cache: "good" },
      },
      verdict: { text: `DNS cache: ${MACHINES_CACHED} machines, fewer lookups`, tone: "good" },
      says: "Most lookups now turn back at the cache, 0.5 ms instead of 100 ms. A fetch takes 0.4 seconds, so a machine is planned at 125 pages a second: 7 machines.",
      hint: "Most dots turn back at the cache.",
    },
    {
      id: "shards",
      title: "Shards",
      patch: {
        actors: [{ id: "frontier", label: `Frontier x${k}`, kind: "queue", x: X[0], y: A }],
        tags: [{ id: "checks", text: `${checksText(n.checks)} checks/s`, x: 60, y: 146, tone: shardTone }],
        status: { frontier: { text: `${gbText(n.gb)} each`, tone: shardTone } },
        mark: { frontier: shardTone },
      },
      verdict: shardVerdict(k),
      says: `A hash of the host picks the shard. The 24 GB seen filter and 38,580 link checks a second are split ${k} ways: ${gbText(n.gb)} and ${checksText(n.checks)} checks a second each.`,
      hint: "Tap 4, 8 or 16 shards in the picture.",
    },
    {
      id: "storage",
      title: "Storage",
      patch: {
        actors: [{ id: "store", label: "Storage", kind: "database", x: X[0], y: B }],
        links: [{ id: "fetch-store", from: "fetch", to: "store" }],
        tags: [{ id: "write", text: `${Number(WRITE_MB_PER_SECOND.toFixed(1))} MB/s written`, x: 70, y: 270, tone: "accent" }],
        status: { store: { text: `${STORED_TB_A_MONTH} TB/month`, tone: "good" } },
        flows: [...THROUGH, ...HITS, MISS, SAVE],
        mark: { store: "good" },
      },
      verdict: { text: `Pages to object storage: ${STORED_TB_A_MONTH} TB/month`, tone: "good" },
      says: "Each page is compressed 4 to 1 to 25 KB and written to object storage: 772 x 25 KB is about 19 MB a second, and 50 TB a month.",
      hint: "Facts about each URL go to a table, not here.",
    },
  ];

  return { width: 420, height: 332, steps };
}

/** Where the canvas draws the shard choice chips (step 4 only). */
export const CHOICE_ROW_Y = 304;
