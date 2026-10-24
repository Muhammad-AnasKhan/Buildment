// Two transactions overlap on one database (chapter 7.4). A fixed script per
// story, and an outcome per isolation level taken from runs on PostgreSQL 18.6
// (2026-10-24). No randomness: the same story at the same level always ends
// the same way. Pure, so every outcome in the chapter's tables is tested.

export type StoryId = "lost-app" | "lost-sql" | "skew" | "dirty";
export type LevelId = "read-committed" | "repeatable-read" | "serializable" | "read-uncommitted";
export type Lane = "t1" | "t2";
export type Tone = "accent" | "good" | "warn" | "bad";

export const STORIES: readonly { id: StoryId; label: string }[] = [
  { id: "lost-app", label: "Lost update (app adds)" },
  { id: "lost-sql", label: "Lost update (SQL adds)" },
  { id: "skew", label: "Write skew (gates)" },
  { id: "dirty", label: "Dirty read (seats)" },
];

export const LEVELS: readonly { id: LevelId; label: string }[] = [
  { id: "read-committed", label: "Read Committed" },
  { id: "repeatable-read", label: "Repeatable Read" },
  { id: "serializable", label: "Serializable" },
  { id: "read-uncommitted", label: "Read Uncommitted (not PostgreSQL)" },
];

export const READ_UNCOMMITTED_NOTE = "PostgreSQL treats this as Read Committed; this shows a database that allows dirty reads.";

/** Read Uncommitted is offered for the dirty read story only. */
export function levelsFor(story: StoryId): readonly LevelId[] {
  return story === "dirty" ? ["read-committed", "repeatable-read", "serializable", "read-uncommitted"] : ["read-committed", "repeatable-read", "serializable"];
}

/** A level that is not offered for this story falls back to Read Committed. */
export function validLevel(story: StoryId, level: LevelId): LevelId {
  return levelsFor(story).includes(level) ? level : "read-committed";
}

export type RowStyle = "begin" | "read" | "write" | "commit" | "rollback" | "wait" | "error" | "done";

export type Row = {
  /** 1-based; the row appears at this step. */
  step: number;
  lane: Lane;
  /** Shown faint before the step, without the result. */
  ghost: string;
  text: string;
  style: RowStyle;
  /** For a write: the step at which its transaction ends, and how. */
  settles?: { step: number; how: "commit" | "rollback" };
  /** The banner line while this is the latest step, 38 characters or fewer. */
  note: string;
  /** The message under the picture from this step on. */
  say?: string;
};

export type DbChip = { step: number; text: string; pending: boolean };

export type Script = {
  story: StoryId;
  level: LevelId;
  rows: Row[];
  /** The database lane: the starting value, then the changes. */
  start: string;
  db: DbChip[];
  /** The banner at the last step, 38 characters or fewer. */
  verdict: { text: string; tone: Tone };
  /** The value at the end and, where it matters, what T2 saw. */
  final: string;
};

const ERR_UPDATE = "ERROR 40001: could not serialize access due to concurrent update.";
const ERR_DEPS = "ERROR 40001: could not serialize access due to read/write dependencies among transactions.";

const begin = (step: number, lane: Lane): Row => ({ step, lane, ghost: "BEGIN", text: "BEGIN", style: "begin", note: `${lane === "t1" ? "T1" : "T2"} begins` });

function lostUpdate(story: "lost-app" | "lost-sql", level: LevelId): Script {
  const app = story === "lost-app";
  const refused = level !== "read-committed";
  const w1 = app ? "UPDATE: balance = 150" : "UPDATE: balance + 50";
  const w2 = app ? "UPDATE: balance = 130" : "UPDATE: balance + 30";
  const rows: Row[] = [
    begin(1, "t1"),
    begin(2, "t2"),
    { step: 3, lane: "t1", ghost: "SELECT balance", text: "SELECT balance: 100", style: "read", note: "T1 reads 100" },
    { step: 4, lane: "t2", ghost: "SELECT balance", text: "SELECT balance: 100", style: "read", note: "T2 reads 100 as well" },
    { step: 5, lane: "t1", ghost: w1, text: w1, style: "write", settles: { step: 7, how: "commit" }, note: "T1 writes 150, not committed", say: "T1's change is not committed yet." },
    { step: 6, lane: "t2", ghost: w2, text: w2, style: "wait", note: "T2 waits for T1's lock", say: "T2 waits: T1 holds the lock on the row." },
    { step: 7, lane: "t1", ghost: "COMMIT", text: "COMMIT", style: "commit", note: "T1 commits: balance is 150" },
  ];
  if (refused) {
    rows.push({
      step: 8,
      lane: "t2",
      ghost: "result?",
      text: "ERROR 40001",
      style: "error",
      note: "T2 is refused: error 40001",
      say: `${ERR_UPDATE} Final balance: 150${app ? "." : ". Retrying gives 180."}`,
    });
  } else {
    rows.push({
      step: 8,
      lane: "t2",
      ghost: "result?",
      text: "UPDATE runs, COMMIT",
      style: "done",
      note: app ? "T2 overwrites with 130" : "T2 adds 30 to 150",
      say: app ? "T2 waited, then wrote 130 over T1's 150. Final balance: 130." : "T2 waited, then added 30 to the new 150. Final balance: 180.",
    });
  }
  const db: DbChip[] = [
    { step: 5, text: "150", pending: true },
    { step: 7, text: "150", pending: false },
  ];
  if (!refused) db.push({ step: 8, text: app ? "130" : "180", pending: false });
  const verdict =
    story === "lost-app"
      ? refused
        ? { text: "Refused with 40001: retry", tone: "good" as Tone }
        : { text: "Lost update: 150 was erased", tone: "bad" as Tone }
      : refused
        ? { text: "Refused with 40001: retry", tone: "good" as Tone }
        : { text: "No loss: 100 + 50 + 30 = 180", tone: "good" as Tone };
  return { story, level, rows, start: "100", db, verdict, final: refused ? "150" : app ? "130" : "180" };
}

function writeSkew(level: LevelId): Script {
  const serializable = level === "serializable";
  const rows: Row[] = [
    begin(1, "t1"),
    begin(2, "t2"),
    { step: 3, lane: "t1", ghost: "SELECT open gates", text: "SELECT open gates: 2", style: "read", note: "T1 sees 2 open: safe to close one" },
    { step: 4, lane: "t2", ghost: "SELECT open gates", text: "SELECT open gates: 2", style: "read", note: "T2 sees 2 open too" },
    { step: 5, lane: "t1", ghost: "UPDATE: north closed", text: "UPDATE: north closed", style: "write", settles: { step: 7, how: "commit" }, note: "T1 closes the north gate", say: "Each one checked first: at least one gate must stay open." },
    { step: 6, lane: "t2", ghost: "UPDATE: south closed", text: "UPDATE: south closed", style: "write", settles: { step: 8, how: serializable ? "rollback" : "commit" }, note: "T2 closes the south gate" },
    { step: 7, lane: "t1", ghost: "COMMIT", text: "COMMIT", style: "commit", note: "T1 commits: 1 gate open" },
  ];
  rows.push(
    serializable
      ? { step: 8, lane: "t2", ghost: "COMMIT", text: "ERROR 40001", style: "error", note: "T2's commit is refused", say: `${ERR_DEPS} 1 gate stays open.` }
      : { step: 8, lane: "t2", ghost: "COMMIT", text: "COMMIT", style: "commit", note: "T2 commits: 0 gates open", say: "Both commits worked, and no gate is open." }
  );
  const db: DbChip[] = [
    { step: 5, text: "north closed", pending: true },
    { step: 6, text: "south closed", pending: true },
    { step: 7, text: "1 open", pending: false },
  ];
  if (!serializable) db.push({ step: 8, text: "0 open", pending: false });
  return {
    story: "skew",
    level,
    rows,
    start: "2 open",
    db,
    verdict: serializable ? { text: "Refused: one gate stays open", tone: "good" } : { text: "Write skew: no gate stays open", tone: "bad" },
    final: serializable ? "1 open" : "0 open",
  };
}

function dirtyRead(level: LevelId): Script {
  const dirty = level === "read-uncommitted";
  const rows: Row[] = [
    begin(1, "t1"),
    { step: 2, lane: "t1", ghost: "UPDATE: left = 0", text: "UPDATE: left = 0", style: "write", settles: { step: 4, how: "rollback" }, note: "T1 sets left to 0, not committed" },
    dirty
      ? { step: 3, lane: "t2", ghost: "SELECT left", text: "SELECT left: 0", style: "read", note: "T2 reads 0: a dirty read", say: "T2 saw T1's uncommitted change." }
      : { step: 3, lane: "t2", ghost: "SELECT left", text: "SELECT left: 1", style: "read", note: "T2 reads 1: change not visible", say: "T2 cannot see T1's uncommitted change." },
    {
      step: 4,
      lane: "t1",
      ghost: "ROLLBACK",
      text: "ROLLBACK",
      style: "rollback",
      note: "T1 rolls back: left is 1 again",
      say: dirty ? "T2 read 0, but T1 rolled back, so 0 never existed." : "T2 read 1. T1 rolled back, so nothing was wrong.",
    },
  ];
  const db: DbChip[] = [
    { step: 2, text: "left 0", pending: true },
    { step: 4, text: "left 1", pending: false },
  ];
  return {
    story: "dirty",
    level,
    rows,
    start: "left 1",
    db,
    verdict: dirty ? { text: "Dirty read: saw a change that vanished", tone: "bad" } : { text: "No dirty read in PostgreSQL", tone: "good" },
    final: dirty ? "T2 read 0, left is 1" : "T2 read 1, left is 1",
  };
}

/** The script for a story at a level. A level the story does not offer is treated as Read Committed. */
export function script(story: StoryId, level: LevelId): Script {
  const l = validLevel(story, level);
  switch (story) {
    case "lost-app":
    case "lost-sql":
      return lostUpdate(story, l);
    case "skew":
      return writeSkew(l);
    case "dirty":
      return dirtyRead(l);
  }
}

export const stepCount = (s: Script) => s.rows.length;

/** The row that is the latest step reached, or null at step 0. */
export const latestRow = (s: Script, step: number): Row | null => s.rows.find((r) => r.step === step) ?? null;

/** The banner for a step: the narration, then the verdict at the end. */
export function banner(s: Script, step: number): { text: string; tone: Tone } {
  if (step <= 0) return { text: "Step forward, one statement at a time", tone: "accent" };
  if (step >= stepCount(s)) return s.verdict;
  return { text: latestRow(s, step)?.note ?? "", tone: "accent" };
}

/** The message under the picture: the latest row's, or an earlier one if this row has none. */
export function message(s: Script, step: number): string {
  for (let i = Math.min(step, stepCount(s)); i >= 1; i--) {
    const say = latestRow(s, i)?.say;
    if (say) return say;
  }
  return "";
}

export type BarLook = "ghost" | "plain" | "pending" | "settled" | "undone";

/** How a row looks at a step: faint before it, dashed while its write is uncommitted, solid after the commit, struck after a rollback. */
export function rowLook(row: Row, step: number): BarLook {
  if (step < row.step) return "ghost";
  if (row.style !== "write" || !row.settles) return "plain";
  if (step < row.settles.step) return "pending";
  return row.settles.how === "commit" ? "settled" : "undone";
}

/** The chips on the database lane at a step, with the value that stands at that moment. */
export function dbAt(s: Script, step: number): { chips: DbChip[]; value: string } {
  const chips = s.db.filter((c) => c.step <= step);
  const solid = chips.filter((c) => !c.pending);
  return { chips, value: solid.length > 0 ? solid[solid.length - 1].text : s.start };
}

/** Spoken summary of the state at a step. */
export function describe(s: Script, step: number): string {
  const shown = s.rows.filter((r) => r.step <= step).map((r) => `${r.lane === "t1" ? "T1" : "T2"} ${r.text}`);
  return `${shown.length ? shown.join(". ") + "." : "No statement has run yet."} Database: ${dbAt(s, step).value}.`;
}
