// The database scaling path as arithmetic (chapter 7.6). Every number is made
// up, to show the reasoning and not a benchmark. Traffic is 90% reads and 10%
// writes. One machine handles 4,000 units of work a second. A read costs 3
// units without an index and 1 with one, a write costs 5. A cache answers 90%
// of the reads. Replicas take all the database reads, partitions split the
// writes. Pure, so the worked values in the chapter are tested.

export const CAPACITY = 4000;
export const BIG_CAPACITY = 8000;
export const READ_SHARE = 0.9;
export const READ_COST_SCAN = 3;
export const READ_COST_INDEX = 1;
export const WRITE_COST = 5;
export const CACHE_HIT = 0.9;
/** Scenario "add the search box": a tenth of the reads are word searches. */
export const SEARCH_SHARE = 0.1;
export const SEARCH_COST = 20;
export const SEARCH_STORE_CAPACITY = 5000;

export const TRAFFIC_LADDER = [500, 1000, 3000, 6000, 12000, 25000, 50000] as const;
export const DEFAULT_TRAFFIC = 3000;
export const GOAL_TRAFFIC = 12000;
export const PARTITION_LADDER = [1, 2, 4, 8] as const;
export const MAX_REPLICAS = 3;

export type Config = {
  traffic: number;
  index: boolean;
  cache: boolean;
  replicas: number;
  partitions: number;
  bigger: boolean;
  scenario: boolean;
  searchIndex: boolean;
};

export const DEFAULT_CONFIG: Config = { traffic: DEFAULT_TRAFFIC, index: false, cache: false, replicas: 0, partitions: 1, bigger: false, scenario: false, searchIndex: false };

export type Tone = "good" | "warn" | "bad";
export type Status = { pct: number; word: "fine" | "busy" | "full"; tone: Tone };

export type Load = {
  /** Requests a second. */
  writes: number;
  reads: number;
  searches: number;
  /** Reads that reach the database after the cache, not counting searches. */
  dbReads: number;
  /** Searches that reach the database (none with a search index). */
  dbSearches: number;
  /** Units a second, in total. */
  writeUnits: number;
  readUnits: number;
  searchUnits: number;
  capacity: number;
  /** Units a second on each primary, and its share of the capacity (1 = full). */
  primaryUnits: number;
  primaryUtil: number;
  /** Each replica, or null with no replicas. */
  replicaUnits: number | null;
  replicaUtil: number | null;
  /** The search store, or null when the scenario or its index is off. */
  searchStoreUtil: number | null;
  /** Machines and the cache, 1 per hour each (a bigger machine counts 2). */
  cost: number;
};

/** Rounds away floating point noise, so 6,000 units is 6,000 and not 5,999.999999999999. */
const clean = (x: number) => Math.round(x * 1e6) / 1e6;

export function load(cfg: Config): Load {
  const R = cfg.traffic;
  const reads = clean((R * Math.round(READ_SHARE * 100)) / 100);
  const writes = clean(R - reads);
  const searches = cfg.scenario ? clean((reads * Math.round(SEARCH_SHARE * 100)) / 100) : 0;
  const plain = clean(reads - searches);
  const readCost = cfg.index ? READ_COST_INDEX : READ_COST_SCAN;
  const dbReads = cfg.cache ? clean((plain * (100 - Math.round(CACHE_HIT * 100))) / 100) : plain;
  const searchOnIndex = cfg.scenario && cfg.searchIndex;
  const dbSearches = searchOnIndex ? 0 : searches;
  const writeUnits = clean(writes * WRITE_COST);
  const searchUnits = clean(dbSearches * SEARCH_COST);
  const readUnits = clean(dbReads * readCost + searchUnits);
  const capacity = cfg.bigger ? BIG_CAPACITY : CAPACITY;
  const p = Math.max(1, cfg.partitions);
  const n = Math.max(0, cfg.replicas);
  const primaryUnits = clean((writeUnits + (n === 0 ? readUnits : 0)) / p);
  const replicaUnits = n > 0 ? clean(readUnits / n) : null;
  const machines = (p + n) * (cfg.bigger ? 2 : 1);
  return {
    writes,
    reads,
    searches,
    dbReads,
    dbSearches,
    writeUnits,
    readUnits,
    searchUnits,
    capacity,
    primaryUnits,
    primaryUtil: primaryUnits / capacity,
    replicaUnits,
    replicaUtil: replicaUnits === null ? null : replicaUnits / capacity,
    searchStoreUtil: cfg.scenario && cfg.searchIndex ? searches / SEARCH_STORE_CAPACITY : null,
    cost: machines + (cfg.cache ? 1 : 0) + (cfg.scenario && cfg.searchIndex ? 1 : 0),
  };
}

/** The pill on a card: percent of capacity and a word. Under 70% fine, up to 100% busy, over 100% full. */
export function status(util: number): Status {
  const pct = Math.round(util * 100);
  if (util > 1) return { pct, word: "full", tone: "bad" };
  if (util >= 0.7) return { pct, word: "busy", tone: "warn" };
  return { pct, word: "fine", tone: "good" };
}

export const statusText = (s: Status) => `${s.pct}% ${s.word}`;

export type Verdict = { text: string; tone: Tone };

/** The banner: the worst part, and the step that takes load off it. 38 characters or fewer. */
export function verdict(cfg: Config, l: Load): Verdict {
  const parts: { kind: "primary" | "replica" | "search"; util: number }[] = [{ kind: "primary", util: l.primaryUtil }];
  if (l.replicaUtil !== null) parts.push({ kind: "replica", util: l.replicaUtil });
  if (l.searchStoreUtil !== null) parts.push({ kind: "search", util: l.searchStoreUtil });
  const worst = parts.reduce((a, b) => (b.util > a.util ? b : a));
  if (worst.util <= 1) return { text: "Every part has room", tone: "good" };
  const N = Math.round(worst.util * 100);
  const bad = (text: string): Verdict => ({ text, tone: "bad" });
  const p = Math.max(1, cfg.partitions);
  const searchOnDb = cfg.scenario && !cfg.searchIndex;

  if (worst.kind === "search") return bad(`Search store ${N}%: too many searches`);

  if (worst.kind === "primary") {
    if (cfg.replicas === 0) {
      if (searchOnDb && l.searchUnits / p > l.capacity) return bad("Searches overload: add a search index");
      const readUnitsEach = l.readUnits / p;
      const writeUnitsEach = l.writeUnits / p;
      if (readUnitsEach > writeUnitsEach) {
        if (!cfg.index) return bad(`Primary ${N}%: add an index`);
        if (!cfg.cache) return bad(`Primary ${N}%: add a cache`);
        return bad(`Reads ${N}%: add a read replica`);
      }
      if (writeUnitsEach >= l.capacity) return bad(`Writes ${N}%: partition the data`);
      return bad(`Reads ${N}%: add a read replica`);
    }
    // With replicas the primary carries only writes.
    return bad(`Writes ${N}%: partition the data`);
  }

  // A replica is the worst part.
  if (searchOnDb && l.searchUnits / cfg.replicas > l.capacity) return bad("Searches overload: add a search index");
  if (!cfg.index) return bad(`Replicas ${N}%: add an index`);
  if (!cfg.cache) return bad(`Replicas ${N}%: add a cache`);
  if (cfg.replicas < MAX_REPLICAS) return bad(`Reads ${N}%: add a read replica`);
  if (!cfg.bigger) return bad(`Replicas ${N}%: use bigger machines`);
  return bad(`Replicas ${N}%: too many reads`);
}

/** The next value when a step is tapped. Replicas cycle 0 to 3, partitions 1, 2, 4, 8. */
export const nextReplicas = (n: number) => (n >= MAX_REPLICAS ? 0 : n + 1);
export const nextPartitions = (p: number) => PARTITION_LADDER[(PARTITION_LADDER.indexOf(p as (typeof PARTITION_LADDER)[number]) + 1) % PARTITION_LADDER.length];

export const trafficFromFraction = (f: number): number => TRAFFIC_LADDER[Math.round(Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0)) * (TRAFFIC_LADDER.length - 1))];
export const trafficToFraction = (t: number): number => Math.max(0, TRAFFIC_LADDER.indexOf(t as (typeof TRAFFIC_LADDER)[number])) / (TRAFFIC_LADDER.length - 1);

export function withCommas(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** How many steps are on, for the learner who tries to reach the goal with the fewest. */
export function stepsOn(cfg: Config): number {
  return (cfg.index ? 1 : 0) + (cfg.cache ? 1 : 0) + cfg.replicas + (cfg.partitions > 1 ? Math.log2(cfg.partitions) : 0) + (cfg.bigger ? 1 : 0) + (cfg.scenario && cfg.searchIndex ? 1 : 0);
}

export function describeConfig(cfg: Config, l: Load, v: Verdict): string {
  const parts = [
    `${withCommas(cfg.traffic)} requests a second.`,
    `Primary${cfg.partitions > 1 ? ` x${cfg.partitions}` : ""}: ${statusText(status(l.primaryUtil))}.`,
    l.replicaUtil !== null ? `Replicas x${cfg.replicas}: ${statusText(status(l.replicaUtil))} each.` : "No replicas.",
    l.searchStoreUtil !== null ? `Search store: ${statusText(status(l.searchStoreUtil))}.` : "",
    `Steps on: ${[cfg.index && "index", cfg.cache && "cache", cfg.bigger && "bigger machine", cfg.scenario && cfg.searchIndex && "search index"].filter(Boolean).join(", ") || "none"}.`,
    `Cost ${l.cost} per hour.`,
    `${v.text}.`,
  ];
  return parts.filter(Boolean).join(" ");
}
