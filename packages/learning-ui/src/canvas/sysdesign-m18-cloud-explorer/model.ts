// 18.7 beat 3: every need maps to a cloud block, and the best block is the one
// that matches the shape of the load. Six needs, eight blocks, round made-up
// prices (NOT AWS prices: exact cloud prices change often). A month is 720 hours.
// AWS names are the real service names, so the learner can find the block later.

export type BlockId = "vm" | "containers" | "function" | "object" | "block" | "db" | "queue" | "cache";
export type NeedId = "api" | "photo" | "exports" | "notes" | "emails" | "reads";
export type Fit = "best" | "ok" | "wrong";

export const HOURS_PER_MONTH = 720;
export const SECONDS_PER_MONTH = 30 * 24 * 3600;

export type Block = {
  id: BlockId;
  name: string;
  aws: string;
  youManage: string;
  providerManages: string;
  /** The illustrative unit price, in words. */
  unitPrice: string;
};

export const BLOCKS: readonly Block[] = [
  { id: "vm", name: "Virtual machine", aws: "EC2", youManage: "the OS, patches, scaling, your app", providerManages: "the hardware and the network", unitPrice: "$0.04 an hour" },
  { id: "containers", name: "Containers", aws: "ECS or EKS", youManage: "your images and how many run", providerManages: "scheduling, restarts, the control plane", unitPrice: "$0.05 an hour per container" },
  { id: "function", name: "Function", aws: "Lambda", youManage: "your code only", providerManages: "servers, scaling and patches", unitPrice: "$0.20 per million requests + time" },
  { id: "object", name: "Object storage", aws: "S3", youManage: "which files and who may read them", providerManages: "disks, copies and growth", unitPrice: "$0.02 per GB-month" },
  { id: "block", name: "Block storage", aws: "EBS", youManage: "the size, file system and backups", providerManages: "the disk hardware", unitPrice: "$0.10 per GB-month" },
  { id: "db", name: "Managed database", aws: "RDS", youManage: "tables, queries and indexes", providerManages: "backups, patches and failover", unitPrice: "$0.10 an hour" },
  { id: "queue", name: "Queue", aws: "SQS", youManage: "the messages and the workers", providerManages: "storage, delivery and scaling", unitPrice: "$0.40 per million requests" },
  { id: "cache", name: "Cache", aws: "ElastiCache", youManage: "what to cache and when it expires", providerManages: "servers, patches and copies", unitPrice: "$0.05 an hour" },
];

export type Need = {
  id: NeedId;
  name: string;
  /** The shape of the load, in a few words. */
  load: string;
  /** The same, as a sentence for the panel. */
  detail: string;
  best: BlockId;
  ok: BlockId;
};

export const NEEDS: readonly Need[] = [
  { id: "api", name: "Serve the API", load: "100 requests a second", detail: "Steady load: 100 requests a second, all day.", best: "containers", ok: "vm" },
  { id: "photo", name: "Resize a photo", load: "10 a day", detail: "Rare load: 10 photos a day, about 2 seconds each.", best: "function", ok: "containers" },
  { id: "exports", name: "Keep note exports", load: "2 TB of files", detail: "Big files kept for years: 2 TB, 2,000 GB.", best: "object", ok: "block" },
  { id: "notes", name: "Store notes", load: "tables and queries", detail: "Relational data with queries and transactions.", best: "db", ok: "vm" },
  { id: "emails", name: "Queue order emails", load: "jobs for a worker", detail: "Jobs that wait until a worker takes them, then retry.", best: "queue", ok: "db" },
  { id: "reads", name: "Speed up reads", load: "the same data, often", detail: "The same data is read again and again.", best: "cache", ok: "db" },
];

type Reasons = { best: string; ok: string; wrong: Record<string, string> };

/** One line of reason for every pick, 56 characters or fewer. */
export const REASONS: Record<NeedId, Reasons> = {
  api: {
    best: "Fits steady load: restarts and scaling are built in",
    ok: "Works, but you patch the OS and handle scaling",
    wrong: {
      function: "Per-request billing costs more at steady load",
      object: "Object storage holds files; it does not run code",
      block: "A disk holds data; it does not run code",
      db: "A database stores data; it does not run your API",
      queue: "A queue passes messages; it does not answer requests",
      cache: "A cache keeps copies; it does not run your logic",
    },
  },
  photo: {
    best: "Pay only for the 20 seconds of work each day",
    ok: "Works, but you build an image and a trigger",
    wrong: {
      vm: "Paid all day for 20 seconds of work",
      object: "Object storage keeps the photo; it cannot resize it",
      block: "A disk keeps data; it cannot resize a photo",
      db: "A database stores rows; it does not process images",
      queue: "A queue holds the job; something else must resize",
      cache: "A cache keeps copies; it does not process images",
    },
  },
  exports: {
    best: "Cheap per GB, grows by itself, any server can read it",
    ok: "Works, but costs more per GB and fits one server",
    wrong: {
      cache: "Loses data and costs more per GB",
      vm: "A server's own disk is lost with the server",
      containers: "A container's files vanish when it restarts",
      function: "A function keeps nothing after it ends",
      db: "A database is for rows, not big files",
      queue: "A queue holds messages briefly, not files",
    },
  },
  notes: {
    best: "Backups, patches and failover are done for you",
    ok: "Works, but you run backups, patches and failover",
    wrong: {
      object: "Object storage: no queries or transactions",
      containers: "Data is lost when a container restarts",
      function: "A function keeps no data between calls",
      block: "A disk holds bytes: no queries or transactions",
      queue: "A queue passes messages; it is not a record store",
      cache: "A cache can lose data; it is not the truth",
    },
  },
  emails: {
    best: "Holds each job until a worker takes it",
    ok: "Works, but you build the waiting and retry rules",
    wrong: {
      cache: "A restart loses the jobs",
      vm: "A server can run a worker but does not hold the jobs",
      containers: "Containers can run workers but do not hold jobs",
      function: "A function can send mail, but nothing holds the jobs",
      object: "Files have no queue order and no retry",
      block: "A disk has no queue order and no retry",
    },
  },
  reads: {
    best: "Hot copies in memory: reads are fast",
    ok: "Works, but this is the slow path you want to skip",
    wrong: {
      queue: "A queue passes work; it does not answer reads",
      vm: "A server alone does not cache anything",
      containers: "A container alone does not cache anything",
      function: "A function has no memory between calls",
      object: "Slower than the database you want to relieve",
      block: "A disk is slower than memory",
    },
  },
};

export function fitOf(need: NeedId, block: BlockId): Fit {
  const n = NEEDS.find((x) => x.id === need);
  if (!n) return "wrong";
  return n.best === block ? "best" : n.ok === block ? "ok" : "wrong";
}

export function reasonOf(need: NeedId, block: BlockId): string {
  const r = REASONS[need];
  const fit = fitOf(need, block);
  return fit === "best" ? r.best : fit === "ok" ? r.ok : (r.wrong[block] ?? "Wrong shape for this need");
}

export type Price = { usd: number; units: string };

const PHOTOS_PER_MONTH = 300;
const API_REQUESTS = 100 * SECONDS_PER_MONTH;
/** A function bills a request fee plus time: seconds of 1 GB at $0.0000167. */
const fn = (requests: number, seconds: number) => (requests / 1e6) * 0.2 + requests * seconds * 1 * 0.0000167;

/** The illustrative monthly price for a pick, or null when the block cannot do the job at all. */
export function priceOf(need: NeedId, block: BlockId): Price | null {
  switch (`${need}:${block}`) {
    case "api:vm":
      return { usd: 2 * 0.04 * HOURS_PER_MONTH, units: "2 machines" };
    case "api:containers":
      return { usd: 2 * 0.05 * HOURS_PER_MONTH, units: "2 containers" };
    case "api:function":
      return { usd: fn(API_REQUESTS, 0.1), units: "259 million requests of 100 ms" };
    case "photo:function":
      return { usd: fn(PHOTOS_PER_MONTH, 2), units: "300 photos of 2 seconds" };
    case "photo:containers":
      return { usd: ((PHOTOS_PER_MONTH * 1) / 60) * 0.05, units: "300 one-minute runs" };
    case "photo:vm":
      return { usd: 0.04 * HOURS_PER_MONTH, units: "1 machine, always on" };
    case "exports:object":
      return { usd: 2000 * 0.02, units: "2,000 GB" };
    case "exports:block":
      return { usd: 2000 * 0.1, units: "2,000 GB" };
    case "notes:db":
      return { usd: 0.1 * HOURS_PER_MONTH, units: "1 database" };
    case "notes:vm":
      return { usd: 0.04 * HOURS_PER_MONTH, units: "1 machine" };
    case "emails:queue":
      return { usd: (100000 / 1e6) * 0.4, units: "100,000 messages" };
    case "emails:db":
      return { usd: 0.1 * HOURS_PER_MONTH, units: "1 database" };
    case "emails:cache":
      return { usd: 0.05 * HOURS_PER_MONTH, units: "1 cache node" };
    case "reads:cache":
      return { usd: 0.05 * HOURS_PER_MONTH, units: "1 cache node" };
    case "reads:db":
      return { usd: 0.1 * HOURS_PER_MONTH, units: "1 more database" };
    default:
      return null;
  }
}

/** Whole dollars from $1 up, two decimals below: $485, $29, $0.25, $0.01. */
export function formatUsd(usd: number): string {
  if (usd >= 1) return `$${Math.round(usd).toLocaleString("en-US")}`;
  return `$${usd.toFixed(2)}`;
}

export const FIT_LABEL: Record<Fit, string> = { best: "Best fit", ok: "Works", wrong: "Wrong shape" };

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(fit: Fit | null): Verdict {
  if (fit === null) return { text: "Now tap a block for this need", tone: "accent" };
  if (fit === "best") return { text: "Best fit for this load", tone: "good" };
  if (fit === "ok") return { text: "Works, but costs more or needs work", tone: "warn" };
  return { text: "Wrong shape for this need", tone: "bad" };
}
