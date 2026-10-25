import type { DesignFlow, DesignPatch, DesignSpec, DesignStep } from "./design-stepper";

// 5.3 "Pick a pattern, then crash it": five cache patterns, each told as the
// same four steps (read p42, write p42 = 899, crash the cache node, read p42
// again). Each pattern becomes a DesignSpec for the design-stepper picture, so
// the cards, links, request dots and verdict banner are the house ones. Three
// status chips are the point of the picture: what the cache copy is, whether
// the database has the write, and how many reads reach the database after
// the crash. Write-back and read-through/write-around are taught as
// trade-offs; the dossier has primary sources for cache-aside and
// write-through only (S24, S26).

export type PatternId = "aside" | "read-through" | "write-through" | "write-back" | "write-around";

export const PATTERNS: readonly { id: PatternId; label: string }[] = [
  { id: "aside", label: "Cache-aside" },
  { id: "read-through", label: "Read-through" },
  { id: "write-through", label: "Write-through" },
  { id: "write-back", label: "Write-back" },
  { id: "write-around", label: "Write-around" },
];

export const STEP_TITLES = ["Read", "Write", "Crash", "Again"] as const;

const APP = "app";
const CACHE = "cache";
const DB = "db";

/** Who loads the cache on a miss: the app itself (3 trips) or the cache layer (the cache asks the database). */
const loadsByApp = (p: PatternId) => p === "aside" || p === "write-around";

const missFlow = (p: PatternId, label: string): DesignFlow =>
  loadsByApp(p)
    ? { path: [APP, CACHE, APP, DB, APP, CACHE], label }
    : { path: [APP, CACHE, DB, CACHE, APP], label };

const hitFlow = (label: string): DesignFlow => ({ path: [APP, CACHE, APP], label });

type Copy = "none" | "fresh 999" | "fresh 899" | "stale 999" | "old 999";
type Written = "n/a" | "yes" | "not yet" | "lost";

const COPY_TEXT: Record<Copy, string> = {
  none: "cache copy: none",
  "fresh 999": "cache copy: 999, fresh",
  "fresh 899": "cache copy: 899, fresh",
  "stale 999": "cache copy: 999, stale",
  "old 999": "cache copy: 999, old",
};
const COPY_TONE = { none: "accent", "fresh 999": "good", "fresh 899": "good", "stale 999": "warn", "old 999": "bad" } as const;
const WRITTEN_TEXT: Record<Written, string> = {
  "n/a": "database has write: n/a",
  yes: "database has write: yes",
  "not yet": "database has write: not yet",
  lost: "database has write: lost",
};
const WRITTEN_TONE = { "n/a": "accent", yes: "good", "not yet": "warn", lost: "bad" } as const;

const TAG_Y = [266, 292, 318] as const;

/** The three chips and the two card pills for one moment. */
function state(copy: Copy, written: Written, reads: string, cacheCard: string, dbCard: string): DesignPatch {
  return {
    tags: [
      { id: "t-copy", text: COPY_TEXT[copy], x: 210, y: TAG_Y[0], tone: COPY_TONE[copy] },
      { id: "t-write", text: WRITTEN_TEXT[written], x: 210, y: TAG_Y[1], tone: WRITTEN_TONE[written] },
      { id: "t-reads", text: `db reads after crash: ${reads}`, x: 210, y: TAG_Y[2], tone: "accent" },
    ],
    status: {
      [CACHE]: { text: cacheCard, tone: copy === "none" ? undefined : COPY_TONE[copy] },
      [DB]: { text: dbCard, tone: written === "lost" ? "bad" : written === "not yet" ? "warn" : undefined },
    },
  };
}

const BASE: DesignPatch = {
  actors: [
    { id: CACHE, label: "Cache", kind: "cache", x: 210, y: 84 },
    { id: APP, label: "App", kind: "server", x: 70, y: 190 },
    { id: DB, label: "Database", kind: "database", x: 350, y: 190 },
  ],
  links: [
    { id: "l-app-cache", from: APP, to: CACHE },
    { id: "l-cache-db", from: CACHE, to: DB },
    { id: "l-app-db", from: APP, to: DB },
  ],
};

export function patternSpec(p: PatternId): DesignSpec {
  const throughRead = !loadsByApp(p);

  // Step 1: read p42. The first read misses and fills the cache; the next one hits.
  const read: DesignStep = {
    id: "read",
    title: STEP_TITLES[0],
    patch: { ...BASE, ...state("fresh 999", "n/a", "n/a", "p42 = 999", "p42 = 999"), flows: [missFlow(p, "read p42")] },
    verdict: { text: throughRead ? "Miss: the cache loads it" : "Miss: 3 trips, then cached", tone: "warn" },
    says: throughRead ? "The copy was missing, so the cache asked the database and kept the answer." : "The copy was missing, so the app read the database and stored the answer.",
    hint: "Tap the App card to read p42 again.",
    action: {
      phases: [
        { button: "Read p42 again", target: APP },
        {
          button: "Show the miss again",
          target: APP,
          patch: { flows: [hitFlow("read p42")] },
          verdict: { text: "Hit: 1 trip", tone: "good" },
          says: "The copy answers. The database is not touched.",
        },
      ],
    },
  };

  // Step 2: write p42 = 899.
  const writes: Record<PatternId, { patch: DesignPatch; verdict: string; tone: "good" | "warn"; says: string }> = {
    aside: {
      patch: { ...state("none", "yes", "n/a", "empty", "p42 = 899"), flows: [{ path: [APP, DB, APP, CACHE], label: "write 899" }] },
      verdict: "Database first, then drop the copy",
      tone: "good",
      says: "The app writes the database, then deletes the cache copy so the next read loads 899.",
    },
    "read-through": {
      patch: { ...state("none", "yes", "n/a", "empty", "p42 = 899"), flows: [{ path: [APP, DB, APP, CACHE], label: "write 899" }] },
      verdict: "Database first, then drop the copy",
      tone: "good",
      says: "Read-through only changes how reads fill the cache. Here the write goes to the database and the copy is dropped.",
    },
    "write-through": {
      patch: { ...state("fresh 899", "yes", "n/a", "p42 = 899", "p42 = 899"), flows: [{ path: [APP, CACHE, DB, CACHE, APP], label: "write 899" }] },
      verdict: "Cache and database, then ok",
      tone: "good",
      says: "The write goes through the cache to the database. The app gets ok only after both have it.",
    },
    "write-back": {
      patch: { ...state("fresh 899", "not yet", "n/a", "p42 = 899", "p42 = 999"), flows: [{ path: [APP, CACHE, APP], label: "write 899" }] },
      verdict: "Fast ok, database not updated yet",
      tone: "warn",
      says: "The cache says ok at once and will write the database later. For now only the cache has 899.",
    },
    "write-around": {
      patch: { ...state("stale 999", "yes", "n/a", "p42 = 999", "p42 = 899"), flows: [{ path: [APP, DB, APP], label: "write 899" }] },
      verdict: "Database updated, old copy stays",
      tone: "warn",
      says: "The write skips the cache. The old copy 999 stays until it expires or is evicted.",
    },
  };
  const w = writes[p];
  const write: DesignStep = {
    id: "write",
    title: STEP_TITLES[1],
    patch: w.patch,
    verdict: { text: w.verdict, tone: w.tone },
    says: w.says,
    hint: "Press Next to crash the cache node.",
  };

  // Step 3: the cache node crashes. Whatever only lived in the cache is gone.
  const lost = p === "write-back";
  const crash: DesignStep = {
    id: "crash",
    title: STEP_TITLES[2],
    patch: {
      ...state("none", lost ? "lost" : "yes", "0", "gone", lost ? "p42 = 999" : "p42 = 899"),
      broken: [CACHE],
      flows: [{ path: [APP, CACHE], label: "read p42" }],
    },
    verdict: lost
      ? { text: "The write was only in the cache", tone: "bad" }
      : { text: "Copy gone, database has 899", tone: p === "write-through" ? "warn" : "good" },
    says: lost
      ? "The node restarted before it flushed. The confirmed write 899 is gone and the database still says 999."
      : "The node is gone with its copies, but the database already has 899. Reads fail over to the database.",
    hint: "Press Next to read p42 again.",
  };

  // Step 4: a new, empty node. The next read misses and loads from the database.
  const finalVerdict = lost
    ? { text: "Crash lost a confirmed write", tone: "bad" as const }
    : p === "write-through"
      ? { text: "Cold cache, but no write lost", tone: "warn" as const }
      : { text: "Crash cost speed, not data", tone: "good" as const };
  const after = lost ? state("old 999", "lost", "1", "p42 = 999", "p42 = 999") : state("fresh 899", "yes", "1", "p42 = 899", "p42 = 899");
  const reread: DesignStep = {
    id: "reread",
    title: STEP_TITLES[3],
    patch: { ...after, fixed: [CACHE], flows: [missFlow(p, "read p42")] },
    verdict: finalVerdict,
    says: lost
      ? "A fresh node is empty, so the read goes to the database and loads the old price 999. Shoppers see it as if nothing happened."
      : "A fresh node is empty, so the first read misses and goes to the database. One database read, then the copy is back.",
    hint: "Tap the App card to read once more.",
    action: {
      phases: [
        { button: "Read once more", target: APP },
        {
          button: "Show the first read again",
          target: APP,
          patch: { flows: [hitFlow("read p42")] },
          says: "The copy is back, so this read is a hit. The count stays at 1.",
        },
      ],
    },
  };

  return { width: 420, height: 338, steps: [read, write, crash, reread] };
}
