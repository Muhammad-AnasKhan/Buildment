// A history is a list of operations by clients: who, what kind, which key,
// which value, and when the request started and ended. This file holds the
// rules the history picture draws and checks (course module 11): real-time
// order, which values a read may return, and the three checkers
// (linearizable, sequential, causal). Pure TypeScript, no React.

export type HistoryOp = {
  id: string;
  client: string;
  kind: "write" | "read";
  key: string;
  /** What the write stored, or what the read returned. */
  value: number;
  start: number;
  end: number;
};

/** Every register starts with this value ("none" for the forum keys). */
export const START_VALUE = 0;

export type HistoryModel = "lin" | "seq" | "causal";

/** a is before b in real time: a finished strictly before b began. Bars that touch overlap. */
export const isBefore = (a: HistoryOp, b: HistoryOp) => a.end < b.start;

/** Neither bar is before the other. */
export const overlaps = (a: HistoryOp, b: HistoryOp) => !isBefore(a, b) && !isBefore(b, a);

/** Number of pairs of operations whose bars overlap. */
export function overlapCount(ops: readonly HistoryOp[]): number {
  let n = 0;
  for (let i = 0; i < ops.length; i++) for (let j = i + 1; j < ops.length; j++) if (overlaps(ops[i], ops[j])) n++;
  return n;
}

/**
 * The values one read may return, lowest first. F is the writes to the same
 * key that finished before the read began; O is the writes that overlap it.
 * A write in F is hidden when another write in F started after it ended. The
 * answer is the values of O, the values of the writes in F that are not
 * hidden, and the starting value only when F is empty.
 */
export function mayReturn(ops: readonly HistoryOp[], read: HistoryOp): number[] {
  const writes = ops.filter((o) => o.kind === "write" && o.key === read.key);
  const finished = writes.filter((w) => w.end < read.start);
  const concurrent = writes.filter((w) => w.end >= read.start && w.start <= read.end);
  const visible = finished.filter((w) => !finished.some((v) => v !== w && v.start > w.end));
  const values = new Set<number>(concurrent.map((w) => w.value));
  for (const w of visible) values.add(w.value);
  if (finished.length === 0) values.add(START_VALUE);
  return [...values].sort((a, b) => a - b);
}

/** The finished writes a read should have seen (not hidden by a later finished write). */
export function visibleFinishedWrites(ops: readonly HistoryOp[], read: HistoryOp): HistoryOp[] {
  const finished = ops.filter((o) => o.kind === "write" && o.key === read.key && o.end < read.start);
  return finished.filter((w) => !finished.some((v) => v !== w && v.start > w.end));
}

/**
 * Search for one order of all operations that keeps `mustPrecede` and in
 * which every read returns the last write before it on its key. Brute force
 * with a memory of failed states: the same set of placed operations and the
 * same register values fail the same way.
 */
export function legalSearch(ops: readonly HistoryOp[], mustPrecede: (a: HistoryOp, b: HistoryOp) => boolean, initial: number = START_VALUE): string[] | null {
  const n = ops.length;
  if (n > 30) throw new RangeError("legalSearch handles at most 30 operations");
  const keys = [...new Set(ops.map((o) => o.key))];
  const keyIndex = new Map(keys.map((k, i) => [k, i]));
  const blockers = ops.map((b, i) => {
    let mask = 0;
    for (let j = 0; j < n; j++) if (j !== i && mustPrecede(ops[j], b)) mask |= 1 << j;
    return mask;
  });
  const current = keys.map(() => initial);
  const failed = new Set<string>();
  const order: string[] = [];
  const full = n === 0 ? 0 : n === 31 ? -1 : (1 << n) - 1;

  const rec = (placed: number): boolean => {
    if (placed === full) return true;
    const memo = `${placed}:${current.join(",")}`;
    if (failed.has(memo)) return false;
    for (let i = 0; i < n; i++) {
      if (placed & (1 << i)) continue;
      if (blockers[i] & ~placed) continue;
      const op = ops[i];
      const k = keyIndex.get(op.key) as number;
      if (op.kind === "read" && op.value !== current[k]) continue;
      const before = current[k];
      if (op.kind === "write") current[k] = op.value;
      order.push(op.id);
      if (rec(placed | (1 << i))) return true;
      order.pop();
      current[k] = before;
    }
    failed.add(memo);
    return false;
  };
  return rec(0) ? order.slice() : null;
}

/** An order that keeps real time and the register rule, or null. */
export function findLinearization(ops: readonly HistoryOp[]): string[] | null {
  return legalSearch(ops, (a, b) => isBefore(a, b));
}

/** An order that keeps only each client's own order, or null. */
export function findSequential(ops: readonly HistoryOp[]): string[] | null {
  return legalSearch(ops, (a, b) => a.client === b.client && a.start < b.start);
}

/**
 * Causal: program order plus "a write before every read that returned its
 * value", closed under chaining. Each client needs a legal order of all the
 * writes and its own reads that keeps that relation.
 */
export function isCausal(ops: readonly HistoryOp[]): boolean {
  const n = ops.length;
  const index = new Map(ops.map((o, i) => [o.id, i]));
  const before = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && ops[i].client === ops[j].client && ops[i].start < ops[j].start) before[i][j] = true;
    }
  }
  for (let j = 0; j < n; j++) {
    if (ops[j].kind !== "read" || ops[j].value === START_VALUE) continue;
    const w = ops.findIndex((o) => o.kind === "write" && o.key === ops[j].key && o.value === ops[j].value);
    if (w >= 0) before[w][j] = true;
  }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (before[i][k] && before[k][j]) before[i][j] = true;
  const clients = [...new Set(ops.map((o) => o.client))];
  for (const c of clients) {
    const view = ops.filter((o) => o.kind === "write" || o.client === c);
    const ok = legalSearch(view, (a, b) => before[index.get(a.id) as number][index.get(b.id) as number]);
    if (!ok) return false;
  }
  return true;
}

export type Verdicts = { lin: boolean; seq: boolean; causal: boolean };

export function verdicts(ops: readonly HistoryOp[]): Verdicts {
  return { lin: findLinearization(ops) !== null, seq: findSequential(ops) !== null, causal: isCausal(ops) };
}

export function passes(ops: readonly HistoryOp[], model: HistoryModel): boolean {
  if (model === "lin") return findLinearization(ops) !== null;
  if (model === "seq") return findSequential(ops) !== null;
  return isCausal(ops);
}

/** A point inside each bar, in the order given: max(start, previous point + 1). */
export type HistoryDot = { id: string; t: number };

export function placeDots(ops: readonly HistoryOp[], order: readonly string[]): HistoryDot[] {
  const byId = new Map(ops.map((o) => [o.id, o]));
  const dots: HistoryDot[] = [];
  let previous = -Infinity;
  for (const id of order) {
    const op = byId.get(id);
    if (!op) continue;
    const t = Math.max(op.start, previous + 1);
    dots.push({ id, t });
    previous = t;
  }
  return dots;
}

/** True when every dot lies inside its own bar. */
export function dotsInside(ops: readonly HistoryOp[], dots: readonly HistoryDot[]): boolean {
  const byId = new Map(ops.map((o) => [o.id, o]));
  return dots.every((d) => {
    const op = byId.get(d.id);
    return !!op && d.t >= op.start && d.t <= op.end;
  });
}

/** The strongest model that rejects the history, or null when all three accept it. Weakest failing model first. */
export function weakestFailing(v: Verdicts): HistoryModel | null {
  if (!v.causal) return "causal";
  if (!v.seq) return "seq";
  if (!v.lin) return "lin";
  return null;
}

/**
 * The operations to ring when a model rejects the history: the smallest set
 * of reads that still fails once every write is kept. For the linearizable
 * model the finished writes those reads should have seen are added.
 */
export function conflictIds(ops: readonly HistoryOp[], model: HistoryModel): string[] {
  if (passes(ops, model)) return [];
  const reads = ops.filter((o) => o.kind === "read");
  const writes = ops.filter((o) => o.kind === "write");
  const keep = (subset: HistoryOp[]) => {
    const ids = new Set([...writes, ...subset].map((o) => o.id));
    return ops.filter((o) => ids.has(o.id));
  };
  let found: HistoryOp[] | null = null;
  for (let size = 1; size <= reads.length && !found; size++) {
    for (const subset of combinations(reads, size)) {
      if (!passes(keep(subset), model)) {
        found = subset;
        break;
      }
    }
  }
  const chosen = found ?? reads;
  const ids = chosen.map((o) => o.id);
  if (model === "lin") {
    for (const r of chosen) {
      for (const w of visibleFinishedWrites(ops, r)) if (w.value !== r.value && !ids.includes(w.id)) ids.push(w.id);
    }
  }
  return ops.filter((o) => ids.includes(o.id)).map((o) => o.id);
}

function combinations<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  const out: T[][] = [];
  const walk = (from: number, acc: T[]) => {
    if (acc.length === size) {
      out.push(acc.slice());
      return;
    }
    for (let i = from; i < items.length; i++) {
      acc.push(items[i]);
      walk(i + 1, acc);
      acc.pop();
    }
  };
  walk(0, []);
  return out;
}

/** The next value in a read's list, wrapping around. */
export function nextValue(values: readonly number[], current: number): number {
  if (values.length === 0) return current;
  const i = values.indexOf(current);
  return values[(i + 1) % values.length];
}

/** Return a copy of the history with one read's value changed. */
export function withValue(ops: readonly HistoryOp[], id: string, value: number): HistoryOp[] {
  return ops.map((o) => (o.id === id ? { ...o, value } : o));
}

/** Every combination of values for the reads that have a list, as histories. */
export function allCombinations(ops: readonly HistoryOp[], lists: Readonly<Record<string, readonly number[]>>): HistoryOp[][] {
  let out: HistoryOp[][] = [ops.slice()];
  for (const [id, values] of Object.entries(lists)) {
    out = out.flatMap((h) => values.map((v) => withValue(h, id, v)));
  }
  return out;
}
