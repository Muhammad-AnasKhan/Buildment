// 8.7 beat 2: write to some of five nodes, read from some. N = 5 nodes each
// hold x = 6 (version 1). The learner taps a write set of W nodes and confirms:
// those nodes become x = 7 (version 2). Then the learner taps a read set of R
// nodes; the read returns the newest version among them. It finds the newest
// write when at least one read node has version 2.
//
//   R + W > N  =>  every read set shares a node with every write set [S45]
//   R + W <= N =>  some read set misses
//
// A node that is down cannot answer. A set that includes a down node waits for
// an answer that never comes, so it stalls.

export const N = 5;
export const OLD_VALUE = 6;
export const NEW_VALUE = 7;

export type Phase = "write" | "read";

export type State = {
  phase: Phase;
  writeSet: readonly number[];
  readSet: readonly number[];
  down: readonly number[];
};

export const INITIAL: State = { phase: "write", writeSet: [], readSet: [], down: [] };

const toggle = (list: readonly number[], i: number) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i].sort((a, b) => a - b));

/** A tap on node i: it joins or leaves the set of the current phase, or goes down or up. */
export function tap(state: State, i: number, mode: "pick" | "down"): State {
  if (i < 0 || i >= N) return state;
  if (mode === "down") return { ...state, down: toggle(state.down, i) };
  return state.phase === "write" ? { ...state, writeSet: toggle(state.writeSet, i) } : { ...state, readSet: toggle(state.readSet, i) };
}

export function writeStalled(state: State): boolean {
  return state.phase === "write" && state.writeSet.some((i) => state.down.includes(i));
}

export function canConfirm(state: State): boolean {
  return state.phase === "write" && state.writeSet.length > 0 && !writeStalled(state);
}

/** Confirm the write: every node in the write set now holds version 2. */
export function confirm(state: State): State {
  return canConfirm(state) ? { ...state, phase: "read" } : state;
}

export function version(state: State, i: number): 1 | 2 {
  return state.phase === "read" && state.writeSet.includes(i) ? 2 : 1;
}

export function value(state: State, i: number): number {
  return version(state, i) === 2 ? NEW_VALUE : OLD_VALUE;
}

export type ReadResult =
  | { kind: "none" }
  | { kind: "stalled" }
  | { kind: "found"; value: number }
  | { kind: "missed"; value: number };

export function readResult(state: State): ReadResult {
  if (state.phase !== "read" || state.readSet.length === 0) return { kind: "none" };
  if (state.readSet.some((i) => state.down.includes(i))) return { kind: "stalled" };
  const newest = Math.max(...state.readSet.map((i) => version(state, i)));
  return newest === 2 ? { kind: "found", value: NEW_VALUE } : { kind: "missed", value: OLD_VALUE };
}

/** The nodes that hold the newest write and are also in the read set. */
export function overlap(state: State): number[] {
  return state.phase === "read" ? state.readSet.filter((i) => state.writeSet.includes(i)) : [];
}

export function guaranteed(w: number, r: number): boolean {
  return w + r > N;
}

export type Header = { line: string; verdict: { text: string; tone: "good" | "warn" } | null };

export function header(state: State): Header {
  const w = state.writeSet.length;
  const r = state.readSet.length;
  const sum = w + r;
  const base = `W = ${w}, R = ${r}`;
  if (w === 0 || r === 0) return { line: base, verdict: null };
  const over = guaranteed(w, r);
  return {
    line: `${base}, R + W = ${sum} (${over ? "more" : "not more"} than ${N})`,
    verdict: over ? { text: `Overlap guaranteed: R + W is over ${N}`, tone: "good" } : { text: `A read can miss: R + W is not over ${N}`, tone: "warn" },
  };
}

export type Verdict = { text: string; tone: "accent" | "good" | "warn" | "bad" };

export function verdict(state: State): Verdict {
  if (writeStalled(state)) return { text: "Not enough nodes up to confirm", tone: "bad" };
  if (state.phase === "write") {
    return state.writeSet.length === 0 ? { text: "Pick the nodes that get the write", tone: "accent" } : { text: "Tap Confirm write", tone: "accent" };
  }
  const r = readResult(state);
  switch (r.kind) {
    case "none":
      return { text: "Now pick the nodes to read from", tone: "accent" };
    case "stalled":
      return { text: "Not enough nodes up to confirm", tone: "bad" };
    case "found":
      return { text: "Read found the newest write", tone: "good" };
    case "missed":
      return { text: "Read missed the newest write", tone: "warn" };
  }
}

/** The read set of size r that is worst for the learner: live nodes without the newest write first. */
export function worstReadSet(state: State, r: number): number[] {
  const live = Array.from({ length: N }, (_, i) => i).filter((i) => !state.down.includes(i));
  const size = Math.max(1, Math.min(r, live.length));
  return live
    .sort((a, b) => version(state, a) - version(state, b) || a - b)
    .slice(0, size)
    .sort((a, b) => a - b);
}

/** Auto-miss: confirm the write if it is ready, then read from the worst nodes for the current R (2 when none is picked yet). */
export function autoMiss(state: State): State {
  const ready = canConfirm(state) ? confirm(state) : state;
  if (ready.phase !== "read") return state;
  return { ...ready, readSet: worstReadSet(ready, ready.readSet.length || 2) };
}
