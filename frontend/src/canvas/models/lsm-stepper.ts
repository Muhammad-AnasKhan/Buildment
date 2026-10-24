// A toy LSM tree you step through (chapter 7.3). A put goes to the log and the
// memory table; a full memory table is flushed into a new sorted file; a merge
// rewrites every file into one. Two counters follow from the rules: how many
// files a read must open, and how many writes the disk did for each put.
// All sizes are made up. Pure, so the counters are tested without a browser.

export const MEMTABLE_LIMIT = 4;
export const PROBE_KEY = "seat-01";

export type LsmAction = { kind: "put"; key: string; sold: boolean } | { kind: "merge" };

const seat = (n: number) => `seat-${String(n).padStart(2, "0")}`;
const put = (n: number, sold = false): LsmAction => ({ kind: "put", key: seat(n), sold });

/** The 18-step script: 12 puts (flushes after 4, 8 and 12), two overwrites, a merge, two more puts, a merge. */
export const SCRIPT: readonly LsmAction[] = [
  ...Array.from({ length: 12 }, (_, i) => put(i + 1)),
  put(3, true),
  put(7, true),
  { kind: "merge" },
  put(13),
  put(14),
  { kind: "merge" },
];

export const STEP_COUNT = SCRIPT.length;

export type MemoryKey = { key: string; sold: boolean };
export type LsmFile = { id: number; keys: string[]; sold: string[] };

export type LsmState = {
  step: number;
  /** The action of this step, or null before the first. */
  action: LsmAction | null;
  memory: MemoryKey[];
  /** Newest first. */
  files: LsmFile[];
  puts: number;
  logWrites: number;
  flushWrites: number;
  mergeWrites: number;
  /** Merges done so far. */
  merges: number;
  /** This step flushed the memory table into the newest file. */
  flushed: boolean;
  /** This step merged files: how many were merged and how many writes it took. */
  merged: { files: number; writes: number } | null;
  nextFileId: number;
};

const START: LsmState = {
  step: 0,
  action: null,
  memory: [],
  files: [],
  puts: 0,
  logWrites: 0,
  flushWrites: 0,
  mergeWrites: 0,
  merges: 0,
  flushed: false,
  merged: null,
  nextFileId: 1,
};

function apply(s: LsmState, action: LsmAction, step: number): LsmState {
  if (action.kind === "put") {
    const memory = s.memory.some((m) => m.key === action.key)
      ? s.memory.map((m) => (m.key === action.key ? { key: m.key, sold: action.sold } : m))
      : [...s.memory, { key: action.key, sold: action.sold }];
    const base = { ...s, step, action, puts: s.puts + 1, logWrites: s.logWrites + 1, flushed: false, merged: null };
    if (memory.length < MEMTABLE_LIMIT) return { ...base, memory };
    const sorted = [...memory].sort((a, b) => a.key.localeCompare(b.key));
    const file: LsmFile = { id: s.nextFileId, keys: sorted.map((m) => m.key), sold: sorted.filter((m) => m.sold).map((m) => m.key) };
    return { ...base, memory: [], files: [file, ...s.files], flushWrites: s.flushWrites + file.keys.length, flushed: true, nextFileId: s.nextFileId + 1 };
  }
  // Merge: newest value wins for each key, one write per distinct key.
  const newest = new Map<string, boolean>();
  for (const f of [...s.files].reverse()) for (const k of f.keys) newest.set(k, f.sold.includes(k));
  const keys = [...newest.keys()].sort();
  const file: LsmFile = { id: s.nextFileId, keys, sold: keys.filter((k) => newest.get(k)) };
  return {
    ...s,
    step,
    action,
    files: [file],
    mergeWrites: s.mergeWrites + keys.length,
    merges: s.merges + 1,
    flushed: false,
    merged: { files: s.files.length, writes: keys.length },
    nextFileId: s.nextFileId + 1,
  };
}

/** The state after `step` presses of Next (0 to 18). Replays the script, so any step can be asked for. */
export function lsmState(step: number): LsmState {
  const n = Math.max(0, Math.min(STEP_COUNT, Math.trunc(step)));
  let s = START;
  for (let i = 0; i < n; i++) s = apply(s, SCRIPT[i], i + 1);
  return s;
}

export const diskWrites = (s: LsmState) => s.logWrites + s.flushWrites + s.mergeWrites;

/** Disk writes for each put. 0 before the first put. */
export const writeAmp = (s: LsmState) => (s.puts === 0 ? 0 : diskWrites(s) / s.puts);

export const formatAmp = (s: LsmState) => (s.puts === 0 ? "-" : writeAmp(s).toFixed(2));

export type ProbeResult = {
  inMemory: boolean;
  /** Files opened, newest first, including the one that holds the key. */
  opened: number[];
  /** With Bloom filters: files that were passed over without opening. */
  skipped: number[];
  /** The file that holds the key, or null if it is in memory or absent. */
  foundIn: number | null;
  /** Files opened for this read. */
  checks: number;
};

/** A read for `key`: memory first, then files newest to oldest. With Bloom filters, a file is opened only if it holds the key. */
export function readProbe(s: LsmState, key: string, bloom: boolean): ProbeResult {
  if (s.memory.some((m) => m.key === key)) return { inMemory: true, opened: [], skipped: [], foundIn: null, checks: 0 };
  const opened: number[] = [];
  const skipped: number[] = [];
  let foundIn: number | null = null;
  for (const f of s.files) {
    const holds = f.keys.includes(key);
    if (bloom && !holds) {
      skipped.push(f.id);
      continue;
    }
    opened.push(f.id);
    if (holds) {
      foundIn = f.id;
      break;
    }
  }
  return { inMemory: false, opened, skipped, foundIn, checks: opened.length };
}

export const VERDICT_MAX = 38;

export type LsmVerdict = { text: string; tone: "accent" | "good" | "warn" | "bad" };

/** The one line in the banner for this step. Each text is 38 characters or fewer. */
export function lsmVerdict(s: LsmState, bloom: boolean): LsmVerdict {
  const a = s.action;
  if (!a) return { text: "Press Next to put the first key in", tone: "accent" };
  if (a.kind === "merge") {
    if (s.merges === 1) return { text: `Merged: ${s.files.length} file, ${s.merged?.writes ?? 0} more writes`, tone: "good" };
    return { text: `Fewer files, but ${formatAmp(s)} writes per put`, tone: "warn" };
  }
  const f = s.files.length;
  if (s.flushed && f === 1) return { text: "Table full: flushed to a new file", tone: "accent" };
  if (s.flushed) {
    const p = readProbe(s, PROBE_KEY, bloom);
    if (bloom) return { text: `Bloom filter: opens ${p.checks} file${p.checks === 1 ? "" : "s"} of ${f}`, tone: "good" };
    return { text: f === 2 ? "2 files: a read opens both" : `${f} files: a read opens all of them`, tone: f >= 3 ? "warn" : "accent" };
  }
  if (a.sold) return { text: "Overwrite: old copy stays in a file", tone: "accent" };
  return { text: `Put ${a.key}: log, then memory`, tone: "accent" };
}

/** What the step did, in plain words, for the live region. */
export function describeStep(s: LsmState): string {
  const a = s.action;
  if (!a) return "Nothing has happened yet.";
  if (a.kind === "merge") return `Merged ${s.merged?.files ?? 0} files into one, rewriting ${s.merged?.writes ?? 0} keys.`;
  const base = a.sold ? `Put ${a.key} again with a new value.` : `Put ${a.key}.`;
  return s.flushed ? `${base} The memory table was full, so it was flushed to a new file.` : base;
}

/** The key range of a file as short text, for example "seat-01 to 12". Keys are sorted. */
export function fileRange(f: LsmFile): string {
  const first = f.keys[0];
  const last = f.keys[f.keys.length - 1];
  return first === undefined ? "empty" : `${first} to ${last.replace("seat-", "")}`;
}
