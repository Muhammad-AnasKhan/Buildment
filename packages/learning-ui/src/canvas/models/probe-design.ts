import type { DesignFlow, DesignPatch, DesignPhase, DesignSpec, DesignStep, DesignTag } from "./design-stepper";
import type { Tone } from "../primitives/tones";
import { withCommas } from "./picture-controls";
import { APP_PLAN, NODE_PLAN, PEAK_CREATES, PEAK_REDIRECTS } from "./wasla-numbers";

// 28.3 "Step through six follow-ups". The same Wasla design (chapters 20.1,
// 20.2 and 20.4) answers six probes: scale the numbers, divide each load by
// its plan, fix the part that breaks first and price the fix.
//
//   database operations = opens x (1 - hit rate) + creates
//   per partition       = operations / partitions, share of plan = per partition / 2,500
//   app servers         = opens / 5,000
//
// Integer maths only (hit rate in whole percent), so there is no float noise.

export const BASE_HIT = 90;
export const FIX_HIT = 99;
export const BASE_PARTITIONS = 5;
/** The partition counts the button in step 3 cycles through. */
export const PARTITION_CYCLE: readonly number[] = [5, 8, 10];
/** Steps 4 and 5 assume the step 3 result: 8 partitions. */
export const FIXED_PARTITIONS = 8;
export const SCALE = 10;
export const CACHE_NODES = 10;
export const COPY_SECONDS = 5;
/** In the hot link step, 1 open in this many is the one viral code. */
export const HOT_ONE_IN = 10;

/** Database operations a second. */
export function dbOps(opens: number, creates: number, hitPercent: number): number {
  return Math.round((opens * (100 - hitPercent)) / 100) + creates;
}

/** One partition's operations a second. */
export const perPartition = (ops: number, partitions: number) => ops / Math.max(1, partitions);

/** One partition's share of its plan, in whole percent. */
export const sharePercent = (ops: number, partitions: number) => Math.round((ops * 100) / (Math.max(1, partitions) * NODE_PLAN));

/** App servers needed to take the opens. */
export const appServers = (opens: number) => Math.ceil(opens / APP_PLAN);

/** Times its plan as text: one decimal under 10 ("8.8x", "6x"), whole above ("50x"). */
export function timesText(ops: number, partitions: number): string {
  const tenths = Math.round((ops * 10) / (Math.max(1, partitions) * NODE_PLAN));
  return `${tenths >= 100 ? Math.floor(tenths / 10) : tenths / 10}x`;
}

/** Reads a second on the one cache node that holds a hot code, when 1 open in `oneIn` is that code. */
export const hotReads = (opens: number, oneIn: number) => Math.round(opens / oneIn);

/** Reads a second on the cache when each app server keeps a copy for `seconds` seconds. */
export const copyReads = (servers: number, seconds: number) => Math.round(servers / seconds);

/** Operations when the cache is spread on `nodes` nodes and one of them restarts empty. */
export function oneNodeEmptyOps(opens: number, creates: number, hitPercent: number, nodes: number): number {
  const emptyShare = Math.round(opens / nodes);
  return emptyShare + Math.round(((opens - emptyShare) * (100 - hitPercent)) / 100) + creates;
}

const OPENS_1 = PEAK_REDIRECTS;
const CREATES_1 = PEAK_CREATES;
const OPENS_10 = PEAK_REDIRECTS * SCALE;
const CREATES_10 = PEAK_CREATES * SCALE;

const shareTone = (ops: number, partitions: number): Tone => (sharePercent(ops, partitions) > 100 ? "bad" : "good");
const sharePill = (ops: number, partitions: number) => ({ text: `${sharePercent(ops, partitions)}% of plan`, tone: shareTone(ops, partitions) });

const BROWSERS = { id: "browsers", label: "Browsers", kind: "user", x: 62, y: 100 } as const;
const APPS = { id: "apps", label: "Apps", kind: "server", x: 210, y: 100 } as const;
const CACHE = { id: "cache", label: "Cache", kind: "cache", x: 358, y: 100 } as const;
const DB = { id: "db", label: "Database", kind: "database", x: 210, y: 230 } as const;

const loadChip = (text: string, tone: Tone): DesignTag => ({ id: "load", text, x: 66, y: 160, tone });
const opsChip = (text: string, tone: Tone): DesignTag => ({ id: "ops", text, x: 210, y: 290, tone });
const eachChip = (ops: number, partitions: number, tone: Tone): DesignTag => ({
  id: "each",
  text: `${withCommas(perPartition(ops, partitions))} each on ${partitions} partitions`,
  x: 210,
  y: 316,
  tone,
});

const HITS: DesignFlow = { path: ["browsers", "apps", "cache"], tone: "good" };
const toDb = (label: string, tone: Tone): DesignFlow => ({ path: ["apps", "db"], label, tone, offset: 0.3 });

/** Step 3: the button cycles 5, 8 and 10 partitions at 99% hits. */
function partitionPhases(ops: number): DesignPhase[] {
  return PARTITION_CYCLE.map((k, index) => {
    const next = PARTITION_CYCLE[(index + 1) % PARTITION_CYCLE.length];
    const tone = shareTone(ops, k);
    const patch: DesignPatch = { status: { db: sharePill(ops, k) }, tags: [eachChip(ops, k, tone)], mark: { db: tone } };
    const last = index === PARTITION_CYCLE.length - 1;
    const phase: DesignPhase = { button: last ? `Back to ${next} partitions` : `Try ${next} partitions`, target: "db", patch };
    if (index > 0) {
      phase.verdict = { text: `${k} partitions: each at ${sharePercent(ops, k)}% of plan`, tone };
      phase.says = `${withCommas(ops)} / ${k} = ${withCommas(perPartition(ops, k))} operations a second each, against a plan of ${withCommas(NODE_PLAN)}.`;
    }
    return phase;
  });
}

/** The probe stepper: the same design answers six follow-ups. */
export function probeDesign(): DesignSpec {
  const k = FIXED_PARTITIONS;
  const ops1 = dbOps(OPENS_1, CREATES_1, BASE_HIT); // 11,000
  const ops2 = dbOps(OPENS_10, CREATES_10, BASE_HIT); // 110,000
  const ops3 = dbOps(OPENS_10, CREATES_10, FIX_HIT); // 20,000
  const cold = dbOps(OPENS_10, CREATES_10, 0); // 1,010,000
  const spread = oneNodeEmptyOps(OPENS_10, CREATES_10, FIX_HIT, CACHE_NODES); // 119,000
  const hot = hotReads(OPENS_10, HOT_ONE_IN); // 100,000
  const copies = copyReads(appServers(OPENS_10), COPY_SECONDS); // 40

  const steps: DesignStep[] = [
    {
      id: "today",
      title: "Today",
      patch: {
        actors: [BROWSERS, APPS, CACHE, DB],
        links: [
          { id: "browsers-apps", from: "browsers", to: "apps" },
          { id: "apps-cache", from: "apps", to: "cache" },
          { id: "apps-db", from: "apps", to: "db" },
        ],
        tags: [loadChip(`${withCommas(OPENS_1)} opens/s`, "accent"), opsChip(`${withCommas(ops1)} db ops/s`, "good"), eachChip(ops1, BASE_PARTITIONS, "good")],
        status: {
          apps: { text: `${appServers(OPENS_1)} servers`, tone: "good" },
          cache: { text: `${BASE_HIT}% hits`, tone: "good" },
          db: sharePill(ops1, BASE_PARTITIONS),
        },
        flows: [HITS],
      },
      verdict: { text: "Today: every part inside its plan", tone: "good" },
      says: "Where the sketch ended: 11,000 database operations a second on 5 partitions.",
      hint: "Tap Next to scale every number by 10.",
    },
    {
      id: "ten-x",
      title: "10x",
      patch: {
        tags: [loadChip(`${withCommas(OPENS_10)} opens/s`, "warn"), opsChip(`${withCommas(ops2)} db ops/s`, "bad"), eachChip(ops2, BASE_PARTITIONS, "bad")],
        status: {
          apps: { text: `needs ${appServers(OPENS_10)}`, tone: "warn" },
          db: { text: `${timesText(ops2, BASE_PARTITIONS)} plan`, tone: "bad" },
        },
        mark: { db: "bad", apps: "warn" },
      },
      verdict: { text: `10x: database at ${timesText(ops2, BASE_PARTITIONS)} its plan`, tone: "bad" },
      says: "Scale every number by 10, then divide each load by its plan.",
      hint: "The database breaks first. Tap Next for the fix.",
    },
    {
      id: "fix",
      title: "Fix",
      patch: {
        tags: [opsChip(`${withCommas(ops3)} db ops/s`, "warn"), eachChip(ops3, BASE_PARTITIONS, "bad")],
        status: {
          apps: { text: `${appServers(OPENS_10)} servers`, tone: "good" },
          cache: { text: `${FIX_HIT}% hits`, tone: "good" },
          db: sharePill(ops3, BASE_PARTITIONS),
        },
        mark: { db: "bad" },
      },
      verdict: { text: `${FIX_HIT}% hits: database at ${sharePercent(ops3, BASE_PARTITIONS)}% of plan`, tone: "bad" },
      says: "Apps: add copies. Database: more hits, then more partitions.",
      hint: "Press the button, or tap the database, to try more partitions.",
      action: { phases: partitionPhases(ops3) },
    },
    {
      id: "cold",
      title: "Cold",
      patch: {
        tags: [opsChip(`${withCommas(cold)} db ops/s`, "bad"), eachChip(cold, k, "bad")],
        status: { cache: { text: "empty", tone: "bad" }, db: { text: `${timesText(cold, k)} plan`, tone: "bad" } },
        flows: [{ path: ["browsers", "apps"], tone: "bad" }, toDb("every open", "bad")],
        mark: { cache: "bad", db: "bad" },
      },
      verdict: { text: `Empty cache: database at ${timesText(cold, k)} plan`, tone: "bad" },
      says: `Every open misses: ${withCommas(cold)} operations a second on ${k} partitions.`,
      hint: "Press the button, or tap the cache, to spread it.",
      action: {
        toggle: true,
        phases: [
          { button: "Spread the cache", target: "cache" },
          {
            button: "Back to one cache",
            target: "cache",
            patch: {
              tags: [opsChip(`${withCommas(spread)} db ops/s`, "warn"), eachChip(spread, k, "warn")],
              status: { cache: { text: `${CACHE_NODES} nodes`, tone: "good" }, db: { text: `${timesText(spread, k)} plan`, tone: "warn" } },
              flows: [HITS, toDb("1 node empty", "warn")],
              mark: { db: "warn" },
            },
            verdict: { text: `One node empty: database at ${timesText(spread, k)} plan`, tone: "warn" },
            says: "A restart empties a tenth. Merge duplicate misses to cut it more.",
          },
        ],
      },
    },
    {
      id: "hot",
      title: "Hot link",
      patch: {
        tags: [opsChip(`${withCommas(hot)} reads/s on 1 node`, "bad")],
        remove: ["each"],
        status: { cache: { text: "1 hot code", tone: "warn" }, db: sharePill(ops3, k) },
        flows: [
          { path: ["browsers", "apps", "cache"], label: "1 code in 10", tone: "warn" },
          { path: ["apps", "cache"], tone: "warn", offset: 0.25 },
          { path: ["apps", "cache"], tone: "warn", offset: 0.5 },
        ],
        mark: { cache: "warn" },
      },
      verdict: { text: `One cache node takes ${withCommas(hot)} reads/s`, tone: "bad" },
      says: "One viral code can load one cache node.",
      hint: "Press the button, or tap the apps, to keep a copy in each.",
      action: {
        toggle: true,
        phases: [
          { button: "Copy in each app", target: "apps" },
          {
            button: "Remove the copies",
            target: "apps",
            patch: {
              tags: [opsChip(`${copies} reads/s on cache`, "good")],
              status: { apps: { text: `${COPY_SECONDS} s copy`, tone: "good" }, cache: { text: `${copies} reads/s`, tone: "good" } },
              flows: [HITS],
              mark: { apps: "good" },
            },
            verdict: { text: `App copies cut it to ${copies} reads/s`, tone: "good" },
            says: "Each app keeps the hottest codes for a few seconds.",
          },
        ],
      },
    },
    {
      id: "cost",
      title: "Cost",
      patch: {
        remove: ["load", "ops"],
        tags: [
          { id: "cost-cache", text: "bigger cache", x: 358, y: 160, tone: "accent" },
          { id: "cost-db", text: `${k - BASE_PARTITIONS} more db nodes`, x: 210, y: 290, tone: "accent" },
          { id: "cost-apps", text: `${COPY_SECONDS} s copy in apps`, x: 210, y: 160, tone: "accent" },
        ],
        status: { apps: null, cache: null, db: null },
        flows: [HITS],
      },
      verdict: { text: "Name the cost before they ask", tone: "good" },
      says: `Cost: cache memory, ${k - BASE_PARTITIONS} more nodes (${BASE_PARTITIONS} to ${k}), data to move. Switch if hits stay under ${FIX_HIT}%.`,
      hint: "Tap Start over to run the probes again.",
    },
  ];
  return { width: 420, height: 330, steps };
}
