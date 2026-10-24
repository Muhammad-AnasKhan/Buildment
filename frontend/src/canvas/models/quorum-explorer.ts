// 12.3 beat 2: N copies, a write waits for W of them and a read for R.
// Pure model, no React. Replica 1 is the fastest; the picture rings the W
// fastest up replicas for the write and the R slowest up replicas for the
// read, so the two groups are as far apart as they can be.

/** Response time of each replica, fastest first. Course numbers, in ms. */
export const RESPONSE_MS = [10, 15, 25, 40, 70, 120, 200, 300, 500] as const;
export const N_LADDER = [3, 5, 7, 9] as const;
export const DEFAULTS = { n: 5, w: 3, r: 3 } as const;

export const majority = (n: number) => Math.floor(n / 2) + 1;

/** Keep N on the ladder and W and R inside 1 to N. */
export function clampQuorum(n: number, w: number, r: number) {
  const nn = (N_LADDER as readonly number[]).includes(n) ? n : DEFAULTS.n;
  const fit = (v: number) => Math.max(1, Math.min(nn, Math.round(Number.isFinite(v) ? v : 1)));
  return { n: nn, w: fit(w), r: fit(r) };
}

export type QuorumVerdict = { text: string; tone: "good" | "warn" | "bad" };

export type QuorumState = {
  n: number;
  w: number;
  r: number;
  /** Replica indexes (0 based, fastest first) that are up. */
  up: number[];
  down: number[];
  /** Empty when fewer than W are up. */
  writeGroup: number[];
  /** Empty when fewer than R are up. */
  readGroup: number[];
  shared: number[];
  guaranteed: boolean;
  /** At least W + R - N nodes are shared, never below 0. */
  minShared: number;
  writesSurvive: number;
  readsSurvive: number;
  writeMs: number | null;
  readMs: number | null;
  writeBlocked: boolean;
  readBlocked: boolean;
  /** Replica indexes either side of the gap when the groups sit apart, else null. */
  gap: [number, number] | null;
  verdict: QuorumVerdict;
};

export function quorumVerdict(guaranteed: boolean, writeBlocked: boolean, readBlocked: boolean): QuorumVerdict {
  if (writeBlocked) return { text: "Writes blocked: too few nodes up", tone: "bad" };
  if (readBlocked) return { text: "Reads blocked: too few nodes up", tone: "bad" };
  return guaranteed ? { text: "Overlap: every read meets a write", tone: "good" } : { text: "No overlap: a read can miss a write", tone: "warn" };
}

export function quorumState(nIn: number, wIn: number, rIn: number, downIn: readonly number[] = []): QuorumState {
  const { n, w, r } = clampQuorum(nIn, wIn, rIn);
  const down = [...new Set(downIn)].filter((i) => i >= 0 && i < n).sort((a, b) => a - b);
  const up = Array.from({ length: n }, (_, i) => i).filter((i) => !down.includes(i));
  const writeBlocked = up.length < w;
  const readBlocked = up.length < r;
  const writeGroup = writeBlocked ? [] : up.slice(0, w);
  const readGroup = readBlocked ? [] : up.slice(up.length - r);
  const shared = writeGroup.filter((i) => readGroup.includes(i));
  const guaranteed = w + r > n;
  let gap: [number, number] | null = null;
  if (writeGroup.length && readGroup.length && shared.length === 0) {
    const lastWrite = Math.max(...writeGroup);
    const firstRead = Math.min(...readGroup);
    if (lastWrite < firstRead) gap = [lastWrite, firstRead];
  }
  return {
    n,
    w,
    r,
    up,
    down,
    writeGroup,
    readGroup,
    shared,
    guaranteed,
    minShared: Math.max(0, w + r - n),
    writesSurvive: n - w,
    readsSurvive: n - r,
    writeMs: writeBlocked ? null : RESPONSE_MS[up[w - 1]],
    readMs: readBlocked ? null : RESPONSE_MS[up[r - 1]],
    writeBlocked,
    readBlocked,
    gap,
    verdict: quorumVerdict(guaranteed, writeBlocked, readBlocked),
  };
}

/** The text of the third pill: write and read times, or what is blocked. */
export function timePill(s: Pick<QuorumState, "writeMs" | "readMs">): string {
  if (s.writeMs === null && s.readMs === null) return "write and read blocked";
  if (s.writeMs === null) return `write blocked, read ${s.readMs} ms`;
  if (s.readMs === null) return `write ${s.writeMs} ms, read blocked`;
  return `write ${s.writeMs} ms, read ${s.readMs} ms`;
}

export const survivePill = (kind: "writes" | "reads", count: number) => `${kind} survive ${count}`;

/** Toggle a replica down or up. */
export function toggleDown(down: readonly number[], index: number): number[] {
  return down.includes(index) ? down.filter((i) => i !== index) : [...down, index].sort((a, b) => a - b);
}

/** Seconds into the ping loop at which a replica answers: faster replicas answer sooner. */
export function pingAt(ms: number): number {
  return 0.15 + (ms / 500) * 1.6;
}
