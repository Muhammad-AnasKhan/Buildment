// 8.5 beat 3: cut the link, two leaders. Three nodes A (leader, epoch 1), B and
// C, and one shared Database. Cutting A from B and C leaves A running. After a
// made-up timeout (2 s of scene time standing for 10 s [S68, S60]) B and C
// elect B with epoch 2. A does not know. Writes from A and B go to the
// Database; with fencing it keeps the highest epoch seen and refuses lower ones
// [S70, S71].

export const TIMEOUT_S = 2;
/** Scene seconds a write takes to reach the Database. */
export const TRAVEL_S = 0.6;
export const MAX_PER_LEADER = 3;
/** Time stamps for reduced motion, where the clock is already at its last frame. */
export const LONG_AGO = -1000;

export type NodeId = "A" | "B" | "C";
export type Phase = "ok" | "cut" | "healed";

export type Net = {
  phase: Phase;
  /** When the link was cut (scene seconds). */
  cutAt: number | null;
  /** When the link came back, only in phase "healed". */
  healAt: number | null;
};

export type WriteTap = { node: "A" | "B"; at: number; epoch: 1 | 2; label: string };

export type State = {
  net: Net;
  fencing: boolean;
  writes: readonly WriteTap[];
};

export const START: Net = { phase: "ok", cutAt: null, healAt: null };

export function initial(fencing: boolean): State {
  return { net: START, fencing, writes: [] };
}

/** True once the followers have waited out the timeout (and not heard A again before). */
export function promoted(net: Net, now: number): boolean {
  if (net.cutAt === null) return false;
  if (net.phase === "healed") return true;
  return net.phase === "cut" && now >= net.cutAt + TIMEOUT_S;
}

/** 0 to 1 while B and C count down, otherwise null. */
export function countdown(net: Net, now: number): number | null {
  if (net.phase !== "cut" || net.cutAt === null) return null;
  const p = (now - net.cutAt) / TIMEOUT_S;
  return p >= 1 ? null : Math.max(0, p);
}

/** Whether the learner may tap this node to write right now. */
export function canWrite(state: State, node: "A" | "B", now: number): boolean {
  const mine = state.writes.filter((w) => w.node === node).length;
  if (mine >= MAX_PER_LEADER) return false;
  if (state.net.phase === "healed") return false;
  if (node === "A") return true;
  return promoted(state.net, now);
}

export function addWrite(state: State, node: "A" | "B", at: number): State {
  const mine = state.writes.filter((w) => w.node === node).length;
  const label = `${node.toLowerCase()}${mine + 1}`;
  return { ...state, writes: [...state.writes, { node, at, epoch: node === "A" ? 1 : 2, label }] };
}

export type Judged = WriteTap & {
  arriveAt: number;
  accepted: boolean;
  /** Why it was refused, for example "epoch 1 < 2". */
  reason: string | null;
};

/** Decide, in order of arrival at the Database, which writes it accepts. */
export function judge(state: State): Judged[] {
  const byArrival = [...state.writes].map((w) => ({ ...w, arriveAt: w.at + TRAVEL_S })).sort((a, b) => a.arriveAt - b.arriveAt || a.at - b.at);
  let highest = 0;
  const judged = byArrival.map((w) => {
    if (state.fencing && w.epoch < highest) return { ...w, accepted: false, reason: `epoch ${w.epoch} < ${highest}` };
    highest = Math.max(highest, w.epoch);
    return { ...w, accepted: true, reason: null };
  });
  // Keep tap order for drawing: learner's own order of events.
  return judged.sort((a, b) => a.at - b.at);
}

/** The writes the Database holds, in the order it accepted them. */
export function history(state: State): Judged[] {
  return judge(state).filter((w) => w.accepted).sort((a, b) => a.arriveAt - b.arriveAt || a.at - b.at);
}

export type Roles = {
  A: { role: "leader" | "follower"; epoch: 1 | 2; stale: boolean };
  B: { role: "leader" | "follower" | "waiting"; epoch: 1 | 2 };
  C: { role: "follower" | "waiting"; epoch: 1 | 2 };
};

export function roles(net: Net, now: number): Roles {
  const isPromoted = promoted(net, now);
  const waiting = net.phase === "cut" && !isPromoted;
  return {
    A: net.phase === "healed" ? { role: "follower", epoch: 2, stale: false } : { role: "leader", epoch: 1, stale: isPromoted },
    B: isPromoted ? { role: "leader", epoch: 2 } : { role: waiting ? "waiting" : "follower", epoch: 1 },
    C: isPromoted ? { role: "follower", epoch: 2 } : { role: waiting ? "waiting" : "follower", epoch: 1 },
  };
}

export type Verdict = { text: string; tone: "accent" | "good" | "warn" | "bad" };

export function verdict(state: State, now: number): Verdict {
  const { net, fencing } = state;
  const judged = judge(state);
  const refused = judged.some((w) => !w.accepted);
  const aKept = judged.some((w) => w.node === "A" && w.accepted);
  const bKept = judged.some((w) => w.node === "B" && w.accepted);
  const bothWrote = judged.some((w) => w.node === "A") && judged.some((w) => w.node === "B");
  if (net.phase === "ok") return { text: "One leader, one history", tone: "good" };
  if (!promoted(net, now)) return { text: "Followers wait out the timeout", tone: "warn" };
  if (net.phase === "healed") {
    if (!fencing) return bothWrote ? { text: "One history must be thrown away", tone: "bad" } : { text: "Healed: no writes clashed", tone: "good" };
    if (bKept && !aKept) return { text: "Only the new leader's writes remain", tone: "good" };
    if (refused) return { text: "Old writes kept; later ones refused", tone: "good" };
    return { text: "Healed: no writes clashed", tone: "good" };
  }
  if (!fencing) return { text: "Two leaders, two histories", tone: "bad" };
  return refused ? { text: "Old leader's write is refused", tone: "good" } : { text: "Two leaders, but fencing is on", tone: "warn" };
}

/** After the link heals without fencing, the old leader's history is the one thrown away. */
export function thrownAway(state: State): Judged[] {
  if (state.net.phase !== "healed" || state.fencing) return [];
  const judged = judge(state);
  if (!judged.some((w) => w.node === "B")) return [];
  return judged.filter((w) => w.node === "A" && w.accepted);
}
