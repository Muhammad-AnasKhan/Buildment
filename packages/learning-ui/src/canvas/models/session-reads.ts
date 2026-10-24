// 11.5 beat 2: Amna writes a comment (position 1 in the leader's log), Omar
// only reads. Replica 1 applies it at 150 ms and replica 2 at 600 ms (course
// numbers). Five reads, each with a default replica. Two promises can be
// switched on: "my own writes" (a read needs a node at the position of the
// reader's own last write) and "no going back" (a read needs a node at the
// position the reader has already seen). A read goes to its default replica
// when that replica is far enough ahead, otherwise to the lowest-numbered
// replica that is, otherwise to the leader.

export type Who = "Amna" | "Omar";
export type NodeId = "leader" | "r1" | "r2";

export const APPLY_MS: Record<NodeId, number> = { leader: 0, r1: 150, r2: 600 };
export const SPAN_MS = 700;
/** Replicas in lowest-numbered-first order. */
const REPLICAS: NodeId[] = ["r1", "r2"];

export type ReadSpec = { id: string; who: Who; at: number; replica: "r1" | "r2" };

export const READS: readonly ReadSpec[] = [
  { id: "a1", who: "Amna", at: 100, replica: "r1" },
  { id: "o1", who: "Omar", at: 200, replica: "r1" },
  { id: "a2", who: "Amna", at: 350, replica: "r2" },
  { id: "o2", who: "Omar", at: 350, replica: "r2" },
  { id: "o3", who: "Omar", at: 500, replica: "r1" },
];

/** Reader names for the picture: "A1", "A2", "O1", "O2", "O3". */
export const readName = (r: ReadSpec) => `${r.who[0]}${READS.filter((x) => x.who === r.who).findIndex((x) => x.id === r.id) + 1}`;

export type Promises = { ownWrites: boolean; noGoingBack: boolean };

export type ReadResult = ReadSpec & {
  node: NodeId;
  /** The read showed the comment. */
  shows: boolean;
  /** The read went to the leader because no replica was far enough ahead. */
  toLeader: boolean;
  /** An Omar read that showed less than one of his earlier reads. */
  wentBack: boolean;
};

export type Outcome = {
  reads: ReadResult[];
  ownWriteMissed: number;
  wentBack: number;
  leaderReads: number;
  verdict: { text: string; tone: "good" | "warn" | "bad" };
};

/** The log position a node has applied at a time: 1 once the comment is applied, else 0. */
export const positionAt = (node: NodeId, ms: number) => (ms >= APPLY_MS[node] ? 1 : 0);

export function simulate(p: Promises): Outcome {
  const ordered = READS.slice().sort((a, b) => a.at - b.at);
  const wrote: Record<Who, number> = { Amna: 1, Omar: 0 };
  const seen: Record<Who, number> = { Amna: 0, Omar: 0 };
  const results = new Map<string, ReadResult>();
  for (const r of ordered) {
    const need = Math.max(p.ownWrites ? wrote[r.who] : 0, p.noGoingBack ? seen[r.who] : 0);
    let node: NodeId = r.replica;
    if (positionAt(node, r.at) < need) {
      node = REPLICAS.find((n) => positionAt(n, r.at) >= need) ?? "leader";
    }
    const shown = positionAt(node, r.at);
    const wentBack = r.who === "Omar" && shown < seen[r.who];
    seen[r.who] = Math.max(seen[r.who], shown);
    results.set(r.id, { ...r, node, shows: shown >= 1, toLeader: node === "leader", wentBack });
  }
  const reads = READS.map((r) => results.get(r.id) as ReadResult);
  const ownWriteMissed = reads.filter((r) => r.who === "Amna" && !r.shows).length;
  const wentBack = reads.filter((r) => r.wentBack).length;
  const leaderReads = reads.filter((r) => r.toLeader).length;
  return { reads, ownWriteMissed, wentBack, leaderReads, verdict: verdictFor(p, ownWriteMissed, wentBack, leaderReads) };
}

function verdictFor(p: Promises, missed: number, back: number, leader: number): Outcome["verdict"] {
  if (!p.ownWrites && !p.noGoingBack) return { text: `${missed} missed own write, ${back} went back`, tone: "bad" };
  if (p.ownWrites && !p.noGoingBack) return { text: back > 0 ? "Writer fixed; Omar went back once" : "Writer fixed; Omar is fine", tone: "warn" };
  if (!p.ownWrites && p.noGoingBack) return { text: missed > 0 ? "Omar fixed; Amna missed twice" : "Omar fixed; Amna is fine", tone: "warn" };
  return { text: `No anomaly; leader took ${leader} read${leader === 1 ? "" : "s"}`, tone: "good" };
}
