// 8.2 beat 4: one leader, two followers. A Write tap appends the next entry to
// the leader's log; each follower applies the entries in the same order after
// its copy delay. Kill leader stops writes; reads keep working on followers.
//
// Times are animation seconds. Copy delays in model time (300 ms and 800 ms,
// made up; real lag is usually under a second [S38]) are slowed down by SLOW so
// a learner can read a node before the copy arrives.

export const MAX_ENTRIES = 9;
/** Animation seconds per model second. */
export const SLOW = 4;
export const COPY_MS = { f1: 300, f2: 800 } as const;
/** Animation seconds for the app's write to reach the leader. */
export const ACCEPT_S = 0.3;
/** Time stamps for reduced motion, where the clock is already at its last frame. */
export const LONG_AGO = -1000;
export const KILL_STAMP = -500;

export type NodeId = "leader" | "f1" | "f2";
export const NODES: readonly NodeId[] = ["leader", "f1", "f2"];
export const NODE_LABEL: Record<NodeId, string> = { leader: "Leader", f1: "Follower 1", f2: "Follower 2" };

export type Run = {
  /** When each Write was tapped, in animation seconds. */
  writes: readonly number[];
  killedAt: number | null;
};

export const EMPTY_RUN: Run = { writes: [], killedAt: null };

/** Seconds a copy takes from the leader to a follower. */
export function copySeconds(id: "f1" | "f2"): number {
  return (COPY_MS[id] / 1000) * SLOW;
}

/** Times at which the leader accepted each write. A write that arrives after the kill is lost with the leader. */
export function acceptTimes(run: Run): number[] {
  return run.writes.map((at) => at + ACCEPT_S).filter((t) => run.killedAt === null || t <= run.killedAt);
}

/** How many entries a node has applied at time `now`; its value is x = n. */
export function applied(run: Run, node: NodeId, now: number): number {
  const delay = node === "leader" ? 0 : copySeconds(node);
  return acceptTimes(run).filter((t) => t + delay <= now).length;
}

export function isDown(run: Run, now: number): boolean {
  return run.killedAt !== null && now >= run.killedAt;
}

export type ReadResult =
  | { kind: "down" }
  | { kind: "value"; value: number; behind: number; fresh: boolean };

/** What a Read tap on a node answers. A follower is compared with the leader's value at that moment. */
export function readNode(run: Run, node: NodeId, now: number): ReadResult {
  if (node === "leader" && isDown(run, now)) return { kind: "down" };
  const value = applied(run, node, now);
  const behind = applied(run, "leader", now) - value;
  return { kind: "value", value, behind, fresh: behind === 0 };
}

export function behindText(behind: number): string {
  return behind === 1 ? "one behind" : `${behind} behind`;
}

export type Action =
  | { kind: "none" }
  | { kind: "write" }
  | { kind: "read"; result: ReadResult }
  | { kind: "kill" }
  | { kind: "refused" };

export type Verdict = { text: string; tone: "accent" | "good" | "warn" | "bad" };

export function verdict(action: Action): Verdict {
  switch (action.kind) {
    case "none":
      return { text: "Tap Write to send a change", tone: "accent" };
    case "write":
      return { text: "Followers copy the leader's log", tone: "accent" };
    case "kill":
      return { text: "Reads work; writes are stopped", tone: "warn" };
    case "refused":
      return { text: "No leader: nobody can take writes", tone: "bad" };
    case "read": {
      const r = action.result;
      if (r.kind === "down") return { text: "The leader is down: no answer", tone: "bad" };
      if (r.fresh) return { text: "That copy is up to date", tone: "good" };
      return { text: r.behind === 1 ? "That read is one write behind" : `That read is ${r.behind} writes behind`, tone: "warn" };
    }
  }
}

export type CopyDot = { entry: number; node: "f1" | "f2"; p: number };

/** Copies in flight from the leader at time `now`, with progress 0 to 1. */
export function copiesInFlight(run: Run, now: number): CopyDot[] {
  const dots: CopyDot[] = [];
  acceptTimes(run).forEach((t, i) => {
    for (const node of ["f1", "f2"] as const) {
      const p = (now - t) / copySeconds(node);
      if (p > 0 && p < 1) dots.push({ entry: i + 1, node, p });
    }
  });
  return dots;
}

/** Writes on their way from the app to the leader, progress 0 to 1. */
export function requestsInFlight(run: Run, now: number): { entry: number; p: number }[] {
  const out: { entry: number; p: number }[] = [];
  run.writes.forEach((at, i) => {
    const p = (now - at) / ACCEPT_S;
    if (p >= 0 && p < 1) out.push({ entry: i + 1, p });
  });
  return out;
}
